from django.db import models
from django.contrib.auth.models import User


class UploadedFile(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    file = models.FileField(upload_to="uploads/")
    filename = models.CharField(max_length=255, default="unknown_file")
    file_type = models.CharField(max_length=30, default="document")
    extracted_text = models.TextField(blank=True, null=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.filename