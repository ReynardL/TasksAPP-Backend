from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class CompletedEnum(str, Enum):
    false = "false"
    in_progress = "in progress"
    true = "true"

class TaskModel(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[CompletedEnum] = None
    due: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    created: Optional[datetime] = None

class TaskResponse(BaseModel):
    message: str
    task: TaskModel