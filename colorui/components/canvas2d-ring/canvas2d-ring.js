
var windWidth = wx.getSystemInfoSync().windowWidth;
Component({
  
  properties: {
    
    canvasWidth: {
      type: Number,
      value: windWidth * 0.4
    },
    
    lineWidth: {
      type: Number,
      value: 10
    },
    
    lineColor: {
      type: String,
      value: "#3696FA"
    },
    
    title: {
      type: String,
      value: "完成率"
    },
    
    value: {
      type: Number,
      value: 45
    },
    
    valueColor: {
      type: String,
      value: "#333"
    },
    
    f_size: {
      type: Number,
      value: 14
    },
    f_weight: {
      type: String,
      value: "500"
    },
    
    maxValue: {
      type: Number,
      value: 100
    },
    
    minValue: {
      type: Number,
      value: 0
    },
    
    suffix: {
      type: null,
      value: "%"
    },
    
    startDegree: {
      type: Number,
      value: 180
    }
  },

  data: {
    canvasWidth: ' windWidth * 0.4',
    show_tip: true
  },

  methods: {
    showCanvasRing() {
      
      if (this.data.title.replace(/(^\s*)|(\s*$)/g, "").length == 0) {
        this.setData({
          show_tip: false
        })
      }
      
      const query = wx.createSelectorQuery().in(this);
      query.select('#myCanvas')
        .fields({
          node: true,
          size: true
        })
        .exec(this.init.bind(this))
    },

    init(res) {
      const canvas = res[0].node
      const ctx = canvas.getContext('2d');
      const dpr = wx.getSystemInfoSync().pixelRatio
      canvas.width = res[0].width * dpr
      canvas.height = res[0].height * dpr
      ctx.scale(dpr, dpr);
      
      var circle_r = this.data.canvasWidth / 2; 
      var startDegree = this.data.startDegree; 
      var maxValue = this.data.maxValue; 
      var minValue = this.data.minValue; 
      var value = this.data.value; 
      var lineColor = this.data.lineColor; 
      var lineWidth = this.data.lineWidth; 
      var percent = 360 * ((value - minValue) / (maxValue - minValue)); 

      ctx.translate(circle_r, circle_r);
      
      ctx.beginPath();
      ctx.strokeStyle = "#ebebeb";
      ctx.lineWidth = lineWidth;
      ctx.arc(0, 0, circle_r - 10, 0, 2 * Math.PI, true);
      ctx.stroke();
      ctx.closePath();
      
      ctx.beginPath();
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = lineWidth;
      ctx.arc(0, 0, circle_r - 10, startDegree * Math.PI / 180 - 0.5 * Math.PI, percent * Math.PI / 180 + startDegree * Math.PI / 180 - 0.5 * Math.PI, false);
      ctx.stroke();
      ctx.closePath();
    }
  }
})