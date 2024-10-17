import React, { useState } from 'react';
import { Container, TextField, Button, AppBar, Toolbar, Typography, Box } from '@mui/material';
import './App.css';
import axios from 'axios';

function App() {
  const [task, setTask] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (task.trim() === '') {
      setMessage('Please enter a task.');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/api/tasks', { task });
      setMessage(`Task submitted: ${response.data.task}`);
      setTask(''); // Clear the input field
    } catch (error) {
      setMessage('Error submitting task.');
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
            value={task}
            onChange={(e) => setTask(e.target.value)}
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
      </Container>
    </div>
  );
}

export default App;
 