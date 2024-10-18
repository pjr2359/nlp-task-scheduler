// index.js (Backend)

require('dotenv').config(); // Load environment variables from .env file
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');

const app = express();
const port = 5000;

// Middleware
app.use(express.json()); // Parse JSON bodies
app.use(cors()); // Enable CORS for all origins

// MongoDB connection URI from environment variable
const mongoURI = process.env.MONGO_URI;


// Connect to MongoDB Atlas
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Connection event listeners
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB Atlas');
});

// Define the Task schema and model
const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: Date, required: true },
});

const Task = mongoose.model('Task', taskSchema);

// Route handlers

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
  const { description, date } = req.body;

  if (!description || !date) {
    console.error('Missing description or date in request body');
    return res.status(400).json({ message: 'Description and date are required' });
  }

  try {
    const task = new Task({
      description,
      date,
    });

    const savedTask = await task.save();

    console.log(`Task saved: ${savedTask.description} at ${savedTask.date}`);

    res.status(201).json(savedTask);
  } catch (error) {
    console.error('Error saving task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks - Retrieve all tasks
app.get('/api/tasks', async (req, res) => {
  try {
    const tasks = await Task.find().sort({ date: 1 }); // Sort tasks by date ascending
    res.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete a task by ID (Optional)
app.delete('/api/tasks/:id', async (req, res) => {
  try {
    const result = await Task.findByIdAndDelete(req.params.id);
    if (result) {
      res.json({ message: 'Task deleted' });
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
