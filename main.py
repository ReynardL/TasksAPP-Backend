from fastapi import FastAPI, HTTPException, Depends
from typing import Dict, List
from models import Task, User, Base
from dependencies import get_db, get_user_manager, auth_backend, engine
from schemas import TaskModel, TaskResponse, UserRead, UserCreate, UserUpdate
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from fastapi.middleware.cors import CORSMiddleware
from fastapi_users import FastAPIUsers
from sqlalchemy import select
import os, uuid

app = FastAPI()

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

@app.on_event("startup")
async def on_startup():
    await init_db()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

fastapi_users = FastAPIUsers[User, uuid.UUID](
    get_user_manager,
    [auth_backend]
)

app.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"]
)

app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"]
)

uneditable_fields = {"id", "created"}
unnullable = {"title", "completed", "repeat_type", "repeat_amount"}

def add_interval(due: datetime, repeat: str, amount: int):
    if repeat == "daily":
        return due + timedelta(days=amount)
    elif repeat == "weekly":
        return due + timedelta(weeks=amount)
    elif repeat == "monthly":
        return due + relativedelta(months=amount)
    elif repeat == "yearly":
        return due + relativedelta(years=amount)
    
@app.post("/tasks/search", response_model=List[TaskModel])
async def search_tasks(
    task: TaskModel, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(Task.user_id == current_user.id)

    if task.title:
        stmt = stmt.filter(Task.title.ilike(f"%{task.title}%"))
    if task.description:
        stmt = stmt.filter(Task.description.ilike(f"%{task.description}%"))
    if task.completed is not None:
        stmt = stmt.filter(Task.completed == task.completed)
    if task.due:
        start_of_day = datetime.combine(task.due, datetime.min.time())
        end_of_day = datetime.combine(task.due, datetime.max.time())
        stmt = stmt.filter(Task.due >= start_of_day, Task.due <= end_of_day)
    if task.priority:
        stmt = stmt.filter(Task.priority == task.priority)
    if task.repeat_type:
        stmt = stmt.filter(Task.repeat_type == task.repeat_type)
    if task.created:
        start_of_day = datetime.combine(task.created, datetime.min.time())
        end_of_day = datetime.combine(task.created, datetime.max.time())
        stmt = stmt.filter(Task.created >= start_of_day, Task.created <= end_of_day)

    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/tasks", response_model=List[TaskModel])
async def get_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(Task.user_id == current_user.id)
    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/tasks/{id}", response_model=TaskModel)
async def get_task_by_id(
    id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(Task.id == id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")
    return db_task

@app.put("/tasks/{id}", response_model=TaskResponse)
async def update_task(
    id: int, 
    new_task: TaskModel, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(Task.id == id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")

    if getattr(new_task, "repeat_type", None) != "never" and getattr(new_task, "due") is None:
        raise HTTPException(status_code=400, detail="Cannot repeat task when due date is not specified")

    for field, value in new_task.__dict__.items():
        if field not in uneditable_fields:
            if field in unnullable and value is None:
                raise HTTPException(status_code=400, detail=f"{field} cannot be null")
            setattr(db_task, field, value)

    if getattr(db_task, "completed") == "true" and getattr(db_task, "repeat_type") != "never":
        db_task.due = add_interval(getattr(db_task, "due"), getattr(db_task, "repeat_type"), getattr(db_task, "repeat_amount"))
        db_task.completed = "false"

    await db.commit()
    await db.refresh(db_task)
    return {"message": "Task Updated", "task": db_task}

@app.delete("/tasks/{id}", response_model=Dict[str, str])
async def delete_task(
    id: int, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(Task.id == id, Task.user_id == current_user.id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found or not authorized")

    await db.delete(db_task)
    await db.commit()
    return {"message": "Task Deleted"}
