from django.urls import path

from .views import (
    memory_notes,
    update_memory,
    delete_memory,
    task_planner,
    task_plans,
    delete_task_plan,
)

urlpatterns = [
    path("notes/", memory_notes),
    path("update/<int:note_id>/", update_memory),
    path("delete/<int:note_id>/", delete_memory),

    path("task-planner/", task_planner),
    path("task-plans/", task_plans),
    path("task-plans/delete/<int:plan_id>/", delete_task_plan),
]