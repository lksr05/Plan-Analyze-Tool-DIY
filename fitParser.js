const { default: FitParser } = require('fit-file-parser')

class MyFitParser extends FitParser {
  constructor(options) {
    super({
      mode: 'list',
      lengthUnit: 'km',
      force: true,
      speedUnit: 'km/h',
      elapsedRecordField: true,
      ...options
    })
  }
  parse(content) {
    return new Promise((resolve, reject) => {
      super.parse(content, function (error, data) {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }
}

module.exports = new MyFitParser()