// index.js (Backend)

const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// Route handler
app.post('/api/tasks', (req, res) => {
    const { task, date } = req.body;
  
    if (!task || !date) {
      console.error('Missing task or date in request body');
      return res.status(400).json({ message: 'Task and date are required' });
    }
  
    const savedTask = {
      id: Date.now(),
      task,
      date,
    };
  
    console.log(`Task received: ${task} at ${date}`);
  
    res.status(201).json(savedTask);
  });
  

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
