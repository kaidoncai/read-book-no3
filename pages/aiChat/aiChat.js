Page({
  data: {
    messages: [
      {
        type: 'ai',
        content: '你好！我是AI助手，很高兴为你解答关于这本书的问题。'
      }
    ],
    inputValue: '',
    loading: false
  },

  onInput(e) {
    this.setData({
      inputValue: e.detail.value
    });
  },

  async sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content) return;

    // 添加用户消息
    this.setData({
      messages: [...this.data.messages, {
        type: 'user',
        content
      }],
      inputValue: '',
      loading: true
    });

    try {
      // 调用AI助手云函数
      const result = await wx.cloud.callFunction({
        name: 'aiChat',
        data: {
          question: content
        }
      });

      // 添加AI回复
      this.setData({
        messages: [...this.data.messages, {
          type: 'ai',
          content: result.data.response
        }],
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: '获取回答失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  }
}); 