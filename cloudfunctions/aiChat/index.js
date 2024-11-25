const cloud = require('wx-server-sdk');
cloud.init();

exports.main = async (event, context) => {
  const { question } = event;
  
  try {
    // 这里可以接入实际的AI API
    const response = await generateAIResponse(question);
    
    return {
      code: 0,
      data: {
        response
      }
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message
    };
  }
};

async function generateAIResponse(question) {
  // 模拟AI回复
  const responses = [
    '这是一个很好的问题！让我来为你解答...',
    '根据书中的内容，我认为...',
    '这个问题涉及到以下几个方面...',
    '让我帮你分析一下这个问题...'
  ];
  
  return responses[Math.floor(Math.random() * responses.length)] + 
    '\n\n关于"' + question + '"，' + 
    '这里是详细的解答...';
} 