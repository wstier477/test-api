const { User } = require('../models');
const { formatResponse, filterEmptyValues } = require('../utils/helpers');

/**
 * 用户控制器
 * 处理用户信息的获取和更新
 */

/**
 * 获取当前用户信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getProfile = async (req, res, next) => {
  try {
    // 从认证中间件中获取用户信息
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      return res.status(404).json(formatResponse(404, '用户不存在'));
    }

    res.json(formatResponse(200, '获取成功', user));
  } catch (error) {
    next(error);
  }
};

/**
 * 更新当前用户信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const updateProfile = async (req, res, next) => {
  try {
    const { username, phone, avatar, workId, college, gender, introduction, education } = req.body;

    // 获取用户
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json(formatResponse(404, '用户不存在'));
    }

    // 如果更新用户名，检查是否已存在
    if (username && username !== user.username) {
      const existingUsername = await User.findOne({ where: { username } });
      if (existingUsername) {
        return res.status(400).json(formatResponse(400, '用户名已存在'));
      }
    }

    // 过滤空值并更新用户信息
    const updateData = filterEmptyValues({
      username,
      phone,
      avatar,
      workId,
      college,
      gender,
      introduction,
      education
    });

    // 更新用户
    await user.update(updateData);

    // 返回更新后的用户信息
    const updatedUser = await User.findByPk(user.id, {
      attributes: { exclude: ['password'] }
    });

    res.json(formatResponse(200, '更新成功', updatedUser));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
}; 