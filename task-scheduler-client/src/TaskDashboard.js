// TaskDashboard.js - Analytics and Dashboard component
import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Divider,
  LinearProgress,
  Button
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend
} from 'recharts';
import axios from 'axios';

// Category colors (matching the ones in App.js)
const categoryColors = {
  work: '#4caf50',
  personal: '#2196f3',
  shopping: '#ff9800',
  health: '#e91e63',
  finance: '#9c27b0',
  other: '#607d8b'
};

// Priority colors
const priorityColors = {
  high: '#f44336',
  medium: '#ff9800',
  low: '#4caf50'
};

const TaskDashboard = ({ tasks, onRefresh }) => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    // Process tasks data for charts
    if (tasks && tasks.length > 0) {
      calculateStats();
    }
  }, [tasks]);

  const calculateStats = () => {
    // Calculate completion rate
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter(task => task.completed).length;
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    // Group by category
    const categoryGroups = {};
    tasks.forEach(task => {
      const category = task.category || 'other';
      if (!categoryGroups[category]) {
        categoryGroups[category] = 0;
      }
      categoryGroups[category]++;
    });

    const categoryData = Object.keys(categoryGroups).map(category => ({
      name: category,
      value: categoryGroups[category]
    }));

    // Group by priority
    const priorityGroups = {};
    tasks.forEach(task => {
      const priority = task.priority || 'medium';
      if (!priorityGroups[priority]) {
        priorityGroups[priority] = 0;
      }
      priorityGroups[priority]++;
    });

    const priorityData = Object.keys(priorityGroups).map(priority => ({
      name: priority,
      value: priorityGroups[priority]
    }));

    // Calculate tasks due soon
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    const dueTodayCount = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return !task.completed && taskDate >= today && taskDate < tomorrow;
    }).length;

    const dueThisWeekCount = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return !task.completed && taskDate >= today && taskDate < nextWeek;
    }).length;

    // Calculate overdue tasks
    const overdueCount = tasks.filter(task => {
      const taskDate = new Date(task.date);
      return !task.completed && taskDate < today;
    }).length;

    // Set all stats
    setStats({
      totalTasks,
      completedTasks,
      pendingTasks: totalTasks - completedTasks,
      completionRate,
      categoryData,
      priorityData,
      dueTodayCount,
      dueThisWeekCount,
      overdueCount
    });
  };

  // Function to clear completed tasks
  const clearCompletedTasks = async () => {
    setLoading(true);
    try {
      // Here we assume you have an endpoint to delete multiple tasks
      // You might need to implement this in your backend
      const completedTaskIds = tasks.filter(task => task.completed).map(task => task._id);

      // For demo purposes, we'll delete them one by one
      for (const id of completedTaskIds) {
        await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      }

      // Refresh the task list
      if (onRefresh) {
        onRefresh();
      }

    } catch (error) {
      console.error('Error clearing completed tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!stats) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4, mb: 6 }}>
      <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
        Task Dashboard
      </Typography>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Total Tasks
              </Typography>
              <Typography variant="h3">
                {stats.totalTasks}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Completed
              </Typography>
              <Typography variant="h3">
                {stats.completedTasks}
              </Typography>
              <LinearProgress
                variant="determinate"
                value={stats.completionRate}
                color="success"
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Due Today
              </Typography>
              <Typography variant="h3" color={stats.dueTodayCount > 0 ? "warning.main" : "text.primary"}>
                {stats.dueTodayCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="subtitle2" color="text.secondary">
                Overdue
              </Typography>
              <Typography variant="h3" color={stats.overdueCount > 0 ? "error.main" : "text.primary"}>
                {stats.overdueCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Charts Row */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Category Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Category
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie
                  data={stats.categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {stats.categoryData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={categoryColors[entry.name] || categoryColors.other}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Priority Distribution */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="h6" gutterBottom>
              Tasks by Priority
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={stats.priorityData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="value" name="Tasks">
                  {stats.priorityData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={priorityColors[entry.name] || priorityColors.medium}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>

      {/* Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
        {stats.completedTasks > 0 && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={clearCompletedTasks}
            disabled={loading}
          >
            {loading ? "Clearing..." : `Clear ${stats.completedTasks} Completed Task${stats.completedTasks > 1 ? 's' : ''}`}
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default TaskDashboard;