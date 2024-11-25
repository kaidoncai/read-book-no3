const cache = {};

async function getBookDetail(bookId) {
  // 检查缓存
  if (cache[`book_${bookId}`]) {
    return cache[`book_${bookId}`];
  }

  const result = await wx.cloud.callFunction({
    name: 'getBookDetail',
    data: { bookId }
  });

  // 存入缓存
  cache[`book_${bookId}`] = result.data;
  return result.data;
} 