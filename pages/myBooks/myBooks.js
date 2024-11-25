Page({
  data: {
    books: [],
    loading: true,
    currentTab: 0,
    tabs: ['全部', '在读', '已读', '想读']
  },

  onLoad() {
    this.fetchMyBooks();
  },

  onShow() {
    this.fetchMyBooks();
  },

  async fetchMyBooks() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'getMyBooks',
        data: {
          status: this.data.currentTab
        }
      });
      
      this.setData({
        books: result.data.books,
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取书架失败',
        icon: 'none'
      });
    }
  },

  switchTab(e) {
    const tab = e.currentTarget.dataset.tab;
    this.setData({
      currentTab: tab
    });
    this.fetchMyBooks();
  },

  updateBookStatus(e) {
    const { bookId, status } = e.currentTarget.dataset;
    wx.cloud.callFunction({
      name: 'updateBookStatus',
      data: {
        bookId,
        status
      }
    }).then(() => {
      this.fetchMyBooks();
    });
  }
}); 