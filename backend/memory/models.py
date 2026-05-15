from django.db import models
from django.contrib.auth.models import User


class MemoryNote(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content = models.TextField()
    tag = models.CharField(max_length=50, default="general")
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title
    
class TaskPlan(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    goal = models.TextField()
    category = models.CharField(max_length=50, default="project")
    days = models.CharField(max_length=20, default="7")
    level = models.CharField(max_length=50, default="beginner")
    priority = models.CharField(max_length=50, default="high")
    plan = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.goal[:50]