const { User, Course } = require('../models');
const { formatResponse, getPagination, formatPagination } = require('../utils/helpers');
const { Op } = require('sequelize');

/**
 * 学生控制器
 * 处理学生的增删改查
 */

/**
 * 获取课程学生列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getCourseStudents = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { search } = req.query;
    const { limit, offset, page } = getPagination(req);

    // 获取课程
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否有权限访问该课程
    if (course.teacherId !== req.user.id && req.user.role !== 'teacher') {
      return res.status(403).json(formatResponse(403, '只有课程教师可以查看学生列表'));
    }

    // 构建查询条件
    let whereCondition = {};
    if (search) {
      whereCondition = {
        [Op.or]: [
          { username: { [Op.like]: `%${search}%` } },
          { workId: { [Op.like]: `%${search}%` } }
        ]
      };
    }

    // 获取学生列表
    const students = await course.getStudents({
      where: {
        ...whereCondition,
        role: 'student'
      },
      attributes: ['id', 'username', 'workId', 'avatar', 'gender', 'phone', 'email'],
      limit,
      offset
    });

    // 获取学生总数
    const count = await course.countStudents({
      where: {
        ...whereCondition,
        role: 'student'
      }
    });

    // 格式化学生数据
    const formattedStudents = students.map(student => ({
      id: student.id,
      name: student.username,
      studentId: student.workId,
      avatar: student.avatar,
      gender: student.gender,
      phone: student.phone,
      email: student.email
    }));

    // 返回分页结果
    const result = formatPagination({
      count,
      rows: formattedStudents
    }, page, limit);

    res.json(formatResponse(200, '获取成功', result));
  } catch (error) {
    next(error);
  }
};

/**
 * 添加学生到课程
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const addStudentsToCourse = async (req, res, next) => {
  try {
    const { courseId } = req.params;
    const { studentIds } = req.body;

    // 验证请求参数
    if (!studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return res.status(400).json(formatResponse(400, '请提供有效的学生ID列表'));
    }

    // 获取课程
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否为课程教师
    if (course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以添加学生'));
    }

    // 验证学生是否存在
    const students = await User.findAll({
      where: {
        id: {
          [Op.in]: studentIds
        },
        role: 'student'
      }
    });

    if (students.length === 0) {
      return res.status(404).json(formatResponse(404, '未找到有效的学生'));
    }

    // 添加学生到课程
    await course.addStudents(students);

    // 返回成功信息
    res.json(formatResponse(200, '添加成功', {
      successCount: students.length,
      failCount: studentIds.length - students.length
    }));
  } catch (error) {
    next(error);
  }
};

/**
 * 从课程中移除学生
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const removeStudentFromCourse = async (req, res, next) => {
  try {
    const { courseId, studentId } = req.params;

    // 获取课程
    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json(formatResponse(404, '课程不存在'));
    }

    // 验证用户是否为课程教师
    if (course.teacherId !== req.user.id) {
      return res.status(403).json(formatResponse(403, '只有课程教师可以移除学生'));
    }

    // 获取学生
    const student = await User.findOne({
      where: {
        id: studentId,
        role: 'student'
      }
    });

    if (!student) {
      return res.status(404).json(formatResponse(404, '学生不存在'));
    }

    // 检查学生是否在课程中
    const isEnrolled = await course.hasStudent(student);
    if (!isEnrolled) {
      return res.status(400).json(formatResponse(400, '该学生未加入此课程'));
    }

    // 从课程中移除学生
    await course.removeStudent(student);

    res.json(formatResponse(200, '移除成功'));
  } catch (error) {
    next(error);
  }
};

/**
 * 获取学生详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getStudentById = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 获取学生详情
    const student = await User.findOne({
      where: {
        id,
        role: 'student'
      },
      attributes: ['id', 'username', 'workId', 'avatar', 'gender', 'phone', 'email', 'college'],
      include: [
        {
          model: Course,
          as: 'studentCourses',
          attributes: ['id', 'title'],
          through: { attributes: [] }
        }
      ]
    });

    if (!student) {
      return res.status(404).json(formatResponse(404, '学生不存在'));
    }

    // 返回学生详情
    res.json(formatResponse(200, '获取成功', {
      id: student.id,
      name: student.username,
      studentId: student.workId,
      avatar: student.avatar,
      gender: student.gender,
      phone: student.phone,
      email: student.email,
      college: student.college,
      courses: student.studentCourses
    }));
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseStudents,
  addStudentsToCourse,
  removeStudentFromCourse,
  getStudentById
}; 