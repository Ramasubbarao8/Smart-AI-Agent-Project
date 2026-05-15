from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import MemoryNote,TaskPlan
from .serializers import MemoryNoteSerializer,TaskPlanSerializer
from agent.ai_agent import both_ai_reply


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def memory_notes(request):
    if request.method == "GET":
        notes = MemoryNote.objects.filter(user=request.user).order_by("-id")
        serializer = MemoryNoteSerializer(notes, many=True)
        return Response(serializer.data)

    serializer = MemoryNoteSerializer(data=request.data)

    if serializer.is_valid():
        serializer.save(user=request.user)
        return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(["PUT"])
@permission_classes([IsAuthenticated])
def update_memory(request, note_id):
    try:
      note = MemoryNote.objects.get(id=note_id, user=request.user)
    except MemoryNote.DoesNotExist:
      return Response({"error": "Memory not found"}, status=404)

    serializer = MemoryNoteSerializer(note, data=request.data, partial=True)

    if serializer.is_valid():
      serializer.save()
      return Response(serializer.data)

    return Response(serializer.errors, status=400)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_memory(request, note_id):
    try:
        note = MemoryNote.objects.get(id=note_id, user=request.user)
        note.delete()
        return Response({"message": "Memory deleted"})
    except MemoryNote.DoesNotExist:
        return Response({"error": "Memory not found"}, status=404)
    
@api_view(["POST"])
@permission_classes([IsAuthenticated])
def task_planner(request):
    try:
        goal = request.data.get("goal", "").strip()
        category = request.data.get("category", "project")
        days = request.data.get("days", "7")
        level = request.data.get("level", "beginner")
        priority = request.data.get("priority", "high")

        if not goal:
            return Response({"error": "Goal is required"}, status=400)

        prompt = f"""
You are a real AI task planner like ChatGPT/Gemini.

Goal:
{goal}

Category:
{category}

Timeline:
{days} days

Level:
{level}

Priority:
{priority}

Create a practical plan with:
1. Day-wise schedule
2. Daily tasks
3. Tools required
4. Expected output
5. Mistakes to avoid
6. Final checklist

Use markdown tables and bullet points.
"""

        plan = both_ai_reply(prompt)

        task = TaskPlan.objects.create(
            user=request.user,
            goal=goal,
            category=category,
            days=days,
            level=level,
            priority=priority,
            plan=plan,
        )

        return Response(TaskPlanSerializer(task).data)

    except Exception as e:
        return Response(
            {
                "error": "Task planner failed",
                "details": str(e),
            },
            status=500,
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def task_plans(request):
    plans = TaskPlan.objects.filter(user=request.user).order_by("-id")
    serializer = TaskPlanSerializer(plans, many=True)
    return Response(serializer.data)


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_task_plan(request, plan_id):
    try:
        plan = TaskPlan.objects.get(id=plan_id, user=request.user)
        plan.delete()
        return Response({"message": "Plan deleted"})
    except TaskPlan.DoesNotExist:
        return Response({"error": "Plan not found"}, status=404)