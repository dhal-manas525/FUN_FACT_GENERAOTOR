"""
FACTVERSE - Discover Something Amazing!
Main Flask Application and REST API
"""

import os
import random
from flask import Flask, render_template, request, jsonify, send_from_directory
from flask_cors import CORS

import database

app = Flask(__name__, template_folder="templates", static_folder="static")
CORS(app)  # Enable Cross-Origin Resource Sharing for API flexibility

# Initialize database schema and seed data on startup
with app.app_context():
    database.init_db()
    database.seed_db_if_empty()


# ============================================================================
# FRONTEND ROUTE
# ============================================================================

@app.route("/")
def index():
    """Renders the main FACTVERSE single-page application."""
    return render_template("index.html")


# ============================================================================
# REST API ENDPOINTS
# ============================================================================

@app.route("/api/facts/random", methods=["GET"])
def get_random_fact():
    """
    GET /api/facts/random
    Optional query params:
      - category: Filter by category name (e.g. 'Science', 'Space')
      - exclude: Comma-separated list of fact IDs to exclude from immediate repetition
    """
    try:
        category = request.args.get("category", default=None, type=str)
        exclude_param = request.args.get("exclude", default="", type=str)

        exclude_ids = []
        if exclude_param:
            exclude_ids = [int(x.strip()) for x in exclude_param.split(",") if x.strip().isdigit()]

        fact = database.get_random_fact(category=category, exclude_ids=exclude_ids)
        if not fact:
            return jsonify({
                "success": False,
                "error": "No facts found matching the specified criteria."
            }), 404

        return jsonify({
            "success": True,
            "data": fact
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/facts", methods=["GET"])
def get_facts():
    """
    GET /api/facts
    Query params:
      - category: Filter by category name
      - search: Search keyword in fact text
      - sort: 'newest', 'oldest', 'alpha', 'alpha_desc', 'category'
      - page: Page number (default: 1)
      - limit: Number of items per page (default: 12)
    """
    try:
        category = request.args.get("category", default=None, type=str)
        search = request.args.get("search", default=None, type=str)
        sort = request.args.get("sort", default="newest", type=str)
        page = request.args.get("page", default=1, type=int)
        limit = request.args.get("limit", default=12, type=int)

        result = database.get_facts(
            category=category,
            search=search,
            sort=sort,
            page=page,
            limit=limit
        )

        return jsonify({
            "success": True,
            "data": result["facts"],
            "pagination": {
                "total": result["total"],
                "page": result["page"],
                "limit": result["limit"],
                "total_pages": result["total_pages"],
                "has_next": result["has_next"],
                "has_prev": result["has_prev"]
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/categories", methods=["GET"])
def get_categories():
    """
    GET /api/categories
    Returns all available categories with fact count, color, and icon metadata.
    """
    try:
        categories = database.get_categories()
        return jsonify({
            "success": True,
            "data": categories
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/facts/daily", methods=["GET"])
def get_daily_fact():
    """
    GET /api/facts/daily
    Returns the deterministic daily fact for today.
    """
    try:
        fact = database.get_daily_fact()
        if not fact:
            return jsonify({"success": False, "error": "Daily fact not available"}), 404

        return jsonify({
            "success": True,
            "data": fact
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """
    GET /api/stats
    Returns dynamic application statistics:
      - Total facts
      - Total categories
      - Total favorite facts
      - Total facts discovered
    """
    try:
        stats = database.get_stats()
        return jsonify({
            "success": True,
            "data": stats
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/favorites", methods=["GET", "POST"])
def handle_favorites():
    """
    GET /api/favorites: Returns all saved favorite facts (optional category filter)
    POST /api/favorites: Adds a fact to favorites. Body: { "fact_id": 12 }
    """
    if request.method == "GET":
        try:
            category = request.args.get("category", default=None, type=str)
            favorites = database.get_favorites(category=category)
            return jsonify({
                "success": True,
                "data": favorites
            }), 200
        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500

    elif request.method == "POST":
        try:
            data = request.get_json(silent=True)
            if not data or "fact_id" not in data:
                return jsonify({
                    "success": False,
                    "error": "Missing 'fact_id' in JSON request body."
                }), 400

            fact_id = data["fact_id"]
            if not str(fact_id).isdigit():
                return jsonify({
                    "success": False,
                    "error": "Invalid 'fact_id'. Must be a positive integer."
                }), 400

            res = database.add_favorite(int(fact_id))
            if not res["success"]:
                return jsonify(res), res.get("status_code", 400)

            return jsonify(res), 201

        except Exception as e:
            return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/favorites/<int:fact_id>", methods=["DELETE"])
def remove_favorite(fact_id):
    """
    DELETE /api/favorites/<fact_id>
    Removes a fact from favorites.
    """
    try:
        res = database.remove_favorite(fact_id)
        if not res["success"]:
            return jsonify(res), res.get("status_code", 404)

        return jsonify(res), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/discoveries", methods=["POST"])
def record_discovery():
    """
    POST /api/discoveries
    Records a user's fact discovery. Body: { "fact_id": 15 }
    """
    try:
        data = request.get_json(silent=True)
        if not data or "fact_id" not in data:
            return jsonify({
                "success": False,
                "error": "Missing 'fact_id' in JSON request body."
            }), 400

        fact_id = data["fact_id"]
        if not str(fact_id).isdigit():
            return jsonify({
                "success": False,
                "error": "Invalid 'fact_id'. Must be a positive integer."
            }), 400

        res = database.record_discovery(int(fact_id))
        if not res["success"]:
            return jsonify(res), res.get("status_code", 404)

        return jsonify(res), 201
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@app.route("/api/quiz", methods=["GET"])
def get_quiz():
    """
    GET /api/quiz
    Returns a randomized quiz question or set of questions.
    Optional query param: 'limit' (default 1).
    """
    try:
        limit = request.args.get("limit", default=1, type=int)
        questions = database.get_quiz_questions()
        if not questions:
            return jsonify({"success": False, "error": "No quiz questions available"}), 404

        sample_size = min(limit, len(questions))
        selected = random.sample(questions, sample_size)

        return jsonify({
            "success": True,
            "data": selected if limit > 1 else selected[0]
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


# ============================================================================
# ERROR HANDLERS
# ============================================================================

@app.errorhandler(404)
def not_found(error):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "API endpoint not found"}), 404
    return render_template("index.html"), 404


@app.errorhandler(500)
def server_error(error):
    if request.path.startswith("/api/"):
        return jsonify({"success": False, "error": "Internal server error"}), 500
    return "<h1>500 Internal Server Error</h1>", 500


# ============================================================================
# MAIN ENTRY POINT
# ============================================================================

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    print(f"Starting FACTVERSE web server on http://127.0.0.1:{port}")
    app.run(host="0.0.0.0", port=port, debug=True)
