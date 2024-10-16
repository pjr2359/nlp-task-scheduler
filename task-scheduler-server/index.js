const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 5000;
const chrono = require('chrono-node');

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Sample route to handle task submission
app.post('/api/tasks', (req, res) => {
    const task = req.body.task;
    
    if (!task) {
      return res.status(400).json({ message: 'Task is required' });
    }
  
    // Use chrono-node to parse date/time from the task string
    const parsedDates = chrono.parseDate(task);
  
    if (!parsedDates) {
      return res.status(400).json({ message: 'Could not extract a date/time from the task' });
    }
  
    console.log(`Task received: ${task}`);
    console.log(`Parsed date/time: ${parsedDates}`);
  
    // Send the response with the parsed date/time
    res.status(201).json({ message: 'Task created', task, parsedDates });
  });

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
