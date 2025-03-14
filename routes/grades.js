const express = require('express');
const router = express.Router();
const { Grade, Course, User } = require('../models');
const { formatResponse } = require('../utils/formatResponse');

// 获取成绩列表
router.get('/', async (req, res) => {
  try {
    const { courseId, studentId } = req.query;
    const whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (studentId) {
      whereClause.studentId = studentId;
    }

    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'workId']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取成绩列表成功', grades));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取成绩列表失败', null, error));
  }
});

// 创建/更新成绩
router.post('/', async (req, res) => {
  try {
    const {
      courseId,
      studentId,
      type,
      score,
      weight,
      comment
    } = req.body;

    const [grade, created] = await Grade.findOrCreate({
      where: {
        courseId,
        studentId,
        type
      },
      defaults: {
        score,
        weight,
        comment,
        gradedBy: req.user.id
      }
    });

    if (!created) {
      await grade.update({
        score,
        weight,
        comment,
        gradedBy: req.user.id
      });
    }

    const gradeWithDetails = await Grade.findByPk(grade.id, {
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        },
        {
          model: User,
          as: 'student',
          attributes: ['id', 'username', 'workId']
        }
      ]
    });

    res.json(formatResponse(200, created ? '创建成绩成功' : '更新成绩成功', gradeWithDetails));
  } catch (error) {
    res.status(500).json(formatResponse(500, '创建/更新成绩失败', null, error));
  }
});

// 批量创建/更新成绩
router.post('/batch', async (req, res) => {
  try {
    const { courseId, type, grades } = req.body;

    const createdGrades = await Promise.all(
      grades.map(async grade => {
        const [gradeRecord, created] = await Grade.findOrCreate({
          where: {
            courseId,
            studentId: grade.studentId,
            type
          },
          defaults: {
            score: grade.score,
            weight: grade.weight,
            comment: grade.comment,
            gradedBy: req.user.id
          }
        });

        if (!created) {
          await gradeRecord.update({
            score: grade.score,
            weight: grade.weight,
            comment: grade.comment,
            gradedBy: req.user.id
          });
        }

        return gradeRecord;
      })
    );

    res.json(formatResponse(200, '批量创建/更新成绩成功', createdGrades));
  } catch (error) {
    res.status(500).json(formatResponse(500, '批量创建/更新成绩失败', null, error));
  }
});

// 删除成绩
router.delete('/:id', async (req, res) => {
  try {
    const grade = await Grade.findByPk(req.params.id);
    if (!grade) {
      return res.status(404).json(formatResponse(404, '成绩不存在'));
    }

    await grade.destroy();
    res.json(formatResponse(200, '删除成绩成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除成绩失败', null, error));
  }
});

// 获取学生的成绩统计
router.get('/student/:studentId/stats', async (req, res) => {
  try {
    const { courseId } = req.query;
    const whereClause = {
      studentId: req.params.studentId
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const grades = await Grade.findAll({
      where: whereClause,
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ]
    });

    // 按课程分组计算统计信息
    const stats = grades.reduce((acc, grade) => {
      const courseId = grade.course.id;
      if (!acc[courseId]) {
        acc[courseId] = {
          courseId,
          courseName: grade.course.title,
          totalScore: 0,
          totalWeight: 0,
          grades: []
        };
      }

      acc[courseId].grades.push({
        type: grade.type,
        score: grade.score,
        weight: grade.weight
      });

      acc[courseId].totalScore += grade.score * grade.weight;
      acc[courseId].totalWeight += grade.weight;

      return acc;
    }, {});

    // 计算加权平均分
    Object.values(stats).forEach(course => {
      course.weightedAverage = course.totalWeight > 0
        ? (course.totalScore / course.totalWeight).toFixed(2)
        : 0;
    });

    res.json(formatResponse(200, '获取学生成绩统计成功', Object.values(stats)));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取学生成绩统计失败', null, error));
  }
});

module.exports = router; 