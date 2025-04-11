// index.js (Enhanced Backend)

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

// Define the enhanced Task schema and model
const taskSchema = new mongoose.Schema({
  description: { type: String, required: true },
  date: { type: Date, required: true },
  category: { type: String, default: 'other' },
  priority: { type: String, default: 'medium' },
  completed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

const Task = mongoose.model('Task', taskSchema);

// Route handlers

// POST /api/tasks - Create a new task
app.post('/api/tasks', async (req, res) => {
  const { description, date, category, priority, completed } = req.body;

  if (!description || !date) {
    console.error('Missing description or date in request body');
    return res.status(400).json({ message: 'Description and date are required' });
  }

  try {
    const task = new Task({
      description,
      date,
      category: category || 'other',
      priority: priority || 'medium',
      completed: completed || false
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

// GET /api/tasks/stats - Get task statistics
app.get('/api/tasks/stats', async (req, res) => {
  try {
    const totalTasks = await Task.countDocuments();
    const completedTasks = await Task.countDocuments({ completed: true });
    const pendingTasks = totalTasks - completedTasks;

    // Count by category
    const categoryStats = await Task.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } }
    ]);

    // Count by priority
    const priorityStats = await Task.aggregate([
      { $group: { _id: "$priority", count: { $sum: 1 } } }
    ]);

    // Tasks due today
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const dueTodayCount = await Task.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      completed: false
    });

    res.json({
      total: totalTasks,
      completed: completedTasks,
      pending: pendingTasks,
      dueToday: dueTodayCount,
      byCategory: categoryStats,
      byPriority: priorityStats
    });
  } catch (error) {
    console.error('Error fetching task stats:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/tasks/:id - Get a specific task
app.get('/api/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (task) {
      res.json(task);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/tasks/:id - Update a task by ID
app.put('/api/tasks/:id', async (req, res) => {
  try {
    const result = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true } // Return the updated document
    );

    if (result) {
      res.json(result);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/tasks/:id - Delete a task by ID
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

// Extra route for demonstration - Mark all tasks as completed/uncompleted
app.put('/api/tasks/batch/status', async (req, res) => {
  const { completed } = req.body;

  if (completed === undefined) {
    return res.status(400).json({ message: 'Completed status is required' });
  }

  try {
    const result = await Task.updateMany({}, { completed });
    res.json({
      message: `${result.modifiedCount} tasks updated`,
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error batch updating tasks:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});