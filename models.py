from sqlalchemy import Column, Integer, String, DateTime, Enum, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from dotenv import load_dotenv
import os
from datetime import datetime
from schemas import PriorityEnum, CompletedEnum, RepeatEnum

Base = declarative_base()

load_dotenv()

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

DB_USER = os.getenv("DB_USER") 
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_NAME = os.getenv("DB_NAME") 
engine = create_engine(f"postgresql://{DB_NAME}:{DB_PASSWORD}@localhost:5432/{DB_NAME}")
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)
