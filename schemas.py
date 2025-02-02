from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional
from enum import Enum
from fastapi_users import schemas
import uuid

class RoleEnum(str, Enum):
    owner = "owner"
    editor = "editor"
    viewer = "viewer"

class PriorityEnum(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class CompletedEnum(str, Enum):
    false = "false"
    in_progress = "in progress"
    true = "true"

class RepeatEnum(str, Enum):
    never = "never"
    daily = "daily"
    weekly = "weekly"
    monthly = "monthly"
    yearly = "yearly"

class TaskModel(BaseModel):
    id: Optional[int] = None
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[CompletedEnum] = None
    due: Optional[datetime] = None
    priority: Optional[PriorityEnum] = None
    repeat_type: Optional[RepeatEnum] = RepeatEnum.never
    repeat_amount: Optional[int] = None
    created: Optional[datetime] = None
    user_id: Optional[uuid.UUID] = None
    folder_id: Optional[int] = None

class TaskResponse(BaseModel):
    message: str
    task: TaskModel

class FolderModel(BaseModel):
    id: Optional[int] = None
    name: str
    created_at: Optional[datetime] = None
    owner_id: Optional[uuid.UUID] = None

class FolderMemberModel(BaseModel):
    id: Optional[int] = None
    folder_id: Optional[int] = None
    user_id: uuid.UUID
    role: RoleEnum = RoleEnum.viewer
    added_at: Optional[datetime] = None

class UserRead(schemas.BaseUser[uuid.UUID]):
    id: Optional[uuid.UUID] = None
    email: Optional[str] = None
    message: Optional[str] = None

class UserCreate(schemas.BaseUserCreate):
    email: EmailStr
    password: str

class UserUpdate(schemas.BaseUserUpdate):
    email: Optional[EmailStr]
    password: Optional[str]
