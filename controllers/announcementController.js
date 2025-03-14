const { Announcement, Course, User } = require('../models');
const { formatResponse, getPagination, formatPagination, getOrder } = require('../utils/helpers');

/**
 * 公告控制器
 * 处理公告的增删改查
 */

/**
 * 获取课程公告列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getCourseAnnouncements = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { limit, offset, page } = getPagination(req);
    const order = getOrder(req);

    // 获取课程
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否有权限访问该课程
    const isTeacher = course.teacherId === req.user.id;
    const isStudent = await course.hasStudent(req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json(formatResponse(403, '您没有权限访问该课程'));
    }

    // 获取公告列表
    const announcements = await Announcement.findAndCountAll({
      where: {
        courseId
      },
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar']
        }
      ],
      limit,
      offset,
      order
    });

    // 格式化公告数据
    const formattedAnnouncements = announcements.rows.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      creatorName: announcement.creator.username,
      creatorId: announcement.creator.id,
      createTime: announcement.createdAt
    }));

    // 返回分页结果
    const result = formatPagination({
      count: announcements.count,
      rows: formattedAnnouncements
    }, page, limit);

    res.json(formatResponse(200, '获取成功', result));
  } catch (error) {
    next(error);
  }
};

/**
 * 发布课程公告
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const createAnnouncement = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { title, content } = req.body;

    // 验证请求参数
    if (!title || !content) {
      return res.status(400).json(formatResponse(400, '请提供公告标题和内容'));
    }

    // 获取课程
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否为课程教师
    if (course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以发布公告'));
    }

    // 创建公告
    const announcement = await Announcement.create({
      title,
      content,
      courseId,
      creatorId: req.user.id
    });

    // 获取创建者信息
    const creator = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    // 返回公告信息
    res.status(201).json(formatResponse(200, '发布成功', {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      creatorName: creator.username,
      creatorId: creator.id,
      createTime: announcement.createdAt
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 获取公告详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getAnnouncementById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取公告详情
    const announcement = await Announcement.findByPk(id, {
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title', 'teacherId']
        }
      ]
    });

    if (!announcement) {
      return res.status(404).json(formatResponse(404, '公告不存在'));
    }

    // 验证用户是否有权限访问该公告
    const isTeacher = announcement.course.teacherId === req.user.id;
    const isStudent = await announcement.course.hasStudent(req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json(formatResponse(403, '您没有权限访问该公告'));
    }

    // 返回公告详情
    res.json(formatResponse(200, '获取成功', {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      creatorName: announcement.creator.username,
      creatorId: announcement.creator.id,
      courseId: announcement.courseId,
      courseName: announcement.course.title,
      createTime: announcement.createdAt
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 更新公告
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const updateAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;

    // 获取公告
    const announcement = await Announcement.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['teacherId']
        }
      ]
    });

    if (!announcement) {
      return res.status(404).json(formatResponse(404, '公告不存在'));
    }

    // 验证用户是否为课程教师
    if (announcement.course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以更新公告'));
    }

    // 更新公告
    await announcement.update({
      title: title || announcement.title,
      content: content || announcement.content
    });

    // 获取创建者信息
    const creator = await User.findByPk(announcement.creatorId, {
      attributes: ['id', 'username', 'avatar']
    });

    // 返回更新后的公告信息
    res.json(formatResponse(200, '更新成功', {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      creatorName: creator.username,
      creatorId: creator.id,
      createTime: announcement.createdAt
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 删除公告
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const deleteAnnouncement = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取公告
    const announcement = await Announcement.findByPk(id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['teacherId']
        }
      ]
    });

    if (!announcement) {
      return res.status(404).json(formatResponse(404, '公告不存在'));
    }

    // 验证用户是否为课程教师
    if (announcement.course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以删除公告'));
    }

    // 删除公告
    await announcement.destroy();

    res.json(formatResponse(200, '删除成功'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseAnnouncements,
  createAnnouncement,
  getAnnouncementById,
  updateAnnouncement,
  deleteAnnouncement
}; 