var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// 处理所有请求的转发逻辑
app.all('*', async (req, res) => {
  try {
    // 简单响应示例，实际使用时替换为转发逻辑
    res.send("转发服务运行中");
  } catch (error) {
    // 必须添加catch块处理可能的错误
    res.status(500).send("服务器错误: " + error.message);
  }
});

module.exports = app;
