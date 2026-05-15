import urllib.parse

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Conversation, ChatMessage
from django.db import models

def conv_data(c):
    return {
        "id": c.id,
        "title": c.title,
        "mode": c.mode,
        "created_at": c.created_at,
    }


def msg_data(m):
    return {
        "id": m.id,
        "conversation": m.conversation.id,
        "user_message": m.user_message,
        "ai_response": m.ai_response,
        "created_at": m.created_at,
        "conversation_id": m.conversation.id,
    }


def ai_reply(prompt):
    try:
        from agent.ai_agent import both_ai_reply
        return str(both_ai_reply(prompt))
    except Exception as e:
        return f"AI backend error: {str(e)}"


def build_prompt(mode, message, context=None, tool="chat"):
    context = context or []
    old = ""

    for item in context:
        old += f"User: {item.get('user', '')}\nAI: {item.get('ai', '')}\n\n"

    return f"""
You are a real AI agent like ChatGPT.
Give exact useful answers.
If user asks code, give full working code.
Use markdown and code blocks.

Mode: {mode}
Tool: {tool}

Previous context:
{old}

User message:
{message}
"""


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    return Response({
        "total_conversations": Conversation.objects.filter(user=request.user).count(),
        "total_messages": ChatMessage.objects.filter(user=request.user).count(),
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def conversations(request):
    try:
        qs = Conversation.objects.filter(user=request.user).order_by("-id")
        return Response([conv_data(c) for c in qs])
    except Exception as e:
        print("CONVERSATIONS ERROR:", e)
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_conversation(request):
    c = Conversation.objects.create(
        user=request.user,
        title=request.data.get("title", "New Chat"),
        mode=request.data.get("mode", "coding"),
    )
    return Response(conv_data(c))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_conversation(request, conversation_id):
    Conversation.objects.filter(id=conversation_id, user=request.user).delete()
    return Response({"message": "Deleted"})


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def clear_all(request):
    Conversation.objects.filter(user=request.user).delete()
    return Response({"message": "Cleared"})


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def history(request):
    conversation_id = request.GET.get("conversation_id")

    qs = ChatMessage.objects.filter(user=request.user)

    if conversation_id:
        qs = qs.filter(conversation_id=conversation_id)

    qs = qs.order_by("id")

    return Response([msg_data(m) for m in qs])


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def send_message(request):
    try:
        message = request.data.get("message", "").strip()
        conversation_id = request.data.get("conversation_id")
        mode = request.data.get("mode", "coding")
        tool = request.data.get("tool", "chat")
        context = request.data.get("context", [])

        if not message:
            return Response({"error": "Message required"}, status=400)

        conv = None

        if conversation_id:
            conv = Conversation.objects.filter(
                id=conversation_id,
                user=request.user
            ).first()

        if conv is None:
            conv = Conversation.objects.create(
                user=request.user,
                title=message[:45],
                mode=mode,
            )

        prompt = build_prompt(mode, message, context, tool)
        answer = ai_reply(prompt)

        msg = ChatMessage.objects.create(
            conversation=conv,
            user=request.user,
            user_message=message,
            ai_response=answer,
        )

        return Response(msg_data(msg))

    except Exception as e:
        print("SEND ERROR:", e)
        return Response({"error": str(e)}, status=500)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def regenerate_message(request, chat_id):
    msg = ChatMessage.objects.filter(id=chat_id, user=request.user).first()

    if not msg:
        return Response({"error": "Message not found"}, status=404)

    msg.ai_response = ai_reply(build_prompt(msg.conversation.mode, msg.user_message))
    msg.save()

    return Response(msg_data(msg))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def continue_message(request, chat_id):
    msg = ChatMessage.objects.filter(id=chat_id, user=request.user).first()

    if not msg:
        return Response({"error": "Message not found"}, status=404)

    prompt = f"""
Continue this answer with more details and code.

User:
{msg.user_message}

Current answer:
{msg.ai_response}
"""

    msg.ai_response += "\n\n" + ai_reply(prompt)
    msg.save()

    return Response(msg_data(msg))


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def edit_message(request, chat_id):
    msg = ChatMessage.objects.filter(id=chat_id, user=request.user).first()

    if not msg:
        return Response({"error": "Message not found"}, status=404)

    new_message = request.data.get("message", "").strip()

    if not new_message:
        return Response({"error": "Message required"}, status=400)

    msg.user_message = new_message
    msg.ai_response = ai_reply(build_prompt("coding", new_message))
    msg.save()

    return Response(msg_data(msg))


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_message(request, chat_id):
    ChatMessage.objects.filter(id=chat_id, user=request.user).delete()
    return Response({"message": "Deleted"})


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def image_generate(request):
    import urllib.parse
    import random

    prompt = request.data.get("prompt", "").strip()

    if not prompt:
        return Response({"error": "Prompt required"}, status=400)

    encoded = urllib.parse.quote(prompt)
    seed = random.randint(10000, 999999)

    image_url = (
        "https://image.pollinations.ai/prompt/"
        f"{encoded}"
        f"?model=flux"
        f"&width=1024"
        f"&height=1024"
        f"&seed={seed}"
        f"&nologo=true"
        f"&safe=true"
        f"&enhance=true"
    )

    return Response({
        "prompt": prompt,
        "image_url": image_url,
    })

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def code_generator(request):
    try:
        prompt = request.data.get("prompt", "").strip()
        language = request.data.get("language", "react")
        code_type = request.data.get("code_type", "full_project")
        model = request.data.get("model", "auto")
        style = request.data.get("style", "coding")
        max_tokens = request.data.get("max_tokens", 2500)

        if not prompt:
            return Response({"error": "Prompt required"}, status=400)

        full_prompt = f"""
You are a senior software engineer AI code generator.

User wants:
{prompt}

Language/Stack:
{language}

Code type:
{code_type}

Model preference:
{model}

Answer style:
{style}

Max tokens:
{max_tokens}

Rules:
- Give full working code.
- Give file names.
- Give folder structure if needed.
- Do not give only theory.
- Explain where to paste each file.
- If frontend + backend needed, give both.
- Use clean professional code.
- Use markdown code blocks.
"""

        generated_code = ai_reply(full_prompt)

        return Response({
            "generated_code": generated_code,
        })

    except Exception as e:
        print("CODE GENERATOR ERROR:", e)
        return Response(
            {
                "error": "Code generation failed",
                "details": str(e),
            },
            status=500,
        )

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    try:
        conversations_qs = Conversation.objects.filter(
            user=request.user
        ).order_by("-id")

        chats_qs = ChatMessage.objects.filter(
            user=request.user
        ).order_by("-id")

        recent_conversations = []

        for conv in conversations_qs[:5]:
            recent_conversations.append({
                "id": conv.id,
                "title": conv.title,
                "mode": conv.mode,
                "created_at": conv.created_at,
            })

        recent_chats = []

        for chat in chats_qs[:5]:
            recent_chats.append({
                "id": chat.id,
                "user_message": chat.user_message,
                "created_at": chat.created_at,
            })

        total_files = 0

        try:
            from uploads.models import UploadedFile

            total_files = UploadedFile.objects.filter(
                user=request.user
            ).count()

        except Exception:
            total_files = 0

        return Response({
            "username": request.user.username,
            "email": request.user.email,

            "total_chats": chats_qs.count(),
            "total_conversations": conversations_qs.count(),
            "total_files": total_files,
            "total_tools": 8,

            "backend_status": "Online",
            "frontend": "React + Vite",
            "backend": "Django REST Framework",
            "database": "SQLite / MySQL Ready",
            "auth": "JWT Secured",

            "ai_models": [
                "Groq",
                "Gemini",
                "Auto",
            ],

            "tools": [
                {
                    "icon": "💬",
                    "title": "Chat",
                    "desc": "Ask anything",
                    "path": "/chat",
                },
                {
                    "icon": "🧩",
                    "title": "Tools",
                    "desc": "AI workspace",
                    "path": "/agent-tools",
                },
                {
                    "icon": "💻",
                    "title": "Code",
                    "desc": "Generate code",
                    "path": "/code-generator",
                },
                {
                    "icon": "📎",
                    "title": "File AI",
                    "desc": "Ask files",
                    "path": "/chat",
                },
                {
                    "icon": "🧠",
                    "title": "Memory",
                    "desc": "Save notes",
                    "path": "/memory",
                },
                {
                    "icon": "✅",
                    "title": "Tasks",
                    "desc": "Plan work",
                    "path": "/task-planner",
                },
                {
                    "icon": "⚙️",
                    "title": "Settings",
                    "desc": "AI config",
                    "path": "/ai-settings",
                },
                {
                    "icon": "📜",
                    "title": "History",
                    "desc": "Old chats",
                    "path": "/history",
                },
            ],

            "recent_conversations": recent_conversations,
            "recent_chats": recent_chats,
        })

    except Exception as e:
        print("DASHBOARD ERROR:", e)

        return Response(
            {
                "error": "Dashboard failed",
                "details": str(e),
            },
            status=500,
        )
    
@api_view(["GET"])
@permission_classes([IsAuthenticated])
def history(request):
    search = request.GET.get("search", "")
    conversation_id = request.GET.get("conversation_id")

    qs = ChatMessage.objects.filter(user=request.user)

    if conversation_id:
        qs = qs.filter(conversation_id=conversation_id)

    if search:
        qs = qs.filter(
            models.Q(user_message__icontains=search) |
            models.Q(ai_response__icontains=search)
        )

    qs = qs.order_by("-id")

    data = []

    for msg in qs:
        data.append({
            "id": msg.id,
            "conversation": msg.conversation.id,
            "user_message": msg.user_message,
            "ai_response": msg.ai_response,
            "created_at": msg.created_at,
        })

    return Response(data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile(request):
    try:
        total_files = 0
        total_memories = 0

        try:
            from uploads.models import UploadedFile
            total_files = UploadedFile.objects.filter(user=request.user).count()
        except Exception:
            total_files = 0

        try:
            from memory.models import MemoryNote
            total_memories = MemoryNote.objects.filter(user=request.user).count()
        except Exception:
            total_memories = 0

        return Response({
            "username": request.user.username,
            "email": request.user.email,
            "total_chats": ChatMessage.objects.filter(user=request.user).count(),
            "total_conversations": Conversation.objects.filter(user=request.user).count(),
            "total_files": total_files,
            "total_memories": total_memories,
        })

    except Exception as e:
        return Response(
            {
                "error": "Profile failed",
                "details": str(e),
            },
            status=500,
        )