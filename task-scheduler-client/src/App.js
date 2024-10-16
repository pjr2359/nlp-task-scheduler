import { useState } from 'react';
import './App.css';

function App() {
  const [task, setTask] = useState('');
  const [tasks, setTasks] = useState([]);

  // Handle task submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (task.trim()) {
      setTasks([...tasks, task]);
      setTask('');  // Clear input after submission
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Task Scheduler with Natural Language</h1>

        {/* Task Input Form */}
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter a task (e.g., 'Remind me to go to the gym')"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            className="task-input"
          />
          <button type="submit" className="submit-button">Add Task</button>
        </form>

        {/* Display Scheduled Tasks */}
        <div className="task-list">
          <h2>Scheduled Tasks</h2>
          <ul>
            {tasks.map((t, index) => (
              <li key={index}>{t}</li>
            ))}
          </ul>
        </div>
      </header>
    </div>
  );
}

export default App;
