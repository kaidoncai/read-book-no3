Page({
  data: {
    bookInfo: {},
    aiAnalysis: {
      coreConcepts: [],
      background: '',
      keyPoints: []
    },
    loading: true,
    showAiChat: false
  },

  onLoad(options) {
    this.fetchBookDetail(options.id);
  },

  async fetchBookDetail(bookId) {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getBookDetail',
        data: { bookId }
      });
      
      this.setData({
        bookInfo: result.data.bookInfo,
        aiAnalysis: result.data.aiAnalysis,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取书籍详情失败',
        icon: 'none'
      });
    }
  },

  toggleAiChat() {
    this.setData({
      showAiChat: !this.data.showAiChat
    });
  }
}); 