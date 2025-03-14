const express = require('express');
const router = express.Router();
const { Exam, ExamQuestion, Course, ExamSubmission, User } = require('../models');
const { formatResponse } = require('../utils/formatResponse');
const { Op } = require('sequelize');

// 获取考试列表
router.get('/', async (req, res) => {
  try {
    const { courseId, status } = req.query;
    const whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (status) {
      const now = new Date();
      switch (status) {
        case 'upcoming':
          whereClause.startTime = { [Op.gt]: now };
          break;
        case 'ongoing':
          whereClause.startTime = { [Op.lte]: now };
          whereClause.endTime = { [Op.gte]: now };
          break;
        case 'ended':
          whereClause.endTime = { [Op.lt]: now };
          break;
      }
    }

    const exams = await Exam.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [['startTime', 'DESC']]
    });

    res.json(formatResponse(200, '获取考试列表成功', exams));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取考试列表失败', null, error));
  }
});

// 创建考试
router.post('/', async (req, res) => {
  try {
    const {
      courseId,
      title,
      description,
      startTime,
      duration,
      totalScore,
      questions
    } = req.body;

    // 创建考试
    const exam = await Exam.create({
      courseId,
      title,
      description,
      startTime,
      duration,
      totalScore,
      endTime: new Date(new Date(startTime).getTime() + duration * 60000)
    });

    // 创建考试题目
    if (questions && questions.length > 0) {
      const examQuestions = questions.map((question, index) => ({
        ...question,
        examId: exam.id,
        order: index + 1
      }));
      await ExamQuestion.bulkCreate(examQuestions);
    }

    res.json(formatResponse(200, '创建考试成功', exam));
  } catch (error) {
    res.status(500).json(formatResponse(500, '创建考试失败', null, error));
  }
});

// 获取考试详情
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: ExamQuestion,
          as: 'questions',
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!exam) {
      return res.status(404).json(formatResponse(404, '考试不存在'));
    }

    res.json(formatResponse(200, '获取考试详情成功', exam));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取考试详情失败', null, error));
  }
});

// 更新考试信息
router.put('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json(formatResponse(404, '考试不存在'));
    }

    const {
      title,
      description,
      startTime,
      duration,
      totalScore,
      questions
    } = req.body;

    // 更新考试基本信息
    await exam.update({
      title,
      description,
      startTime,
      duration,
      totalScore,
      endTime: new Date(new Date(startTime).getTime() + duration * 60000)
    });

    // 如果提供了新的题目列表，更新题目
    if (questions && questions.length > 0) {
      // 删除旧题目
      await ExamQuestion.destroy({ where: { examId: exam.id } });
      
      // 创建新题目
      const examQuestions = questions.map((question, index) => ({
        ...question,
        examId: exam.id,
        order: index + 1
      }));
      await ExamQuestion.bulkCreate(examQuestions);
    }

    res.json(formatResponse(200, '更新考试成功', exam));
  } catch (error) {
    res.status(500).json(formatResponse(500, '更新考试失败', null, error));
  }
});

// 删除考试
router.delete('/:id', async (req, res) => {
  try {
    const exam = await Exam.findByPk(req.params.id);
    if (!exam) {
      return res.status(404).json(formatResponse(404, '考试不存在'));
    }

    // 检查是否有学生已经开始考试
    const submissions = await ExamSubmission.count({
      where: { examId: exam.id }
    });

    if (submissions > 0) {
      return res.status(400).json(formatResponse(400, '已有学生参加考试，无法删除'));
    }

    // 删除考试相关的所有题目
    await ExamQuestion.destroy({
      where: { examId: exam.id }
    });

    // 删除考试
    await exam.destroy();

    res.json(formatResponse(200, '删除考试成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除考试失败', null, error));
  }
});

// 获取考试结果列表
router.get('/:id/results', async (req, res) => {
  try {
    const examId = req.params.id;
    const exam = await Exam.findByPk(examId);
    
    if (!exam) {
      return res.status(404).json(formatResponse(404, '考试不存在'));
    }

    const submissions = await ExamSubmission.findAll({
      where: { examId },
      include: [
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'workId']
        }
      ],
      order: [['totalScore', 'DESC']]
    });

    res.json(formatResponse(200, '获取考试结果成功', submissions));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取考试结果失败', null, error));
  }
});

module.exports = router; 