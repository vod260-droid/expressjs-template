var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// 保留必要的中间件
app.use(logger('dev')); // 日志中间件（可选，方便调试）
app.use(express.json()); // 解析JSON请求体
app.use(express.urlencoded({ extended: false })); // 解析表单请求体
app.use(cookieParser()); // 解析Cookie（如果目标网站需要Cookie则保留）
// 移除静态文件托管（转发场景不需要）
// app.use(express.static(path.join(__dirname, 'public')));

// 目标网站基础URL（修改为你需要转发的网站）
const TARGET_BASE_URL = 'https://web3.okx.com';

// 核心转发逻辑：处理所有路径的请求
app.all('*', async (req, res) => {
  try {
    // 构建目标URL（拼接原请求的路径和参数）
    const targetUrl = `${TARGET_BASE_URL}${req.originalUrl}`;
    
    // 准备请求头（过滤不需要转发的头信息）
    const headers = new Headers();
    Object.entries(req.headers).forEach(([key, value]) => {
      if (key.toLowerCase() !== 'host' && key.toLowerCase() !== 'x-forwarded-for') {
        headers.append(key, value);
      }
    });
    
    // 准备请求体（适用于POST/PUT等方法）
    let body = undefined;
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
      body = req.body ? JSON.stringify(req.body) : undefined;
    }
    
    // 发起fetch请求获取目标网站内容
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: headers,
      body: body,
      redirect: 'manual' // 不自动跟随重定向，保持原始响应
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
    
  } catch (error) {
    console.error('转发错误:', error.message);
    res.status(500).send(`转发失败: ${error.message}`);
  }
});

// 错误处理（简化版）
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: req.app.get('env') === 'development' ? err : {}
  });
});

module.exports = app;
