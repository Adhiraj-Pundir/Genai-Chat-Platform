from flask import Blueprint, request, jsonify
from textblob import TextBlob

sentiment_bp = Blueprint("sentiment", __name__)


def analyze_text(text: str) -> dict:
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity

    if polarity > 0.3:
        label = "positive"
        emoji = "😊"
    elif polarity < -0.3:
        label = "negative"
        emoji = "😟"
    else:
        label = "neutral"
        emoji = "😐"

    return {"sentiment": label, "emoji": emoji, "polarity": round(polarity, 4)}


@sentiment_bp.route("/sentiment", methods=["POST"])
def sentiment():
    data = request.get_json()
    text = data.get("text", "")
    if not text:
        return jsonify({"error": "text is required"}), 400
    return jsonify(analyze_text(text)), 200


@sentiment_bp.route("/sentiment/bulk", methods=["POST"])
def sentiment_bulk():
    data = request.get_json()
    texts = data.get("texts", [])
    if not texts:
        return jsonify({"error": "texts array is required"}), 400
    results = [analyze_text(t) for t in texts]
    return jsonify({"results": results}), 200
