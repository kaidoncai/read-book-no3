Component({
  properties: {
    book: {
      type: Object,
      value: {}
    }
  },
  
  methods: {
    onTapBook() {
      const { id } = this.properties.book;
      wx.navigateTo({
        url: `/pages/bookDetail/bookDetail?id=${id}`
      });
    }
  }
}); 