import os
from flask import Blueprint, request, jsonify
import firebase_admin
from firebase_admin import credentials, firestore
from datetime import datetime, timezone

memory_bp = Blueprint("memory", __name__)

_db = None


def get_db():
    global _db
    if _db is None:
        if not firebase_admin._apps:
            service_account_path = os.getenv(
                "FIREBASE_SERVICE_ACCOUNT_PATH",
                "./firebase-service-account.json",
            )
            cred = credentials.Certificate(service_account_path)
            firebase_admin.initialize_app(cred)
        _db = firestore.client()
    return _db


@memory_bp.route("/memory/save", methods=["POST"])
def save_memory():
    data = request.get_json()
    channel_id = data.get("channelId", "general")
    user_id = data.get("userId", "user")
    user_message = data.get("userMessage", "")
    ai_response = data.get("aiResponse", "")
    sentiment = data.get("sentiment", "neutral")
    emoji = data.get("emoji", "😐")

    db = get_db()
    doc_ref = (
        db.collection("conversations")
        .document(channel_id)
        .collection(user_id)
        .document()
    )
    doc_ref.set(
        {
            "userMessage": user_message,
            "aiResponse": ai_response,
            "sentiment": sentiment,
            "emoji": emoji,
            "timestamp": datetime.now(timezone.utc).isoformat(),
        }
    )

    return jsonify({"status": "saved", "channelId": channel_id, "userId": user_id}), 200


@memory_bp.route("/memory/load", methods=["POST"])
def load_memory():
    data = request.get_json()
    channel_id = data.get("channelId", "general")
    user_id = data.get("userId", "user")
    limit = data.get("limit", 20)

    db = get_db()
    docs = (
        db.collection("conversations")
        .document(channel_id)
        .collection(user_id)
        .order_by("timestamp", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )

    history = []
    for doc in docs:
        d = doc.to_dict()
        history.append(
            {
                "userMessage": d.get("userMessage", ""),
                "aiResponse": d.get("aiResponse", ""),
                "sentiment": d.get("sentiment", "neutral"),
                "emoji": d.get("emoji", "😐"),
                "timestamp": d.get("timestamp", ""),
            }
        )

    history.reverse()
    return jsonify({"history": history, "channelId": channel_id, "userId": user_id}), 200


@memory_bp.route("/memory/channel", methods=["POST"])
def channel_memory():
    data = request.get_json()
    channel_id = data.get("channelId", "general")
    limit = data.get("limit", 50)

    db = get_db()
    col_ref = db.collection("conversations").document(channel_id)
    collections = col_ref.collections()

    all_messages = []
    for user_col in collections:
        docs = (
            user_col.order_by("timestamp", direction=firestore.Query.DESCENDING)
            .limit(limit)
            .stream()
        )
        for doc in docs:
            d = doc.to_dict()
            d["userId"] = user_col.id
            all_messages.append(d)

    all_messages.sort(key=lambda x: x.get("timestamp", ""))
    return jsonify({"messages": all_messages, "channelId": channel_id}), 200


@memory_bp.route("/memory/delete", methods=["POST"])
def delete_memory():
    data = request.get_json()
    channel_id = data.get("channelId", "general")
    user_id = data.get("userId", "user")

    db = get_db()
    docs = (
        db.collection("conversations")
        .document(channel_id)
        .collection(user_id)
        .stream()
    )
    for doc in docs:
        doc.reference.delete()

    return jsonify({"status": "deleted", "channelId": channel_id, "userId": user_id}), 200
