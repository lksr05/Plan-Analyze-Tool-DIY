//nur zu Testzwecken des Parsers
const { default: FitParser } = require('fit-file-parser')
const fs = require('fs')
const util = require('util')


const content = fs.readFileSync('./test.fit')

const fitParser = new FitParser({
  mode: 'list',
  lengthUnit: 'km',
  force: true,
  speedUnit: 'km/h',
  elapsedRecordField: true
})
fitParser.parse = util.promisify(fitParser.parse).bind(fitParser)

async function main() {
  const { activity, records } = await fitParser.parse(content)
  console.log(records)
  const powerValues = records.map(({ power }) => power);
  let summe = 0
  let count = 0
  let countWo0 = 0
  for (const value of powerValues) {
    if (typeof value === 'number') {
      summe += value
      count++
      if (value > 0) {
        countWo0++
      }
    }
  }
  const avgPwr = summe / count
  const avgPwrWo0 = summe / countWo0
  console.log(avgPwr, avgPwrWo0)
}


main()
