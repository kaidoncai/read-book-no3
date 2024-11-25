const cloud = require('wx-server-sdk');
cloud.init();

const db = cloud.database();

exports.main = async (event, context) => {
  const { bookId } = event;
  
  try {
    const book = await db.collection('books').doc(bookId).get();
    
    const aiAnalysis = await analyzeBookContent(book.data);

    return {
      code: 0,
      data: {
        bookInfo: book.data,
        aiAnalysis
      }
    };
  } catch (error) {
    return {
      code: -1,
      message: error.message
    };
  }
};

async function analyzeBookContent(book) {
  return {
    coreConcepts: [
      {
        title: '核心概念1',
        description: '概念1的详细解释'
      },
      {
        title: '核心概念2',
        description: '概念2的详细解释'
      }
    ],
    background: '这是书籍的背景介绍...',
    keyPoints: [
      '关键点1',
      '关键点2',
      '关键点3'
    ]
  };
} 