/**
 * 角色中间件
 * 用于检查用户角色权限
 */

const { formatResponse } = require('../utils/formatResponse');

/**
 * 检查用户角色
 * @param {Array} roles - 允许的角色数组
 * @returns {Function} 中间件函数
 */
const checkRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json(formatResponse(401, '未经过身份验证'));
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json(formatResponse(403, '无权访问此资源'));
    }

    next();
  };
};

module.exports = {
  checkRole
}; 