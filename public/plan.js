
class Activity {
  constructor(time, volume, distance, sport, type, workout, id) {
    this.time = time
    this.volume = volume
    this.distance = distance
    this.sport = sport
    this.type = type
    this.workout = workout
    this.id = id
  }
}
window.onload = async () => {
  const btn = window.document.getElementById('submit')
  btn.addEventListener('click', function () {
    const time = document.getElementById('time').value
    const volume = document.getElementById('volume').value
    const distance = document.getElementById('dist').value
    const sport = document.getElementById('sport').value
    const type = document.getElementById('type').value
    const workout = document.getElementById('workout').value
    const id = 'empty'

    const activity = new Activity(time, volume, distance, sport, type, workout, id)
    console.log(activity)
    postActivity(activity)


  })
}

async function postActivity(activity) {
  const url = new URL('/activities', window.location.origin)
  const res = await fetch(url, {
    method: 'post',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(activity)
  })
  if (!res.ok) {
    console.log(res.status + " " + res.statusText)
  } else {
    console.log('redirect')
    window.location.replace(new URL('/', window.location.origin))
  }
}
