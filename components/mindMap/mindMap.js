Component({
  properties: {
    data: {
      type: Object,
      value: {}
    },
    width: {
      type: Number,
      value: 750
    },
    height: {
      type: Number,
      value: 600
    }
  },

  data: {
    nodes: [],
    lines: [],
    draggedNodeId: null,
    dragStartX: 0,
    dragStartY: 0,
    scale: 1
  },

  lifetimes: {
    attached() {
      this.initMindMap();
    }
  },

  methods: {
    initMindMap() {
      const { data } = this.properties;
      if (!data.central) return;

      // 计算节点位置
      const centerX = this.properties.width / 2;
      const centerY = this.properties.height / 2;
      
      const nodes = [{
        id: 'central',
        x: centerX,
        y: centerY,
        text: data.central,
        type: 'central'
      }];

      const lines = [];
      
      // 计算子节点位置
      if (data.children) {
        const angleStep = (2 * Math.PI) / data.children.length;
        data.children.forEach((child, index) => {
          const angle = angleStep * index;
          const radius = 200; // 子节点到中心的距离
          
          const x = centerX + radius * Math.cos(angle);
          const y = centerY + radius * Math.sin(angle);
          
          const nodeId = `node-${index}`;
          nodes.push({
            id: nodeId,
            x,
            y,
            text: child.topic,
            type: 'topic'
          });

          lines.push({
            from: 'central',
            to: nodeId
          });

          // 处理二级节点
          if (child.children) {
            this.addSubNodes(child.children, nodeId, x, y, nodes, lines, index);
          }
        });
      }

      this.setData({ nodes, lines });
    },

    addSubNodes(children, parentId, parentX, parentY, nodes, lines, parentIndex) {
      const subRadius = 100;
      const angleStart = (parentIndex * Math.PI) / 3;
      const angleStep = Math.PI / 6;

      children.forEach((child, index) => {
        const angle = angleStart + angleStep * index;
        const x = parentX + subRadius * Math.cos(angle);
        const y = parentY + subRadius * Math.sin(angle);
        
        const nodeId = `${parentId}-sub-${index}`;
        nodes.push({
          id: nodeId,
          x,
          y,
          text: child.topic || child,
          type: 'subtopic'
        });

        lines.push({
          from: parentId,
          to: nodeId
        });
      });
    },

    // 计算连线样式
    getLineStyle(line) {
      const fromNode = this.data.nodes.find(n => n.id === line.from);
      const toNode = this.data.nodes.find(n => n.id === line.to);
      
      if (!fromNode || !toNode) return '';
      
      const dx = toNode.x - fromNode.x;
      const dy = toNode.y - fromNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx) * 180 / Math.PI;
      
      return `
        left: ${fromNode.x}rpx;
        top: ${fromNode.y}rpx;
        width: ${length}rpx;
        transform: rotate(${angle}deg);
      `;
    },

    // 节点拖动处理
    onNodeDragStart(e) {
      const nodeId = e.currentTarget.dataset.id;
      this.setData({
        draggedNodeId: nodeId,
        dragStartX: e.touches[0].clientX,
        dragStartY: e.touches[0].clientY
      });
    },

    onNodeDragMove(e) {
      if (!this.data.draggedNodeId) return;
      
      const dx = e.touches[0].clientX - this.data.dragStartX;
      const dy = e.touches[0].clientY - this.data.dragStartY;
      
      const nodes = this.data.nodes.map(node => {
        if (node.id === this.data.draggedNodeId) {
          return {
            ...node,
            x: node.x + dx,
            y: node.y + dy
          };
        }
        return node;
      });
      
      this.setData({
        nodes,
        dragStartX: e.touches[0].clientX,
        dragStartY: e.touches[0].clientY
      });
    },

    onNodeDragEnd() {
      this.setData({
        draggedNodeId: null
      });
    },

    // 缩放控制
    zoomIn() {
      const scale = Math.min(2, (this.data.scale || 1) + 0.1);
      this.setData({ scale });
    },

    zoomOut() {
      const scale = Math.max(0.5, (this.data.scale || 1) - 0.1);
      this.setData({ scale });
    }
  }
}); 