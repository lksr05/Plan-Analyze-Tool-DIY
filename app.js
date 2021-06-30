//Serverseitiger Code mit Express.js (WebFramework für JS)
//Imports
const express = require('express')
const { lodash } = require('consolidate')
const fitParser = require('./fitParser')
const fs = require('fs')
const util = require('util')
const { time } = require('console')
const { request } = require('http')
const { map, get, xor } = require('lodash')


const app = express()
const port = 8000
const readFileContent = util.promisify(fs.readFile)
const writeFileContent = util.promisify(fs.writeFile)


//getEvents(1)

app.engine('html', lodash);
app.set('view engine', 'html');
app.set('views', __dirname + '/views');

//Middleware Funktionen
app.use(express.static(__dirname + '/public'))
app.use(express.json())
app.use(express.raw({ limit: '1Mb' }))

app.get('/analyze', (req, res) => {
  res.render('analyze')
})

app.get('/', (req, res) => {
  res.render('calender')
})

app.get('/plan', (req, res) => {
  res.render('plan')
})

app.get('/calendar', async (req, res) => {
  let params = req.query.range
  if (req.query === { undefined: '' }) {
    console.log(req.query)

    const currentDate = new Date
    params = [Date.parse(currentDate) - 604800000, Date.parse(currentDate) + 604800000]
  }
  res.json(await getEvents(params))

})

//Post Request Handler
app.post('/api', async (req, res, next) => {
  try {
    //await sorgt dafür, dass der Code erst ausgeführt wird wenn er das erzeugte Promise erhält
    const obj = await fitParser.parse(req.body)
    obj.filename = req.headers['x-content-filename']
    res.send(obj)
  } catch (error) {
    console.error(error)
    next(error)
  }
})

app.post('/activities', async (req, res, next) => {
  try {
    const activity = req.body
    activity.id = createID()
    console.log(activity)
    await storeData(activity, __dirname + '/storage/user1/' + activity.time + '.json')
    res.status(201).end()
  } catch (error) {
    console.log(error)
    next(error)
  }
})

async function storeData(data, path) {
  try {
    await writeFileContent(path, JSON.stringify(data))
  } catch (err) {
    console.error(err)
  }
}

async function getEvents(range) {
  console.log(range)
  try {
    let data = []
    const list = fs.readdirSync(__dirname + '/storage/user1')
    for (let i = 0; i < list.length; i++) {
      const date = new Date(list[i].slice(0, 16))
      const arr = range.split(',')
      console.log(arr)
      if (Date.parse(date) >= +arr[0] && Date.parse(date) <= +arr[1]) {
        data.push(await readFileContent(__dirname + '/storage/user1/' + list[i], 'utf-8'))
      }
    }
    console.log(data)

    return data
  } catch (error) {
    console.log(error)
  }
}

function createID() {

  return id

}



//lässt den Server auf den angegebenen Port "hören"
app.listen(port)
console.log(`Example app listening at http://localhost:${port}`)