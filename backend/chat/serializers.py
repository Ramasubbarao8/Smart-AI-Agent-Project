from rest_framework import serializers
from .models import Conversation, ChatMessage


class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = [
            "id",
            "title",
            "mode",
            "created_at",
        ]


class ChatMessageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ChatMessage
        fields = [
            "id",
            "conversation",
            "user_message",
            "ai_response",
            "created_at",
        ]