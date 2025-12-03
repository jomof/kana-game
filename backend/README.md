# Backend Service

This is a Python Flask application that serves a JSON-RPC API for the Kana Game.

## Setup

1.  Navigate to the `backend` directory:
    ```bash
    cd backend
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running Locally

Run the application:
```bash
python app.py
```

The server will start on `http://localhost:8080`.

## API Usage

### `getNextQuestion`

**Request:**
```json
POST /api
{
    "jsonrpc": "2.0",
    "method": "getNextQuestion",
    "params": [],
    "id": 1
}
```

**Response:**
```json
{
    "jsonrpc": "2.0",
    "result": {
        "prompt": "I live[すむ] in Seattle[シアトル].",
        "answers": ["私 は シアトル に 住んでいます。", ...]
    },
    "id": 1
}
```

## Deployment to Google Cloud Run

1.  Build the container image:
    ```bash
    gcloud builds submit --tag gcr.io/PROJECT-ID/kana-backend
    ```

2.  Deploy to Cloud Run:
    ```bash
    gcloud run deploy kana-backend --image gcr.io/PROJECT-ID/kana-backend --platform managed
    ```
