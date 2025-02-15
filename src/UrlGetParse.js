const fs = require ('fs')
const axios = require('axios')
const {fetchPage} = require('./FetchPage')

const {getDate, getDateOnly } = require ('./Utils')

const print_textFiles = false


function urlGetParse (app) {

  const updateDate = getDateOnly ()
  app.get('/urlGetParse', (req, res) => {

    console.log ('\n\n', getDate(), 'urlGetParse', req.query)
    const LOG = req.query.LOG

    var url = req.query.url
    
    
// fetchPage('https://www.nasdaq.com/market-activity/etf/qqq/after-hours')
// fetchPage('https://example.com')
    if (! url)
      url = 'https://example.com';
    if (req.query.subPages   ) {
      const txt = fetchPage(url)
      console.log ('subPages length=', txt.length)
      res.send (txt.length)
      return
    }

    const options = {
      "method": "GET",
    };
    console.log (url)
    axios.get (url)
    .then ((result) => {
      const text = result.data
      console.log ('text length=', text.length)
      const choppedTxt = text.replaceAll('<', '\n<')
 

      var pattern = req.query.pattern.replace(/~~/,'+')
      console.log ('pattern after replace', pattern)

      var regex1 = new RegExp (pattern);
      var regExpResult = regex1.exec(choppedTxt)
       

      if (regExpResult && regExpResult[1]) {
        console.log ('results', regExpResult[1])
        res.send (regExpResult[1])
        return;
      }

      console.log (getDateOnly(), 'urlGetParse fail', req.query.stock)
      res.send ('fail, regex')
  })
  .catch ((err) => {
    console.log('urlGetParse', req.query.stock, err.message)
    res.send('err ' + err.message)
  })
}
)}

module.exports = {urlGetParse}
