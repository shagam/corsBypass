const fs = require ('fs')
const axios = require('axios')
const {fetchPage} = require('./FetchPage')

const {getDate, getDateOnly } = require ('./Utils')

const print_textFiles = false

var urlArray = {}

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

    // check if saved exist
    const savedUrl = urlArray[req.query.url]
    if (savedUrl && ! req.query.ignoreSaved && savedUrl.url === url && Date.now() - savedUrl.mili < 1000*60*10) {
      console.log (getDate(), 'savedUrlFound', savedUrl.results_1)
      res.send ({result_1: savedUrl.results_1, mili: savedUrl.mili, secondsDiff: (Date.now() - savedUrl.mili) / 1000})
      return;
    }

    const options = {
      "   method": "GET",
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


        // save to avoid too many url access
        const obj = {
          url: req.query.url,
          pattern: req.query.pattern,
          results_1: regExpResult[1],
          mili: Date.now()
        }
        urlArray[req.query.url] = obj;
        console.log (getDate(), 'save', obj)
        res.send ({result_1: regExpResult[1], mili: Date.now(), secondsDiff: 0})
        return;
      }

      console.log (getDateOnly(), 'urlGetParse fail')
      res.send ('fail, regex')
  })
  .catch ((err) => {
    console.log('urlGetParse', err.message)
    res.send('err ' + err.message)
  })
}
)}

module.exports = {urlGetParse}
