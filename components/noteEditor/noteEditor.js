Component({
  properties: {
    bookId: String,
    initialContent: {
      type: String,
      value: ''
    }
  },

  data: {
    content: '',
    isEditing: false,
    selectedText: ''
  },

  lifetimes: {
    attached() {
      this.setData({
        content: this.properties.initialContent
      });
    }
  },

  methods: {
    onTextSelect(e) {
      const { text } = e.detail;
      this.setData({
        selectedText: text,
        showActionSheet: true
      });
    },

    async addHighlight() {
      const { selectedText } = this.data;
      try {
        await wx.cloud.callFunction({
          name: 'saveHighlight',
          data: {
            bookId: this.properties.bookId,
            text: selectedText,
            type: 'highlight'
          }
        });
        
        wx.showToast({
          title: '已添加标注'
        });
      } catch (error) {
        wx.showToast({
          title: '添加标注失败',
          icon: 'none'
        });
      }
    },

    async askAI() {
      const { selectedText } = this.data;
      wx.navigateTo({
        url: `/pages/aiChat/aiChat?text=${encodeURIComponent(selectedText)}&bookId=${this.properties.bookId}`
      });
    }
  }
}); 