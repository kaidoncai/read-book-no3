Page({
  data: {
    readingStats: {
      totalBooks: 0,
      totalTime: 0,
      averageSpeed: 0,
      completionRate: 0
    },
    readingTrends: [],
    bookCategories: [],
    loading: true
  },

  onLoad() {
    this.fetchReadingData();
  },

  async fetchReadingData() {
    try {
      const result = await wx.cloud.callFunction({
        name: 'aiAssistant',
        data: {
          action: 'analyzeReadingPattern'
        }
      });

      const { readingStats, readingTrends, bookCategories } = result.data;
      this.setData({
        readingStats,
        readingTrends,
        bookCategories,
        loading: false
      });

      this.renderCharts();
    } catch (error) {
      wx.showToast({
        title: '获取数据失败',
        icon: 'none'
      });
    }
  },

  renderCharts() {
    // 使用微信小程序的canvas绘制图表
    this.renderTrendChart();
    this.renderCategoryChart();
  },

  renderTrendChart() {
    const ctx = wx.createCanvasContext('trendChart');
    const { readingTrends } = this.data;
    
    const width = 710; // canvas宽度
    const height = 400; // canvas高度
    const padding = 40;
    
    // 绘制坐标轴
    ctx.beginPath();
    ctx.setLineWidth(1);
    ctx.setStrokeStyle('#ccc');
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(width - padding, height - padding);
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.stroke();
    
    // 绘制折线
    if (readingTrends.length > 0) {
      const xStep = (width - padding * 2) / (readingTrends.length - 1);
      const maxValue = Math.max(...readingTrends.map(t => t.value));
      const yScale = (height - padding * 2) / maxValue;
      
      ctx.beginPath();
      ctx.setLineWidth(2);
      ctx.setStrokeStyle('#4CAF50');
      
      readingTrends.forEach((trend, index) => {
        const x = padding + xStep * index;
        const y = height - padding - trend.value * yScale;
        
        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });
      
      ctx.stroke();
    }
    
    ctx.draw();
  },

  renderCategoryChart() {
    const ctx = wx.createCanvasContext('categoryChart');
    const { bookCategories } = this.data;
    
    const centerX = 355; // canvas中心x坐标
    const centerY = 200; // canvas中心y坐标
    const radius = 150; // 饼图半径
    
    let startAngle = 0;
    const total = bookCategories.reduce((sum, cat) => sum + cat.count, 0);
    
    bookCategories.forEach(category => {
      const angle = (category.count / total) * 2 * Math.PI;
      
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, startAngle, startAngle + angle);
      ctx.setFillStyle(category.color);
      ctx.fill();
      
      // 绘制标签
      const labelAngle = startAngle + angle / 2;
      const labelX = centerX + (radius + 30) * Math.cos(labelAngle);
      const labelY = centerY + (radius + 30) * Math.sin(labelAngle);
      
      ctx.setFontSize(24);
      ctx.setFillStyle('#333');
      ctx.fillText(
        `${category.name} ${Math.round(category.count / total * 100)}%`,
        labelX,
        labelY
      );
      
      startAngle += angle;
    });
    
    ctx.draw();
  }
}); 