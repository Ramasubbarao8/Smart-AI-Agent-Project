from rest_framework import serializers
from .models import MemoryNote,TaskPlan


class MemoryNoteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MemoryNote
        fields = "__all__"
        read_only_fields = ["user"]


class TaskPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = TaskPlan
        fields = "__all__"
        read_only_fields = ["user"]