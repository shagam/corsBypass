const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')

const print_textFiles = false


var priceArray = {};   // saved one obj per stock


function futures(app) {
  nowMili = Date.now();

  app.get('/futures', (req, res) => {



    var url = 'https://www.barchart.com/futures/quotes/NQZ24'

    console.log (url)
    const options = {
      "method": "GET",
    };

    axios.get (url)
    .then ((result) => {
      const text = result.data
      const choppedTxt = JSON.stringify(text).replaceAll('<', '\n\a<')
      console.log (result.data.length)
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
      // pattern = '."lastPrice.":."([0-9\\.,]+)."'
      // pattern = 'lastPrice\\":\\"([0-9\\.,]+)'
      // pattern = '(lastPrice)\\\\"'

      var regex1 = new RegExp (pattern);
      var regExpResult = regex1.exec(choppedTxt)


      console.log (regExpResult[1])
      res.send (regExpResult[1])
  })
})

}





module.exports = {futures}
