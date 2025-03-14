const express = require('express');
const router = express.Router();
const { Notification } = require('../models');
const { formatResponse } = require('../utils/formatResponse');

// 获取用户的通知列表
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取通知列表成功', notifications));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取通知列表失败', null, error));
  }
});

// 标记通知为已读
router.put('/:id/read', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json(formatResponse(404, '通知不存在'));
    }

    // 检查权限
    if (notification.userId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权操作此通知'));
    }

    await notification.update({ isRead: true });
    res.json(formatResponse(200, '标记通知已读成功', notification));
  } catch (error) {
    res.status(500).json(formatResponse(500, '标记通知已读失败', null, error));
  }
});

// 标记所有通知为已读
router.put('/read/all', async (req, res) => {
  try {
    await Notification.update(
      { isRead: true },
      { where: { userId: req.user.id, isRead: false } }
    );

    res.json(formatResponse(200, '标记所有通知已读成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '标记所有通知已读失败', null, error));
  }
});

// 删除通知
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findByPk(req.params.id);
    if (!notification) {
      return res.status(404).json(formatResponse(404, '通知不存在'));
    }

    // 检查权限
    if (notification.userId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权删除此通知'));
    }

    await notification.destroy();
    res.json(formatResponse(200, '删除通知成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除通知失败', null, error));
  }
});

// 获取未读通知数量
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Notification.count({
      where: {
        userId: req.user.id,
        isRead: false
      }
    });

    res.json(formatResponse(200, '获取未读通知数量成功', { count }));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取未读通知数量失败', null, error));
  }
});

module.exports = router; 