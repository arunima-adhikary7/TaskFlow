const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');

const {
  getTasks,
  addTask,
  updateTask,
  deleteTask,
  toggleTask,
} = require('../controllers/taskController');

const router = express.Router();

router.get('/', authMiddleware, getTasks);

router.post('/', authMiddleware, addTask);

router.put('/:id', authMiddleware, updateTask);

router.delete('/:id', authMiddleware, deleteTask);

router.patch('/:id/toggle', authMiddleware, toggleTask);

module.exports = router;