/**
 * 智能助手路由
 * 处理智能助手相关的路由
 */

const express = require('express');
const router = express.Router();
const { chat, getHistory, getChatDetail } = require('../controllers/assistantController');
const { authenticate } = require('../middleware/auth');

/**
 * @route   POST /api/assistant/chat
 * @desc    发送消息给智能助手
 * @access  Private
 */
router.post('/chat', authenticate, chat);

/**
 * @route   GET /api/assistant/history
 * @desc    获取智能助手聊天历史
 * @access  Private
 */
router.get('/history', authenticate, getHistory);

/**
 * @route   GET /api/assistant/history/:historyId
 * @desc    获取特定聊天记录
 * @access  Private
 */
router.get('/history/:historyId', authenticate, getChatDetail);

module.exports = router; 