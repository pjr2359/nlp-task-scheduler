// App.js (Enhanced Frontend)

import React, { useState, useEffect } from 'react';
import {
  Container, TextField, Button, AppBar, Toolbar, Typography, Box,
  Select, MenuItem, FormControl, InputLabel, Grid, Card, CardContent,
  CardActions, IconButton, Chip, Tabs, Tab, InputAdornment, Dialog,
  DialogTitle, DialogContent, DialogActions, Snackbar, Alert, Badge,
  Drawer, Divider, List, ListItem, ListItemIcon, ListItemText, Fab,
  useMediaQuery, useTheme, CircularProgress, Switch, FormControlLabel
} from '@mui/material';
import {
  Delete as DeleteIcon,
  Search as SearchIcon,
  CheckCircle as CheckCircleIcon,
  RadioButtonUnchecked as UncheckedIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  Dashboard as DashboardIcon,
  FormatListBulleted as ListIcon,
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material';
import './App.css';
import axios from 'axios';
import * as chrono from 'chrono-node';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import TaskDashboard from './TaskDashboard';

// Category colors for visual distinction
const categoryColors = {
  work: '#4caf50',
  personal: '#2196f3',
  shopping: '#ff9800',
  health: '#e91e63',
  finance: '#9c27b0',
  other: '#607d8b'
};

// Priority level styles
const priorityStyles = {
  high: { bgcolor: '#ffebee', color: '#d32f2f', borderColor: '#f44336', borderWidth: 2 },
  medium: { bgcolor: '#fff8e1', color: '#ff8f00', borderColor: '#ffc107', borderWidth: 1 },
  low: { bgcolor: '#e8f5e9', color: '#2e7d32', borderColor: '#4caf50', borderWidth: 1 },
};

function App() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [taskInput, setTaskInput] = useState('');
  const [dateInput, setDateInput] = useState(new Date());
  const [message, setMessage] = useState('');
  const [tasks, setTasks] = useState([]);
  const [category, setCategory] = useState('other');
  const [priority, setPriority] = useState('medium');
  const [selectedTab, setSelectedTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDateFilter, setSelectedDateFilter] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentView, setCurrentView] = useState('tasks'); // 'tasks' or 'dashboard'
  const [isLoading, setIsLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Helper function to show snackbar messages
  const showSnackbar = (message, severity = 'success') => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  // Fetch tasks from the backend on component mount
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching tasks:', error.response?.data || error.message);
      showSnackbar(`Error fetching tasks: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    if (taskInput.trim() === '') {
      showSnackbar('Please enter a task description.', 'warning');
      return;
    }

    let taskDate = dateInput;

    // If using the natural language input, try to parse the date
    if (!isAddDialogOpen) {
      // Use chrono-node to parse the date and time from the task input
      const parsedResults = chrono.parse(taskInput);
      if (parsedResults.length > 0) {
        taskDate = parsedResults[0].start.date(); // Get the parsed date
      } else {
        // If no date is found, use the current date/time
        taskDate = new Date();
      }
    }

    // Create new task object
    const newTask = {
      description: taskInput,
      date: taskDate.toISOString(),
      category: category,
      priority: priority,
      completed: false
    };

    try {
      setIsLoading(true);
      // Send the task to the backend and get the response
      const response = await axios.post('http://localhost:5000/api/tasks', newTask);

      showSnackbar(`Task added: ${response.data.description}`);

      // Fetch updated tasks
      fetchTasks();

      // Clear the form
      setTaskInput('');
      setDateInput(new Date());
      setCategory('other');
      setPriority('medium');

      // Close dialog if open
      setIsAddDialogOpen(false);
    } catch (error) {
      console.error('Error submitting task:', error.response?.data || error.message);
      showSnackbar(`Error submitting task: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to update task (edit or toggle completion)
  const updateTask = async (id, updatedFields) => {
    try {
      setIsLoading(true);
      const response = await axios.put(`http://localhost:5000/api/tasks/${id}`, updatedFields);

      // Update the tasks state
      setTasks(tasks.map(task =>
        task._id === id ? { ...task, ...updatedFields } : task
      ));

      showSnackbar("Task updated successfully");

      // Close edit dialog if open
      if (isEditDialogOpen) {
        setIsEditDialogOpen(false);
      }

    } catch (error) {
      console.error('Error updating task:', error.response?.data || error.message);
      showSnackbar(`Error updating task: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to delete a task
  const deleteTask = async (id) => {
    try {
      setIsLoading(true);
      await axios.delete(`http://localhost:5000/api/tasks/${id}`);
      // Update the tasks state
      setTasks(tasks.filter((task) => task._id !== id));
      showSnackbar("Task deleted successfully");
    } catch (error) {
      console.error('Error deleting task:', error.response?.data || error.message);
      showSnackbar(`Error deleting task: ${error.response?.data?.message || error.message}`, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Function to toggle task completion status
  const toggleTaskCompletion = (task) => {
    updateTask(task._id, { completed: !task.completed });
  };

  // Function to edit a task
  const openEditDialog = (task) => {
    setCurrentTask(task);
    setTaskInput(task.description);
    setDateInput(new Date(task.date));
    setCategory(task.category || 'other');
    setPriority(task.priority || 'medium');
    setIsEditDialogOpen(true);
  };

  // Function to handle task edit submission
  const handleEditSubmit = () => {
    if (!currentTask) return;

    updateTask(currentTask._id, {
      description: taskInput,
      date: dateInput.toISOString(),
      category: category,
      priority: priority
    });
  };

  // Get filtered tasks based on tab, search, and date filter
  const getFilteredTasks = () => {
    let filtered = [...tasks];

    // Filter by completion status (tab)
    if (selectedTab === 1) {
      filtered = filtered.filter(task => !task.completed);
    } else if (selectedTab === 2) {
      filtered = filtered.filter(task => task.completed);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(task =>
        task.description.toLowerCase().includes(term) ||
        task.category.toLowerCase().includes(term)
      );
    }

    // Filter by date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    if (selectedDateFilter === 'today') {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate < tomorrow;
      });
    } else if (selectedDateFilter === 'week') {
      filtered = filtered.filter(task => {
        const taskDate = new Date(task.date);
        return taskDate >= today && taskDate < nextWeek;
      });
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();

  // Count of incomplete tasks
  const incompleteCount = tasks.filter(task => !task.completed).length;

  // Toggle drawer
  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setIsDrawerOpen(open);
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  // Drawer content
  const drawerContent = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2 }}>
        <Typography variant="h6">Smart Scheduler</Typography>
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => setCurrentView('tasks')}>
          <ListItemIcon>
            <ListIcon />
          </ListItemIcon>
          <ListItemText primary="Tasks" />
        </ListItem>
        <ListItem button onClick={() => setCurrentView('dashboard')}>
          <ListItemIcon>
            <DashboardIcon />
          </ListItemIcon>
          <ListItemText primary="Dashboard" />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem>
          <ListItemIcon>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </ListItemIcon>
          <FormControlLabel
            control={
              <Switch
                checked={darkMode}
                onChange={toggleDarkMode}
                name="darkMode"
              />
            }
            label="Dark Mode"
          />
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <AppBar position="static">
        <Toolbar>
          {isMobile && (
            <IconButton
              size="large"
              edge="start"
              color="inherit"
              aria-label="menu"
              sx={{ mr: 2 }}
              onClick={toggleDrawer(true)}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Smart Task Scheduler
          </Typography>

          {!isMobile && (
            <>
              <Button
                color="inherit"
                onClick={() => setCurrentView('tasks')}
                sx={{ mr: 1 }}
              >
                Tasks
              </Button>
              <Button
                color="inherit"
                onClick={() => setCurrentView('dashboard')}
                sx={{ mr: 2 }}
              >
                Dashboard
              </Button>
            </>
          )}

          <Badge badgeContent={incompleteCount} color="error" sx={{ mr: 2 }}>
            <NotificationsIcon />
          </Badge>

          <IconButton color="inherit" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>

          <Button
            color="inherit"
            startIcon={<AddIcon />}
            onClick={() => {
              setTaskInput('');
              setDateInput(new Date());
              setCategory('other');
              setPriority('medium');
              setIsAddDialogOpen(true);
            }}
            sx={{ ml: 1 }}
          >
            Add Task
          </Button>
        </Toolbar>
      </AppBar>

      {/* Drawer for mobile */}
      <Drawer
        anchor="left"
        open={isDrawerOpen}
        onClose={toggleDrawer(false)}
      >
        {drawerContent}
      </Drawer>

      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        {currentView === 'dashboard' ? (
          /* Dashboard View */
          <TaskDashboard
            tasks={tasks}
            onRefresh={fetchTasks}
          />
        ) : (
          /* Tasks View */
          <>
            {/* Search and Filter Bar */}
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              mb: 2,
              p: 2,
              borderRadius: 1,
              bgcolor: darkMode ? '#333' : '#f5f5f5',
              color: darkMode ? '#fff' : 'inherit',
              className: 'search-filter-bar'
            }}>
              <TextField
                placeholder="Search tasks..."
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{
                  flexGrow: 1,
                  mr: 2,
                  '& .MuiInputBase-root': {
                    backgroundColor: darkMode ? '#444' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color={darkMode ? "primary" : "action"} />
                    </InputAdornment>
                  ),
                }}
              />

              <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
                <InputLabel id="date-filter-label" sx={{ color: darkMode ? '#fff' : 'inherit' }}>
                  Date
                </InputLabel>
                <Select
                  labelId="date-filter-label"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value)}
                  label="Date"
                  sx={{
                    backgroundColor: darkMode ? '#444' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  }}
                  startAdornment={
                    <InputAdornment position="start">
                      <CalendarIcon fontSize="small" color={darkMode ? "primary" : "action"} />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Dates</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">This Week</MenuItem>
                </Select>
              </FormControl>
            </Box>

            {/* Quick task input field */}
            <Box
              component="form"
              onSubmit={handleSubmit}
              sx={{
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                p: 2,
                borderRadius: 1,
                bgcolor: darkMode ? '#283593' : '#e3f2fd',
                boxShadow: 1,
                className: 'quick-add-bar'
              }}
            >
              <TextField
                label="Quick Add Task (with natural language date)"
                placeholder="E.g., Buy groceries tomorrow at 5pm"
                variant="outlined"
                fullWidth
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                sx={{
                  mr: 2,
                  '& .MuiInputBase-root': {
                    backgroundColor: darkMode ? '#444' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  },
                  '& .MuiInputLabel-root': {
                    color: darkMode ? '#aaa' : 'inherit'
                  }
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
              >
                Add
              </Button>
            </Box>

            {/* Task status tabs */}
            <Box sx={{
              borderBottom: 1,
              borderColor: 'divider',
              mb: 2,
              '& .MuiTabs-indicator': {
                backgroundColor: darkMode ? '#90caf9' : 'primary'
              }
            }}>
              <Tabs
                value={selectedTab}
                onChange={(e, newValue) => setSelectedTab(newValue)}
                variant="fullWidth"
                textColor={darkMode ? "inherit" : "primary"}
              >
                <Tab label="All Tasks" sx={{ color: darkMode ? '#fff' : 'inherit' }} />
                <Tab
                  label={
                    <Badge badgeContent={tasks.filter(task => !task.completed).length} color="error">
                      Active
                    </Badge>
                  }
                  sx={{ color: darkMode ? '#fff' : 'inherit' }}
                />
                <Tab label="Completed" sx={{ color: darkMode ? '#fff' : 'inherit' }} />
              </Tabs>
            </Box>

            {/* Task List */}
            {filteredTasks.length > 0 ? (
              <Grid container spacing={2}>
                {filteredTasks.map((task) => (
                  <Grid item xs={12} key={task._id}>
                    <Card
                      sx={{
                        borderLeft: `6px solid ${categoryColors[task.category] || categoryColors.other}`,
                        opacity: task.completed ? 0.7 : 1,
                        ...priorityStyles[task.priority || 'medium'],
                        backgroundColor: darkMode ? '#424242' : '#fff',
                        color: darkMode ? '#fff' : 'inherit'
                      }}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <IconButton
                              edge="start"
                              size="small"
                              color={task.completed ? "success" : darkMode ? "primary" : "default"}
                              onClick={() => toggleTaskCompletion(task)}
                              className="task-checkbox"
                            >
                              {task.completed ? <CheckCircleIcon /> : <UncheckedIcon />}
                            </IconButton>
                            <Typography
                              variant="h6"
                              component="div"
                              sx={{
                                textDecoration: task.completed ? 'line-through' : 'none',
                                color: task.completed ? (darkMode ? '#aaa' : 'text.secondary') : (darkMode ? '#fff' : 'text.primary'),
                                className: task.completed ? 'completed-task' : ''
                              }}
                            >
                              {task.description}
                            </Typography>
                          </Box>
                          <Box>
                            <Chip
                              label={task.category || 'other'}
                              size="small"
                              sx={{
                                bgcolor: categoryColors[task.category] || categoryColors.other,
                                color: 'white',
                                fontWeight: 'bold',
                                textTransform: 'capitalize',
                                className: 'category-chip'
                              }}
                            />
                            <Chip
                              label={task.priority || 'medium'}
                              size="small"
                              sx={{ ml: 1, textTransform: 'capitalize' }}
                              variant="outlined"
                              color={task.priority === 'high' ? 'error' : task.priority === 'low' ? 'success' : 'warning'}
                            />
                          </Box>
                        </Box>
                        <Typography variant="body2" color={darkMode ? "#bbb" : "text.secondary"} className="date-text">
                          <CalendarIcon fontSize="small" sx={{ mr: 0.5 }} />
                          {new Date(task.date).toLocaleString()}
                        </Typography>
                      </CardContent>
                      <CardActions>
                        <IconButton
                          color="primary"
                          onClick={() => openEditDialog(task)}
                          aria-label="edit"
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          color="error"
                          onClick={() => deleteTask(task._id)}
                          aria-label="delete"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box sx={{
                textAlign: 'center',
                py: 4,
                className: 'empty-state',
                color: darkMode ? '#bbb' : 'text.secondary'
              }}>
                <CalendarIcon sx={{ fontSize: 60, mb: 2, opacity: 0.5 }} />
                <Typography variant="h6" color={darkMode ? '#bbb' : 'text.secondary'}>
                  {searchTerm ? 'No tasks match your search' : 'No tasks found'}
                </Typography>
                <Typography variant="body2" color={darkMode ? '#aaa' : 'text.secondary'}>
                  {searchTerm ? 'Try a different search term' : 'Add a task to get started'}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={() => setIsAddDialogOpen(true)}
                  sx={{ mt: 2 }}
                >
                  Add New Task
                </Button>
              </Box>
            )}
          </>
        )}
      </Container>

      {/* Floating action button for mobile */}
      {isMobile && currentView === 'tasks' && (
        <Fab
          color="primary"
          aria-label="add"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => {
            setTaskInput('');
            setDateInput(new Date());
            setCategory('other');
            setPriority('medium');
            setIsAddDialogOpen(true);
          }}
        >
          <AddIcon />
        </Fab>
      )}

      {/* Add Task Dialog */}
      <Dialog
        open={isAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : 'inherit'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: darkMode ? '#444' : '#f5f5f5',
          color: darkMode ? '#fff' : 'inherit'
        }}>
          Add New Task
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Task Description"
              fullWidth
              variant="outlined"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: darkMode ? '#555' : '#fff',
                  color: darkMode ? '#fff' : 'inherit'
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#bbb' : 'inherit'
                }
              }}
            />

            <Box sx={{ display: 'flex', mt: 2, gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="category-label" sx={{ color: darkMode ? '#bbb' : 'inherit' }}>
                  Category
                </InputLabel>
                <Select
                  labelId="category-label"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                  sx={{
                    backgroundColor: darkMode ? '#555' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  }}
                >
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="priority-label" sx={{ color: darkMode ? '#bbb' : 'inherit' }}>
                  Priority
                </InputLabel>
                <Select
                  labelId="priority-label"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priority"
                  sx={{
                    backgroundColor: darkMode ? '#555' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  }}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date & Time"
                  value={dateInput}
                  onChange={(newValue) => setDateInput(newValue)}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          backgroundColor: darkMode ? '#555' : '#fff',
                          color: darkMode ? '#fff' : 'inherit'
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? '#bbb' : 'inherit'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: darkMode ? '#333' : '#fff' }}>
          <Button onClick={() => setIsAddDialogOpen(false)} sx={{ color: darkMode ? '#90caf9' : 'inherit' }}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Add Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            backgroundColor: darkMode ? '#333' : '#fff',
            color: darkMode ? '#fff' : 'inherit'
          }
        }}
      >
        <DialogTitle sx={{
          backgroundColor: darkMode ? '#444' : '#f5f5f5',
          color: darkMode ? '#fff' : 'inherit'
        }}>
          Edit Task
        </DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 1 }}>
            <TextField
              autoFocus
              margin="dense"
              label="Task Description"
              fullWidth
              variant="outlined"
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              sx={{
                '& .MuiInputBase-root': {
                  backgroundColor: darkMode ? '#555' : '#fff',
                  color: darkMode ? '#fff' : 'inherit'
                },
                '& .MuiInputLabel-root': {
                  color: darkMode ? '#bbb' : 'inherit'
                }
              }}
            />

            <Box sx={{ display: 'flex', mt: 2, gap: 2, flexDirection: isMobile ? 'column' : 'row' }}>
              <FormControl fullWidth variant="outlined">
                <InputLabel id="edit-category-label" sx={{ color: darkMode ? '#bbb' : 'inherit' }}>
                  Category
                </InputLabel>
                <Select
                  labelId="edit-category-label"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  label="Category"
                  sx={{
                    backgroundColor: darkMode ? '#555' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  }}
                >
                  <MenuItem value="work">Work</MenuItem>
                  <MenuItem value="personal">Personal</MenuItem>
                  <MenuItem value="shopping">Shopping</MenuItem>
                  <MenuItem value="health">Health</MenuItem>
                  <MenuItem value="finance">Finance</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth variant="outlined">
                <InputLabel id="edit-priority-label" sx={{ color: darkMode ? '#bbb' : 'inherit' }}>
                  Priority
                </InputLabel>
                <Select
                  labelId="edit-priority-label"
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  label="Priority"
                  sx={{
                    backgroundColor: darkMode ? '#555' : '#fff',
                    color: darkMode ? '#fff' : 'inherit'
                  }}
                >
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                </Select>
              </FormControl>
            </Box>

            <Box sx={{ mt: 2 }}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DateTimePicker
                  label="Date & Time"
                  value={dateInput}
                  onChange={(newValue) => setDateInput(newValue)}
                  slotProps={{
                    textField: {
                      variant: 'outlined',
                      fullWidth: true,
                      sx: {
                        '& .MuiInputBase-root': {
                          backgroundColor: darkMode ? '#555' : '#fff',
                          color: darkMode ? '#fff' : 'inherit'
                        },
                        '& .MuiInputLabel-root': {
                          color: darkMode ? '#bbb' : 'inherit'
                        }
                      }
                    }
                  }}
                />
              </LocalizationProvider>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ backgroundColor: darkMode ? '#333' : '#fff' }}>
          <Button onClick={() => setIsEditDialogOpen(false)} sx={{ color: darkMode ? '#90caf9' : 'inherit' }}>
            Cancel
          </Button>
          <Button onClick={handleEditSubmit} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbarOpen(false)}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default App;