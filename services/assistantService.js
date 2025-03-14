/**
 * 智能助手服务
 * 用于处理与AI模型的交互
 */

const axios = require('axios');
const { api_key, base_url, model, default_params } = require('../config/openai');
const { AssistantChat, AssistantMessage, Course, User } = require('../models');
const { Op } = require('sequelize');

/**
 * 创建新的聊天会话
 * @param {string} userId - 用户ID
 * @param {string} courseId - 课程ID（可选）
 * @param {string} title - 聊天标题
 * @returns {Promise<Object>} - 创建的聊天会话
 */
const createChat = async (userId, courseId = null, title = '新对话') => {
  try {
    const chat = await AssistantChat.create({
      userId,
      courseId,
      title,
      preview: null
    });
    
    return chat;
  } catch (error) {
    console.error('创建聊天会话失败:', error);
    throw new Error('创建聊天会话失败');
  }
};

/**
 * 获取用户的聊天历史
 * @param {string} userId - 用户ID
 * @returns {Promise<Array>} - 聊天历史列表
 */
const getChatHistory = async (userId) => {
  try {
    const chats = await AssistantChat.findAll({
      where: { userId },
      order: [['updatedAt', 'DESC']],
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    return chats;
  } catch (error) {
    console.error('获取聊天历史失败:', error);
    throw new Error('获取聊天历史失败');
  }
};

/**
 * 获取特定聊天的消息记录
 * @param {string} chatId - 聊天ID
 * @param {string} userId - 用户ID
 * @returns {Promise<Object>} - 聊天详情和消息记录
 */
const getChatMessages = async (chatId, userId) => {
  try {
    const chat = await AssistantChat.findOne({
      where: { 
        id: chatId,
        userId 
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: AssistantMessage,
          as: 'messages',
          order: [['createdAt', 'ASC']]
        }
      ]
    });
    
    if (!chat) {
      throw new Error('聊天记录不存在');
    }
    
    return chat;
  } catch (error) {
    console.error('获取聊天消息失败:', error);
    throw new Error('获取聊天消息失败');
  }
};

/**
 * 发送消息给AI助手并获取回复
 * @param {string} chatId - 聊天ID
 * @param {string} userId - 用户ID
 * @param {string} message - 用户消息
 * @param {string} courseId - 课程ID（可选）
 * @returns {Promise<Object>} - AI助手的回复
 */
const sendMessage = async (chatId, userId, message, courseId = null) => {
  try {
    // 创建用户消息
    await AssistantMessage.create({
      chatId,
      type: 'user',
      content: message
    });
    
    // 获取聊天上下文（最近5条消息）
    const recentMessages = await AssistantMessage.findAll({
      where: { chatId },
      order: [['createdAt', 'DESC']],
      limit: 10
    });
    
    // 构建上下文消息
    const contextMessages = recentMessages
      .reverse()
      .map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));
    
    // 如果有课程ID，添加课程相关信息
    let systemPrompt = '你是一个教育管理系统中的智能助手，可以回答学习和教学相关的问题。';
    
    if (courseId) {
      const course = await Course.findByPk(courseId, {
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'username', 'name']
          }
        ]
      });
      
      if (course) {
        systemPrompt += `当前课程是"${course.title}"，由${course.teacher.name}老师教授。`;
      }
    }
    
    // 添加系统提示
    const messages = [
      { role: 'system', content: systemPrompt },
      ...contextMessages
    ];
    
    // 调用AI API
    const response = await axios.post(
      `${base_url}/chat/completions`,
      {
        model: model,
        messages: messages,
        ...default_params
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api_key}`
        }
      }
    );
    
    // 获取AI回复
    const aiResponse = response.data.choices[0].message.content;
    
    // 保存AI回复
    const assistantMessage = await AssistantMessage.create({
      chatId,
      type: 'assistant',
      content: aiResponse
    });
    
    // 更新聊天预览
    await AssistantChat.update(
      { 
        preview: aiResponse.substring(0, 100),
        updatedAt: new Date()
      },
      { where: { id: chatId } }
    );
    
    return assistantMessage;
  } catch (error) {
    console.error('发送消息失败:', error);
    
    // 保存错误消息
    const errorMessage = await AssistantMessage.create({
      chatId,
      type: 'assistant',
      content: '抱歉，我遇到了一些问题，无法回答您的问题。请稍后再试。'
    });
    
    return errorMessage;
  }
};

module.exports = {
  createChat,
  getChatHistory,
  getChatMessages,
  sendMessage
}; 