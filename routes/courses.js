const express = require('express');
const router = express.Router();
const { 
  getCourses, 
  createCourse, 
  getCourseById, 
  updateCourse, 
  deleteCourse 
} = require('../controllers/courseController');
const { authenticate, isTeacher } = require('../middleware/auth');

/**
 * 课程路由
 * 处理课程的增删改查
 */

/**
 * @route   GET /api/courses
 * @desc    获取课程列表
 * @access  Private
 */
router.get('/', authenticate, getCourses);

/**
 * @route   POST /api/courses
 * @desc    创建新课程
 * @access  Private/Teacher
 */
router.post('/', authenticate, isTeacher, createCourse);

/**
 * @route   GET /api/courses/:id
 * @desc    获取课程详情
 * @access  Private
 */
router.get('/:id', authenticate, getCourseById);

/**
 * @route   PUT /api/courses/:id
 * @desc    更新课程信息
 * @access  Private/Teacher
 */
router.put('/:id', authenticate, isTeacher, updateCourse);

/**
 * @route   DELETE /api/courses/:id
 * @desc    删除课程
 * @access  Private/Teacher
 */
router.delete('/:id', authenticate, isTeacher, deleteCourse);

module.exports = router; 