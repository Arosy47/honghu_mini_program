import WxData from './wxData'
import { Logger, uniqueArrayByDate, GetDate } from './utils'

const logger = new Logger()
const getDate = new GetDate()

class Todo extends WxData {
  constructor(component) {
    super(component)
    this.Component = component
  }
  
  setTodoLabels(options) {
    if (options) this.Component.todoConfig = options
    const calendar = this.getData('calendar')
    if (!calendar || !calendar.days) {
      return logger.warn('请等待日历初始化完成后再调用该方法')
    }
    const dates = [...calendar.days]
    const { curYear, curMonth } = calendar
    const {
      circle,
      dotColor = '',
      pos = 'bottom',
      showLabelAlways,
      days: todoDays = []
    } = options || this.Component.todoConfig || {}
    const { todoLabels = [] } = calendar
    const currentMonthTodoLabels = this.getTodoLabels({
      year: curYear,
      month: curMonth
    })
    let newTodoLabels = todoDays.filter(
      item => +item.year === +curYear && +item.month === +curMonth
    )
    if (this.Component.weekMode) {
      newTodoLabels = todoDays
    }
    const allTodos = currentMonthTodoLabels.concat(newTodoLabels)
    for (let todo of allTodos) {
      let target
      if (this.Component.weekMode) {
        target = dates.find(
          date =>
            +todo.year === +date.year &&
            +todo.month === +date.month &&
            +todo.day === +date.day
        )
      } else {
        target = dates[todo.day - 1]
      }
      if (!target) continue
      if (showLabelAlways) {
        target.showTodoLabel = true
      } else {
        target.showTodoLabel = !target.choosed
      }
      if (target.showTodoLabel) {
        target.todoText = todo.todoText
      }
      target.color = todo.color
    }
    const o = {
      'calendar.days': dates,
      'calendar.todoLabels': uniqueArrayByDate(todoLabels.concat(todoDays))
    }
    if (!circle) {
      o['calendar.todoLabelPos'] = pos
      o['calendar.todoLabelColor'] = dotColor
    }
    o['calendar.todoLabelCircle'] = circle || false
    o['calendar.showLabelAlways'] = showLabelAlways || false
    this.setData(o)
  }
  
  deleteTodoLabels(todos) {
    if (!(todos instanceof Array) || !todos.length) return
    const todoLabels = this.filterTodos(todos)
    const { days: dates, curYear, curMonth } = this.getData('calendar')
    const currentMonthTodoLabels = todoLabels.filter(
      item => curYear === +item.year && curMonth === +item.month
    )
    dates.forEach(item => {
      item.showTodoLabel = false
    })
    currentMonthTodoLabels.forEach(item => {
      dates[item.day - 1].showTodoLabel = !dates[item.day - 1].choosed
    })
    this.setData({
      'calendar.days': dates,
      'calendar.todoLabels': todoLabels
    })
  }
  
  clearTodoLabels() {
    const { days = [] } = this.getData('calendar')
    const dates = [].concat(days)
    dates.forEach(item => {
      item.showTodoLabel = false
    })
    this.setData({
      'calendar.days': dates,
      'calendar.todoLabels': []
    })
  }
  
  getTodoLabels(target) {
    const { todoLabels = [] } = this.getData('calendar')
    if (target) {
      const { year, month } = target
      const _todoLabels = todoLabels.filter(
        item => +item.year === +year && +item.month === +month
      )
      return _todoLabels
    }
    return todoLabels
  }
  
  filterTodos(todos) {
    const todoLabels = this.getData('calendar.todoLabels') || []
    const deleteTodo = todos.map(item => getDate.toTimeStr(item))
    return todoLabels.filter(
      item => !deleteTodo.includes(getDate.toTimeStr(item))
    )
  }
  
  showTodoLabels(todoDays, days, selectedDays) {
    todoDays.forEach(item => {
      if (this.Component.weekMode) {
        days.forEach((_item, idx) => {
          if (+_item.day === +item.day) {
            const day = days[idx]
            day.hasTodo = true
            day.todoText = item.todoText
            if (
              selectedDays &&
              selectedDays.length &&
              +selectedDays[0].day === +item.day
            ) {
              day.showTodoLabel = true
            }
          }
        })
      } else {
        const day = days[item.day - 1]
        if (!day) return
        day.hasTodo = true
        day.todoText = item.todoText
        if (
          selectedDays &&
          selectedDays.length &&
          +selectedDays[0].day === +item.day
        ) {
          days[selectedDays[0].day - 1].showTodoLabel = true
        }
      }
    })
  }
}

export default component => new Todo(component)
