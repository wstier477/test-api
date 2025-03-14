const express = require('express');
const router = express.Router();
const { Group, User, Course } = require('../models');
const { formatResponse } = require('../utils/formatResponse');

// 获取小组列表
router.get('/', async (req, res) => {
  try {
    const { courseId } = req.query;
    const whereClause = courseId ? { courseId } : {};

    const groups = await Group.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'username', 'workId']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'workId'],
          through: { attributes: [] }
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取小组列表成功', groups));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取小组列表失败', null, error));
  }
});

// 创建小组
router.post('/', async (req, res) => {
  try {
    const {
      courseId,
      name,
      description,
      leaderId,
      memberIds
    } = req.body;

    const group = await Group.create({
      courseId,
      name,
      description,
      leaderId
    });

    if (memberIds && memberIds.length > 0) {
      await group.setMembers(memberIds);
    }

    const groupWithDetails = await Group.findByPk(group.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'username', 'workId']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'workId'],
          through: { attributes: [] }
        }
      ]
    });

    res.json(formatResponse(200, '创建小组成功', groupWithDetails));
  } catch (error) {
    res.status(500).json(formatResponse(500, '创建小组失败', null, error));
  }
});

// 更新小组信息
router.put('/:id', async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json(formatResponse(404, '小组不存在'));
    }

    const {
      name,
      description,
      leaderId,
      memberIds
    } = req.body;

    await group.update({
      name,
      description,
      leaderId
    });

    if (memberIds) {
      await group.setMembers(memberIds);
    }

    const updatedGroup = await Group.findByPk(group.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'leader',
          attributes: ['id', 'username', 'workId']
        },
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'workId'],
          through: { attributes: [] }
        }
      ]
    });

    res.json(formatResponse(200, '更新小组成功', updatedGroup));
  } catch (error) {
    res.status(500).json(formatResponse(500, '更新小组失败', null, error));
  }
});

// 删除小组
router.delete('/:id', async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json(formatResponse(404, '小组不存在'));
    }

    await group.destroy();
    res.json(formatResponse(200, '删除小组成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除小组失败', null, error));
  }
});

// 添加组员
router.post('/:id/members', async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json(formatResponse(404, '小组不存在'));
    }

    const { memberIds } = req.body;
    await group.addMembers(memberIds);

    const updatedGroup = await Group.findByPk(group.id, {
      include: [
        {
          model: User,
          as: 'members',
          attributes: ['id', 'username', 'workId'],
          through: { attributes: [] }
        }
      ]
    });

    res.json(formatResponse(200, '添加组员成功', updatedGroup));
  } catch (error) {
    res.status(500).json(formatResponse(500, '添加组员失败', null, error));
  }
});

// 移除组员
router.delete('/:id/members/:memberId', async (req, res) => {
  try {
    const group = await Group.findByPk(req.params.id);
    if (!group) {
      return res.status(404).json(formatResponse(404, '小组不存在'));
    }

    await group.removeMember(req.params.memberId);
    res.json(formatResponse(200, '移除组员成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '移除组员失败', null, error));
  }
});

module.exports = router; 