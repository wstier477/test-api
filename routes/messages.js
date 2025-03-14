const express = require('express');
const router = express.Router();
const { Message, User } = require('../models');
const { formatResponse } = require('../utils/formatResponse');
const { Op } = require('sequelize');

// 获取消息列表
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取消息列表成功', messages));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取消息列表失败', null, error));
  }
});

// 发送消息
router.post('/', async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.id;

    // 检查接收者是否存在
    const receiver = await User.findByPk(receiverId);
    if (!receiver) {
      return res.status(404).json(formatResponse(404, '接收者不存在'));
    }

    const message = await Message.create({
      senderId,
      receiverId,
      content
    });

    const messageWithUsers = await Message.findByPk(message.id, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'avatar']
        }
      ]
    });

    res.json(formatResponse(200, '发送消息成功', messageWithUsers));
  } catch (error) {
    res.status(500).json(formatResponse(500, '发送消息失败', null, error));
  }
});

// 获取与特定用户的对话
router.get('/conversation/:userId', async (req, res) => {
  try {
    const currentUserId = req.user.id;
    const otherUserId = req.params.userId;

    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          {
            senderId: currentUserId,
            receiverId: otherUserId
          },
          {
            senderId: otherUserId,
            receiverId: currentUserId
          }
        ]
      },
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'receiver',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json(formatResponse(200, '获取对话成功', messages));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取对话失败', null, error));
  }
});

// 标记消息为已读
router.put('/:id/read', async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json(formatResponse(404, '消息不存在'));
    }

    // 检查权限
    if (message.receiverId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权操作此消息'));
    }

    await message.update({ isRead: true });
    res.json(formatResponse(200, '标记消息已读成功', message));
  } catch (error) {
    res.status(500).json(formatResponse(500, '标记消息已读失败', null, error));
  }
});

// 删除消息
router.delete('/:id', async (req, res) => {
  try {
    const message = await Message.findByPk(req.params.id);
    if (!message) {
      return res.status(404).json(formatResponse(404, '消息不存在'));
    }

    // 检查权限
    if (message.senderId !== req.user.id && message.receiverId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '无权删除此消息'));
    }

    await message.destroy();
    res.json(formatResponse(200, '删除消息成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除消息失败', null, error));
  }
});

// 获取未读消息数量
router.get('/unread/count', async (req, res) => {
  try {
    const count = await Message.count({
      where: {
        receiverId: req.user.id,
        isRead: false
      }
    });

    res.json(formatResponse(200, '获取未读消息数量成功', { count }));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取未读消息数量失败', null, error));
  }
});

module.exports = router; 