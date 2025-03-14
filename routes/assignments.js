const express = require('express');
const router = express.Router();
const { Assignment, Course, User, AssignmentSubmission } = require('../models');
const { formatResponse } = require('../utils/formatResponse');
const { Op } = require('sequelize');

// 获取作业列表
router.get('/', async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'upcoming':
          whereClause.deadline = { [Op.gt]: now };
          break;
        case 'ongoing':
          whereClause.deadline = { [Op.gte]: now };
          break;
        case 'ended':
          whereClause.deadline = { [Op.lt]: now };
          break;
      }
    }

    const assignments = await Assignment.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username']
        }
      ],
      order: [['deadline', 'DESC']]
    });

    res.json(formatResponse(200, '获取作业列表成功', assignments));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取作业列表失败', null, error));
  }
});

// 创建作业
router.post('/', async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      deadline,
      score
    } = req.body;

    const assignment = await Assignment.create({
      courseId,
      teacherId: req.user.id,
      title,
      description,
      deadline,
      score
    });

    res.json(formatResponse(200, '创建作业成功', assignment));
  } catch (error) {
    res.status(500).json(formatResponse(500, '创建作业失败', null, error));
  }
});

// 获取作业详情
router.get('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username']
        }
      ]
    });

    if (!assignment) {
      return res.status(404).json(formatResponse(404, '作业不存在'));
    }

    res.json(formatResponse(200, '获取作业详情成功', assignment));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取作业详情失败', null, error));
  }
});

// 更新作业
router.put('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json(formatResponse(404, '作业不存在'));
    }

    // 检查权限
    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权修改此作业'));
    }

    const {
      title,
      description,
      deadline,
      score
    } = req.body;

    await assignment.update({
      title,
      description,
      deadline,
      score
    });

    res.json(formatResponse(200, '更新作业成功', assignment));
  } catch (error) {
    res.status(500).json(formatResponse(500, '更新作业失败', null, error));
  }
});

// 删除作业
router.delete('/:id', async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json(formatResponse(404, '作业不存在'));
    }

    // 检查权限
    if (assignment.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权删除此作业'));
    }

    // 检查是否有学生已提交作业
    const submissions = await AssignmentSubmission.count({
      where: { assignmentId: assignment.id }
    });

    if (submissions > 0) {
      return res.status(400).json(formatResponse(400, '已有学生提交作业，无法删除'));
    }

    await assignment.destroy();
    res.json(formatResponse(200, '删除作业成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除作业失败', null, error));
  }
});

// 获取作业提交列表
router.get('/:id/submissions', async (req, res) => {
  try {
    const assignment = await Assignment.findByPk(req.params.id);
    if (!assignment) {
      return res.status(404).json(formatResponse(404, '作业不存在'));
    }

    const submissions = await AssignmentSubmission.findAll({
      where: { assignmentId: assignment.id },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'workId']
        }
      ],
      order: [['submittedAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取作业提交列表成功', submissions));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取作业提交列表失败', null, error));
  }
});

module.exports = router; 