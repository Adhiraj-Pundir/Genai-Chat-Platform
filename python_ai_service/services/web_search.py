import os
from flask import Blueprint, request, jsonify
from tavily import TavilyClient

search_bp = Blueprint("search", __name__)

_client = None


def get_client():
    global _client
    if _client is None:
        _client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))
    return _client


@search_bp.route("/search", methods=["POST"])
def search():
    data = request.get_json()
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "query is required"}), 400

    client = get_client()
    response = client.search(query=query, search_depth="basic", max_results=5)

    return jsonify(
        {
            "answer": response.get("answer", ""),
            "results": response.get("results", []),
            "query": query,
        }
    ), 200


@search_bp.route("/search/context", methods=["POST"])
def search_context():
    data = request.get_json()
    query = data.get("query", "")
    if not query:
        return jsonify({"error": "query is required"}), 400

    client = get_client()
    context = client.get_search_context(query=query, max_tokens=2000)

    return jsonify({"context": context, "query": query}), 200
