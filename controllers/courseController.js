const { Course, User } = require('../models');
const { formatResponse, getPagination, formatPagination, getOrder } = require('../utils/helpers');
const { Op } = require('sequelize');

/**
 * 课程控制器
 * 处理课程的增删改查
 */

/**
 * 获取课程列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getCourses = async (req, res, next) => {
  try {
    const { role } = req.query;
    const { limit, offset, page } = getPagination(req);
    const order = getOrder(req);
    
    let courses;
    
    // 根据角色获取不同的课程列表
    if (req.user.role === 'teacher') {
      // 教师获取自己创建的课程
      courses = await Course.findAndCountAll({
        where: {
          teacherId: req.user.id
        },
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'username', 'avatar']
          }
        ],
        limit,
        offset,
        order,
        distinct: true
      });
    } else {
      // 学生获取已加入的课程
      courses = await Course.findAndCountAll({
        include: [
          {
            model: User,
            as: 'teacher',
            attributes: ['id', 'username', 'avatar']
          },
          {
            model: User,
            as: 'students',
            attributes: [],
            where: {
              id: req.user.id
            },
            required: true
          }
        ],
        limit,
        offset,
        order,
        distinct: true
      });
    }

    // 格式化课程数据
    const formattedCourses = courses.rows.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description,
      cover: course.cover,
      teacherName: course.teacher.username,
      teacherId: course.teacher.id,
      studentCount: course.students ? course.students.length : 0,
      location: course.location,
      createTime: course.createdAt
    }));

    // 返回分页结果
    const result = formatPagination({
      count: courses.count,
      rows: formattedCourses
    }, page, limit);

    res.json(formatResponse(200, '获取成功', result));
  } catch (error) {
    next(error);
  }
};

/**
 * 创建新课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const createCourse = async (req, res, next) => {
  try {
    // 验证用户是否为教师
    if (req.user.role !== 'teacher') {
      return res.status(403).json(formatResponse(403, '只有教师可以创建课程'));
    }

    const { title, description, cover, location } = req.body;

    // 验证请求参数
    if (!title) {
      return res.status(400).json(formatResponse(400, '请提供课程标题'));
    }

    // 创建新课程
    const course = await Course.create({
      title,
      description,
      cover,
      location,
      teacherId: req.user.id
    });

    // 获取教师信息
    const teacher = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    // 返回课程信息
    res.status(201).json(formatResponse(200, '创建成功', {
      id: course.id,
      title: course.title,
      description: course.description,
      cover: course.cover,
      teacherName: teacher.username,
      teacherId: teacher.id,
      studentCount: 0,
      location: course.location,
      createTime: course.createdAt
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 获取课程详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getCourseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取课程详情
    const course = await Course.findByPk(id, {
      include: [
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'avatar']
        },
        {
          model: User,
          as: 'students',
          attributes: ['id'],
          through: { attributes: [] }
        }
      ]
    });

    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否有权限访问该课程
    const isTeacher = course.teacherId === req.user.id;
    const isStudent = course.students.some(student => student.id === req.user.id);

    if (!isTeacher && !isStudent) {
      return res.status(403).json(formatResponse(403, '您没有权限访问该课程'));
    }

    // 返回课程详情
    res.json(formatResponse(200, '获取成功', {
      id: course.id,
      title: course.title,
      description: course.description,
      cover: course.cover,
      teacherName: course.teacher.username,
      teacherId: course.teacher.id,
      studentCount: course.students.length,
      location: course.location,
      createTime: course.createdAt,
      assessmentScheme: course.assessmentScheme
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 更新课程信息
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const updateCourse = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, cover, location, assessmentScheme } = req.body;

    // 获取课程
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否为课程教师
    if (course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以更新课程信息'));
    }

    // 更新课程信息
    await course.update({
      title: title || course.title,
      description: description !== undefined ? description : course.description,
      cover: cover || course.cover,
      location: location || course.location,
      assessmentScheme: assessmentScheme || course.assessmentScheme
    });

    // 获取教师信息
    const teacher = await User.findByPk(req.user.id, {
      attributes: ['id', 'username', 'avatar']
    });

    // 获取学生数量
    const studentCount = await course.countStudents();

    // 返回更新后的课程信息
    res.json(formatResponse(200, '更新成功', {
      id: course.id,
      title: course.title,
      description: course.description,
      cover: course.cover,
      teacherName: teacher.username,
      teacherId: teacher.id,
      studentCount,
      location: course.location,
      createTime: course.createdAt,
      assessmentScheme: course.assessmentScheme
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 删除课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const deleteCourse = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取课程
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否为课程教师
    if (course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以删除课程'));
    }

    // 删除课程
    await course.destroy();

    res.json(formatResponse(200, '删除成功'));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourses,
  createCourse,
  getCourseById,
  updateCourse,
  deleteCourse
}; 