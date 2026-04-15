import os
from flask import Blueprint, request, jsonify
from transformers import pipeline

summarizer_bp = Blueprint("summarizer", __name__)

_summarizer = None


def get_summarizer():
    global _summarizer
    if _summarizer is None:
        _summarizer = pipeline("summarization", model="facebook/bart-large-cnn")
    return _summarizer


def build_conversation_text(messages: list) -> str:
    lines = []
    for msg in messages:
        user = msg.get("user", "Unknown")
        text = msg.get("text", "")
        lines.append(f"{user}: {text}")
    return "\n".join(lines)


@summarizer_bp.route("/summarize", methods=["POST"])
def summarize():
    data = request.get_json()
    messages = data.get("messages", [])
    channel_id = data.get("channelId", "general")

    if not messages:
        return jsonify({"error": "messages array is required"}), 400

    conversation_text = build_conversation_text(messages)

    max_chunk = 1024
    if len(conversation_text) > max_chunk:
        conversation_text = conversation_text[:max_chunk]

    summarizer = get_summarizer()
    result = summarizer(
        conversation_text,
        max_length=150,
        min_length=50,
        do_sample=False,
    )
    summary = result[0]["summary_text"]

    return jsonify(
        {
            "summary": summary,
            "channelId": channel_id,
            "originalCount": len(messages),
            "compressionRate": round(
                1 - len(summary) / max(len(conversation_text), 1), 2
            ),
        }
    ), 200


@summarizer_bp.route("/summarize/quick", methods=["POST"])
def summarize_quick():
    data = request.get_json()
    messages = data.get("messages", [])
    limit = data.get("limit", 10)
    recent = messages[-limit:] if len(messages) > limit else messages
    conversation_text = build_conversation_text(recent)

    max_chunk = 512
    if len(conversation_text) > max_chunk:
        conversation_text = conversation_text[:max_chunk]

    summarizer = get_summarizer()
    result = summarizer(
        conversation_text,
        max_length=80,
        min_length=20,
        do_sample=False,
    )
    return jsonify({"summary": result[0]["summary_text"]}), 200
