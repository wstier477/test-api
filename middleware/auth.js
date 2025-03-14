const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { formatResponse } = require('../utils/formatResponse');

/**
 * 认证中间件
 * 用于验证用户身份和权限
 */

// JWT密钥，实际应用中应该存储在环境变量中
const JWT_SECRET = 'your-secret-key';

/**
 * 验证用户是否已登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const authenticate = async (req, res, next) => {
  try {
    // 从请求头获取 token
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json(formatResponse(401, '未提供认证令牌'));
    }
    
    // 验证 token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    
    // 查找用户
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json(formatResponse(401, '用户不存在'));
    }
    
    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json(formatResponse(401, '无效的认证令牌'));
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json(formatResponse(401, '认证令牌已过期'));
    }
    res.status(500).json(formatResponse(500, '认证过程发生错误', null, error));
  }
};

/**
 * 验证用户是否为教师
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const isTeacher = (req, res, next) => {
  if (req.user && req.user.role === 'teacher') {
    next();
  } else {
    return res.status(403).json({
      code: 403,
      message: '权限不足，需要教师权限',
      data: null
    });
  }
};

/**
 * 验证用户是否为学生
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const isStudent = (req, res, next) => {
  if (req.user && req.user.role === 'student') {
    next();
  } else {
    return res.status(403).json({
      code: 403,
      message: '权限不足，需要学生权限',
      data: null
    });
  }
};

/**
 * 生成JWT令牌
 * @param {Object} user - 用户对象
 * @returns {String} - JWT令牌
 */
const generateToken = (user) => {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticate,
  isTeacher,
  isStudent,
  generateToken
}; 