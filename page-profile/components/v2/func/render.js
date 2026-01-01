import Day from './day'
import Todo from './todo'
import WxData from './wxData'
import convertSolarLunar from './convertSolarLunar'
import {
  Logger,
  GetDate,
  delRepeatedEnableDay,
  getDateTimeStamp,
  converEnableDaysToTimestamp
} from './utils'

const getDate = new GetDate()
const logger = new Logger()

class Calendar extends WxData {
  constructor(component) {
    super(component)
    this.Component = component
  }
  getCalendarConfig() {
    return this.Component.config
  }
  
  renderCalendar(curYear, curMonth, curDate, disableSelect) {
    return new Promise(resolve => {
      const config = this.getCalendarConfig()
      this.calculateEmptyGrids(curYear, curMonth)
      this.calculateDays(curYear, curMonth, curDate, disableSelect).then(() => {
        const { todoLabels, specialStyleDates, enableDays, selectedDay } =
          this.getData('calendar') || {}
        if (
          todoLabels &&
          todoLabels.find(
            item => +item.month === +curMonth && +item.year === +curYear
          )
        ) {
          Todo(this.Component).setTodoLabels()
        }
        if (
          specialStyleDates &&
          specialStyleDates.length &&
          specialStyleDates.find(
            item => +item.month === +curMonth && +item.year === +curYear
          )
        ) {
          Day(this.Component).setDateStyle(specialStyleDates)
        }

        if (
          enableDays &&
          enableDays.length &&
          enableDays.find(item => {
            let ymd = item.split('-')
            return +ymd[1] === +curMonth && +ymd[0] === +curYear
          })
        ) {
          Day(this.Component).enableDays(enableDays)
        }

        if (
          selectedDay &&
          selectedDay.length &&
          selectedDay.find(
            item => +item.month === +curMonth && +item.year === +curYear
          ) &&
          config.mulit
        ) {
          Day(this.Component).setSelectedDays(selectedDay)
        }

        if (!this.Component.firstRender) {
          resolve({
            firstRender: true
          })
        } else {
          resolve({
            firstRender: false
          })
        }
      })
    })
  }
  
  calculateEmptyGrids(year, month) {
    this.calculatePrevMonthGrids(year, month)
    this.calculateNextMonthGrids(year, month)
  }
  
  calculatePrevMonthGrids(year, month) {
    let empytGrids = []
    const prevMonthDays = getDate.thisMonthDays(year, month - 1)
    let firstDayOfWeek = getDate.firstDayOfWeek(year, month)
    const config = this.getCalendarConfig() || {}
    if (config.firstDayOfWeek === 'Mon') {
      if (firstDayOfWeek === 0) {
        firstDayOfWeek = 6
      } else {
        firstDayOfWeek -= 1
      }
    }
    if (firstDayOfWeek > 0) {
      const len = prevMonthDays - firstDayOfWeek
      const { onlyShowCurrentMonth } = config
      const { showLunar } = this.getCalendarConfig()
      for (let i = prevMonthDays; i > len; i--) {
        if (onlyShowCurrentMonth) {
          empytGrids.push('')
        } else {
          empytGrids.push({
            day: i,
            lunar: showLunar
              ? convertSolarLunar.solar2lunar(year, month - 1, i)
              : null
          })
        }
      }
      this.setData({
        'calendar.empytGrids': empytGrids.reverse()
      })
    } else {
      this.setData({
        'calendar.empytGrids': null
      })
    }
  }
  
  calculateExtraEmptyDate(year, month, config) {
    let extDate = 0
    if (+month === 2) {
      extDate += 7
      let firstDayofMonth = getDate.dayOfWeek(year, month, 1)
      if (config.firstDayOfWeek === 'Mon') {
        if (+firstDayofMonth === 1) extDate += 7
      } else {
        if (+firstDayofMonth === 0) extDate += 7
      }
    } else {
      let firstDayofMonth = getDate.dayOfWeek(year, month, 1)
      if (config.firstDayOfWeek === 'Mon') {
        if (firstDayofMonth !== 0 && firstDayofMonth < 6) {
          extDate += 7
        }
      } else {
        if (firstDayofMonth <= 5) {
          extDate += 7
        }
      }
    }
    return extDate
  }
  
  calculateNextMonthGrids(year, month) {
    let lastEmptyGrids = []
    const thisMonthDays = getDate.thisMonthDays(year, month)
    let lastDayWeek = getDate.dayOfWeek(year, month, thisMonthDays)
    const config = this.getCalendarConfig() || {}
    if (config.firstDayOfWeek === 'Mon') {
      if (lastDayWeek === 0) {
        lastDayWeek = 6
      } else {
        lastDayWeek -= 1
      }
    }
    let len = 7 - (lastDayWeek + 1)
    const { onlyShowCurrentMonth, showLunar } = config
    if (!onlyShowCurrentMonth) {
      len = len + this.calculateExtraEmptyDate(year, month, config)
    }
    for (let i = 1; i <= len; i++) {
      if (onlyShowCurrentMonth) {
        lastEmptyGrids.push('')
      } else {
        lastEmptyGrids.push({
          day: i,
          lunar: showLunar
            ? convertSolarLunar.solar2lunar(year, month + 1, i)
            : null
        })
      }
    }
    this.setData({
      'calendar.lastEmptyGrids': lastEmptyGrids
    })
  }
  
  setSelectedDay(year, month, curDate) {
    let selectedDay = []
    const config = this.getCalendarConfig()
    if (config.noDefault) {
      selectedDay = []
      config.noDefault = false
    } else {
      const data = this.getData('calendar') || {}
      const { showLunar } = this.getCalendarConfig()
      selectedDay = curDate
        ? [
            {
              year,
              month,
              day: curDate,
              choosed: true,
              week: getDate.dayOfWeek(year, month, curDate),
              lunar: showLunar
                ? convertSolarLunar.solar2lunar(year, month, curDate)
                : null
            }
          ]
        : data.selectedDay
    }
    return selectedDay
  }
  __getDisableDateTimestamp() {
    let disableDateTimestamp
    const { date, type } = this.getCalendarConfig().disableMode || {}
    if (date) {
      const t = date.split('-')
      if (t.length < 3) {
        logger.warn('配置 disableMode.date 格式错误')
        return {}
      }
      disableDateTimestamp = getDateTimeStamp({
        year: +t[0],
        month: +t[1],
        day: +t[2]
      })
    }
    return {
      disableDateTimestamp,
      disableType: type
    }
  }
  resetDates() {
    this.setData({
      'calendar.days': []
    })
  }
  
  calculateDays(year, month, curDate, disableSelect) {
    return new Promise(resolve => {
      
      this.resetDates()
      let days = []
      const {
        disableDays = [],
        chooseAreaTimestamp = [],
        selectedDay: selectedDates = []
      } = this.getData('calendar')
      days = Day(this.Component).buildDate(year, month)
      let selectedDay = selectedDates
      if (!disableSelect) {
        selectedDay = this.setSelectedDay(year, month, curDate)
      }
      const selectedDayStr = selectedDay.map(d => getDate.toTimeStr(d))
      const disableDaysStr = disableDays.map(d => getDate.toTimeStr(d))
      const [areaStart, areaEnd] = chooseAreaTimestamp
      days.forEach(item => {
        const cur = getDate.toTimeStr(item)
        const timestamp = getDateTimeStamp(item)
        if (selectedDayStr.includes(cur) && !disableSelect) {
          item.choosed = true
          if (timestamp > areaEnd || timestamp < areaStart) {
            const idx = selectedDay.findIndex(
              selectedDate =>
                getDate.toTimeStr(selectedDate) === getDate.toTimeStr(item)
            )
            selectedDay.splice(idx, 1)
          }
        } else if (
          areaStart &&
          areaEnd &&
          timestamp >= areaStart &&
          timestamp <= areaEnd &&
          !disableSelect
        ) {
          item.choosed = true
          selectedDay.push(item)
        }
        if (disableDaysStr.includes(cur)) item.disable = true

        const {
          disableDateTimestamp,
          disableType
        } = this.__getDisableDateTimestamp()
        let disabelByConfig = false
        if (disableDateTimestamp) {
          if (
            (disableType === 'before' && timestamp < disableDateTimestamp) ||
            (disableType === 'after' && timestamp > disableDateTimestamp)
          ) {
            disabelByConfig = true
          }
        }
        const isDisable = disabelByConfig || this.__isDisable(timestamp)
        if (isDisable) {
          item.disable = true
          item.choosed = false
        }
      })
      this.setData(
        {
          'calendar.days': days,
          'calendar.selectedDay': [...selectedDay] || []
        },
        () => {
          resolve()
        }
      )
    })
  }
  __isDisable(timestamp) {
    const {
      enableArea = [],
      enableDays = [],
      enableAreaTimestamp = []
    } = this.getData('calendar')
    let setDisable = false
    let expectEnableDaysTimestamp = converEnableDaysToTimestamp(enableDays)
    if (enableArea.length) {
      expectEnableDaysTimestamp = delRepeatedEnableDay(enableDays, enableArea)
    }
    if (enableAreaTimestamp.length) {
      if (
        (+enableAreaTimestamp[0] > +timestamp ||
          +timestamp > +enableAreaTimestamp[1]) &&
        !expectEnableDaysTimestamp.includes(+timestamp)
      ) {
        setDisable = true
      }
    } else if (
      expectEnableDaysTimestamp.length &&
      !expectEnableDaysTimestamp.includes(+timestamp)
    ) {
      setDisable = true
    }
    return setDisable
  }
}

export default component => new Calendar(component)
