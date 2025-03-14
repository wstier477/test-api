/**
 * 智能助手控制器
 * 处理智能助手相关的请求
 */

const assistantService = require('../services/assistantService');
const { formatResponse } = require('../utils/helpers');

/**
 * 发送消息给智能助手
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const chat = async (req, res, next) => {
  try {
    const { message, courseId } = req.body;
    const userId = req.user.id;
    
    if (!message) {
      return res.status(400).json(formatResponse(400, '消息内容不能为空'));
    }
    
    // 检查是否有现有聊天，如果没有则创建新聊天
    let chatId = req.body.chatId;
    if (!chatId) {
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      const newChat = await assistantService.createChat(userId, courseId, title);
      chatId = newChat.id;
    }
    
    // 发送消息并获取回复
    const response = await assistantService.sendMessage(chatId, userId, message, courseId);
    
    return res.json(formatResponse(200, '获取成功', {
      id: response.id,
      chatId: chatId,
      content: response.content,
      time: response.createdAt
    }));
  } catch (error) {
    console.error('智能助手聊天错误:', error);
    next(error);
  }
};

/**
 * 获取智能助手聊天历史
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getHistory = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    const history = await assistantService.getChatHistory(userId);
    
    const formattedHistory = history.map(chat => ({
      id: chat.id,
      title: chat.title,
      time: chat.updatedAt,
      preview: chat.preview || '开始新对话',
      courseId: chat.courseId,
      courseName: chat.course ? chat.course.title : null
    }));
    
    return res.json(formatResponse(200, '获取成功', formattedHistory));
  } catch (error) {
    console.error('获取聊天历史错误:', error);
    next(error);
  }
};

/**
 * 获取特定聊天记录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getChatDetail = async (req, res, next) => {
  try {
    const { historyId } = req.params;
    const userId = req.user.id;
    
    if (!historyId) {
      return res.status(400).json(formatResponse(400, '聊天ID不能为空'));
    }
    
    const chat = await assistantService.getChatMessages(historyId, userId);
    
    const formattedChat = {
      id: chat.id,
      title: chat.title,
      courseId: chat.courseId,
      courseName: chat.course ? chat.course.title : null,
      messages: chat.messages.map(msg => ({
        id: msg.id,
        type: msg.type,
        content: msg.content,
        time: msg.createdAt
      }))
    };
    
    return res.json(formatResponse(200, '获取成功', formattedChat));
  } catch (error) {
    console.error('获取聊天详情错误:', error);
    next(error);
  }
};

module.exports = {
  chat,
  getHistory,
  getChatDetail
}; 