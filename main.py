from fastapi import FastAPI, HTTPException, Depends
from typing import Dict, List
from models import Task, User, Folder, FolderMember, Base
from dependencies import get_db, get_user_manager, auth_backend, engine
from schemas import TaskModel, TaskResponse, FolderModel, FolderMemberModel, UserRead, UserCreate, UserUpdate, RoleEnum
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Query
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

uneditable_fields = {"id", "created", "user_id", "folder_id"}
unnullable = {"title", "completed", "repeat_type", "repeat_amount"}


# helper functions

def add_interval(due: datetime, repeat: str, amount: int):
    if repeat == "daily":
        return due + timedelta(days=amount)
    elif repeat == "weekly":
        return due + timedelta(weeks=amount)
    elif repeat == "monthly":
        return due + relativedelta(months=amount)
    elif repeat == "yearly":
        return due + relativedelta(years=amount)
    
async def check_folder_access(
    folder_id: int,
    mode: str,
    db: AsyncSession,
    current_user: User
):
    stmt = select(Folder).filter(Folder.id == folder_id).distinct()
    result = await db.execute(stmt)
    folder = result.scalar_one_or_none()

    if not folder:
        raise HTTPException(status_code=404, detail="Folder not found")

    if mode == "owner":
        if folder.owner_id != current_user.id:
            raise HTTPException(status_code=403, detail="Only the folder owner can perform this action")
    elif mode == "editor":
        stmt = select(FolderMember).filter(
            FolderMember.folder_id == folder_id,
            FolderMember.user_id == current_user.id,
            FolderMember.role.in_([RoleEnum.owner, RoleEnum.editor])
        ).distinct()
        result = await db.execute(stmt)
        folder_member = result.scalar_one_or_none()
        if not folder_member:
            raise HTTPException(status_code=403, detail="You must be an editor or owner to perform this action")
    elif mode == "member":
        stmt = select(FolderMember).filter(FolderMember.folder_id == folder_id, FolderMember.user_id == current_user.id).distinct()
        result = await db.execute(stmt)
        folder_member = result.scalar_one_or_none()
        if not folder_member:
            raise HTTPException(status_code=403, detail="User is not a member of this folder")
    else:
        raise HTTPException(status_code=400, detail="Invalid mode. Mode must be either 'owner', 'editor', or 'member'")

    return folder

def apply_task_filters(query: Query, task: TaskModel):
    if task.title:
        query = query.filter(Task.title.ilike(f"%{task.title}%"))
    if task.description:
        query = query.filter(Task.description.ilike(f"%{task.description}%"))
    if task.completed is not None:
        query = query.filter(Task.completed == task.completed)
    if task.due:
        start_of_day = datetime.combine(task.due, datetime.min.time())
        end_of_day = datetime.combine(task.due, datetime.max.time())
        query = query.filter(Task.due >= start_of_day, Task.due <= end_of_day)
    if task.priority:
        query = query.filter(Task.priority == task.priority)
    if task.repeat_type:
        query = query.filter(Task.repeat_type == task.repeat_type)
    if task.created:
        start_of_day = datetime.combine(task.created, datetime.min.time())
        end_of_day = datetime.combine(task.created, datetime.max.time())
        query = query.filter(Task.created >= start_of_day, Task.created <= end_of_day)
    
    return query
    

# tasks

@app.get("/tasks", response_model=List[TaskModel])
async def get_tasks(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(
        (Task.user_id == current_user.id) |  
        (Task.folder.has(FolderMember.user_id == current_user.id))
    )
    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/tasks/{id}", response_model=TaskModel)
async def get_task_by_id(
    id: int, 
    db: AsyncSession = Depends(get_db), 
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(
        Task.id == id,
        (Task.user_id == current_user.id) | 
        (Task.folder.has(FolderMember.user_id == current_user.id)) 
        .distinct()
    )
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
    stmt = select(Task).filter(Task.id == id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")

    await check_folder_access(db_task.folder_id, mode="editor", db=db, current_user=current_user)

    if getattr(new_task, "repeat_type") and getattr(new_task, "repeat_type") != "never" and getattr(new_task, "due") is None:
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
    stmt = select(Task).filter(Task.id == id)
    result = await db.execute(stmt)
    db_task = result.scalar_one_or_none()

    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    await check_folder_access(db_task.folder_id, mode="editor", db=db, current_user=current_user)

    await db.delete(db_task)
    await db.commit()
    return {"message": "Task Deleted"}

@app.post("/tasks/search", response_model=List[TaskModel])
async def search_tasks(
    task: TaskModel, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Task).filter(
        (Task.user_id == current_user.id) |  
        (Task.folder.has(FolderMember.user_id == current_user.id))
    )

    stmt = apply_task_filters(stmt, task)

    result = await db.execute(stmt)
    return result.scalars().all()


# folders

@app.get("/folders", response_model=List[FolderModel])
async def get_all_folders(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    stmt = select(Folder).filter(
        (Folder.owner_id == current_user.id) |  
        (Folder.members.any(FolderMember.user_id == current_user.id))
    )
    result = await db.execute(stmt)
    folders = result.scalars().all()
    return folders

@app.post("/folders", response_model=FolderModel)
async def create_folder(
    folder: FolderModel,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    new_folder = Folder(name=folder.name, owner_id=current_user.id)
    db.add(new_folder)
    await db.commit()
    await db.refresh(new_folder)

    folder_member = FolderMember(
        folder_id=new_folder.id,
        user_id=current_user.id,
        role=RoleEnum.owner
    )
    db.add(folder_member)
    await db.commit()

    return new_folder

@app.delete("/folders/{folder_id}", response_model=Dict[str, str])
async def delete_folder(
    folder_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    folder = await check_folder_access(folder_id, mode="owner", db=db, current_user=current_user)

    await db.delete(folder)
    await db.commit()
    return {"message": f"Folder {folder_id} deleted"}

@app.post("/folders/{folder_id}/tasks", response_model=TaskResponse)
async def create_task_in_folder(
    folder_id: int,
    task: TaskModel,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="member", db=db, current_user=current_user)

    new_task = Task(
        title=task.title,
        description=task.description,
        completed=task.completed,
        due=task.due,
        priority=task.priority,
        repeat_type=task.repeat_type,
        repeat_amount=task.repeat_amount,
        user_id=current_user.id,
        folder_id=folder_id,
        created=datetime.now()
    )
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return {"message": "Task created successfully", "task": new_task}

@app.get("/folders/{folder_id}/tasks", response_model=List[TaskModel])
async def get_tasks_by_folder(
    folder_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="member", db=db, current_user=current_user)

    stmt = select(Task).filter(Task.folder_id == folder_id)
    result = await db.execute(stmt)
    return result.scalars().all()

@app.get("/folders/{folder_id}/members", response_model=List[FolderMemberModel])
async def get_folder_members(
    folder_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="owner", db=db, current_user=current_user)

    stmt = select(FolderMember).filter(FolderMember.folder_id == folder_id)
    result = await db.execute(stmt)
    members = result.scalars().all()
    return members

@app.post("/folders/{folder_id}/members", response_model=FolderMemberModel)
async def add_folder_member(
    folder_id: int,
    folder_member: FolderMemberModel,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="owner", db=db, current_user=current_user)

    member_stmt = select(FolderMember).filter(
        FolderMember.folder_id == folder_id,
        FolderMember.user_id == folder_member.user_id
    )
    result = await db.execute(member_stmt)
    existing_member = result.scalar_one_or_none()

    if existing_member:
        raise HTTPException(status_code=400, detail="This user is already a member of the folder.")

    if folder_member.role == RoleEnum.owner:
        raise HTTPException(status_code=400, detail="Cannot assign 'owner' role to a member.")

    new_member = FolderMember(folder_id=folder_id, user_id=folder_member.user_id, role=folder_member.role)
    db.add(new_member)
    await db.commit()
    await db.refresh(new_member)
    return new_member

@app.put("/folders/{folder_id}/members", response_model=FolderMemberModel)
async def change_member_permissions(
    folder_id: int,
    folder_member: FolderMemberModel,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="owner", db=db, current_user=current_user)

    stmt = select(FolderMember).filter(FolderMember.folder_id == folder_id, FolderMember.user_id == folder_member.user_id)
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")
    
    if folder_member.role == RoleEnum.owner:
        raise HTTPException(status_code=400, detail="Cannot change a member's role to 'owner'.")

    member.role = folder_member.role
    await db.commit()
    await db.refresh(member)
    return member

@app.delete("/folders/{folder_id}/members", response_model=Dict[str, str])
async def delete_folder_member(
    folder_id: int,
    folder_member: FolderMemberModel,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="owner", db=db, current_user=current_user)

    stmt = select(FolderMember).filter(FolderMember.folder_id == folder_id, FolderMember.user_id == folder_member.user_id)
    result = await db.execute(stmt)
    member = result.scalar_one_or_none()

    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    await db.delete(member)
    await db.commit()
    return {"message": f"Member {folder_member.user_id} deleted from folder {folder_id}"}

@app.post("/folders/{folder_id}/tasks/search", response_model=List[TaskModel])
async def search_tasks_in_folder(
    folder_id: int,
    task: TaskModel, 
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(fastapi_users.current_user(active=True))
):
    await check_folder_access(folder_id, mode="member", db=db, current_user=current_user)

    stmt = select(Task).filter(Task.folder_id == folder_id)
    stmt = apply_task_filters(stmt, task)

    result = await db.execute(stmt)
    return result.scalars().all()