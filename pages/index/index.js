Page({
  data: {
    searchQuery: '',
    loading: false
  },

  onSearchInput(e) {
    this.setData({
      searchQuery: e.detail.value
    });
  },

  async onSearch() {
    if (!this.data.searchQuery.trim()) {
      return wx.showToast({
        title: '请输入书名',
        icon: 'none'
      });
    }

    this.setData({ loading: true });
    try {
      const result = await wx.cloud.callFunction({
        name: 'searchBooks',
        data: {
          keyword: this.data.searchQuery
        }
      });

      if (result.data && result.data.length > 0) {
        wx.navigateTo({
          url: `/pages/bookDetail/bookDetail?id=${result.data[0].id}`
        });
      } else {
        wx.showToast({
          title: '未找到相关书籍',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.showToast({
        title: '搜索失败',
        icon: 'none'
      });
    }
    this.setData({ loading: false });
  }
}); 