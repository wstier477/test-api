/**
 * 学生作业控制器
 * 处理学生作业相关的请求
 */

const { Assignment, AssignmentSubmission, Course, SubmissionFile, User, sequelize } = require('../models');
const { formatResponse, getPagination, formatPagination } = require('../utils/helpers');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

/**
 * 获取学生作业列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getAssignments = async (req, res, next) => {
  try {
    const studentId = req.user.id;
    const { courseId, status } = req.query;
    const { limit, offset, page } = getPagination(req);
    
    // 构建查询条件
    const whereClause = {};
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    // 查询学生所在的课程
    const studentCourses = await sequelize.query(
      'SELECT courseId FROM course_students WHERE studentId = :studentId',
      {
        replacements: { studentId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    const courseIds = studentCourses.map(course => course.courseId);
    
    if (courseIds.length === 0) {
      return res.json(formatResponse(200, '获取成功', {
        totalItems: 0,
        items: [],
        currentPage: page,
        totalPages: 0
      }));
    }
    
    whereClause.courseId = {
      [Op.in]: courseIds
    };
    
    // 查询作业
    const assignments = await Assignment.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: AssignmentSubmission,
          as: 'submissions',
          required: false,
          where: {
            studentId
          },
          attributes: ['id', 'status', 'submittedAt', 'score']
        }
      ],
      limit,
      offset,
      order: [['deadline', 'ASC']]
    });
    
    // 格式化作业数据
    const formattedAssignments = assignments.rows.map(assignment => {
      const submission = assignment.submissions && assignment.submissions.length > 0 
        ? assignment.submissions[0] 
        : null;
      
      let assignmentStatus = '未提交';
      if (submission) {
        assignmentStatus = submission.status === 'graded' ? '已批改' : '已提交';
      } else if (new Date() > new Date(assignment.deadline)) {
        assignmentStatus = '已截止';
      }
      
      // 如果请求了特定状态的作业，进行过滤
      if (status && status !== assignmentStatus) {
        return null;
      }
      
      return {
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        deadline: assignment.deadline,
        score: assignment.score,
        status: assignmentStatus,
        submissionId: submission ? submission.id : null,
        submittedAt: submission ? submission.submittedAt : null,
        gradedScore: submission ? submission.score : null,
        courseId: assignment.courseId,
        courseName: assignment.course ? assignment.course.title : null
      };
    }).filter(Boolean); // 过滤掉null值
    
    // 计算过滤后的总数
    const filteredCount = formattedAssignments.length;
    
    return res.json(formatResponse(200, '获取成功', {
      totalItems: filteredCount,
      items: formattedAssignments,
      currentPage: page,
      totalPages: Math.ceil(filteredCount / limit)
    }));
  } catch (error) {
    console.error('获取学生作业列表错误:', error);
    next(error);
  }
};

/**
 * 提交作业
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const submitAssignment = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { assignmentId } = req.params;
    const { content } = req.body;
    const studentId = req.user.id;
    
    // 检查作业是否存在
    const assignment = await Assignment.findByPk(assignmentId);
    if (!assignment) {
      await transaction.rollback();
      return res.status(404).json(formatResponse(404, '作业不存在'));
    }
    
    // 检查截止日期
    if (new Date() > new Date(assignment.deadline)) {
      await transaction.rollback();
      return res.status(400).json(formatResponse(400, '作业已截止，无法提交'));
    }
    
    // 检查学生是否在课程中
    const isStudentInCourse = await sequelize.query(
      'SELECT 1 FROM course_students WHERE courseId = :courseId AND studentId = :studentId',
      {
        replacements: { courseId: assignment.courseId, studentId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (isStudentInCourse.length === 0) {
      await transaction.rollback();
      return res.status(403).json(formatResponse(403, '您不是该课程的学生，无法提交作业'));
    }
    
    // 检查是否已提交
    const existingSubmission = await AssignmentSubmission.findOne({
      where: {
        assignmentId,
        studentId
      }
    });
    
    let submission;
    
    if (existingSubmission) {
      // 更新已有提交
      submission = await existingSubmission.update({
        content,
        submittedAt: new Date(),
        status: 'submitted'
      }, { transaction });
      
      // 删除旧文件
      await SubmissionFile.destroy({
        where: {
          submissionId: existingSubmission.id
        },
        transaction
      });
    } else {
      // 创建新提交
      submission = await AssignmentSubmission.create({
        assignmentId,
        studentId,
        content,
        submittedAt: new Date(),
        status: 'submitted'
      }, { transaction });
    }
    
    // 处理文件上传
    const files = [];
    if (req.files && req.files.length > 0) {
      const uploadDir = path.join(__dirname, '../uploads/assignments');
      
      // 确保目录存在
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      
      for (const file of req.files) {
        const fileExt = path.extname(file.originalname);
        const fileName = `${uuidv4()}${fileExt}`;
        const filePath = path.join(uploadDir, fileName);
        
        // 写入文件
        fs.writeFileSync(filePath, file.buffer);
        
        // 创建文件记录
        const submissionFile = await SubmissionFile.create({
          submissionId: submission.id,
          name: file.originalname,
          url: `/uploads/assignments/${fileName}`,
          size: file.size,
          type: file.mimetype
        }, { transaction });
        
        files.push({
          id: submissionFile.id,
          name: submissionFile.name,
          url: submissionFile.url,
          size: submissionFile.size
        });
      }
    }
    
    await transaction.commit();
    
    return res.json(formatResponse(200, '提交成功', {
      id: submission.id,
      assignmentId,
      content: submission.content,
      files,
      submitTime: submission.submittedAt,
      status: submission.status
    }));
  } catch (error) {
    await transaction.rollback();
    console.error('提交作业错误:', error);
    next(error);
  }
};

/**
 * 获取作业详情
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getAssignmentDetail = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const studentId = req.user.id;
    
    // 查询作业详情
    const assignment = await Assignment.findByPk(assignmentId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'teacher',
          attributes: ['id', 'username', 'name']
        }
      ]
    });
    
    if (!assignment) {
      return res.status(404).json(formatResponse(404, '作业不存在'));
    }
    
    // 检查学生是否在课程中
    const isStudentInCourse = await sequelize.query(
      'SELECT 1 FROM course_students WHERE courseId = :courseId AND studentId = :studentId',
      {
        replacements: { courseId: assignment.courseId, studentId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (isStudentInCourse.length === 0) {
      return res.status(403).json(formatResponse(403, '您不是该课程的学生，无法查看作业'));
    }
    
    // 查询学生提交
    const submission = await AssignmentSubmission.findOne({
      where: {
        assignmentId,
        studentId
      },
      include: [
        {
          model: SubmissionFile,
          as: 'files',
          attributes: ['id', 'name', 'url', 'size', 'type']
        }
      ]
    });
    
    // 格式化作业状态
    let status = '未提交';
    if (submission) {
      status = submission.status === 'graded' ? '已批改' : '已提交';
    } else if (new Date() > new Date(assignment.deadline)) {
      status = '已截止';
    }
    
    return res.json(formatResponse(200, '获取成功', {
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      deadline: assignment.deadline,
      score: assignment.score,
      status,
      courseId: assignment.courseId,
      courseName: assignment.course ? assignment.course.title : null,
      teacherId: assignment.teacherId,
      teacherName: assignment.teacher ? assignment.teacher.name : null,
      submission: submission ? {
        id: submission.id,
        content: submission.content,
        submittedAt: submission.submittedAt,
        score: submission.score,
        feedback: submission.feedback,
        files: submission.files.map(file => ({
          id: file.id,
          name: file.name,
          url: file.url,
          size: file.size,
          type: file.type
        }))
      } : null
    }));
  } catch (error) {
    console.error('获取作业详情错误:', error);
    next(error);
  }
};

module.exports = {
  getAssignments,
  submitAssignment,
  getAssignmentDetail
}; 