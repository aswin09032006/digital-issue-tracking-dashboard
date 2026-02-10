const {
    registerUser,
    loginUser,
    updateUserProfile,
    getAllUsers,
    deleteUser,
    updateUserRole,
    createUser,
    updateUser
} = require('../controllers/authController');
const { protect, admin } = require('../middleware/authMiddleware');
const express = require('express');

const router = express.Router();

router.get('/test', (req, res) => res.send('Auth Routes Working'));
router.post('/register', registerUser);
router.post('/login', loginUser);
router.put('/profile', protect, updateUserProfile);

// Admin Routes
router.get('/users', protect, admin, getAllUsers);
router.post('/users', protect, admin, createUser);
router.put('/users/:id', protect, admin, updateUser);
router.delete('/users/:id', protect, admin, deleteUser);
router.put('/users/:id/role', protect, admin, updateUserRole);

module.exports = router;
