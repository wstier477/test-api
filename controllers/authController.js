const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { formatResponse } = require('../utils/helpers');

/**
 * 认证控制器
 * 处理用户登录和注册
 */

/**
 * 用户登录
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // 查找用户
    const user = await User.findOne({
      where: { username }
    });

    if (!user) {
      return res.status(401).json(formatResponse(401, '用户名或密码错误'));
    }

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json(formatResponse(401, '用户名或密码错误'));
    }

    // 生成 JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // 返回用户信息和token
    res.json(formatResponse(200, '登录成功', {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        workId: user.workId,
        college: user.college,
        gender: user.gender,
        avatar: user.avatar,
        introduction: user.introduction
      }
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 用户注册
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const register = async (req, res, next) => {
  try {
    const { username, password, email, role } = req.body;

    // 检查用户名是否已存在
    const existingUser = await User.findOne({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json(formatResponse(400, '用户名已存在'));
    }

    // 检查邮箱是否已存在
    const existingEmail = await User.findOne({
      where: { email }
    });

    if (existingEmail) {
      return res.status(400).json(formatResponse(400, '邮箱已存在'));
    }

    // 创建用户 - 不需要在这里加密密码，模型钩子会处理
    const user = await User.create({
      username,
      password, // 直接使用原始密码，模型钩子会处理加密
      email,
      role: role || 'student'
    });

    res.status(201).json(formatResponse(201, '注册成功', {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  register
}; 