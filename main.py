from fastapi import FastAPI, HTTPException, Depends
from typing import Dict, List
from models import Task, SessionLocal
from schemas import TaskModel, TaskResponse
from sqlalchemy.orm import Session

app = FastAPI()

# editable_fields = {"title", "description", "completed", "due", "priority"}
uneditable_fields = {"id", "created"}

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/tasks", response_model=List[TaskModel])
def get_tasks(db: Session = Depends(get_db)):
    return db.query(Task).all()

@app.post("/tasks", response_model=TaskResponse)
def create_task(task: TaskModel, db: Session = Depends(get_db)):
    if not task.title:
        raise HTTPException(status_code=400, detail="Title is required")
    
    new_task = Task(
        title=task.title, 
        description=task.description, 
        completed=task.completed,
        due=task.due,
        priority=task.priority
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
    
    for field in new_task.__fields_set__:
        if field not in uneditable_fields:
            setattr(db_task, field, getattr(new_task, field))
    
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