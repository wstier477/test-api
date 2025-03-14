const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

/**
 * 用户路由
 * 处理用户信息的获取和更新
 */

/**
 * @route   GET /api/users/profile
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/profile', authenticate, getProfile);

/**
 * @route   PUT /api/users/profile
 * @desc    更新当前用户信息
 * @access  Private
 */
router.put('/profile', authenticate, updateProfile);

module.exports = router; 