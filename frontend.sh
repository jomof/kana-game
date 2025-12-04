#!/bin/bash
set -e

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Start the application
echo "Starting frontend..."
npm run dev
