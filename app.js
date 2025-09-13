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
    
    let TARGET_BASE_URL="https://web3.okx.com";
    const targetUrl = `${TARGET_BASE_URL}${req.originalUrl}`;
    
    // 转发请求头（过滤掉一些不必要的头信息）
    const headers = { ...req.headers };
    delete headers.host;
    delete headers['x-forwarded-for'];

    // 发起远程请求

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: req.body,
      redirect: 'manual' // 不自动跟随重定向，由我们自己处理
    });
    // 转发状态码
    res.status(response.status);
    
    // 转发响应头
    response.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });
    
    // 转发响应内容
    const content = await response.text();
    res.send(content);
    //res.send(targetUrl);
  } catch (error) {
    // 必须添加catch块处理可能的错误
    res.status(500).send("服务器错误: " + error.message);
  }
});

module.exports = app;
