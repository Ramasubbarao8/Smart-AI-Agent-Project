from rest_framework.decorators import api_view
from rest_framework.response import Response
from .ai_agent import both_ai_reply


@api_view(["GET"])
def agent_test(request):
    return Response({
        "message": "Agent app working successfully"
    })


@api_view(["POST"])
def agent_reply(request):
    message = request.data.get("message", "")

    if not message.strip():
        return Response({
            "error": "Message is required"
        }, status=400)

    reply = both_ai_reply(message)

    return Response({
        "user_message": message,
        "ai_response": reply
    })