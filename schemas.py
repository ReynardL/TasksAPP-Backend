from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class TaskModel(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = False 
    created: Optional[datetime] = None

class TaskResponse(BaseModel):
    message: str
    task: TaskModel