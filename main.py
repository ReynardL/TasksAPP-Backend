from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Optional

app = FastAPI()

tasks = {}
i = 0

class Task(BaseModel):
    title: str
    description: str
    start: Optional[datetime] = datetime.now()
    # due: datetime
    completed: Optional[bool] = False 

@app.get("/tasks", response_model=Dict[int, Task])
def get_tasks():
    return tasks

@app.post("/tasks")
def create_task(task: Task):
    global i
    tasks[i] = task
    i += 1
    return {"message": "Task Created Succesfully", "task": task}

@app.get("/tasks/{id}", response_model = Task)
def get_task_by_id(id: int):
    if id not in tasks: 
        raise HTTPException(status_code=404, detail="Task not found")
    return tasks[id]

@app.put("/tasks/{id}")
def update_task(id: int, new_task = Task):
    if id not in tasks: 
        raise HTTPException(status_code=404, detail="Task not found")
    tasks[id] = new_task
    return {"message": "Taskcd Updated Succesfully", "task": new_task}

@app.delete("/tasks/{id}")
def delete_task(id: int):
    if id not in tasks: 
        raise HTTPException(status_code=404, detail="Task not found")
    del tasks[id]
    return {"message": "Task Deleted Sucessfully"}