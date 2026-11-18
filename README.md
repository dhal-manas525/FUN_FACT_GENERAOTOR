# FACTVERSE – Discover Something Amazing! 🌌✨

FACTVERSE is a modern, responsive, and interactive **Fun Fact Generator Web Application**. Designed with sleek glassmorphism, glowing gradients, smooth micro-interactions, and a powerful Python Flask REST API backed by SQLite, FACTVERSE allows users to explore, favorite, search, listen to, and share hundreds of verified, mind-blowing facts across 12 distinct knowledge domains.

---

## 🌟 Key Features

### 1. 🎲 Interactive Fact Generation (Zero Page Reload)
- **Instant Discovery**: Generates random verified facts without page reloads using the modern Fetch API.
- **Smart Rotation (Non-Repetitive)**: Automatically tracks recently viewed fact IDs to avoid repetitions until facts in that category are exhausted.
- **12 Curated Categories**: Science 🔬, Space 🚀, Technology 💻, Animals 🦁, Human Body 🧠, History 📜, Geography 🌍, Nature 🌿, Food 🍕, Psychology 🧩, Sports ⚽, and General Knowledge 💡.

### 2. ⭐ Fact of the Day (Daily Showcase)
- Deterministic daily fact that remains constant throughout the 24-hour day and automatically updates at midnight.
- Includes a live countdown timer showing remaining hours, minutes, and seconds until the next daily fact.

### 3. 🧠 Fact Quiz Mode (Interactive Trivia Arena)
- Challenge your memory and intuition with multi-choice quiz questions derived from facts.
- Instant visual feedback (green checkmark for correct answers, red for incorrect).
- Full scientific and historical explanations revealed upon answering.
- Dynamic scoring and streak tracker.

### 4. ❤️ Favorites Management System
- Save and unsave favorite facts into the SQLite database with one click.
- Real-time synchronization: favoriting a fact updates all cards across the generator, explore section, and favorites vault immediately.
- Filter saved favorites by category or remove them at will.

### 5. 🔍 Deep Search & Explore Section
- Live debounced keyword search across facts and categories.
- Filter by category and sort by newest, oldest, alphabetical (A–Z, Z–A), or category.
- Clean pagination with "Load More Facts" support.

### 6. 📊 Real-Time Dynamic Statistics
- Live counters for Total Curated Facts (192+), Unique Categories (12), Total Favorites Saved, and Total Discoveries logged.
- Animated number counting upon loading.

### 7. 🚀 Gamified Knowledge Level & Daily Streak
- **Knowledge Ranks**: Novice ➡️ Fact Seeker ➡️ Cosmic Explorer ➡️ Knowledge Scholar ➡️ Wisdom Sage ➡️ FactVerse Master ➡️ Universal Fact Guru.
- Dynamic visual progress bar tracking facts discovered.
- **Consecutive Day Streak**: Automatically tracks your consecutive days of learning in `localStorage`.

### 8. 🔊 Text-to-Speech (Audio Voice)
- Integrated Web SpeechSynthesis API: click the **Listen** button on any fact card to hear the fact read aloud with a pulsing audio wave indicator.

### 9. 📱 Native Web Share & Social Media Sharing
- Web Share API support on mobile devices.
- Desktop modal featuring one-click sharing to **X (Twitter)**, **WhatsApp**, **Telegram**, **LinkedIn**, plus instant link copying.

### 10. ⌨️ Power-User Keyboard Shortcuts
- `[Spacebar]` : Generate next random fact
- `[S]` : Surprise Me with a random category
- `[L]` : Toggle Like / Favorite on current fact
- `[C]` : Copy current fact text to clipboard
- `[V]` : Read current fact aloud (Voice)
- `[Esc]` : Close modal dialogs

### 11. 🌓 Modern Glassmorphism & Dark/Light Themes
- Translucent frosted glass styling (`backdrop-filter: blur(16px)`), ambient floating glow orbs, and soft layered shadows.
- Persistent Dark and Light theme toggle stored in `localStorage`.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend** | HTML5 (Semantic), CSS3 (Glassmorphism & Variables), Vanilla JavaScript (ES6+), Font Awesome 6.5.1 |
| **Backend** | Python 3, Flask 3.x, Flask-CORS |
| **Database** | SQLite3 (`factverse.db`) with parameterized queries and foreign key constraints |
| **Typography**| Google Fonts: *Outfit* (Headings) and *Plus Jakarta Sans* (Body) |

---

## 📁 Project Folder Structure

```
FACTVERSE/
│
├── app.py                  # Main Flask application and REST API routes
├── database.py             # SQLite connection management, schema, and queries
├── requirements.txt        # Python package dependencies
├── README.md               # Documentation and execution guide
├── factverse.db            # SQLite database file (auto-created and seeded)
│
├── data/
│   ├── facts.json          # 192 curated facts across 12 categories
│   └── quiz.json           # 25 interactive multiple-choice quiz questions
│
├── templates/
│   └── index.html          # Semantic HTML5 single-page application
│
├── static/
│   ├── css/
│   │   └── style.css       # Complete glassmorphic styling, responsive layout, animations
│   ├── js/
│   │   └── script.js       # Pure vanilla JavaScript client controller
│   └── images/             # Static assets folder
│
└── .gitignore              # Version control ignore rules
```

---

## 🚀 Installation & Execution Guide

### 1. Prerequisites
Ensure you have **Python 3.8+** installed on your system. Verify with:
```bash
python --version
```

### 2. Install Dependencies
Open your terminal in the project directory and install the required Python packages:
```bash
pip install -r requirements.txt
```
*(Or `python -m pip install -r requirements.txt`)*

### 3. Initialize & Seed the Database
The database initializes and seeds itself automatically when the Flask server starts.
If you wish to initialize it manually beforehand:
```bash
python database.py
```
*Output:*
```
Seeded database with 192 facts from data/facts.json.
Database initialized and verified successfully!
Current Stats: {'total_facts': 192, 'total_categories': 12, 'total_favorites': 0, 'total_discoveries': 0}
```

### 4. Start the Flask Server
Run the application:
```bash
python app.py
```
The server will start on port 5000:
```
Starting FACTVERSE web server on http://127.0.0.1:5000
 * Serving Flask app 'app'
 * Debug mode: on
 * Running on http://127.0.0.1:5000
```

### 5. Open the Application
Open any web browser and navigate to:
```
http://127.0.0.1:5000
```

---

## 📡 REST API Reference

All responses return standard JSON with proper HTTP status codes.

| Endpoint | Method | Description | Sample Query / Body |
| :--- | :---: | :--- | :--- |
| `/api/facts/random` | `GET` | Fetch random fact (optional category & exclusion) | `?category=Space&exclude=1,2,3` |
| `/api/facts` | `GET` | List facts with search, sort & pagination | `?search=Venus&page=1&limit=12&sort=alpha` |
| `/api/categories` | `GET` | List all 12 categories with icons and counts | *None* |
| `/api/facts/daily` | `GET` | Get today's deterministic Fact of the Day | *None* |
| `/api/stats` | `GET` | Get dynamic metrics (facts, categories, favs) | *None* |
| `/api/favorites` | `GET` | List all saved favorite facts | `?category=Science` *(optional)* |
| `/api/favorites` | `POST` | Add a fact to user favorites | `{"fact_id": 12}` |
| `/api/favorites/<id>` | `DELETE` | Remove a fact from favorites | `/api/favorites/12` |
| `/api/discoveries` | `POST` | Record a user discovery | `{"fact_id": 42}` |
| `/api/quiz` | `GET` | Get randomized quiz questions with explanations | `?limit=1` *(optional)* |

### Example API Testing with cURL / PowerShell:

#### Get a random fact:
```bash
curl http://127.0.0.1:5000/api/facts/random?category=Science
```

#### Add a favorite fact:
```bash
curl -X POST http://127.0.0.1:5000/api/favorites -H "Content-Type: application/json" -d "{\"fact_id\": 1}"
```

#### Fetch dynamic statistics:
```bash
curl http://127.0.0.1:5000/api/stats
```

---

## 🛡️ Security & Code Quality Highlights

- **Parameterized SQL Queries**: All database queries in `database.py` use SQLite parameter placeholders (`?`) to prevent SQL injection vulnerabilities.
- **Input Validation**: API endpoints enforce type checks and bounds for IDs, search parameters, and JSON payloads.
- **Foreign Key Constraints**: Foreign keys are enabled with `ON DELETE CASCADE` to maintain relational integrity between `facts`, `favorites`, and `discoveries`.
- **Zero Frontend Framework Dependencies**: High performance, lightweight vanilla JavaScript ES6+ implementation with no heavy node_modules or bundle overhead.
- **Accessibility & Responsiveness**: Semantic HTML5 tags, ARIA attributes, responsive grid systems, and touch-friendly button targets.

---

## 🎓 Academic / MCA Project Verification

This project fulfills all criteria of a comprehensive Full-Stack Software Engineering project:
- Relational Database Management System (SQLite3)
- Modular Backend Server Architecture (Python Flask REST API)
- Responsive Modern UI/UX Engineering (Glassmorphic CSS3, Vanilla JS)
- Complete CRUD Capabilities (Favorites, Discoveries, Search, Filters)
- Production-Ready Clean Code with zero placeholders.

---

&copy; 2026 **FACTVERSE** – Discover Something Amazing!
