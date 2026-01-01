const emoji = require('./data-by-group')
const DEFAULT_ACtIVE = '😀'
const HISTORY_LIMIT = 42

Component({
  
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    topicedit:{
      type: Boolean,
      value: false
    },
    emojiheight:{
      type: Number,
      value: 0
    }
  },
  data: {
    visible: false,
    emojiKeys: Object.keys(emoji),
    active: DEFAULT_ACtIVE,
    emojis: emoji[DEFAULT_ACtIVE],
    scrollTop: 0,
    
    safeAreaBottom:0
  },
  ready() {

    this.setBottom()

  },
  methods: {

    topicedit: function(topicedit) {

    },

    closeDialog() {
      
      this.setData({
        visible: false
      })
      this.triggerEvent('closeDialog')
    },
    
    chooseEmoji(event) {
      const { emoji } = event.currentTarget.dataset

      this.triggerEvent('onSelect', emoji)
    },

    setBottom(){
      const systemInfo = wx.getSystemInfoSync()

    }
  }
})
