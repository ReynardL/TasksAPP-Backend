from fastapi import FastAPI, HTTPException, Depends
from typing import Dict, List
from models import Task, SessionLocal
from schemas import TaskModel, TaskResponse
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from dateutil.relativedelta import relativedelta
from fastapi.middleware.cors import CORSMiddleware
import os

app = FastAPI()

ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"], 
    allow_headers=["*"], 
)

uneditable_fields = {"id", "created"}
unnullable = {"title", "completed", "repeat_type", "repeat_amount"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

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
def search_tasks(task: TaskModel, db: Session = Depends(get_db)):
    query = db.query(Task)

    if task.title:
        query = query.filter(Task.title.ilike(f"%{task.title}%"))
    if task.description:
        query = query.filter(Task.description.ilike(f"%{task.description}%"))
    if task.completed:
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
        query = query.filter(Task.due >= start_of_day, Task.due <= end_of_day)

    return query.all()

@app.get("/tasks", response_model=List[TaskModel])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskModel, db: Session = Depends(get_db)):
    if not task.title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    if getattr(task, "repeat_type") and getattr(task, "repeat_type") != 'never' and getattr(task, "due") is None:
        raise HTTPException(status_code=400, detail="Due date is required to repeat tasks")

    new_task = Task(
        title=task.title, 
        description=task.description, 
        completed=task.completed,
        due=task.due,
        priority=task.priority,
        repeat_type=task.repeat_type,
        repeat_amount=task.repeat_amount
        )
    db.add(new_task)
    db.commit()
    db.refresh(new_task)
    return {"message": "Task Created", "task": new_task}

@app.get("/tasks/{id}", response_model=TaskModel)
def get_task_by_id(id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    return db_task

@app.put("/tasks/{id}", response_model=TaskResponse)
def update_task(id: int, new_task: TaskModel, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if getattr(new_task, "repeat_type") != "never" and getattr(new_task, "due") is None:
        raise HTTPException(status_code=400, detail="Cannot repeat task when due date is not specified")

    for field, value in new_task.__dict__.items():
        if field not in uneditable_fields:
            if field in unnullable and value is None:
                raise HTTPException(status_code=400, detail=f"{field} cannot be null")
            setattr(db_task, field, value) 
    
    if getattr(db_task, "completed") == "true" and getattr(db_task, "repeat_type") != "never":
            db_task.due = add_interval(getattr(db_task, "due"), getattr(db_task, "repeat_type"), getattr(db_task, "repeat_amount"))
            db_task.completed = "false"
    
    db.commit()
    db.refresh(db_task)
    return {"message": "Task Updated", "task": db_task}

@app.delete("/tasks/{id}", response_model=Dict[str, str])
def delete_task(id: int, db: Session = Depends(get_db)):
    db_task = db.query(Task).filter(Task.id == id).first()
    if not db_task:
        raise HTTPException(status_code=404, detail="Task not found")
    db.delete(db_task)
    db.commit()
    return {"message": "Task Deleted"}