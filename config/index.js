const config = {
  env: {
    id: 'your-env-id', // 替换为你的云环境ID
    database: 'hundred-books'
  },
  collection: {
    books: 'books',
    notes: 'notes',
    chatHistory: 'chat_history',
    readingProgress: 'reading_progress'
  },
  ai: {
    apiKey: 'your-ai-api-key', // 替换为你的AI API密钥
    endpoint: 'https://api.openai.com/v1/chat/completions'
  },
  storage: {
    avatar: 'avatar/',
    bookCover: 'book-cover/'
  }
};

module.exports = config; 