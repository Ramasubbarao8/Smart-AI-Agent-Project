from django.contrib.auth.models import User
from django.contrib.auth import authenticate
from django.db.models import Q

from rest_framework.decorators import api_view
from rest_framework.response import Response

from rest_framework_simplejwt.tokens import RefreshToken

from .models import UserProfile


def create_tokens(user):
    refresh = RefreshToken.for_user(user)

    return {
        "refresh": str(refresh),
        "access": str(refresh.access_token),
    }


@api_view(["POST"])
def register_user(request):
    full_name = request.data.get("full_name", "").strip()
    username = request.data.get("username", "").strip()
    email = request.data.get("email", "").strip()
    phone = request.data.get("phone", "").strip()
    password = request.data.get("password", "").strip()

    if not full_name or not username or not email or not phone or not password:
        return Response({"error": "All fields are required"}, status=400)

    if User.objects.filter(username=username).exists():
        return Response({"error": "Username already exists"}, status=400)

    if User.objects.filter(email=email).exists():
        return Response({"error": "Email already exists"}, status=400)

    if UserProfile.objects.filter(phone=phone).exists():
        return Response({"error": "Phone already exists"}, status=400)

    user = User.objects.create_user(
        username=username,
        email=email,
        password=password,
        first_name=full_name,
    )

    UserProfile.objects.create(
        user=user,
        full_name=full_name,
        phone=phone,
    )

    return Response({
        "message": "Registration successful",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": full_name,
            "phone": phone,
        },
    })


@api_view(["POST"])
def login_user(request):
    login = request.data.get("login", "").strip()
    password = request.data.get("password", "").strip()

    if not login or not password:
        return Response({"error": "Login and password required"}, status=400)

    user = None

    if User.objects.filter(username=login).exists():
        user = authenticate(username=login, password=password)

    elif User.objects.filter(email=login).exists():
        username = User.objects.get(email=login).username
        user = authenticate(username=username, password=password)

    else:
        profile = UserProfile.objects.filter(phone=login).first()

        if profile:
            user = authenticate(username=profile.user.username, password=password)

    if user is None:
        return Response({"error": "Invalid login or password"}, status=401)

    tokens = create_tokens(user)
    profile = UserProfile.objects.filter(user=user).first()

    return Response({
        **tokens,
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "full_name": profile.full_name if profile else user.first_name,
            "phone": profile.phone if profile else "",
        },
    })


@api_view(["POST"])
def forgot_password(request):
    email = request.data.get("email", "").strip()

    if not email:
        return Response({"error": "Email is required"}, status=400)

    user = User.objects.filter(email=email).first()

    if not user:
        return Response({"error": "No account found with this email"}, status=404)

    return Response({
        "message": "Password reset request received. Admin will verify your account."
    })