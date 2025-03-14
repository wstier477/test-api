const express = require('express');
const router = express.Router();
const { Announcement, Course, User } = require('../models');
const { formatResponse } = require('../utils/formatResponse');

/**
 * 公告路由
 * 处理公告的增删改查
 */

/**
 * @route   GET /api/courses/:courseId/announcements
 * @desc    获取课程公告列表
 * @access  Private
 */
router.get('/courses/:courseId/announcements', async (req, res) => {
  try {
    const { courseId } = req.query;
    const whereClause = courseId ? { courseId } : {};

    const announcements = await Announcement.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取公告列表成功', announcements));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取公告列表失败', null, error));
  }
});

/**
 * @route   POST /api/courses/:courseId/announcements
 * @desc    发布课程公告
 * @access  Private/Teacher
 */
router.post('/courses/:courseId/announcements', async (req, res) => {
  try {
    const { courseId, title, content } = req.body;
    const announcement = await Announcement.create({
      courseId,
      title,
      content,
      creatorId: req.user.id
    });

    res.json(formatResponse(200, '创建公告成功', announcement));
  } catch (error) {
    res.status(500).json(formatResponse(500, '创建公告失败', null, error));
  }
});

/**
 * @route   GET /api/announcements/:id
 * @desc    获取公告详情
 * @access  Private
 */
router.get('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!announcement) {
      return res.status(404).json(formatResponse(404, '公告不存在'));
    }

    res.json(formatResponse(200, '获取公告详情成功', announcement));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取公告详情失败', null, error));
  }
});

/**
 * @route   PUT /api/announcements/:id
 * @desc    更新公告
 * @access  Private/Teacher
 */
router.put('/:id', async (req, res) => {
  try {
    const { title, content } = req.body;
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).json(formatResponse(404, '公告不存在'));
    }

    // 检查权限
    if (announcement.creatorId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权修改此公告'));
    }

    await announcement.update({ title, content });
    res.json(formatResponse(200, '更新公告成功', announcement));
  } catch (error) {
    res.status(500).json(formatResponse(500, '更新公告失败', null, error));
  }
});

/**
 * @route   DELETE /api/announcements/:id
 * @desc    删除公告
 * @access  Private/Teacher
 */
router.delete('/:id', async (req, res) => {
  try {
    const announcement = await Announcement.findByPk(req.params.id);

    if (!announcement) {
      return res.status(404).json(formatResponse(404, '公告不存在'));
    }

    // 检查权限
    if (announcement.creatorId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权删除此公告'));
    }

    await announcement.destroy();
    res.json(formatResponse(200, '删除公告成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除公告失败', null, error));
  }
});

module.exports = router; 