from django.urls import path
from .views import agent_test, agent_reply

urlpatterns = [
    path("test/", agent_test),
    path("reply/", agent_reply),
]