/**
 * 学生成绩控制器
 * 处理学生成绩相关的请求
 */

const { Grade, Course, User, sequelize } = require('../models');
const { formatResponse } = require('../utils/helpers');
const { Op } = require('sequelize');

/**
 * 获取学生成绩概览
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getGradeOverview = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    
    // 查询学生所有成绩
    const grades = await Grade.findAll({
      where: { studentId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    if (grades.length === 0) {
      return res.json(formatResponse(200, '获取成功', {
        averageScore: 0,
        highestScore: 0,
        lowestScore: 0,
        totalCourses: 0
      }));
    }
    
    // 计算统计数据
    const scores = grades.map(grade => grade.totalScore).filter(Boolean);
    
    const averageScore = scores.length > 0 
      ? parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)) 
      : 0;
    
    const highestScore = scores.length > 0 ? Math.max(...scores) : 0;
    const lowestScore = scores.length > 0 ? Math.min(...scores) : 0;
    
    return res.json(formatResponse(200, '获取成功', {
      averageScore,
      highestScore,
      lowestScore,
      totalCourses: grades.length
    }));
  } catch (error) {
    console.error('获取学生成绩概览错误:', error);
    next(error);
  }
};

/**
 * 获取学生成绩详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getGradeDetails = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { semester } = req.query;
    
    // 构建查询条件
    const whereClause = { studentId };
    if (semester) {
      whereClause.semester = semester;
    }
    
    // 查询学生成绩
    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['semester', 'DESC']]
    });
    
    // 格式化成绩数据
    const formattedGrades = grades.map(grade => ({
      courseId: grade.courseId,
      courseName: grade.course ? grade.course.title : null,
      courseType: '必修', // 这里可以根据实际情况从课程中获取
      credit: 3, // 这里可以根据实际情况从课程中获取
      composition: [
        {
          name: '平时成绩',
          score: grade.classScore || 0
        },
        {
          name: '雨课堂',
          score: grade.rainScore || 0
        },
        {
          name: '期末考试',
          score: grade.examScore || 0
        }
      ],
      finalScore: grade.totalScore || 0,
      semester: grade.semester
    }));
    
    return res.json(formatResponse(200, '获取成功', formattedGrades));
  } catch (error) {
    console.error('获取学生成绩详情错误:', error);
    next(error);
  }
};

/**
 * 获取学生单门课程成绩
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getCourseGrade = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId } = req.params;
    
    // 检查学生是否在课程中
    const isStudentInCourse = await sequelize.query(
      'SELECT 1 FROM course_students WHERE courseId = :courseId AND studentId = :studentId',
      {
        replacements: { courseId, studentId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (isStudentInCourse.length === 0) {
      return res.status(403).json(formatResponse(403, '您不是该课程的学生，无法查看成绩'));
    }
    
    // 查询成绩
    const grade = await Grade.findOne({
      where: {
        courseId,
        studentId
      },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title'],
          include: [
            {
              model: User,
              as: 'teacher',
              attributes: ['id', 'username', 'name']
            }
          ]
        }
      ]
    });
    
    if (!grade) {
      return res.json(formatResponse(200, '获取成功', {
        courseId,
        courseName: null,
        teacherName: null,
        composition: [
          { name: '平时成绩', score: 0, percentage: 30 },
          { name: '雨课堂', score: 0, percentage: 20 },
          { name: '期末考试', score: 0, percentage: 50 }
        ],
        finalScore: 0,
        comment: null
      }));
    }
    
    return res.json(formatResponse(200, '获取成功', {
      courseId: grade.courseId,
      courseName: grade.course ? grade.course.title : null,
      teacherName: grade.course && grade.course.teacher ? grade.course.teacher.name : null,
      composition: [
        { name: '平时成绩', score: grade.classScore || 0, percentage: 30 },
        { name: '雨课堂', score: grade.rainScore || 0, percentage: 20 },
        { name: '期末考试', score: grade.examScore || 0, percentage: 50 }
      ],
      finalScore: grade.totalScore || 0,
      comment: grade.comment
    }));
  } catch (error) {
    console.error('获取课程成绩错误:', error);
    next(error);
  }
};

module.exports = {
  getGradeOverview,
  getGradeDetails,
  getCourseGrade
}; 