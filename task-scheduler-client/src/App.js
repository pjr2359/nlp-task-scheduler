import React, { useState } from 'react';

function App() {
  const [task, setTask] = useState('');
  const [response, setResponse] = useState(null);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('http://localhost:5000/api/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task }),
    });

    const data = await res.json();
    setResponse(data);
  };

  return (
    <div className="App">
      <h1>Task Scheduler</h1>
      <form onSubmit={handleTaskSubmit}>
        <input
          type="text"
          value={task}
          onChange={(e) => setTask(e.target.value)}
          placeholder="Enter your task"
        />
        <button type="submit">Submit</button>
      </form>

      {response && (
        <div>
          <h2>Task Created</h2>
          <p>{response.message}</p>
          <p>Task: {response.task}</p>
          <p>Parsed Date/Time: {new Date(response.parsedDates).toString()}</p>
        </div>
      )}
    </div>
  );
}

export default App;
