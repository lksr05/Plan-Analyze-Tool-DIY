

class MyEvent {
  constructor(title, start, allDay, backgroundColor, image_url, id) {
    this.title = title
    this.start = start
    this.allDay = allDay
    this.backgroundColor = backgroundColor
    this.image_url = image_url
    this.id = id
  }
}

const myCalendar = document.getElementById('calendar')
let color = '#e6e600'
let data = []


const calendar = new FullCalendar.Calendar(myCalendar, {
  initialView: 'dayGridWeek',
  firstDay: 1,
  height: 400,
  eventDisplay: 'block',
  eventBorderColor: 'black',
  displayEventTime: false,
  editable: true,
  eventClick: () => {

  },
  eventContent: function (arg) {
    let arrayOfDomNodes = []
    // title event
    let titleEvent = document.createElement('div')
    if (arg.event._def.title) {
      titleEvent.innerHTML = arg.event._def.title
      titleEvent.classList = "fc-event-title fc-sticky"
    }

    // image event
    let imgEventWrap = document.createElement('div')
    if (arg.event.extendedProps.image_url) {
      let imgEvent = '<img width="32" height="32" src="' + arg.event.extendedProps.image_url + '" >'
      imgEventWrap.classList = "fc-event-img"
      imgEventWrap.innerHTML = imgEvent;
    }

    arrayOfDomNodes = [titleEvent, imgEventWrap]

    return { domNodes: arrayOfDomNodes }
  },
  datesSet: () => {
    const searchParams = new URLSearchParams({
      range: getViewRange(calendar)
    })
    fetchData(searchParams)
    calendar.render()
  }
})



function getViewRange(calendar) {
  const view = calendar.view
  const viewRange = [Date.parse(view.activeStart), Date.parse(view.activeEnd)]
  console.log(view.activeStart)
  return viewRange
}

async function fetchData(searchParams) {
  const url = new URL('/calendar', window.location.origin)
  const res = await fetch(url + '?' + searchParams)
  if (!res.ok) {
    console.log(res.status)
  } else {
    const data = await res.json()
    console.log(data)
    console.log(typeof data)
    for (let i = 0; i < data.length; i++) {
      if (data[i].includes('HIT')) {
        color = '#e60000'
      }
      if (data[i].includes('LIT')) {
        color = '#00bfff'
      }
      const eventRaw = JSON.parse(data[i])
      let pic = 'https://icon-library.com/images/running-shoes-icon/running-shoes-icon-6.jpg'
      if (eventRaw.sport === 'rc') {
        pic = 'https://c0.klipartz.com/pngpicture/1024/930/sticker-png-computer-icons-scalable-graphics-bicycle-cycle-symbol-text-bicycle-cycling-trial-symbol.png'
      }
      if (eventRaw.sport === 'mtb') {
        pic = 'https://spng.subpng.com/20200216/ebu/transparent-mountain-bike-bicycle-mountain-biking-downhill-mou-bower-road-bike-park5ead2b18bced88.2380391515884070647739.jpg'
      }
      if (eventRaw.sport === 'swim') {
        pic = 'https://w7.pngwing.com/pngs/655/142/png-transparent-computer-icons-synchronised-swimming-swimming-text-sport-swimming-pool.png'
      }
      const event = new MyEvent(eventRaw.sport.toUpperCase() + ' - ' + eventRaw.type + ' - ' + eventRaw.workout, eventRaw.time, false, color, pic)
      if (calendar.getEvents().includes(event)) {
        calendar.addEvent(event)
      }
    }
  }
}

document.getElementById('plan').addEventListener('click', () => {
  window.location.replace(new URL('/plan', window.location.origin))
})


calendar.render()

