# 🇮🇳 Which State Am I? — Indian State Quiz

A beautiful, immersive full-stack web application that challenges players to identify Indian states and union territories using educational clues about culture, landmark, geography, cuisine, and history.

---

## 🌟 Features

- **🎯 Classic Quiz**: Answer 10 questions with progressive clues (up to 5 per state). Fewer clues used = higher score.
- **⚡ Rapid Fire**: Test your instincts under pressure! 15 seconds per question with a single clue. Answer as many as you can.
- **🗺️ State Explorer**: Learn at your own pace! Explore all 28 states and 8 union territories, search for specific entries, and read their facts and list of clues.
- **🏆 Global Leaderboard**: Submit your high scores and check your rank. See who has the fastest time and best score!
- **⚡ Premium UI/UX**: Stunning modern dark-mode with glassmorphic cards, tricolor themes, and satisfying animations.
- **♿ Fully Accessible**: WCAG 2.1 compliant structure with keyboard navigation support, focus indicator rings, reduced-motion controls, and `aria-live` announcer regions.
- **🔒 Secure & Stable**: Implements rate-limiting, Helmet security headers, compression, clean input validation, and sanitization.

---

## 🛠️ Tech Stack

- **Frontend**: Vanilla HTML5, CSS3, JavaScript (ES Modules)
- **Backend**: Node.js, Express.js
- **Database**: SQLite3 (embedded using high-performance `better-sqlite3`)
- **Testing**: Jest, Supertest
- **Utility**: Helmet, CORS, Compression, express-rate-limit, express-validator, UUID

---

## 📂 Project Structure

```
├── database/
│   ├── db.js          # SQLite connection and helper queries
│   ├── quiz.db        # SQLite database file (auto-generated)
│   └── seed.js        # Seeds 36 states/UTs with 200+ clues
├── middleware/
│   ├── errorHandler.js# Error & 404 middleware handlers
│   └── validate.js    # Request validation middleware
├── public/
│   ├── css/
│   │   └── style.css  # Premium stylesheet
│   ├── js/
│   │   ├── api.js     # API client fetching wrapper
│   │   ├── app.js     # Routing & Explorer controllers
│   │   ├── quiz.js    # Quiz mechanics (Classic/Rapid)
│   │   ├── ui.js      # Animations & DOM helpers
│   │   └── leaderboard.js # Leaderboard views
│   └── index.html     # HTML SPA layout
├── routes/
│   └── api.js         # API endpoint routes
├── tests/
│   ├── api.test.js    # Express endpoints integration tests
│   └── db.test.js     # Database helper unit tests
├── .env.example       # Example environment variables config
├── .gitignore         # Untracked files list
├── jest.config.js     # Jest testing framework configuration
├── package.json       # Project dependencies & scripts
└── server.js          # App entrypoint
```

---

## 🚀 Setup & Installation

### 1. Prerequisites
Ensure you have **Node.js** (v18+) installed.

### 2. Install Dependencies
Run the package installer:
```bash
npm install
```

### 3. Setup Configuration
Copy the env config:
```bash
cp .env.example .env
```

### 4. Seed the Database
Initialize and seed the SQLite database with 36 states/UTs and ~200 clues:
```bash
npm run seed
```

### 5. Start Development Server
Start the Express server in watch mode:
```bash
npm run dev
```
Open **`http://localhost:3000`** in your browser.

---

## 🧪 Testing

The codebase includes comprehensive integration and unit tests for API endpoints and database logic.

To execute tests:
```bash
npm test
```

---

## 📡 API Endpoints

### Health check
* **`GET /api/health`**: Returns system status and uptime.

### Quiz Gameplay
* **`GET /api/quiz/start`**: Starts a session.
  * *Query params*: `mode` (`classic`|`rapid`), `difficulty` (`easy`|`medium`|`hard`|`mixed`)
* **`GET /api/quiz/question/:sessionId`**: Fetches the current question details.
* **`POST /api/quiz/hint`**: Reveals the next clue for the question.
  * *Body*: `{ "sessionId": "UUID" }`
* **`POST /api/quiz/answer`**: Submits the answer.
  * *Body*: `{ "sessionId": "UUID", "answer": "State Name" }`

### Explorer
* **`GET /api/states`**: Lists all states. Support `?search=term`.
* **`GET /api/states/:id`**: Gets state details + its full clues list.

### Leaderboard
* **`GET /api/leaderboard`**: Retrieves high scores. Support `?mode=mode&limit=num`.
* **`POST /api/scores`**: Submits player score.
  * *Body*: `{ "playerName": "Alphanumeric", "score": 500, "gameMode": "classic", "timeTaken": 120 }`

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE details.
