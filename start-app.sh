#!/bin/bash

# Navigate to server folder and start the backend

echo "Starting the server..."
cd task-scheduler-server
npm install
node index.js &

# Navigate to client folder and start the frontend
echo "Starting the client..."
cd ../task-scheduler-client
npm install
npm start &

# Wait for both processes to complete
wait

echo "App is running at http://localhost:3000"
