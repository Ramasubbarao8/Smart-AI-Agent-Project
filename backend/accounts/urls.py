from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import register_user, login_user, forgot_password

urlpatterns = [
    path("register/", register_user),
    path("login/", login_user),
    path("forgot-password/", forgot_password),
    path("token/refresh/", TokenRefreshView.as_view()),
]