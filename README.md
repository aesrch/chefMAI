# Chef MAI

## Overview

Chef MAI is an ingredient-based smart recipe recommendation system designed to help users discover, create, and adapt recipes using ingredients they already have in their kitchen. 

The system leverages:
* **Computer Vision Ingredient Detection**: Zero-shot food ingredient classification using CLIP (`ViT-B/32`).
* **Smart Ingredient Substitutions**: Fuzzy matching against a pre-seeded library of alternative ingredient mappings.
* **Naive Bayes Classification**: Statistical recipe suitability assessment.
* **Bayesian Learning**: Adaptive user genre and recipe affinity estimation using Beta distribution updates.
* **Relevance-Based Recipe Matching**: A Jaccard-style scoring algorithm comparing available ingredients to recipe requirements.

With Chef MAI, users can:
* **Enter ingredients manually** via an autocomplete search bar.
* **Upload ingredient images** or scan their fridge with a camera to automatically identify available items.
* **Receive ranked recipe recommendations** with transparent score breakdowns.
* **Receive substitution suggestions** for missing items based on their current pantry items.
* **Improve recommendations** over time by providing feedback (liking, cooking, bookmarking) which updates the Bayesian user preference model.

---

## Features

### Recipe Recommendation Engine
* **Ingredient-Based Recommendations**: Scores and filters recipes using the ingredients in the user's pantry.
* **Ingredient Match Scoring**: A normalization algorithm comparing pantry matches against required recipe ingredients.
* **Personalized Recommendations**: Automatically scales and weights scores based on historical user interactions.
* **Transparent Ranking System**: Shows users exactly how matching, classification, and preferences factored into their score.

### Computer Vision
* **Ingredient Detection from Images**: Parses image files using a deep learning vision model to extract a list of ingredients.
* **CV → Recommendation Pipeline**: In a single request, processes uploaded pictures, detects the ingredients, and outputs tailored recipe suggestions.

### Smart Ingredient Substitutions
* **Missing Ingredient Detection**: Pinpoints which ingredients are missing for a given recipe.
* **Alternative Ingredient Suggestions**: Recommends appropriate substitutes, including conversion ratios, confidence metrics, and usage notes.

### Machine Learning
* **Naive Bayes Suitability Classification**: Categorizes recipes as suitable or unsuitable using prior log-space probabilities and Laplace smoothing ($\alpha = 1.0$) to handle unseen features.
* **Bayesian User Preference Learning**: Tracks user interactions (viewing, cooking, saving, rating) to dynamically compute posterior means using updated Beta priors.

### Analytics & Metrics Dashboard
* **Precision**: Measures classification exactness.
* **Recall**: Measures classification coverage.
* **F1 Score**: Harmonic mean of Precision and Recall.
* **Precision@K**: Evaluates recommendation quality in the top $K$ ($K = 3, 5, 10$) results.
* **Average Ingredient Match Score**: Tracks average matching coverage for recommended recipes.

### User Features
* **Interactive Cooking Mode**: Step-by-step cooking guide with an ingredient checklist.
* **Favorites & Bookmarks**: Save recipes to a personalized bookmark list.
* **Ratings & Reviews**: Rate recipes (1-5 stars) and write written reviews.
* **Dynamic Feedback Loop**: Track positive (like, cook, save) or negative (dislike) signals to refine the user's affinity profile.

### Admin Features
* **System KPIs**: Real-time summary of recommendation logs and feedback counts.
* **Metrics Dashboard**: View live classification metrics, Precision@K scores, and retrain models on demand.
* **User Management**: Search, view, suspend, or delete user accounts.
* **Review Moderation**: Approve or delete flagged reviews.

---

## System Architecture

Chef MAI is built using a modern, multi-tiered architecture consisting of a React client, a Kotlin Ktor server, a MySQL relational database, and a FastAPI computer vision server.

### Architecture Diagrams

#### Core Recommendation Architecture
```
User
  ↓
React Frontend (Vite, TypeScript, TailwindCSS)
  ↓
Ktor Backend (Kotlin, Exposed ORM)
  ↓
Recommendation Engine (MatchScoring, NaiveBayes, BayesianPref)
  ↓
MySQL Database (cookingdb)
```

#### Computer Vision Pipeline
```
Image Upload
  ↓
YOLO (CLIP) Server (FastAPI, ViT-B/32 CLIP)
  ↓
Detected Ingredients
  ↓
Recommendation Engine (Ktor)
  ↓
Scored Recommendations Output
```

---

## Recommendation Algorithm

Chef MAI ranks recipes using a weighted combination of three distinct matching signals:

$$\text{FinalScore} = (0.50 \times \text{IngredientMatchScore}) + (0.30 \times \text{NaiveBayesSuitability}) + (0.20 \times \text{BayesianPreferenceScore})$$

### Component Breakdown

1. **Ingredient Match Score (Weight: 50%)**  
   Measures the direct intersection between user-supplied pantry ingredients and the recipe's ingredients:
   $$\text{IngredientMatchScore} = \frac{\text{Available Ingredients Used in Recipe}}{\text{Total Ingredients Required by Recipe}}$$

2. **Naive Bayes Suitability (Weight: 30%)**  
   Calculates the statistical likelihood that a recipe is "suitable" or "unsuitable" for the current context. Uses Laplace smoothing to avoid zero-probability traps for unseen features, and maps the log-probabilities back to a normalized ratio using a Softmax-like function.

3. **Bayesian Preference Score (Weight: 20%)**  
   Calculates the user's affinity for the recipe's genre using Beta distribution updates. Starting from a uniform prior ($B(1,1)$), the system applies positive or negative weights based on interactions:
   * **Cook**: $+3.0$ alpha weight
   * **Like / Rate**: $+2.0$ alpha weight
   * **Save**: $+1.5$ alpha weight
   * **View**: $+0.5$ alpha weight
   * **Dislike**: $+2.0$ beta weight

---

## Database Schema

The relational schema is mapped via **Exposed ORM** and consists of the following tables:

* **`acctable`**: User accounts table. Stores names, usernames, BCrypt-hashed passwords, profile descriptions, links, and profile picture references.
* **`rcptable`**: Recipes table. Stores recipe names, genres, descriptions, comma-separated ingredient lists, pipe-delimited (`||`) cooking steps, and parallel comma-separated ingredient amounts.
* **`ratetable`** / **`rateTable`**: User ratings and reviews. Maps relationships between accounts and recipes, containing star ratings (1-5) and written feedback.
* **`rcpcoltable`**: User bookmark collections table. Relates users to their favorited/saved recipes via a composite primary key.
* **`imgtable`**: Image metadata table. Stores file names, local system paths, sizes, and MIME types for uploaded profile images and recipes.
* **`ingredient_substitutions`**: Substitution database. Contains original-to-substitute mappings, substitution ratios, categories, confidence thresholds, and notes.
* **`nb_model_params`**: Naive Bayes parameters. Stores the trained feature probabilities and class logs.
* **`user_preferences`**: Bayesian logs. Stores interaction signals (`view`, `cook`, `like`, `dislike`, `save`, `rate`) mapped to user accounts and recipe IDs.
* **`recommendation_logs`**: System logs. Stores the intermediate scores (`ingredient_match`, `nb_suitability`, `preference_score`, `final_score`) and explicit user feedback (`accepted`, `rejected`, `cooked`, `ignored`) for every recommendation query.

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
| :--- | :---: | :--- |
| **JDK** | `17+` | Compiler & runtime environment for Ktor backend |
| **Node.js** | `18+` | Package manager & dev server for Vite React frontend |
| **MySQL** | `8.0+` | Relational database storage |
| **Python** | `3.9+` | Runtime environment for the Computer Vision server |
| **Git** | `Latest` | Version control |

---

## Installation Guide

### 1. Clone Repository
```bash
git clone <repository-url>
cd chefMAI
```

### 2. Database Setup
Ensure MySQL is running, then log in to your MySQL client and create the database:
```sql
CREATE DATABASE IF NOT EXISTS cookingdb;
```
Run the database migrations in order:
```bash
mysql -u root -p cookingdb < backend/migrations/V001__create_ingredient_substitutions.sql
mysql -u root -p cookingdb < backend/migrations/V001b__seed_substitutions.sql
mysql -u root -p cookingdb < backend/migrations/V002__create_nb_model_params.sql
mysql -u root -p cookingdb < backend/migrations/V003__create_user_preferences.sql
mysql -u root -p cookingdb < backend/migrations/V004__create_recommendation_logs.sql
```

### 3. Backend Setup
Configure your environment variables in `backend/.env`. Example:
```env
DB_URL=jdbc:mysql://localhost:3306/cookingdb
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USER=root
DB_PASSWORD=your_password
IMAGE_BASE_PATH=D:/files/chefMAI/backend
YOLO_BASE_URL=http://localhost:8001
```

Run the backend server:
* **macOS / Linux**:
  ```bash
  cd backend
  ./gradlew run
  ```
* **Windows (PowerShell)**:
  ```powershell
  cd backend
  .\gradlew.bat run
  ```

* **Expected Outputs**:
  * Root endpoint: `http://localhost:8080`
  * Health check: `http://localhost:8080/health` (should respond with `{"status":"OK","service":"ktor-backend"}`)
  * NB model auto-trains on startup.

### 4. Frontend Setup
Navigate into the frontend directory, install the required packages, and start the development server:
```bash
cd frontend
npm install
npm run dev
```

* **Expected Outputs**:
  * Local site: `http://localhost:5173`

### 5. Computer Vision Server Setup (Optional)
Navigate into the `yolo-service` directory, install the Python dependencies, and run the FastAPI server:
```bash
cd yolo-service
pip install -r requirements.txt
uvicorn app:app --port 8001
```

* **Expected Outputs**:
  * Local vision server: `http://localhost:8001`
  * Zero-shot image classification running using CLIP models.

---

## Running the Entire System

To run the full stack simultaneously, open three separate terminal windows:

### Terminal 1 — Backend
```powershell
cd backend
.\gradlew.bat run
```

### Terminal 2 — Frontend
```powershell
cd frontend
npm run dev
```

### Terminal 3 — Computer Vision Service
```powershell
cd yolo-service
uvicorn app:app --port 8001
```

---

## API Documentation

### Recommendations
* `POST /recommend`: Main recommendation endpoint. Accepts pantry ingredients and returns sorted, scored recipes.
* `POST /recommend/feedback`: Log feedback (e.g. `accepted`, `cooked`, `rejected`, `ignored`) for a generated recommendation.

### Substitutions
* `GET /substitutions?ingredient=X`: Search for substitutions for a specific ingredient.
* `GET /substitutions/all`: Retrieve all available substitutions.

### Naive Bayes
* `POST /nb/train`: Manually trigger retraining of the classification model.
* `GET /nb/status`: Retrieve the current model parameters status.

### Preferences
* `POST /preferences/track`: Track a user interaction (like, view, cook, rate) to update preference weights.
* `GET /preferences/scores`: Get the current logged-in user's genre affinity scores.

### Metrics
* `GET /metrics/summary`: Retrieve accuracy, precision, recall, F1, average match, and sample feedback tallies.
* `GET /metrics/precision-at-k/{k}`: Get the recommendation precision computed at rank $k$.

### Computer Vision
* `POST /detection/recommend`: Upload an image file; returns detected ingredients and immediate recipe matches.

---

## Example API Requests

### 1. Recipe Recommendation (`POST /recommend`)
```bash
curl -X POST http://localhost:8080/recommend \
  -H "Content-Type: application/json" \
  -d '{"ingredients": ["garlic", "onion", "beef"], "accId": "acc-001", "topK": 5}'
```

### 2. Ingredient Substitution (`GET /substitutions`)
```bash
curl -X GET "http://localhost:8080/substitutions?ingredient=milk"
```

### 3. Feedback Submission (`POST /recommend/feedback`)
```bash
curl -X POST http://localhost:8080/recommend/feedback \
  -H "Content-Type: application/json" \
  -d '{"logId": "log-a1b2c3d4", "feedback": "cooked"}'
```

### 4. Metrics Retrieval (`GET /metrics/summary`)
```bash
curl -X GET http://localhost:8080/metrics/summary
```

---

## Project Structure

```
chefMAI/
├── backend/
│   ├── migrations/               # SQL schema and seed files
│   ├── src/
│   │   ├── main/kotlin/com/example/
│   │   │   ├── client/           # Clients connecting to external microservices
│   │   │   ├── db/               # Table DSL definitions (Exposed)
│   │   │   ├── dto/              # Serializable data classes for Ktor
│   │   │   ├── repository/       # Exposed CRUD interfaces
│   │   │   ├── routes/           # Routing and endpoint definitions
│   │   │   ├── service/          # Recommender algorithm math and model logic
│   │   │   └── session/          # User Session data definitions
│   │   └── test/kotlin/com/example/ # Backend unit and integration tests
│   ├── build.gradle.kts
│   └── gradlew.bat
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/       # Screens (Kitchen, Admin, Metrics, Discover)
│   │   │   └── App.tsx           # Router and main layout logic
│   │   ├── main.tsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.ts
├── yolo-service/
│   ├── app.py                    # CLIP FastAPI object detector
│   └── requirements.txt
├── PROJECT_MEMORY.md             # Persistent project summary and log
└── README.md
```

---

## Testing

### Backend Testing
To run the Gradle test suites (including endpoint routing checks, database integrations, and formula unit checks):
```bash
cd backend
./gradlew test
```

### Frontend Testing
Component structures are validated by completing production builds using Vite's type checker:
```bash
cd frontend
npm run build
```

### Recommendation Testing
Algorithm outputs can be verified by reviewing calculations dynamically printed in the backend console during query requests, or by checking metrics summaries retrieved at `/metrics/summary`.

### Computer Vision Testing
Send test image files directly to the FastAPI server using `/detect` on port 8001 or through the frontend UI by dropping a file onto the pantry component drag-drop area.

---

## Known Limitations

* **YOLO (CLIP) Service Requirement**: Ingredient detection from images fails gracefully (returns a 503) if the FastAPI Python server is offline.
* **Recipe Metadata Defaults**: Time, calories, servings, difficulty, and ratings on the frontend default to preset values (`30mins`, `400cal`, `Medium`, etc.) because the baseline `rcptable` schema does not store these columns natively yet.
* **Dataset Dependencies**: Recommendations performance (average recall/precision) scales based on the size and diversity of the underlying recipe dataset (currently seeded with 25 recipes).

---

## Contributors

**Group 4**
* Vinjireh Caasi
* Chelsea Lauren Cabrera
* Joshua Enzo Carpio
* Jule Alexander Coralde
* Bien Jeric Dela Paz
* Dominic Christian Isais
* Jake Anthony Lamac
* Ethan Kelvin Loanzon
* Arwen Therese Emmanuelle Matinong
* Kristina Casandra Nagera
* Hans Naperi
* Landon Lawrence Peralta

---

## License

This project is licensed under the Academic/Educational Use License. It is intended solely for university capstone assessment, evaluation, and educational demonstration. Redistribution or commercial use is prohibited.
