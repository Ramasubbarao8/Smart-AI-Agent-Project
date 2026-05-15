from rest_framework import serializers
from .models import UploadedFile


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = [
            "id",
            "file",
            "filename",
            "file_type",
            "extracted_text",
            "uploaded_at",
        ]