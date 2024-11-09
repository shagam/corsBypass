const fs = require ('fs')
const axios = require('axios')


const {getDate, getDateOnly } = require ('./Utils')

const print_textFiles = false


var futureArr = {};   // saved one obj per stock
const fileName = 'txt/futureArray.txt'

fs.readFile(fileName, 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  futureArr = JSON.parse(data);
  const keys = Object.keys(futureArr);
  console.log('\n', getDate(), fileName, ' read, count=', keys.length)
  if (print_textFiles) {
    for (var i = 0; i < keys.length; i++)
      console.log (JSON.stringify (futureArr[keys[i]]))
  }
  else {
      var symbols = "";
      for (var i = 0; i < keys.length; i++)
        symbols += keys[i] + '  '
      console.log(symbols)
  }
});


function futuresFlush () {
  if (Object.keys(futureArr).length === 0) // avoid write of empty
    return;
  fs.writeFile (fileName, JSON.stringify (futureArr), err => {
    if (err) {
      console.log (getDate(), fileName, ' write fail', err)
    }
    else
      console.log (getDate(), fileName, 'sym count:', Object.keys(futureArr).length)
  })
}


function futures(app) {

  const updateDate = getDateOnly ()
  app.get('/futures', (req, res) => {

    console.log ('\n\n', getDate(), 'futures', req.query)
    const LOG = req.query.LOG

    var url = 'https://www.barchart.com/futures/quotes/' + req.query.stock

    console.log (url)
    const options = {
      "method": "GET",
    };

    // try {
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
       
      var lastPrice;
      if (regExpResult)
        lastPrice = regExpResult[1]

      // report err if not found
      if (! lastPrice) {
        res.send ('fail, invalid sym', req.query.stock)
        return;
      }

      console.log (getDateOnly(), 'futures', req.query.stock, lastPrice)

      if (! futureArr[req.query.stock]) // create entry if first time
        futureArr[req.query.stock] = {}

      // avoid duplicate price
      var priceFound = false;
      const keys = Object.keys(futureArr[req.query.stock])
      for (let i = 0; i < keys.length; i++) {
        if (lastPrice === futureArr[req.query.stock][keys[i]]){
          priceFound = true;
          console.log ('duplicate price', lastPrice)
          break;
        }
      }

      // add new future price
      if (!priceFound && ! futureArr[req.query.stock][getDateOnly ()] || req.query.ignoreSaved) {
        futureArr[req.query.stock][getDateOnly ()] = lastPrice;
        futuresFlush();
        if (LOG)
          console.log ('futureArr', futureArr)
      }

      // const future = {
      //   lastPrice: lastPrice,
      //   sym: req.query.stock,
      // }
      res.send (futureArr[req.query.stock])
  })
}

)

}





module.exports = {futures, futuresFlush}
