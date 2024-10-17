# Task Scheduler with NLP and Material-UI

## Project Description
This is a personal task scheduling app that allows users to schedule tasks by typing in natural language (e.g., "Remind me to go to the gym every Monday at 7 PM"). The app features a clean UI with Material-UI components, including a calendar for selecting task dates and a list to display tasks in chronological order.

### Features:
- Task scheduling with natural language input.
- Task list with date and time display.
- Calendar view for easy task date selection.
- REST API integration for task storage and retrieval.

### Technologies Used:
- **Frontend**: React, Material-UI
- **Backend**: Node.js, Express.js
- **NLP**: NLP processing with custom rules (using NLP.js or other libraries).
- **Database**: (Optional) You can extend this with MongoDB or another database for persistent storage.

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>

2.  Navigate to the client and server directories and install           dependencies:
    cd task-scheduler-client
    npm install

    cd ../task-scheduler-server
    npm install
3. Start the client and server:
    ./start-app.sh
