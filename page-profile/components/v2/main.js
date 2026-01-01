import Day from './func/day'
import Week from './func/week'
import Todo from './func/todo'
import WxData from './func/wxData'
import Calendar from './func/render'
import CalendarConfig from './func/config'
import convertSolarLunar from './func/convertSolarLunar'
import {
  Logger,
  GetDate,
  isComponent,
  initialTasks,
  getCurrentPage,
  getComponent,
  getDateTimeStamp
} from './func/utils'

let Component = {}
let logger = new Logger()
let getDate = new GetDate()
let dataInstance = null

function bindCurrentComponent(componentId) {
  if (componentId) {
    Component = getComponent(componentId)
  }
  return Component
}

function getData(key, componentId) {
  bindCurrentComponent(componentId)
  dataInstance = new WxData(Component)
  return dataInstance.getData(key)
}

function setData(data, callback = () => {}) {
  const dataInstance = new WxData(Component)
  return dataInstance.setData(data, callback)
}

const conf = {
  
  renderCalendar(curYear, curMonth, curDate) {
    if (isComponent(this)) Component = this
    return new Promise((resolve, reject) => {
      Calendar(Component)
        .renderCalendar(curYear, curMonth, curDate)
        .then((info = {}) => {
          if (!info.firstRender) {
            return resolve({
              year: curYear,
              month: curMonth,
              date: curDate
            })
          }
          mountEventsOnPage(getCurrentPage())
          Component.triggerEvent('afterCalendarRender', Component)
          Component.firstRender = true
          initialTasks.flag = 'finished'
          if (initialTasks.tasks.length) {
            initialTasks.tasks.shift()()
          }
          resolve({
            year: curYear,
            month: curMonth,
            date: curDate
          })
        })
        .catch(err => {
          reject(err)
        })
    })
  },
  
  whenChangeDate({ curYear, curMonth, newYear, newMonth }) {
    Component.triggerEvent('whenChangeMonth', {
      current: {
        year: curYear,
        month: curMonth
      },
      next: {
        year: newYear,
        month: newMonth
      }
    })
  },
  
  whenMulitSelect(dateIdx) {
    if (isComponent(this)) Component = this
    const { calendar = {} } = getData()
    const { days, todoLabels } = calendar
    const config = CalendarConfig(Component).getCalendarConfig()
    let { selectedDay: selectedDays = [] } = calendar
    const currentDay = days[dateIdx]
    if (!currentDay) return
    currentDay.choosed = !currentDay.choosed
    if (!currentDay.choosed) {
      currentDay.cancel = true 
      const currentDayStr = getDate.toTimeStr(currentDay)
      selectedDays = selectedDays.filter(
        item => currentDayStr !== getDate.toTimeStr(item)
      )
      if (todoLabels) {
        todoLabels.forEach(item => {
          if (currentDayStr === getDate.toTimeStr(item)) {
            currentDay.showTodoLabel = true
          }
        })
      }
    } else {
      currentDay.cancel = false
      const { showLabelAlways } = getData('calendar')
      if (showLabelAlways && currentDay.showTodoLabel) {
        currentDay.showTodoLabel = true
      } else {
        currentDay.showTodoLabel = false
      }
      if (!config.takeoverTap) {
        selectedDays.push(currentDay)
      }
    }
    if (config.takeoverTap) {
      return Component.triggerEvent('onTapDay', currentDay)
    }
    setData({
      'calendar.days': days,
      'calendar.selectedDay': selectedDays
    })
    conf.afterTapDay(currentDay, selectedDays)
  },
  
  whenSingleSelect(dateIdx) {
    if (isComponent(this)) Component = this
    const { calendar = {} } = getData()
    const { days, selectedDay: selectedDays = [], todoLabels } = calendar
    let shouldMarkerTodoDay = []
    const currentDay = days[dateIdx]
    if (!currentDay) return
    const preSelectedDate = [...selectedDays].pop() || {}
    const { month: dMonth, year: dYear } = days[0] || {}
    const config = CalendarConfig(Component).getCalendarConfig()
    if (config.takeoverTap) {
      return Component.triggerEvent('onTapDay', currentDay)
    }
    conf.afterTapDay(currentDay)
    if (!config.inverse && preSelectedDate.day === currentDay.day) return
    days.forEach((item, idx) => {
      if (+item.day === +preSelectedDate.day) days[idx].choosed = false
    })
    if (todoLabels) {
      
      shouldMarkerTodoDay = todoLabels.filter(
        item => +item.year === dYear && +item.month === dMonth
      )
    }
    Todo(Component).showTodoLabels(shouldMarkerTodoDay, days, selectedDays)
    const tmp = {
      'calendar.days': days
    }
    if (preSelectedDate.day !== currentDay.day) {
      preSelectedDate.choosed = false
      currentDay.choosed = true
      if (!calendar.showLabelAlways || !currentDay.showTodoLabel) {
        currentDay.showTodoLabel = false
      }
      tmp['calendar.selectedDay'] = [currentDay]
    } else if (config.inverse) {
      if (currentDay.choosed) {
        if (currentDay.showTodoLabel && calendar.showLabelAlways) {
          currentDay.showTodoLabel = true
        } else {
          currentDay.showTodoLabel = false
        }
      }
      tmp['calendar.selectedDay'] = []
    }
    if (config.weekMode) {
      tmp['calendar.curYear'] = currentDay.year
      tmp['calendar.curMonth'] = currentDay.month
    }
    setData(tmp)
  },
  gotoSetContinuousDates(start, end) {
    return chooseDateArea([
      `${getDate.toTimeStr(start)}`,
      `${getDate.toTimeStr(end)}`
    ])
  },
  timeRangeHelper(currentDate, selectedDay) {
    const currentDateTimestamp = getDateTimeStamp(currentDate)
    const startDate = selectedDay[0]
    let endDate
    let endDateTimestamp
    let selectedLen = selectedDay.length
    if (selectedLen > 1) {
      endDate = selectedDay[selectedLen - 1]
      endDateTimestamp = getDateTimeStamp(endDate)
    }
    const startTimestamp = getDateTimeStamp(startDate)
    return {
      endDate,
      startDate,
      currentDateTimestamp,
      endDateTimestamp,
      startTimestamp
    }
  },
  
  calculateDateRange(currentDate, selectedDay) {
    const {
      endDate,
      startDate,
      currentDateTimestamp,
      endDateTimestamp,
      startTimestamp
    } = this.timeRangeHelper(currentDate, selectedDay)
    let range = []
    let selectedLen = selectedDay.length
    const isWantToChooseOneDate = selectedDay.filter(
      item => getDate.toTimeStr(item) === getDate.toTimeStr(currentDate)
    )
    if (selectedLen === 2 && isWantToChooseOneDate.length) {
      range = [currentDate, currentDate]
      return range
    }
    if (
      currentDateTimestamp >= startTimestamp &&
      endDateTimestamp &&
      currentDateTimestamp <= endDateTimestamp
    ) {
      const currentDateIdxInChoosedDateArea = selectedDay.findIndex(
        item => getDate.toTimeStr(item) === getDate.toTimeStr(currentDate)
      )
      if (selectedLen / 2 > currentDateIdxInChoosedDateArea) {
        range = [currentDate, endDate]
      } else {
        range = [startDate, currentDate]
      }
    } else if (currentDateTimestamp < startTimestamp) {
      range = [currentDate, endDate]
    } else if (currentDateTimestamp > startTimestamp) {
      range = [startDate, currentDate]
    }
    return range
  },
  chooseAreaWhenExistArea(currentDate, selectedDay) {
    return new Promise((resolve, reject) => {
      const range = conf.calculateDateRange(
        currentDate,
        getDate.sortDates(selectedDay)
      )
      conf
        .gotoSetContinuousDates(...range)
        .then(data => {
          resolve(data)
          conf.afterTapDay(currentDate)
        })
        .catch(err => {
          reject(err)
          conf.afterTapDay(currentDate)
        })
    })
  },
  chooseAreaWhenHasOneDate(currentDate, selectedDay, lastChoosedDate) {
    return new Promise((resolve, reject) => {
      const startDate = lastChoosedDate || selectedDay[0]
      let range = [startDate, currentDate]
      const currentDateTimestamp = getDateTimeStamp(currentDate)
      const lastChoosedDateTimestamp = getDateTimeStamp(startDate)
      if (lastChoosedDateTimestamp > currentDateTimestamp) {
        range = [currentDate, startDate]
      }
      conf
        .gotoSetContinuousDates(...range)
        .then(data => {
          resolve(data)
          conf.afterTapDay(currentDate)
        })
        .catch(err => {
          reject(err)
          conf.afterTapDay(currentDate)
        })
    })
  },
  
  whenChooseArea(dateIdx) {
    return new Promise((resolve, reject) => {
      if (isComponent(this)) Component = this
      if (Component.weekMode) return
      const { days = [], selectedDay, lastChoosedDate } = getData('calendar')
      const currentDate = days[dateIdx]
      if (currentDate.disable) return
      const config = CalendarConfig(Component).getCalendarConfig()
      if (config.takeoverTap) {
        return Component.triggerEvent('onTapDay', currentDate)
      }
      if (selectedDay && selectedDay.length > 1) {
        conf
          .chooseAreaWhenExistArea(currentDate, selectedDay)
          .then(dates => {
            resolve(dates)
          })
          .catch(err => {
            reject(err)
          })
      } else if (lastChoosedDate || (selectedDay && selectedDay.length === 1)) {
        conf
          .chooseAreaWhenHasOneDate(currentDate, selectedDay, lastChoosedDate)
          .then(dates => {
            resolve(dates)
          })
          .catch(err => {
            reject(err)
          })
      } else {
        days.forEach(date => {
          if (+date.day === +currentDate.day) {
            date.choosed = true
          } else {
            date.choosed = false
          }
        })

        const dataInstance = new WxData(Component)
        dataInstance.setData({
          'calendar.days': [...days],
          'calendar.lastChoosedDate': currentDate
        })
      }
    })
  },
  
  afterTapDay(currentSelected, selectedDates) {
    
    const config = CalendarConfig(Component).getCalendarConfig()
    const { multi } = config
    if (!multi) {
      Component.triggerEvent('afterTapDay', currentSelected)
    } else {
      Component.triggerEvent('afterTapDay', {
        currentSelected,
        selectedDates
      })
    }
  },
  
  jumpToToday() {
    return new Promise((resolve, reject) => {
      const { year, month, date } = getDate.todayDate()
      const timestamp = getDate.todayTimestamp()
      const config = CalendarConfig(Component).getCalendarConfig()
      setData({
        'calendar.curYear': year,
        'calendar.curMonth': month,
        'calendar.selectedDay': [
          {
            year: year,
            day: date,
            month: month,
            choosed: true,
            lunar: config.showLunar
              ? convertSolarLunar.solar2lunar(year, month, date)
              : null
          }
        ],
        'calendar.todayTimestamp': timestamp
      })
      conf
        .renderCalendar(year, month, date)
        .then(() => {
          resolve({ year, month, date })
        })
        .catch(() => {
          reject('jump failed')
        })
    })
  }
}

export const whenChangeDate = conf.whenChangeDate
export const renderCalendar = conf.renderCalendar
export const whenSingleSelect = conf.whenSingleSelect
export const whenChooseArea = conf.whenChooseArea
export const whenMulitSelect = conf.whenMulitSelect
export const calculatePrevWeekDays = conf.calculatePrevWeekDays
export const calculateNextWeekDays = conf.calculateNextWeekDays

export function getCurrentYM(componentId) {
  bindCurrentComponent(componentId)
  return {
    year: getData('calendar.curYear'),
    month: getData('calendar.curMonth')
  }
}

export function getSelectedDay(options = {}, componentId) {
  bindCurrentComponent(componentId)
  const config = getCalendarConfig()
  const dates = getData('calendar.selectedDay') || []
  if (options.lunar && !config.showLunar) {
    const datesWithLunar = getDate.convertLunar(dates)
    return datesWithLunar
  } else {
    return dates
  }
}

export function cancelSelectedDates(dates, componentId) {
  bindCurrentComponent(componentId)
  const { days = [], selectedDay = [] } = getData('calendar') || {}
  if (!dates || !dates.length) {
    days.forEach(item => {
      item.choosed = false
    })
    setData({
      'calendar.days': days,
      'calendar.selectedDay': []
    })
  } else {
    const cancelDatesStr = dates.map(
      date => `${+date.year}-${+date.month}-${+date.day}`
    )
    const filterSelectedDates = selectedDay.filter(
      date =>
        !cancelDatesStr.includes(`${+date.year}-${+date.month}-${+date.day}`)
    )
    days.forEach(date => {
      if (
        cancelDatesStr.includes(`${+date.year}-${+date.month}-${+date.day}`)
      ) {
        date.choosed = false
      }
    })
    setData({
      'calendar.days': days,
      'calendar.selectedDay': filterSelectedDates
    })
  }
}

function jumpWhenWeekMode({ year, month, day }, disableSelected) {
  return new Promise((resolve, reject) => {
    Week(Component)
      .jump(
        {
          year: +year,
          month: +month,
          day: +day
        },
        disableSelected
      )
      .then(date => {
        resolve(date)
        Component.triggerEvent('afterCalendarRender', Component)
      })
      .catch(err => {
        reject(err)
        Component.triggerEvent('afterCalendarRender', Component)
      })
  })
}

function jumpWhenNormalMode({ year, month, day }) {
  return new Promise((resolve, reject) => {
    if (typeof +year !== 'number' || typeof +month !== 'number') {
      return logger.warn('jump 函数年月日参数必须为数字')
    }
    const timestamp = getDate.todayTimestamp()
    let tmp = {
      'calendar.curYear': +year,
      'calendar.curMonth': +month,
      'calendar.todayTimestamp': timestamp
    }
    setData(tmp, () => {
      conf
        .renderCalendar(+year, +month, +day)
        .then(date => {
          resolve(date)
        })
        .catch(err => {
          reject(err)
        })
    })
  })
}

export function jump(year, month, day, componentId) {
  return new Promise((resolve, reject) => {
    bindCurrentComponent(componentId)
    const { selectedDay = [] } = getData('calendar') || {}
    const { weekMode } = getData('calendarConfig') || {}
    const { year: y, month: m, day: d } = selectedDay[0] || {}
    if (+y === +year && +m === +month && +d === +day) {
      return
    }
    if (weekMode) {
      let disableSelected = false
      if (!year || !month || !day) {
        const today = getDate.todayDate()
        year = today.year
        month = today.month
        day = today.date
        disableSelected = true
      }
      jumpWhenWeekMode({ year, month, day }, disableSelected)
        .then(date => {
          resolve(date)
        })
        .catch(err => {
          reject(err)
        })
      mountEventsOnPage(getCurrentPage())
      return
    }
    if (year && month) {
      jumpWhenNormalMode({ year, month, day })
        .then(date => {
          resolve(date)
        })
        .catch(err => {
          reject(err)
        })
    } else {
      conf
        .jumpToToday()
        .then(date => {
          resolve(date)
        })
        .catch(err => {
          reject(err)
        })
    }
  })
}

export function setTodoLabels(todos, componentId) {
  bindCurrentComponent(componentId)
  Todo(Component).setTodoLabels(todos)
}

export function deleteTodoLabels(todos, componentId) {
  bindCurrentComponent(componentId)
  Todo(Component).deleteTodoLabels(todos)
}

export function clearTodoLabels(componentId) {
  bindCurrentComponent(componentId)
  Todo(Component).clearTodoLabels()
}

export function getTodoLabels(options = {}, componentId) {
  bindCurrentComponent(componentId)
  const config = getCalendarConfig()
  const todoDates = Todo(Component).getTodoLabels() || []
  if (options.lunar && !config.showLunar) {
    const todoDatesWithLunar = getDate.convertLunar(todoDates)
    return todoDatesWithLunar
  } else {
    return todoDates
  }
}

export function disableDay(days = [], componentId) {
  bindCurrentComponent(componentId)
  Day(Component).disableDays(days)
}

export function enableArea(area = [], componentId) {
  bindCurrentComponent(componentId)
  Day(Component).enableArea(area)
}

export function enableDays(days = [], componentId) {
  bindCurrentComponent(componentId)
  Day(Component).enableDays(days)
}

export function setSelectedDays(selected, componentId) {
  bindCurrentComponent(componentId)
  Day(Component).setSelectedDays(selected)
}

export function getCalendarConfig(componentId) {
  bindCurrentComponent(componentId)
  return CalendarConfig(Component).getCalendarConfig()
}

export function setCalendarConfig(config, componentId) {
  bindCurrentComponent(componentId)
  if (!config || Object.keys(config).length === 0) {
    return logger.warn('setCalendarConfig 参数必须为非空对象')
  }
  const existConfig = getCalendarConfig()
  return new Promise((resolve, reject) => {
    CalendarConfig(Component)
      .setCalendarConfig(config)
      .then(conf => {
        resolve(conf)
        const { date, type } = existConfig.disableMode || {}
        const { _date, _type } = config.disableMode || {}
        if (type !== _type || date !== _date) {
          const { year, month } = getCurrentYM()
          jump(year, month)
        }
      })
      .catch(err => {
        reject(err)
      })
  })
}

export function getCalendarDates(options = {}, componentId) {
  bindCurrentComponent(componentId)
  const config = getCalendarConfig()
  const dates = getData('calendar.days', componentId) || []
  if (options.lunar && !config.showLunar) {
    const datesWithLunar = getDate.convertLunar(dates)
    return datesWithLunar
  } else {
    return dates
  }
}

export function chooseDateArea(dateArea, componentId) {
  bindCurrentComponent(componentId)
  return Day(Component).chooseArea(dateArea)
}

export function setDateStyle(dates, componentId) {
  if (!dates) return
  bindCurrentComponent(componentId)
  Day(Component).setDateStyle(dates)
}

export function switchView(...args) {
  return new Promise((resolve, reject) => {
    const view = args[0]
    if (!args[1]) {
      return Week(Component)
        .switchWeek(view)
        .then(resolve)
        .catch(reject)
    }
    if (typeof args[1] === 'string') {
      bindCurrentComponent(args[1], this)
      Week(Component)
        .switchWeek(view, args[2])
        .then(resolve)
        .catch(reject)
    } else if (typeof args[1] === 'object') {
      if (typeof args[2] === 'string') {
        bindCurrentComponent(args[1], this)
      }
      Week(Component)
        .switchWeek(view, args[1])
        .then(resolve)
        .catch(reject)
    }
  })
}

function mountEventsOnPage(page) {
  page.calendar = {
    jump,
    switchView,
    disableDay,
    enableArea,
    enableDays,
    chooseDateArea,
    getCurrentYM,
    getSelectedDay,
    cancelSelectedDates,
    setDateStyle,
    setTodoLabels,
    getTodoLabels,
    deleteTodoLabels,
    clearTodoLabels,
    setSelectedDays,
    getCalendarConfig,
    setCalendarConfig,
    getCalendarDates
  }
}

function setWeekHeader(firstDayOfWeek) {
  let weeksCh = ['日', '一', '二', '三', '四', '五', '六']
  if (firstDayOfWeek === 'Mon') {
    weeksCh = ['一', '二', '三', '四', '五', '六', '日']
  }
  setData({
    'calendar.weeksCh': weeksCh
  })
}

function autoSelectDay(defaultDay) {
  Component.firstRenderWeekMode = true
  if (defaultDay && typeof defaultDay === 'string') {
    const day = defaultDay.split('-')
    if (day.length < 3) {
      return logger.warn('配置 jumpTo 格式应为: 2018-4-2 或 2018-04-02')
    }
    jump(+day[0], +day[1], +day[2])
  } else {
    if (!defaultDay) {
      Component.config.noDefault = true
      setData({
        'config.noDefault': true
      })
    }
    jump()
  }
}

function init(component, config) {
  initialTasks.flag = 'process'
  Component = component
  Component.config = config
  setWeekHeader(config.firstDayOfWeek)
  autoSelectDay(config.defaultDay)

}

export default (component, config = {}) => {
  if (initialTasks.flag === 'process') {
    return initialTasks.tasks.push(function() {
      init(component, config)
    })
  }
  init(component, config)
}
