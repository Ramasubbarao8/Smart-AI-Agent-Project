from django.urls import path

from .views import (
    upload_file,
    uploaded_files,
    ask_file_ai,
    delete_uploaded_file,
)

urlpatterns = [
    path("upload/", upload_file),
    path("files/", uploaded_files),
    path("list/", uploaded_files),
    path("ask/<int:file_id>/", ask_file_ai),
    path("delete/<int:file_id>/", delete_uploaded_file),
]