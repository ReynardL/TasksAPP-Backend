from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.dialects.postgresql import UUID
from datetime import datetime
from schemas import PriorityEnum, CompletedEnum, RepeatEnum, RoleEnum
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    is_verified = Column(Boolean, default=False)

    tasks = relationship("Task", back_populates="owner")
    folder_memberships = relationship("FolderMember", back_populates="user")

class Folder(Base):
    __tablename__ = "folders"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    owner_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    created_at = Column(DateTime, default=datetime.now)

    owner = relationship("User")
    tasks = relationship("Task", back_populates="folder", cascade="all, delete, delete-orphan")
    members = relationship("FolderMember", back_populates="folder", cascade="all, delete, delete-orphan")

class FolderMember(Base):
    __tablename__ = "folder_members"
    id = Column(Integer, primary_key=True, autoincrement=True)
    folder_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    role = Column(Enum(RoleEnum), default=RoleEnum.viewer)
    added_at = Column(DateTime, default=datetime.now)

    folder = relationship("Folder", back_populates="members")
    user = relationship("User", back_populates="folder_memberships")

class Task(Base):
    __tablename__ = "tasks"
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    title = Column(String, nullable=False)
    description = Column(String)
    completed = Column(Enum(CompletedEnum), default=CompletedEnum.false)
    due = Column(DateTime)
    priority = Column(Enum(PriorityEnum))
    repeat_type = Column(Enum(RepeatEnum), default=RepeatEnum.never)
    repeat_amount = Column(Integer, default=1, nullable=False)
    created = Column(DateTime, default=datetime.now)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    folder_id = Column(Integer, ForeignKey("folders.id", ondelete="CASCADE"), nullable=False)

    owner = relationship("User", back_populates="tasks")
    folder = relationship("Folder", back_populates="tasks")
