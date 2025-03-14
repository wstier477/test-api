const express = require('express');
const router = express.Router();
const { ClassRecord, Course, User } = require('../models');
const { formatResponse } = require('../utils/formatResponse');

// 获取课堂记录列表
router.get('/', async (req, res) => {
  try {
    const { courseId, date } = req.query;
    const whereClause = {};
    
    if (courseId) {
      whereClause.courseId = courseId;
    }
    
    if (date) {
      whereClause.date = date;
    }

    const records = await ClassRecord.findAll({
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
      order: [['date', 'DESC'], ['createdAt', 'DESC']]
    });

    res.json(formatResponse(200, '获取课堂记录列表成功', records));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取课堂记录列表失败', null, error));
  }
});

// 创建课堂记录
router.post('/', async (req, res) => {
  try {
    const {
      courseId,
      studentId,
      date,
      attendanceStatus,
      performance,
      notes
    } = req.body;

    const record = await ClassRecord.create({
      courseId,
      studentId,
      date,
      attendanceStatus,
      performance,
      notes,
      recordedBy: req.user.id
    });

    const recordWithDetails = await ClassRecord.findByPk(record.id, {
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

    res.json(formatResponse(200, '创建课堂记录成功', recordWithDetails));
  } catch (error) {
    res.status(500).json(formatResponse(500, '创建课堂记录失败', null, error));
  }
});

// 批量创建课堂记录
router.post('/batch', async (req, res) => {
  try {
    const { courseId, date, records } = req.body;

    const createdRecords = await ClassRecord.bulkCreate(
      records.map(record => ({
        courseId,
        date,
        studentId: record.studentId,
        attendanceStatus: record.attendanceStatus,
        performance: record.performance,
        notes: record.notes,
        recordedBy: req.user.id
      }))
    );

    res.json(formatResponse(200, '批量创建课堂记录成功', createdRecords));
  } catch (error) {
    res.status(500).json(formatResponse(500, '批量创建课堂记录失败', null, error));
  }
});

// 更新课堂记录
router.put('/:id', async (req, res) => {
  try {
    const record = await ClassRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json(formatResponse(404, '课堂记录不存在'));
    }

    const {
      attendanceStatus,
      performance,
      notes
    } = req.body;

    await record.update({
      attendanceStatus,
      performance,
      notes
    });

    const updatedRecord = await ClassRecord.findByPk(record.id, {
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

    res.json(formatResponse(200, '更新课堂记录成功', updatedRecord));
  } catch (error) {
    res.status(500).json(formatResponse(500, '更新课堂记录失败', null, error));
  }
});

// 删除课堂记录
router.delete('/:id', async (req, res) => {
  try {
    const record = await ClassRecord.findByPk(req.params.id);
    if (!record) {
      return res.status(404).json(formatResponse(404, '课堂记录不存在'));
    }

    await record.destroy();
    res.json(formatResponse(200, '删除课堂记录成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '删除课堂记录失败', null, error));
  }
});

// 获取学生的课堂记录统计
router.get('/student/:studentId/stats', async (req, res) => {
  try {
    const { courseId } = req.query;
    const whereClause = {
      studentId: req.params.studentId
    };

    if (courseId) {
      whereClause.courseId = courseId;
    }

    const records = await ClassRecord.findAll({
      where: whereClause,
      attributes: ['attendanceStatus', 'performance']
    });

    const stats = {
      totalClasses: records.length,
      attendance: {
        present: 0,
        late: 0,
        absent: 0
      },
      averagePerformance: 0
    };

    records.forEach(record => {
      // 统计考勤
      stats.attendance[record.attendanceStatus]++;
      
      // 计算平均表现分数
      if (record.performance) {
        stats.averagePerformance += record.performance;
      }
    });

    if (records.length > 0) {
      stats.averagePerformance = (stats.averagePerformance / records.length).toFixed(2);
    }

    res.json(formatResponse(200, '获取学生课堂记录统计成功', stats));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取学生课堂记录统计失败', null, error));
  }
});

module.exports = router; 