const express = require('express');
const router = express.Router();
const { login, register } = require('../controllers/authController');
const { authenticateToken } = require('../middleware/authMiddleware');
const { User } = require('../models');
const { formatResponse } = require('../utils/helpers');

/**
 * 认证路由
 * 处理用户登录和注册
 */

/**
 * @route   POST /api/auth/login
 * @desc    用户登录
 * @access  Public
 */
router.post('/login', login);

/**
 * @route   POST /api/auth/register
 * @desc    用户注册
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   GET /api/auth/profile
 * @desc    获取当前用户信息
 * @access  Private
 */
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });
    
    if (!user) {
      return res.status(404).json(formatResponse(404, '用户不存在'));
    }

    res.json(formatResponse(200, '获取成功', user));
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json(formatResponse(500, '获取用户信息失败', null, error));
  }
});

module.exports = router; 