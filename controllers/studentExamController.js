/**
 * 学生考试控制器
 * 处理学生考试相关的请求
 */

const { Exam, ExamSubmission, ExamQuestion, ExamAnswer, Course, User, sequelize } = require('../models');
const { formatResponse, getPagination, formatPagination } = require('../utils/helpers');
const { Op } = require('sequelize');

/**
 * 获取学生考试列表
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const getExams = async (req, res, next) => {
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
    
    // 查询考试
    const exams = await Exam.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: ExamSubmission,
          as: 'submissions',
          required: false,
          where: {
            studentId
          },
          attributes: ['id', 'status', 'startTime', 'submitTime', 'totalScore']
        }
      ],
      limit,
      offset,
      order: [['startTime', 'DESC']]
    });
    
    // 格式化考试数据
    const now = new Date();
    const formattedExams = exams.rows.map(exam => {
      const submission = exam.submissions && exam.submissions.length > 0 
        ? exam.submissions[0] 
        : null;
      
      let examStatus = '未开始';
      if (submission) {
        if (submission.status === 'ongoing') {
          examStatus = '进行中';
        } else {
          examStatus = '已完成';
        }
      } else if (now >= new Date(exam.startTime) && now <= new Date(exam.endTime)) {
        examStatus = '进行中';
      } else if (now > new Date(exam.endTime)) {
        examStatus = '已结束';
      }
      
      // 如果请求了特定状态的考试，进行过滤
      if (status && status !== examStatus) {
        return null;
      }
      
      return {
        id: exam.id,
        title: exam.title,
        description: exam.description,
        examTime: exam.startTime,
        duration: exam.duration,
        totalScore: exam.totalScore,
        status: examStatus,
        submissionId: submission ? submission.id : null,
        startTime: submission ? submission.startTime : null,
        submitTime: submission ? submission.submitTime : null,
        score: submission ? submission.totalScore : null,
        courseId: exam.courseId,
        courseName: exam.course ? exam.course.title : null
      };
    }).filter(Boolean); // 过滤掉null值
    
    // 计算过滤后的总数
    const filteredCount = formattedExams.length;
    
    return res.json(formatResponse(200, '获取成功', {
      totalItems: filteredCount,
      items: formattedExams,
      currentPage: page,
      totalPages: Math.ceil(filteredCount / limit)
    }));
  } catch (error) {
    console.error('获取学生考试列表错误:', error);
    next(error);
  }
};

/**
 * 开始/继续考试
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const startExam = async (req, res, next) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    // 检查考试是否存在
    const exam = await Exam.findByPk(examId, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });
    
    if (!exam) {
      await transaction.rollback();
      return res.status(404).json(formatResponse(404, '考试不存在'));
    }
    
    // 检查考试时间
    const now = new Date();
    if (now < new Date(exam.startTime)) {
      await transaction.rollback();
      return res.status(400).json(formatResponse(400, '考试尚未开始'));
    }
    
    if (now > new Date(exam.endTime)) {
      await transaction.rollback();
      return res.status(400).json(formatResponse(400, '考试已结束'));
    }
    
    // 检查学生是否在课程中
    const isStudentInCourse = await sequelize.query(
      'SELECT 1 FROM course_students WHERE courseId = :courseId AND studentId = :studentId',
      {
        replacements: { courseId: exam.courseId, studentId },
        type: sequelize.QueryTypes.SELECT
      }
    );
    
    if (isStudentInCourse.length === 0) {
      await transaction.rollback();
      return res.status(403).json(formatResponse(403, '您不是该课程的学生，无法参加考试'));
    }
    
    // 检查是否已有提交
    let submission = await ExamSubmission.findOne({
      where: {
        examId,
        studentId
      },
      include: [
        {
          model: ExamAnswer,
          as: 'answers',
          include: [
            {
              model: ExamQuestion,
              as: 'question',
              attributes: ['id', 'type', 'content', 'options', 'score']
            }
          ]
        }
      ]
    });
    
    // 如果没有提交，创建新提交
    if (!submission) {
      submission = await ExamSubmission.create({
        examId,
        studentId,
        startTime: now,
        status: 'ongoing'
      }, { transaction });
      
      // 获取考试题目
      const questions = await ExamQuestion.findAll({
        where: { examId },
        order: [['order', 'ASC']]
      });
      
      // 为每个题目创建空答案
      for (const question of questions) {
        await ExamAnswer.create({
          submissionId: submission.id,
          questionId: question.id,
          answer: null,
          score: null,
          isCorrect: null
        }, { transaction });
      }
      
      await transaction.commit();
      
      // 重新查询提交，包含答案和题目
      submission = await ExamSubmission.findOne({
        where: { id: submission.id },
        include: [
          {
            model: ExamAnswer,
            as: 'answers',
            include: [
              {
                model: ExamQuestion,
                as: 'question',
                attributes: ['id', 'type', 'content', 'options', 'score']
              }
            ]
          }
        ]
      });
    } else {
      await transaction.commit();
    }
    
    // 计算剩余时间
    const startTime = new Date(submission.startTime);
    const endTime = new Date(startTime.getTime() + exam.duration * 60000);
    const remainingTime = Math.max(0, endTime.getTime() - now.getTime()) / 1000;
    
    // 如果剩余时间为0且状态为进行中，自动提交
    if (remainingTime === 0 && submission.status === 'ongoing') {
      await submission.update({
        status: 'submitted',
        submitTime: now
      });
    }
    
    // 格式化题目
    const questions = submission.answers.map(answer => {
      const question = answer.question;
      return {
        id: question.id,
        type: question.type,
        content: question.content,
        options: question.options,
        score: question.score,
        answerId: answer.id,
        userAnswer: answer.answer
      };
    });
    
    return res.json(formatResponse(200, '开始考试成功', {
      id: exam.id,
      title: exam.title,
      description: exam.description,
      startTime: submission.startTime,
      endTime: endTime,
      duration: exam.duration,
      remainingTime: Math.round(remainingTime),
      submissionId: submission.id,
      status: submission.status,
      questions
    }));
  } catch (error) {
    await transaction.rollback();
    console.error('开始考试错误:', error);
    next(error);
  }
};

/**
 * 保存答案
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const saveAnswer = async (req, res, next) => {
  try {
    const { answerId } = req.params;
    const { answer } = req.body;
    const studentId = req.user.id;
    
    // 查询答案
    const examAnswer = await ExamAnswer.findOne({
      where: { id: answerId },
      include: [
        {
          model: ExamSubmission,
          as: 'submission',
          attributes: ['id', 'examId', 'studentId', 'status']
        }
      ]
    });
    
    if (!examAnswer) {
      return res.status(404).json(formatResponse(404, '答案不存在'));
    }
    
    // 检查是否是学生自己的答案
    if (examAnswer.submission.studentId !== studentId) {
      return res.status(403).json(formatResponse(403, '无权修改此答案'));
    }
    
    // 检查考试状态
    if (examAnswer.submission.status !== 'ongoing') {
      return res.status(400).json(formatResponse(400, '考试已结束，无法修改答案'));
    }
    
    // 更新答案
    await examAnswer.update({ answer });
    
    return res.json(formatResponse(200, '保存成功', {
      id: examAnswer.id,
      answer: examAnswer.answer
    }));
  } catch (error) {
    console.error('保存答案错误:', error);
    next(error);
  }
};

/**
 * 提交考试
 * @param {Object} req - 请求对象
 * @param {Object} res - 响应对象
 * @param {Function} next - 下一个中间件函数
 */
const submitExam = async (req, res, next) => {
  try {
    const { examId } = req.params;
    const studentId = req.user.id;
    
    // 查询提交
    const submission = await ExamSubmission.findOne({
      where: {
        examId,
        studentId
      }
    });
    
    if (!submission) {
      return res.status(404).json(formatResponse(404, '考试提交不存在'));
    }
    
    if (submission.status !== 'ongoing') {
      return res.status(400).json(formatResponse(400, '考试已提交'));
    }
    
    // 更新提交状态
    await submission.update({
      status: 'submitted',
      submitTime: new Date()
    });
    
    return res.json(formatResponse(200, '提交成功', {
      id: submission.id,
      examId,
      submitTime: submission.submitTime,
      status: submission.status
    }));
  } catch (error) {
    console.error('提交考试错误:', error);
    next(error);
  }
};

module.exports = {
  getExams,
  startExam,
  saveAnswer,
  submitExam
}; 