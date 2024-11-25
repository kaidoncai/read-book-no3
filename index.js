const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3000;

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// 路由导入
const booksRouter = require('./routes/books');
const usersRouter = require('./routes/users');

// 路由注册
app.use('/api/books', booksRouter);
app.use('/api/users', usersRouter);

// 添加 AI 助手路由
const aiRouter = express.Router();

// AI 助手对话
aiRouter.post('/chat', async (req, res) => {
  try {
    const { message } = req.body;
    
    // 简单的关键词匹配系统
    const response = generateAIResponse(message);
    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// AI 响应生成函数
function generateAIResponse(message) {
  const keywords = message.toLowerCase();
  
  // 阅读建议
  if (keywords.includes('建议') || keywords.includes('怎么读')) {
    return {
      text: "我的建议是：\n1. 每天固定时间阅读，培养习惯\n2. 使用番茄工作法，每次专注25分钟\n3. 阅读时做笔记，加深理解\n4. 定期复习笔记，巩固知识\n\n需要了解具体哪方面的建议吗？",
      suggestions: ['制定阅读计划', '提高阅读效率', '做好读书笔记']
    };
  }
  
  // 阅读计划
  if (keywords.includes('计划') || keywords.includes('目标')) {
    return {
      text: "制定阅读计划很重要！建议：\n1. 设置每日阅读页数目标\n2. 规划固定的阅读时间段\n3. 建立阅读清单\n4. 追踪阅读进度\n\n要我帮你制定具体的阅读计划吗？",
      suggestions: ['设置每日目标', '查看阅读进度', '调整阅读计划']
    };
  }
  
  // 笔记方法
  if (keywords.includes('笔记') || keywords.includes('记录')) {
    return {
      text: "做读书笔记的技巧：\n1. 记录重要观点和感悟\n2. 使用思维导图整理内容\n3. 定期复习和整理笔记\n4. 与他人分享讨论\n\n需要我为您生成笔记模板吗？",
      suggestions: ['创建笔记模板', '查看笔记示例', '导出笔记']
    };
  }
  
  // 书籍推荐
  if (keywords.includes('推荐') || keywords.includes('什么书')) {
    return {
      text: "根据您的阅读历史，我推荐：\n1. 《深度工作》- 提升专注力\n2. 《原子习惯》- 养成好习惯\n3. 《认知觉醒》- 提高学习能力\n\n想了解具体哪本书的详情吗？",
      suggestions: ['查看详细介绍', '加入阅读清单', '查看更多推荐']
    };
  }

  // 阅读理解
  if (keywords.includes('理解') || keywords.includes('复习')) {
    return {
      text: "提高阅读理解的方法：\n1. 带着问题阅读\n2. 定期总结重点\n3. 与他人讨论交流\n4. 实践书中的方法\n\n需要我为您生成理解检查问题吗？",
      suggestions: ['生成复习问题', '创建思维导图', '总结关键点']
    };
  }

  // 默认回复
  return {
    text: "我是您的AI读书助手，可以帮您：\n1. 制定阅读计划\n2. 推荐适合的书籍\n3. 提供阅读建议\n4. 生成读书笔记\n\n请告诉我您需要什么帮助？",
    suggestions: ['获取阅读建议', '制定阅读计划', '推荐好书', '笔记方法']
  };
}

// AI 特定功能
aiRouter.post('/:feature', async (req, res) => {
  try {
    const { feature } = req.params;
    let response;

    switch (feature) {
      case 'summary':
        response = {
          text: "我已为您生成内容概要：\n\n主要观点：\n1. ...\n2. ...\n\n核心要点：\n1. ...\n2. ...\n\n实践建议：\n1. ...\n2. ...",
          type: 'summary'
        };
        break;
      
      case 'mindmap':
        response = {
          text: "思维导图已生成，包含以下要点：\n\n中心主题\n├── 分支1\n│   ├── 要点1\n│   └── 要点2\n└── 分支2\n    ├── 要点3\n    └── 要点4",
          type: 'mindmap'
        };
        break;
      
      case 'quiz':
        response = {
          text: "理解测验题目：\n\n1. 问题一：...\n   A. ...\n   B. ...\n   C. ...\n\n2. 问题二：...\n   A. ...\n   B. ...\n   C. ...",
          type: 'quiz'
        };
        break;
      
      case 'recommend':
        response = {
          text: "基于您的阅读兴趣，推荐以下书籍：\n\n1. 《书名1》\n   推荐理由：...\n\n2. 《书名2》\n   推荐理由：...\n\n3. 《书名3》\n   推荐理由：...",
          type: 'recommend'
        };
        break;
      
      default:
        response = {
          text: "抱歉，该功能暂时不可用。",
          type: 'error'
        };
    }

    res.json({ success: true, data: response });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

app.use('/api/ai', aiRouter);

// MongoDB 连接配置
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/reading-app';

// 设置 strictQuery 选项
mongoose.set('strictQuery', true);

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      retryWrites: true
    });
    console.log('成功连接到数据库');
  } catch (error) {
    console.error('数据库连接失败:', error.message);
    // 5秒后重试连接
    setTimeout(connectDB, 5000);
  }
};

// 调用连接函数
connectDB();

// 监听连接事件
mongoose.connection.on('error', (err) => {
  console.error('MongoDB 连接错误:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('MongoDB 连接断开，尝试重新连接...');
  setTimeout(connectDB, 5000);
});

// API 健康检查
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date() });
});

// 错误处理中间件
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 处理 404 错误
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '未找到请求的资源'
  });
});

app.listen(port, () => {
  console.log(`服务器运行在 http://localhost:${port}`);
}); 