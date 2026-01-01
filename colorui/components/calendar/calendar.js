
Component({
  
  properties: {
    spot: {
      type: Array,
      value: []
    },
    defaultTime: {
      type: String,
      value: ''
    }
  },

  data: {
    dateList: [], 
    selectDay: {}, 
  },

  methods: {
    
    formatTime(time, format) {
      function formatNumber(n) {
        n = n.toString()
        return n[1] ? n : '0' + n
      }

      function getDate(time, format) {
        const formateArr = ['Y', 'M', 'D', 'h', 'm', 's']
        const returnArr = []
        const date = new Date(time)
        returnArr.push(date.getFullYear())
        returnArr.push(formatNumber(date.getMonth() + 1))
        returnArr.push(formatNumber(date.getDate()))
        returnArr.push(formatNumber(date.getHours()))
        returnArr.push(formatNumber(date.getMinutes()))
        returnArr.push(formatNumber(date.getSeconds()))
        for (const i in returnArr) {
          format = format.replace(formateArr[i], returnArr[i])
        }
        return format
      }

      function getDateDiff(time) {
        let r = ''
        const ft = new Date(time)
        const nt = new Date()
        const nd = new Date(nt)
        nd.setHours(23)
        nd.setMinutes(59)
        nd.setSeconds(59)
        nd.setMilliseconds(999)
        const d = parseInt((nd - ft) / 86400000)
        switch (true) {
          case d === 0:
            const t = parseInt(nt / 1000) - parseInt(ft / 1000)
            switch (true) {
              case t < 60:
                r = '刚刚'
                break
              case t < 3600:
                r = parseInt(t / 60) + '分钟前'
                break
              default:
                r = parseInt(t / 3600) + '小时前'
            }
            break
          case d === 1:
            r = '昨天'
            break
          case d === 2:
            r = '前天'
            break
          case d > 2 && d < 30:
            r = d + '天前'
            break
          default:
            r = getDate(time, 'Y-M-D')
        }
        return r
      }
      if (!format) {
        return getDateDiff(time)
      } else {
        return getDate(time, format)
      }
    },
    
    editMonth(e) {
      const arr = e.detail.value.split("-")
      const year = parseInt(arr[0])
      const month = parseInt(arr[1])
      this.setMonth(year, month)
    },
    
    lastMonth() {
      const lastMonth = new Date(this.data.selectDay.year, this.data.selectDay.month - 2)
      const year = lastMonth.getFullYear()
      const month = lastMonth.getMonth() + 1
      this.setMonth(year, month)
    },
    
    nextMonth() {
      const nextMonth = new Date(this.data.selectDay.year, this.data.selectDay.month)
      const year = nextMonth.getFullYear()
      const month = nextMonth.getMonth() + 1
      this.setMonth(year, month)
    },
    
    setMonth(setYear, setMonth, setDay) {
      if (this.data.selectDay.year !== setYear || this.data.selectDay.month !== setMonth) {
        const day = Math.min(new Date(setYear, setMonth, 0).getDate(), this.data.selectDay.day)
        const time = new Date(setYear, setMonth - 1, setDay ? setDay : day)
        const data = {
          selectDay: {
            year: setYear,
            month: setMonth,
            day: setDay ? setDay : day,
            dateString: this.formatTime(time, "Y-M-D")
          }
        }
        if (!setDay) {
          data.open = true
        }
        this.setData(data)
        this.dateInit(setYear, setMonth)
        this.setSpot()
        this.triggerEvent("change", this.data.selectDay)
      }
    },
    
    openChange() {
      this.setData({
        open: !this.data.open
      })
      this.triggerEvent("aaa", {
        a: 0
      })
      this.dateInit()
      this.setSpot()
    },
    
    setSpot() {
      const timeArr = this.data.spot.map(item => {
        return this.formatTime(item, "Y-M-D")
      })
      this.data.dateList.forEach(item => {
        if (timeArr.indexOf(item.dateString) !== -1) {
          item.spot = true
        } else {
          item.spot = false
        }
      })
      this.setData({
        dateList: this.data.dateList
      })
    },
    
    dateInit(setYear = this.data.selectDay.year, setMonth = this.data.selectDay.month) {
      let dateList = []; 
      let now = new Date(setYear, setMonth - 1) 
      let startWeek = now.getDay(); 
      let dayNum = new Date(setYear, setMonth, 0).getDate() 
      let forNum = Math.ceil((startWeek + dayNum) / 7) * 7 
      if (this.data.open) {
        
        for (let i = 0; i < forNum; i++) {
          const now2 = new Date(now)
          now2.setDate(i - startWeek + 1)
          let obj = {};
          obj = {
            day: now2.getDate(),
            month: now2.getMonth() + 1,
            year: now2.getFullYear(),
            dateString: this.formatTime(now2, "Y-M-D")
          };
          dateList[i] = obj;
        }
      } else {
        
        for (let i = 0; i < 7; i++) {
          const now2 = new Date(now)
          
          now2.setDate(Math.ceil((this.data.selectDay.day + startWeek) / 7) * 7 - 6 - startWeek + i)
          let obj = {};
          obj = {
            day: now2.getDate(),
            month: now2.getMonth() + 1,
            year: now2.getFullYear(),
            dateString: this.formatTime(now2, "Y-M-D")
          };
          dateList[i] = obj;
        }
      }
      this.setData({
        dateList: dateList
      })
    },
    
    selectChange(e) {
      const year = e.currentTarget.dataset.year
      const month = e.currentTarget.dataset.month
      const day = e.currentTarget.dataset.day
      const dateString = e.currentTarget.dataset.dateString
      const selectDay = {
        year: year,
        month: month,
        day: day,
        dateString: dateString
      }
      if (this.data.selectDay.year !== year || this.data.selectDay.month !== month) {
        this.setMonth(year, month, day)
      } else if (this.data.selectDay.day !== day) {
        this.setData({
          selectDay: selectDay
        })
        this.triggerEvent("change", this.data.selectDay)
      }
    }
  },
  lifetimes: {
    attached() {
      let now = this.data.defaultTime ? new Date(this.data.defaultTime) : new Date()
      let selectDay = {
        year: now.getFullYear(),
        month: now.getMonth() + 1,
        day: now.getDate(),
        dateString: this.formatTime(now, "Y-M-D")
      }
      this.setMonth(selectDay.year, selectDay.month, selectDay.day)
    }
  },
  observers: {
    spot: function (spot) {
      this.setSpot()
    }
  }
})