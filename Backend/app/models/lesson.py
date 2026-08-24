from sqlalchemy import Column, String, Text, Integer, ForeignKey
from sqlalchemy.orm import relationship
from .base import BaseModel


class Lesson(BaseModel):
    """
    Lesson model representing individual lessons within a course.
    """
    __tablename__ = 'lessons'
    
    course_id = Column(Integer, ForeignKey('courses.id'), nullable=False, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=False)
    slug = Column(String(255), nullable=False, index=True)
    video_url = Column(String(500), nullable=False)  # URL to video content
    duration = Column(Integer, nullable=False, server_default='0')  # Duration in minutes
    # 1-based ordering within the course; position == 1 marks the free preview lesson
    position = Column(Integer, nullable=False, server_default='0', default=0)
    
    # Many-to-one relationship with Course
    course = relationship("Course", back_populates="lessons")
    
    def __repr__(self):
        return f"<Lesson(id={self.id}, name='{self.name}', slug='{self.slug}', course_id={self.course_id})>" 