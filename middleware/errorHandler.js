/**
 * 错误处理中间件
 * 用于统一处理应用中的错误
 */

const { formatResponse } = require('../utils/helpers');

/**
 * 404错误处理中间件
 * 处理未找到的路由
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const notFound = (req, res, next) => {
  const error = new Error(`未找到 - ${req.originalUrl}`);
  res.status(404);
  next(error);
};

/**
 * 全局错误处理中间件
 * 处理应用中的所有错误
 * @param {Error} err - 错误对象
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const errorHandler = (err, req, res, next) => {
  console.error('错误:', err);

  // 处理 Sequelize 验证错误
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json(formatResponse(400, '数据验证错误', {
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    }));
  }

  // 处理 Sequelize 唯一约束错误
  if (err.name === 'SequelizeUniqueConstraintError') {
    return res.status(400).json(formatResponse(400, '数据已存在', {
      errors: err.errors.map(e => ({
        field: e.path,
        message: e.message
      }))
    }));
  }

  // 处理 JWT 验证错误
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json(formatResponse(401, '无效的令牌'));
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json(formatResponse(401, '令牌已过期'));
  }

  // 处理其他错误
  const statusCode = err.statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json(formatResponse(statusCode, message));
};

module.exports = {
  notFound,
  errorHandler
}; 