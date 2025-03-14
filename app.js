const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const { notFound, errorHandler } = require('./middleware/errorHandler');
const indexRouter = require('./routes/index');
const authRouter = require('./routes/auth');
const userAuthRouter = require('./routes/userAuth');

/**
 * Express应用主文件
 * 配置中间件和路由
 */
const app = express();

// 基本中间件
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// CORS 跨域配置
app.use(cors());

// 路由
app.use('/', indexRouter);
app.use('/api/auth', authRouter);
app.use('/api/user-auth', userAuthRouter);

// 错误处理中间件
app.use(notFound);
app.use(errorHandler);

module.exports = app;