# Copilot Instructions for Kana Game

This repository contains a full-stack web application for a Kana learning game. It consists of a Python Flask backend and a Vite-based JavaScript frontend.

## Project Structure

- **Root**: `/workspaces/kana-game`
- **Backend**: `backend/`
- **Frontend**: `frontend/`

## Backend (`backend/`)

- **Framework**: Python Flask.
- **Entry Point**: `app.py`.
- **Dependencies**: Managed via `requirements.txt`. Install with `pip install -r requirements.txt`.
- **Running**: Run `python app.py`. The server listens on port `8080`.
- **API**:
  - The backend exposes a JSON-RPC 2.0 endpoint at `/api`.
  - **Methods**:
    - `getNextQuestion`: Returns a random question with a prompt and acceptable answers.
    - `provideAnswer`: Accepts user submission details (score, skeleton, attempts, etc.).
  - **Data**: Questions are currently hardcoded in `app.py` in the `QUESTIONS` list.

## Frontend (`frontend/`)

- **Build Tool**: Vite.
- **Framework**: Vanilla JavaScript with Lit-based web components.
- **Key Component**: `kana-control` (npm package) is the main game component.
- **Entry Point**: `index.html` acts as the main entry, importing `src/main.js`.
- **Configuration**: `vite.config.js` sets up a proxy for `/api` to forward requests to `http://127.0.0.1:8080`.
- **Running**: Run `npm run dev` to start the development server.

## Development Workflow

1.  **Start Backend**:
    ```bash
    cd backend
    python app.py
    ```
2.  **Start Frontend**:
    ```bash
    cd frontend
    npm run dev
    ```
3.  **Access**: Open the URL provided by Vite (usually localhost with a random port).

## Key Considerations

- **JSON-RPC**: All communication between frontend and backend happens via JSON-RPC POST requests to `/api`.
- **Proxy**: The frontend development server proxies `/api` calls to the backend. Ensure both servers are running for the app to function correctly.
- **State**: The frontend is relatively stateless, fetching questions one by one. The backend currently does not persist user state (database integration may be a future step).
- **User**: The user ID is currently hardcoded as 'jomof' in the frontend `fetch` calls.

## Common Tasks

- **Adding a new question**: Add a new entry to the `QUESTIONS` list in `backend/app.py`.
- **Modifying game logic**: Check `frontend/index.html` for event listeners (`question-complete`, `question-skipped`) and `backend/app.py` for the `provideAnswer` handler.
- **Updating dependencies**:
  - Backend: Update `requirements.txt`.
  - Frontend: Update `package.json` and run `npm install`.
