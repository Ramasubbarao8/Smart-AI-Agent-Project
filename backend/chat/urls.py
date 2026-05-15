from django.urls import path

from .views import (
    dashboard_stats,
    conversations,
    create_conversation,
    delete_conversation,
    clear_all,
    history,
    send_message,
    regenerate_message,
    continue_message,
    edit_message,
    delete_message,
    image_generate,
    code_generator,
    profile,
)

urlpatterns = [
    path("dashboard-stats/", dashboard_stats),

    path("conversations/", conversations),
    path("conversations/create/", create_conversation),
    path("conversations/delete/<int:conversation_id>/", delete_conversation),

    path("clear/", clear_all),
    path("history/", history),

    path("send/", send_message),
    path("regenerate/<int:chat_id>/", regenerate_message),
    path("continue/<int:chat_id>/", continue_message),
    path("edit/<int:chat_id>/", edit_message),
    path("delete/<int:chat_id>/", delete_message),

    path("image-generate/", image_generate),
    path("code-generator/", code_generator),
    path("profile/", profile),
]