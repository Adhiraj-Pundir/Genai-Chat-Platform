import os
from google import genai
from google.genai import types
from flask import Blueprint, request, jsonify

ai_bp = Blueprint("ai", __name__)

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = "gemini-1.5-flash"


@ai_bp.route("/generate", methods=["POST"])
def generate():
    data = request.get_json()
    user_id = data.get("userId", "user")
    channel_id = data.get("channelId", "general")
    message = data.get("message", "")
    history = data.get("history", [])

    system_prompt = (
        f"You are a helpful AI assistant in a real-time chat platform. "
        f"You are responding in channel '{channel_id}'. "
        f"Be concise, helpful, and friendly."
    )

    contents = []
    for entry in history:
        contents.append(types.Content(
            role="user",
            parts=[types.Part(text=entry.get("userMessage", ""))]
        ))
        contents.append(types.Content(
            role="model",
            parts=[types.Part(text=entry.get("aiResponse", ""))]
        ))
    contents.append(types.Content(
        role="user",
        parts=[types.Part(text=message)]
    ))

    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=system_prompt,
            temperature=0.8,
            max_output_tokens=1024,
        ),
    )

    reply = response.text
    tokens_used = (
        response.usage_metadata.total_token_count
        if response.usage_metadata else 0
    )

    return jsonify({
        "reply": reply,
        "userId": user_id,
        "channelId": channel_id,
        "model": MODEL,
        "tokensUsed": tokens_used,
    }), 200
