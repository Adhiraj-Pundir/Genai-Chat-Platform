from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

load_dotenv()

app = Flask(__name__)
CORS(app)

from services.ai_generation import ai_bp
from services.sentiment import sentiment_bp
from services.summarizer import summarizer_bp
from services.langchain_agent import agent_bp
from services.memory import memory_bp
from services.web_search import search_bp

app.register_blueprint(ai_bp)
app.register_blueprint(sentiment_bp)
app.register_blueprint(summarizer_bp)
app.register_blueprint(agent_bp)
app.register_blueprint(memory_bp)
app.register_blueprint(search_bp)


@app.route("/", methods=["GET"])
def health_check():
    return {"status": "ok", "service": "python-ai-service"}, 200


if __name__ == "__main__":
    port = int(os.getenv("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=False)
