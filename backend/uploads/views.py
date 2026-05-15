import os
import fitz
import docx

from PIL import Image
from google import genai

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import UploadedFile
from .serializers import UploadedFileSerializer
from agent.ai_agent import both_ai_reply


def extract_pdf_text(file_path):
    text = ""
    pdf = fitz.open(file_path)

    for page in pdf:
        text += page.get_text()

    return text


def extract_docx_text(file_path):
    document = docx.Document(file_path)
    return "\n".join([p.text for p in document.paragraphs])


def extract_txt_text(file_path):
    with open(file_path, "r", encoding="utf-8", errors="ignore") as f:
        return f.read()


def ask_image_ai(file_path, question):
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        return "GEMINI_API_KEY missing in backend .env file."

    client = genai.Client(api_key=api_key)
    image = Image.open(file_path)

    response = client.models.generate_content(
        model="gemini-2.0-flash",
        contents=[
            question,
            image,
        ],
    )

    return response.text


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def upload_file(request):
    uploaded_file = request.FILES.get("file")

    if not uploaded_file:
        return Response({"error": "No file uploaded"}, status=400)

    filename = uploaded_file.name
    lower_name = filename.lower()

    image_exts = (".jpg", ".jpeg", ".png", ".webp")
    doc_exts = (".pdf", ".txt", ".docx")

    if lower_name.endswith(image_exts):
        file_type = "image"
    elif lower_name.endswith(doc_exts):
        file_type = "document"
    else:
        return Response(
            {"error": "Only PDF, TXT, DOCX, JPG, JPEG, PNG, WEBP allowed"},
            status=400,
        )

    file_obj = UploadedFile.objects.create(
        user=request.user,
        file=uploaded_file,
        filename=filename,
        file_type=file_type,
    )

    extracted_text = ""

    try:
        if file_type == "document":
            if lower_name.endswith(".pdf"):
                extracted_text = extract_pdf_text(file_obj.file.path)

            elif lower_name.endswith(".docx"):
                extracted_text = extract_docx_text(file_obj.file.path)

            elif lower_name.endswith(".txt"):
                extracted_text = extract_txt_text(file_obj.file.path)

        file_obj.extracted_text = extracted_text[:60000]
        file_obj.save()

    except Exception as e:
        print("FILE EXTRACT ERROR:", e)
        file_obj.extracted_text = ""
        file_obj.save()

    return Response({
        "id": file_obj.id,
        "filename": file_obj.filename,
        "file_type": file_obj.file_type,
        "text_preview": extracted_text[:300],
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def uploaded_files(request):
    files = UploadedFile.objects.filter(user=request.user).order_by("-uploaded_at")
    serializer = UploadedFileSerializer(files, many=True)
    return Response(serializer.data)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def ask_file_ai(request, file_id):
    question = request.data.get("question", "").strip()

    if not question:
        return Response({"error": "Question is required"}, status=400)

    try:
        file_obj = UploadedFile.objects.get(id=file_id, user=request.user)
    except UploadedFile.DoesNotExist:
        return Response({"error": "File not found"}, status=404)

    try:
        if file_obj.file_type == "image":
            answer = ask_image_ai(file_obj.file.path, question)

        else:
            prompt = f"""
You are a real AI file assistant like ChatGPT.

File name:
{file_obj.filename}

File content:
{file_obj.extracted_text[:15000]}

User question:
{question}

Rules:
- Answer clearly.
- If user asks summary, give bullet points.
- If user asks code, give full code.
- If file has important points, explain simply.
"""

            answer = both_ai_reply(prompt)

        return Response({
            "question": question,
            "answer": answer,
            "filename": file_obj.filename,
            "file_type": file_obj.file_type,
        })

    except Exception as e:
        print("FILE AI ERROR:", e)

        return Response(
            {
                "error": "File AI failed",
                "details": str(e),
            },
            status=500,
        )


@api_view(["DELETE"])
@permission_classes([IsAuthenticated])
def delete_uploaded_file(request, file_id):
    try:
        file_obj = UploadedFile.objects.get(id=file_id, user=request.user)
        file_obj.delete()

        return Response({"message": "File deleted successfully"})

    except UploadedFile.DoesNotExist:
        return Response({"error": "File not found"}, status=404)