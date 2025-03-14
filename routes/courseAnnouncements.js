const express = require('express');
const router = express.Router();
const { 
  getCourseAnnouncements, 
  createAnnouncement 
} = require('../controllers/announcementController');
const { authenticate, isTeacher } = require('../middleware/auth');

/**
 * 课程公告路由
 * 处理课程公告的增删改查
 */

/**
 * @route   GET /api/courses/:courseId/announcements
 * @desc    获取课程公告列表
 * @access  Private
 */
router.get('/:courseId/announcements', authenticate, getCourseAnnouncements);

/**
 * @route   POST /api/courses/:courseId/announcements
 * @desc    发布课程公告
 * @access  Private/Teacher
 */
router.post('/:courseId/announcements', authenticate, isTeacher, createAnnouncement);

module.exports = router; 