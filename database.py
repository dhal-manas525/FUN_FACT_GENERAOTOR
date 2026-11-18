"""
FACTVERSE Database Management Module
Handles SQLite schema, connection lifecycle, data seeding, and parameterized queries.
"""

import sqlite3
import os
import json
import hashlib
from datetime import datetime
from contextlib import contextmanager

DB_PATH = os.path.join(os.path.dirname(__file__), "factverse.db")
FACTS_JSON_PATH = os.path.join(os.path.dirname(__file__), "data", "facts.json")
QUIZ_JSON_PATH = os.path.join(os.path.dirname(__file__), "data", "quiz.json")

# Category metadata with Font Awesome icons, themes, and descriptions
CATEGORY_METADATA = {
    "Science": {
        "icon": "fas fa-atom",
        "description": "Mind-bending discoveries in physics, chemistry, biology, and natural forces.",
        "color": "#8B5CF6",
        "badge_bg": "rgba(139, 92, 246, 0.15)",
        "emoji": "🔬"
    },
    "Space": {
        "icon": "fas fa-rocket",
        "description": "Mysteries of galaxies, stars, planets, cosmic time, and deep space exploration.",
        "color": "#3B82F6",
        "badge_bg": "rgba(59, 130, 246, 0.15)",
        "emoji": "🚀"
    },
    "Technology": {
        "icon": "fas fa-laptop-code",
        "description": "Inventions, computing history, internet breakthroughs, and AI frontiers.",
        "color": "#22D3EE",
        "badge_bg": "rgba(34, 211, 238, 0.15)",
        "emoji": "💻"
    },
    "Animals": {
        "icon": "fas fa-paw",
        "description": "Astonishing creatures, strange adaptations, and behaviors of wildlife.",
        "color": "#10B981",
        "badge_bg": "rgba(16, 185, 129, 0.15)",
        "emoji": "🦁"
    },
    "Human Body": {
        "icon": "fas fa-brain",
        "description": "Incredible mechanics, biological marvels, and secrets of human physiology.",
        "color": "#EC4899",
        "badge_bg": "rgba(236, 72, 153, 0.15)",
        "emoji": "🧠"
    },
    "History": {
        "icon": "fas fa-landmark",
        "description": "Unbelievable moments, forgotten empires, eccentric leaders, and antiquity.",
        "color": "#F59E0B",
        "badge_bg": "rgba(245, 158, 11, 0.15)",
        "emoji": "📜"
    },
    "Geography": {
        "icon": "fas fa-globe-americas",
        "description": "Earth's highest peaks, deepest trenches, extreme climates, and borders.",
        "color": "#06B6D4",
        "badge_bg": "rgba(6, 182, 212, 0.15)",
        "emoji": "🌍"
    },
    "Nature": {
        "icon": "fas fa-seedling",
        "description": "Astonishing flora, fungal mycelium networks, forests, and wild phenomena.",
        "color": "#84CC16",
        "badge_bg": "rgba(132, 204, 22, 0.15)",
        "emoji": "🌿"
    },
    "Food": {
        "icon": "fas fa-pizza-slice",
        "description": "Flavorful histories, culinary origins, surprising edible sciences, and spices.",
        "color": "#F97316",
        "badge_bg": "rgba(249, 115, 22, 0.15)",
        "emoji": "🍕"
    },
    "Psychology": {
        "icon": "fas fa-puzzle-piece",
        "description": "Cognitive quirks, human behavior, sensory illusions, and emotional science.",
        "color": "#A855F7",
        "badge_bg": "rgba(168, 85, 247, 0.15)",
        "emoji": "🧩"
    },
    "Sports": {
        "icon": "fas fa-futbol",
        "description": "Remarkable athletic feats, historic records, and strange sporting origins.",
        "color": "#EF4444",
        "badge_bg": "rgba(239, 68, 68, 0.15)",
        "emoji": "⚽"
    },
    "General Knowledge": {
        "icon": "fas fa-lightbulb",
        "description": "Fascinating curiosities, word origins, and surprising everyday truths.",
        "color": "#EAB308",
        "badge_bg": "rgba(234, 179, 8, 0.15)",
        "emoji": "💡"
    }
}


@contextmanager
def get_db(db_path=DB_PATH):
    """Context manager for SQLite connection with automatic commit and rollback."""
    conn = sqlite3.connect(db_path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def init_db(db_path=DB_PATH):
    """Creates the SQLite database schema and tables if they don't already exist."""
    with get_db(db_path) as conn:
        cursor = conn.cursor()

        # Table 1: facts
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS facts (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fact_text TEXT NOT NULL,
                category TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # Table 2: favorites
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS favorites (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fact_id INTEGER NOT NULL UNIQUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fact_id) REFERENCES facts (id) ON DELETE CASCADE
            )
        """)

        # Table 3: discoveries
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS discoveries (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                fact_id INTEGER NOT NULL,
                discovered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (fact_id) REFERENCES facts (id) ON DELETE CASCADE
            )
        """)

        # Create indexing for high performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_facts_category ON facts(category)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_favorites_fact_id ON favorites(fact_id)")
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_discoveries_fact_id ON discoveries(fact_id)")


def seed_db_if_empty(db_path=DB_PATH, json_path=FACTS_JSON_PATH):
    """Seeds the database with facts from facts.json if the facts table is empty."""
    init_db(db_path)
    with get_db(db_path) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM facts")
        count = cursor.fetchone()[0]

        if count == 0 and os.path.exists(json_path):
            with open(json_path, "r", encoding="utf-8") as f:
                facts_data = json.load(f)

            cursor.executemany(
                "INSERT INTO facts (fact_text, category) VALUES (?, ?)",
                [(fact["fact_text"].strip(), fact["category"].strip()) for fact in facts_data]
            )
            print(f"Seeded database with {len(facts_data)} facts from {json_path}.")


def get_random_fact(category=None, exclude_ids=None):
    """
    Returns a random fact. Optionally filtered by category.
    Supports excluding recently seen fact IDs to avoid repetitive display.
    """
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT f.id, f.fact_text, f.category, f.created_at,
                   CASE WHEN fav.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
            FROM facts f
            LEFT JOIN favorites fav ON f.id = fav.fact_id
            WHERE 1=1
        """
        params = []

        if category and category.strip() and category.lower() != "all":
            query += " AND LOWER(f.category) = LOWER(?)"
            params.append(category.strip())

        if exclude_ids and isinstance(exclude_ids, list) and len(exclude_ids) > 0:
            valid_ids = [int(i) for i in exclude_ids if str(i).isdigit()]
            if valid_ids:
                placeholders = ",".join("?" for _ in valid_ids)
                # First check if there are facts remaining after exclusion
                check_query = query + f" AND f.id NOT IN ({placeholders})"
                cursor.execute(check_query, params + valid_ids)
                rows = cursor.fetchall()
                if rows:
                    # Choose a random row from remaining
                    cursor.execute(check_query + " ORDER BY RANDOM() LIMIT 1", params + valid_ids)
                    row = cursor.fetchone()
                    if row:
                        return dict(row)

        # Fallback or standard random selection
        query += " ORDER BY RANDOM() LIMIT 1"
        cursor.execute(query, params)
        row = cursor.fetchone()
        return dict(row) if row else None


def get_daily_fact():
    """
    Returns a consistent 'Fact of the Day' based on today's date.
    Uses date string hashing to deterministically select a fact that rotates daily.
    """
    today_str = datetime.now().strftime("%Y-%m-%d")
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM facts")
        total = cursor.fetchone()[0]

        if total == 0:
            return None

        # Hash the date string to produce a deterministic index
        hash_val = int(hashlib.md5(today_str.encode("utf-8")).hexdigest(), 16)
        offset = hash_val % total

        cursor.execute("""
            SELECT f.id, f.fact_text, f.category, f.created_at,
                   CASE WHEN fav.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
            FROM facts f
            LEFT JOIN favorites fav ON f.id = fav.fact_id
            ORDER BY f.id ASC
            LIMIT 1 OFFSET ?
        """, (offset,))
        row = cursor.fetchone()
        if row:
            data = dict(row)
            data["date"] = today_str
            return data
        return None


def get_facts(category=None, search=None, sort="newest", page=1, limit=12):
    """
    Returns paginated facts with optional category, search keyword filtering, and sorting.
    """
    page = max(1, int(page))
    limit = max(1, min(100, int(limit)))
    offset = (page - 1) * limit

    with get_db() as conn:
        cursor = conn.cursor()

        where_clauses = ["1=1"]
        params = []

        if category and category.strip() and category.lower() != "all":
            where_clauses.append("LOWER(f.category) = LOWER(?)")
            params.append(category.strip())

        if search and search.strip():
            where_clauses.append("(f.fact_text LIKE ? OR f.category LIKE ?)")
            search_pattern = f"%{search.strip()}%"
            params.extend([search_pattern, search_pattern])

        where_sql = " AND ".join(where_clauses)

        # Get total matching count
        count_query = f"SELECT COUNT(*) FROM facts f WHERE {where_sql}"
        cursor.execute(count_query, params)
        total_count = cursor.fetchone()[0]

        # Sorting
        order_sql = "f.id DESC"
        if sort == "oldest":
            order_sql = "f.id ASC"
        elif sort == "alpha":
            order_sql = "f.fact_text ASC"
        elif sort == "alpha_desc":
            order_sql = "f.fact_text DESC"
        elif sort == "category":
            order_sql = "f.category ASC, f.id DESC"

        query = f"""
            SELECT f.id, f.fact_text, f.category, f.created_at,
                   CASE WHEN fav.id IS NOT NULL THEN 1 ELSE 0 END AS is_favorite
            FROM facts f
            LEFT JOIN favorites fav ON f.id = fav.fact_id
            WHERE {where_sql}
            ORDER BY {order_sql}
            LIMIT ? OFFSET ?
        """
        cursor.execute(query, params + [limit, offset])
        rows = cursor.fetchall()

        facts_list = [dict(row) for row in rows]
        total_pages = (total_count + limit - 1) // limit if total_count > 0 else 1

        return {
            "facts": facts_list,
            "total": total_count,
            "page": page,
            "limit": limit,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }


def get_categories():
    """Returns all available categories with fact count and metadata."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT category, COUNT(*) as count
            FROM facts
            GROUP BY category
            ORDER BY category ASC
        """)
        rows = cursor.fetchall()

        results = []
        for row in rows:
            cat_name = row["category"]
            meta = CATEGORY_METADATA.get(cat_name, {
                "icon": "fas fa-tag",
                "description": "Fascinating facts in this domain.",
                "color": "#8B5CF6",
                "badge_bg": "rgba(139, 92, 246, 0.15)",
                "emoji": "✨"
            })
            results.append({
                "name": cat_name,
                "count": row["count"],
                "icon": meta["icon"],
                "description": meta["description"],
                "color": meta["color"],
                "badge_bg": meta["badge_bg"],
                "emoji": meta["emoji"]
            })
        return results


def get_stats():
    """Returns dynamic statistics for total facts, categories, favorites, and discoveries."""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM facts")
        total_facts = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(DISTINCT category) FROM facts")
        total_categories = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM favorites")
        total_favorites = cursor.fetchone()[0]

        cursor.execute("SELECT COUNT(*) FROM discoveries")
        total_discoveries = cursor.fetchone()[0]

        return {
            "total_facts": total_facts,
            "total_categories": total_categories,
            "total_favorites": total_favorites,
            "total_discoveries": total_discoveries
        }


def get_favorites(category=None):
    """Returns all saved favorite facts, optionally filtered by category."""
    with get_db() as conn:
        cursor = conn.cursor()
        query = """
            SELECT f.id, f.fact_text, f.category, fav.created_at as favorited_at,
                   1 AS is_favorite
            FROM favorites fav
            JOIN facts f ON fav.fact_id = f.id
            WHERE 1=1
        """
        params = []
        if category and category.strip() and category.lower() != "all":
            query += " AND LOWER(f.category) = LOWER(?)"
            params.append(category.strip())

        query += " ORDER BY fav.created_at DESC, fav.id DESC"
        cursor.execute(query, params)
        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def add_favorite(fact_id):
    """Adds a fact to favorites if it exists and is not already favorited."""
    fact_id = int(fact_id)
    with get_db() as conn:
        cursor = conn.cursor()
        # Verify fact exists
        cursor.execute("SELECT id FROM facts WHERE id = ?", (fact_id,))
        if not cursor.fetchone():
            return {"success": False, "error": f"Fact with id {fact_id} not found", "status_code": 404}

        try:
            cursor.execute("INSERT INTO favorites (fact_id) VALUES (?)", (fact_id,))
            return {"success": True, "message": "Fact added to favorites successfully"}
        except sqlite3.IntegrityError:
            return {"success": True, "message": "Fact already in favorites"}


def remove_favorite(fact_id):
    """Removes a fact from favorites."""
    fact_id = int(fact_id)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM favorites WHERE fact_id = ?", (fact_id,))
        if cursor.rowcount > 0:
            return {"success": True, "message": "Fact removed from favorites successfully"}
        else:
            return {"success": False, "error": f"Favorite fact with id {fact_id} not found", "status_code": 404}


def record_discovery(fact_id):
    """Records a fact discovery in the discoveries table."""
    fact_id = int(fact_id)
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM facts WHERE id = ?", (fact_id,))
        if not cursor.fetchone():
            return {"success": False, "error": f"Fact with id {fact_id} not found", "status_code": 404}

        cursor.execute("INSERT INTO discoveries (fact_id) VALUES (?)", (fact_id,))
        cursor.execute("SELECT COUNT(*) FROM discoveries")
        total_discoveries = cursor.fetchone()[0]

        return {
            "success": True,
            "message": "Discovery recorded",
            "total_discoveries": total_discoveries
        }


def get_quiz_questions():
    """Loads quiz questions from quiz.json."""
    if os.path.exists(QUIZ_JSON_PATH):
        with open(QUIZ_JSON_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    return []


if __name__ == "__main__":
    init_db()
    seed_db_if_empty()
    print("Database initialized and verified successfully!")
    stats = get_stats()
    print("Current Stats:", stats)
