import os
from dotenv import load_dotenv
from groq import Groq
from google import genai

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

SYSTEM_PROMPT = """
You are Smart AI Agent like ChatGPT.
Give clean, fast, simple answers.
Do not show API errors to user.
Help with coding, Django, React, SQL, projects, debugging, and interviews.
"""


def groq_reply(message):
    if not GROQ_API_KEY:
        return None

    client = Groq(api_key=GROQ_API_KEY)

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": message},
        ],
        temperature=0.5,
        max_tokens=900,
    )

    return response.choices[0].message.content


def gemini_reply(message):
    if not GEMINI_API_KEY:
        return None

    client = genai.Client(api_key=GEMINI_API_KEY)

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=f"{SYSTEM_PROMPT}\n\nUser: {message}",
    )

    return response.text


def both_ai_reply(message):
    try:
        groq_answer = groq_reply(message)
        if groq_answer:
            return groq_answer
    except Exception:
        pass

    try:
        gemini_answer = gemini_reply(message)
        if gemini_answer:
            return gemini_answer
    except Exception:
        pass

    return "AI is not connected. Please check your Groq or Gemini API key."


def ai_agent_reply_with_settings(message, settings=None):
    if settings is None:
        settings = {}

    model = settings.get("model", "both")
    style = settings.get("style", "beginner")

    style_prompt = f"""
Answer style: {style}.
User message: {message}
"""

    if model == "groq":
        return groq_reply(style_prompt)

    if model == "gemini":
        return gemini_reply(style_prompt)

    return both_ai_reply(style_prompt)