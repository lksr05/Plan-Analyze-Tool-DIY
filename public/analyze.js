//import der ChartLibrary
const ctx = document.getElementById('myChart').getContext('2d')

//liest und ruft postFit auf
document.getElementById('fit').addEventListener('change', function (event) {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.onload = () => postFit(reader.result, file.name)
  reader.readAsArrayBuffer(file)
}, false)

loadFit()

//Function für den Post Request
async function postFit(buffer, filename) {
  //erstellt URL
  const url = new URL('/api', window.location.origin)
  //der Response wird gespeichert
  const res = await fetch(url, {
    method: 'post',
    headers: {
      'x-content-filename': filename,
      'content-type': 'application/octet-stream'
    },
    body: buffer
  })
  //loggt den Fehler Code in die Konsole
  if (!res.ok) {
    console.log(res.status + " " + res.statusText)
  }
  //speichert nur die Records aus dem Response
  const { records } = await res.json();
  renderChart(records)
}

async function loadFit() {
  const filename = new URLSearchParams(window.location.search).get('filename')
  if (!filename || !filename.endsWith('fit')) {
    return
  }
  //erstellt URL
  const pathname = '/api/' + encodeURIComponent(filename)
  const url = new URL(pathname, window.location.origin)
  //der Response wird gespeichert
  const res = await fetch(url)
  //loggt den Fehler Code in die Konsole
  if (!res.ok) {
    console.log(res.status + " " + res.statusText)
  }
  //speichert nur die Records aus dem Response
  const { records } = await res.json();
  renderChart(records)
}

function renderChart(records) {
  //alle nötigen globalen Variablen innerhalb der Post Funktion
  let pwrSum = 0
  let countWo0 = 0
  let pwrMax = 0
  let smoothness = 20
  let hrSum = 0
  let hrMax = 0
  let cadSum = 0
  let cadMax = 0
  let countHr = 0
  let countCad = 0

  //Funktion um die Daten aus dem Objekt Records zu bekommen
  function getData() {
    pwrSum = 0
    pwrMax = 0
    countWo0 = 0
    const avgPwr = []
    datasetPwr.data = records.map(function ({ power: y }, x) {
      if (typeof y === 'number') {
        pwrSum += y
        if (y > 0) {
          countWo0++
        }
      }
      if (y > pwrMax) {
        pwrMax = y
      }
      y = smoothing(avgPwr, y)
      return {
        x, y
      }
    })

    const avgHr = []
    datasetHr.data = records.map(({ heart_rate: y }, x) => {
      hrSum += y
      if (y > hrMax) {
        hrMax = y
      }
      y = smoothing(avgHr, y)
      return {
        x, y
      }
    })

    datasetElv.data = records.map(({ altitude: y }, x) => {
      return {
        x,
        y: Math.round(y * 1000)
      }
    })
    const avgCad = []
    datasetCad.data = records.map(({ cadence: y }, x) => {
      cadSum += y
      let sum = 0
      if (cadMax < y) {
        cadMax = y
      }
      y = smoothing(avgCad, y)
      return {
        x, y
      }
    })
    //Funktion zu glätten der Daten
    function smoothing(avgData, y) {
      let sum = 0
      if (avgData.length >= smoothness) {
        avgData.shift()
      }
      avgData.push(y)
      for (const value of avgData) {
        sum += value
      }
      return {
        y: Math.round(sum / avgData.length)
      }
    }

  }
  //Dataset Objekt zum rendern der Chart
  const datasetPwr = {
    label: 'Power',
    data: [],
    showLine: true,
    pointRadius: 0,
    borderColor: '#17bf3b',
    borderWidth: 1,
    fill: false,
  }

  const datasetHr = {
    label: 'Heartrate',
    data: [],
    showLine: true,
    pointRadius: 0,
    borderColor: '#C03',
    borderWidth: 1,
    fill: false,
  }

  const datasetElv = {
    label: 'Elevation',
    data: [],
    showLine: true,
    pointRadius: 0,
    borderColor: '#666',
    borderWidth: 1,
    fill: true,
  }

  const datasetCad = {
    label: 'Cadence',
    data: [],
    showLine: true,
    pointRadius: 0,
    borderColor: '#399fe3',
    borderWidth: 1,
    fill: false,
  }
  //Objekt zu rendern Chart
  const myChart = new Chart(ctx, {
    type: 'scatter',
    data: {
      datasets: [datasetPwr, datasetHr, datasetElv, datasetCad]
    },
    options: {
      scales: {
        yAxes: [{
          ticks: {
            min: 0,
            max: 100
          }
        }]
      },
      plugins: {
        zoom: {
          pan: {
            enable: true,
            mode: 'x',
          },
          zoom: {
            enable: true,
            mode: 'x',
          }
        }
      }
    }
  })
  //Daten holen und die Chart rendern
  getData()
  myChart.options.scales.yAxes[0].ticks.max = 100 + 100 * Math.floor(pwrMax / 100)
  myChart.update()
  //Html Elemente setzen
  document.getElementById('avg').textContent = 'avg. power: ' + Math.round(pwrSum / datasetPwr.data.length) + 'w'
  document.getElementById('max').textContent = 'max. power: ' + pwrMax + 'w'
  document.getElementById('avg2').textContent = 'avg. power w/o 0s: ' + Math.round(pwrSum / countWo0) + 'w'
  document.getElementById('avgHr').textContent = 'avg. heartrate: ' + Math.round(hrSum / datasetHr.data.length) + 'bpm'
  document.getElementById('maxHr').textContent = 'max heartrate: ' + hrMax + 'bpm'
  document.getElementById('avgCad').textContent = 'avg. cadence: ' + Math.round(cadSum / datasetCad.data.length) + 'rpm'
  document.getElementById('maxCad').textContent = 'max cadence: ' + cadMax + 'rpm'
  //alerts falls Daten fehlen
  if (hrMax === 0) {
    alert('Seems like ther is no heartrate data available :( Go on by clicking ok')
  }
  if (pwrMax === 0) {
    alert('Seems like ther is no power data available :( Go on by clicking ok')
  }
  if (cadMax === 0) {
    alert('Seems like ther is no cadence data available :( Go on by clicking ok')
  }

  //Slider um den Glättungsgrad zu verstellen
  const slider = document.getElementById('smooth')
  slider.addEventListener('change', () => {
    smoothness = slider.value
    getData()
    myChart.update()
  })
}
window.onload = () => {
  document.getElementById('plan').addEventListener('click', () => {
    window.location.replace(new URL('/plan', window.location.origin))
  })
}