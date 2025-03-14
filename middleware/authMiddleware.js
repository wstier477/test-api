const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/helpers');
const { User } = require('../models');

/**
 * JWT 验证中间件
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json(formatResponse(401, '未提供令牌'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findByPk(decoded.id);

      if (!user) {
        return res.status(401).json(formatResponse(401, '用户不存在'));
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json(formatResponse(401, '无效的令牌'));
    }
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json(formatResponse(500, '认证过程发生错误'));
  }
};

/**
 * 角色验证中间件
 * @param {string[]} roles - 允许的角色列表
 * @returns {Function} 中间件函数
 */
const authorizeRoles = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json(formatResponse(403, '无权访问此资源'));
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles
}; 