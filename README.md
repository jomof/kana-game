# Kana Game

[![Canary Build](https://github.com/jomof/kana-game/actions/workflows/canary.yml/badge.svg)](https://github.com/jomof/kana-game/actions/workflows/canary.yml)

A web-based game for learning Japanese Kana and grammar.

## Project Structure

*   `backend/`: Python Flask application serving the JSON-RPC API.
*   `frontend/`: Web frontend using Lit and Vite.
    *   `temp_kana_control/`: Custom Lit component for Kana input.

## Development Setup

### Prerequisites

*   Node.js and npm
*   Python 3.11+

### Backend

The backend is a Flask application that serves the game data.

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```

2.  Create and activate a virtual environment:
    ```bash
    python3 -m venv venv
    source venv/bin/activate
    ```

3.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4.  Start the server:
    ```bash
    python app.py
    ```
    The backend will run at `http://localhost:8080`.

### Frontend

The frontend is built with Vite.

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```

2.  Install dependencies:
    ```bash
    npm install
    ```

3.  Start the development server:
    ```bash
    npm run dev
    ```
    The frontend will typically run at `http://localhost:5173` (check the terminal output).

## API

The backend provides a JSON-RPC API at `/api`.

### JSON-RPC Methods

#### `getNextQuestion`

*   **Description**: Retrieves a random question from the server.
*   **Params**: `[]` (None required)
*   **Returns**: A single question object containing a `prompt` and a list of acceptable `answers`.
    ```json
    {
      "prompt": "I live[すむ] in Seattle[シアトル].",
      "answers": [
        "私 は シアトル に 住んでいます。",
        "私 は シアトル に 住んでる。"
      ]
    }
    ```

#### `provideAnswer`

*   **Description**: Submits an answer to the server (currently logs the answer).
*   **Params**: The answer data (e.g., `{"question": "...", "answer": "..."}`).
*   **Returns**: `"ok"`

### Other Endpoints

#### `GET /health`

*   **Description**: Health check endpoint.
*   **Returns**: `{"status": "healthy"}`
