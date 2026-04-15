import os
import json
from google import genai
from google.genai import types
from tavily import TavilyClient
from flask import Blueprint, request, jsonify

agent_bp = Blueprint("agent", __name__)

gemini_client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
tavily_client = TavilyClient(api_key=os.getenv("TAVILY_API_KEY"))

MODEL = "gemini-1.5-flash"
_histories: dict = {}

SYSTEM_PROMPT = (
    "You are a helpful AI assistant in a real-time chat platform. "
    "Be concise, helpful, and friendly. "
    "You have a web_search tool — use it whenever the user asks about "
    "current events, recent news, live data, or anything you are unsure about."
)

# Native Gemini tool definition for web search
search_tool = types.Tool(function_declarations=[
    types.FunctionDeclaration(
        name="web_search",
        description="Search the web for current information on any topic.",
        parameters=types.Schema(
            type=types.Type.OBJECT,
            properties={
                "query": types.Schema(
                    type=types.Type.STRING,
                    description="The search query to look up.",
                ),
            },
            required=["query"],
        ),
    )
])


def do_web_search(query: str) -> str:
    result = tavily_client.search(query=query, search_depth="basic", max_results=3)
    answer = result.get("answer", "")
    snippets = [r.get("content", "") for r in result.get("results", [])]
    return answer + "\n" + "\n".join(snippets[:2])


def run_agent_turn(channel_id: str, user_message: str) -> str:
    history = _histories.get(channel_id, [])

    # Build contents from history + new message
    contents = list(history)
    contents.append(types.Content(
        role="user",
        parts=[types.Part(text=user_message)]
    ))

    # Agentic loop — keep going until model gives a final text response
    while True:
        response = gemini_client.models.generate_content(
            model=MODEL,
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=SYSTEM_PROMPT,
                temperature=0.8,
                max_output_tokens=1024,
                tools=[search_tool],
            ),
        )

        candidate = response.candidates[0]
        parts = candidate.content.parts

        # Check if model wants to call a tool
        tool_calls = [p for p in parts if p.function_call is not None]

        if tool_calls:
            # Append model's tool-call turn to contents
            contents.append(types.Content(
                role="model",
                parts=parts,
            ))

            # Execute each tool and add results
            tool_response_parts = []
            for part in tool_calls:
                fc = part.function_call
                if fc.name == "web_search":
                    query = fc.args.get("query", "")
                    search_result = do_web_search(query)
                    tool_response_parts.append(types.Part(
                        function_response=types.FunctionResponse(
                            name="web_search",
                            response={"result": search_result},
                        )
                    ))

            contents.append(types.Content(
                role="user",
                parts=tool_response_parts,
            ))
            # Loop back for model to process tool results

        else:
            # Final text response
            reply = response.text

            # Save turn to history
            history.append(types.Content(
                role="user",
                parts=[types.Part(text=user_message)]
            ))
            history.append(types.Content(
                role="model",
                parts=[types.Part(text=reply)]
            ))
            _histories[channel_id] = history

            return reply


@agent_bp.route("/agent", methods=["POST"])
def run_agent():
    data = request.get_json()
    user_id = data.get("userId", "user")
    channel_id = data.get("channelId", "general")
    message = data.get("message", "")

    if not message:
        return jsonify({"error": "message is required"}), 400

    reply = run_agent_turn(channel_id, message)

    return jsonify({
        "reply": reply,
        "userId": user_id,
        "channelId": channel_id,
    }), 200


@agent_bp.route("/agent/clear-memory", methods=["POST"])
def clear_memory():
    data = request.get_json()
    channel_id = data.get("channelId", "general")
    _histories.pop(channel_id, None)
    return jsonify({"status": "cleared", "channelId": channel_id}), 200


@agent_bp.route("/agent/memory-status", methods=["GET"])
def memory_status():
    channel_id = request.args.get("channelId", "general")
    history = _histories.get(channel_id, [])
    return jsonify({
        "channelId": channel_id,
        "hasMemory": channel_id in _histories,
        "messageCount": len(history),
    }), 200
