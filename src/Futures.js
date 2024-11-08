const fs = require ('fs')
const axios = require('axios')


const {getDate, getDateOnly } = require ('./Utils')

const print_textFiles = false


var priceArray = {};   // saved one obj per stock


function futures(app) {

  var futureArr = {}

  const updateDate = getDateOnly ()
  app.get('/futures', (req, res) => {

    console.log ('\n\n', getDate(), 'futures', req.query)
    const LOG = req.query.LOG

    var url = 'https://www.barchart.com/futures/quotes/' + req.query.stock

    console.log (url)
    const options = {
      "method": "GET",
    };

    axios.get (url)
    .then ((result) => {
      const text = result.data
      const choppedTxt = JSON.stringify(text).replaceAll('<', '\n\a<')

      if (req.query.saveInFile) {

        const rawFileName = 'raw/futuresRaw_' + req.query.stock + '.txt'
  
        fs.writeFile (rawFileName, choppedTxt, err => {
          if (err) {
            console.err(getDate(), rawFileName, ' write fail', err)
          }
          else
            console.log(getDate(), rawFileName, 'write')
        })  
      }
  

     // var pattern = 'init({"symbol":"NQZ24","symbolName":"Nasdaq 100 E-Mini","symbolType":2,"lastPrice":"21,237.50","priceChange":'
      var pattern = 'init({"symbol":"NQZ24","symbolName":"Nasdaq 100 E-Mini","symbolType":2,"lastPrice":"[0-9\\.,]","priceChange":'
      pattern = '"lastPrice\\\\":\\\\"([0-9\\.,]+)'


      var regex1 = new RegExp (pattern);
      var regExpResult = regex1.exec(choppedTxt)
      const lastPrice = regExpResult[1]

      console.log (getDateOnly(), 'futures', req.query.stock, lastPrice)

      if (! futureArr[req.query.stock])
        futureArr[req.query.stock] = {}
      if (! futureArr[req.query.stock][getDateOnly ()] || req.query.ignoreSaved) {
        futureArr[req.query.stock][getDateOnly ()] = lastPrice;

        if (LOG)
          console.log (futureArr)
      }
      
      const future = {
        lastPrice: lastPrice,
        sym: req.query.stock,
      }
      res.send (future)
  })
})

}





module.exports = {futures}
