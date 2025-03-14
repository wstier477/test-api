const express = require('express');
const router = express.Router();
const { Resource } = require('../models');
const { formatResponse } = require('../utils/formatResponse');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 配置文件上传
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/resources';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 限制文件大小为10MB
  fileFilter: (req, file, cb) => {
    // 允许的文件类型
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    if (extname) {
      return cb(null, true);
    }
    cb(new Error('不支持的文件类型'));
  }
});

// 获取课程资源列表
router.get('/course/:courseId', async (req, res) => {
  try {
    const resources = await Resource.findAll({
      where: { courseId: req.params.courseId },
      order: [['createdAt', 'DESC']]
    });
    res.json(formatResponse(200, '获取资源列表成功', resources));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取资源列表失败', null, error));
  }
});

// 上传资源
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { courseId, title, description } = req.body;
    const file = req.file;

    const resource = await Resource.create({
      courseId,
      title,
      description,
      filename: file.filename,
      originalname: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      uploaderId: req.user.id
    });

    res.json(formatResponse(200, '资源上传成功', resource));
  } catch (error) {
    res.status(500).json(formatResponse(500, '资源上传失败', null, error));
  }
});

// 删除资源
router.delete('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json(formatResponse(404, '资源不存在'));
    }

    // 删除文件
    if (fs.existsSync(resource.path)) {
      fs.unlinkSync(resource.path);
    }

    await resource.destroy();
    res.json(formatResponse(200, '资源删除成功'));
  } catch (error) {
    res.status(500).json(formatResponse(500, '资源删除失败', null, error));
  }
});

// 更新资源信息
router.put('/:id', async (req, res) => {
  try {
    const { title, description } = req.body;
    const resource = await Resource.findByPk(req.params.id);
    
    if (!resource) {
      return res.status(404).json(formatResponse(404, '资源不存在'));
    }

    await resource.update({ title, description });
    res.json(formatResponse(200, '资源信息更新成功', resource));
  } catch (error) {
    res.status(500).json(formatResponse(500, '资源信息更新失败', null, error));
  }
});

// 获取单个资源详情
router.get('/:id', async (req, res) => {
  try {
    const resource = await Resource.findByPk(req.params.id);
    if (!resource) {
      return res.status(404).json(formatResponse(404, '资源不存在'));
    }
    res.json(formatResponse(200, '获取资源详情成功', resource));
  } catch (error) {
    res.status(500).json(formatResponse(500, '获取资源详情失败', null, error));
  }
});

module.exports = router; 