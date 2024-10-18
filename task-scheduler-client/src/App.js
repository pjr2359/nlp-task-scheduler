// App.js (Frontend)

import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, AppBar, Toolbar, Typography, Box,
} from '@mui/material';
import './App.css';
import axios from 'axios';
import * as chrono from 'chrono-node';

function App() {
  const [taskInput, setTaskInput] = useState('');
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from the backend on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/tasks');
        setTasks(response.data);
      } catch (error) {
        console.error('Error fetching tasks:', error.response?.data || error.message);
        setMessage(`Error fetching tasks: ${error.response?.data?.message || error.message}`);
      }
    };

    fetchTasks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (taskInput.trim() === '') {
      setMessage('Please enter a task.');
      return;
    }

    // Use chrono-node to parse the date and time from the task input
    const parsedResults = chrono.parse(taskInput);
    if (parsedResults.length === 0) {
      setMessage('Could not extract date/time from the task.');
      return;
    }

    const taskDate = parsedResults[0].start.date(); // Get the parsed date

    // Extract the task description by removing the parsed date text from the input
    const taskDescription = taskInput.replace(parsedResults[0].text, '').trim();

    const newTask = {
      description: taskDescription || parsedResults[0].text,
      date: taskDate.toISOString(),
    };

    // Log the new task
    console.log('New Task:', newTask);

    try {
      // Send the task to the backend and get the response
      const response = await axios.post('http://localhost:5000/api/tasks', newTask);

      // Use the response data
      setMessage(`Task submitted: ${response.data.description}`);

      // Fetch updated tasks
      const updatedTasks = await axios.get('http://localhost:5000/api/tasks');
      setTasks(updatedTasks.data);

      setTaskInput(''); // Clear the input field
    } catch (error) {
      console.error('Error submitting task:', error.response?.data || error.message);
      setMessage(`Error submitting task: ${error.response?.data?.message || error.message}`);
    }
  };

  // Function to delete a task
  const deleteTask = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      // Update the tasks state
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error.response?.data || error.message);
      setMessage(`Error deleting task: ${error.response?.data?.message || error.message}`);
    }
  };

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Task Scheduler</Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="sm" style={{ marginTop: '50px' }}>
        <Typography variant="h5" gutterBottom>
          Enter your task:
        </Typography>
        <Box
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}
        >
          <TextField
            label="Task"
            variant="outlined"
            fullWidth
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
          />
          <Button type="submit" variant="contained" color="primary">
            Submit Task
          </Button>
        </Box>
        {message && (
          <Typography variant="body1" color="textSecondary" style={{ marginTop: '20px' }}>
            {message}
          </Typography>
        )}

        {/* Task List Rendering Code */}
        {tasks.length > 0 && (
          <Box style={{ marginTop: '30px' }}>
            <Typography variant="h6">Scheduled Tasks:</Typography>
            {tasks.map((task) => (
              <Box key={task._id} style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
                <Typography variant="body1">{task.description}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {new Date(task.date).toLocaleString()}
                </Typography>
                <Button
                  variant="outlined"
                  color="secondary"
                  onClick={() => deleteTask(task._id)}
                  style={{ marginTop: '10px' }}
                >
                  Delete
                </Button>
              </Box>
            ))}
          </Box>
        )}
      </Container>
    </div>
  );
}

export default App;
