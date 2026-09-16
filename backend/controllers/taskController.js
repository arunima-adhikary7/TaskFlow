const Task = require('../models/Task');

// Get all tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({
      user: req.user.userId,
    }).sort({createdAt: -1});

    res.json(tasks);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to get tasks',
      error: error.message,
    });
  }
};

// Add task
const addTask = async (req, res) => {
  try {
    const {
      title,
      description,
      dateTime,
      deadline,
      priority,
    } = req.body;

    if (!title || title.trim() === '') {
      return res.status(400).json({
        message: 'Task title is required',
      });
    }

    const task = await Task.create({
      user: req.user.userId,
      title,
      description,
      dateTime,
      deadline,
      priority,
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to add task',
      error: error.message,
    });
  }
};

// Update task
const updateTask = async (req, res) => {
  try {
    const task = await Task.findOneAndUpdate(
      {
        _id: req.params.id,
        user: req.user.userId,
      },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

// Delete task
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    res.json({
      message: 'Task deleted successfully',
    });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to delete task',
      error: error.message,
    });
  }
};

// Complete / incomplete
const toggleTask = async (req, res) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      user: req.user.userId,
    });

    if (!task) {
      return res.status(404).json({
        message: 'Task not found',
      });
    }

    task.completed = !task.completed;

    await task.save();

    res.json(task);
  } catch (error) {
    res.status(500).json({
      message: 'Failed to update task',
      error: error.message,
    });
  }
};

module.exports = {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
};