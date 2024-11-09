const fs = require ('fs')
const axios = require('axios')


const {getDate, getDateOnly } = require ('./Utils')

const print_textFiles = false


function urlGetParse (app) {

  const updateDate = getDateOnly ()
  app.get('/urlGetParse', (req, res) => {

    console.log ('\n\n', getDate(), 'urlGetParse', req.query)
    const LOG = req.query.LOG

    var url = req.query.url


    const options = {
      "method": "GET",
    };

    axios.get (url)
    .then ((result) => {
      const text = result.data
      const choppedTxt = text.replaceAll('<', '\n<')

      if (req.query.saveInFile) {

        const rawFileName = 'raw/urlGetParseRaw' + '.txt'
  
        fs.writeFile (rawFileName, choppedTxt, err => {
          if (err) {
            console.err(getDate(), rawFileName, ' write fail', err)
          }
          else
            console.log(getDate(), rawFileName, 'write')
        })  
      }
  

      var pattern = req.query.pattern.replace(/~~/,'+')
      console.log ('pattern after replace', pattern)

      var regex1 = new RegExp (pattern);
      var regExpResult = regex1.exec(choppedTxt)
       

      if (regExpResult && regExpResult[1]) {
        console.log (regExpResult[1])
        res.send (regExpResult[1])
        return;
      }

      console.log (getDateOnly(), 'urlGetParse fail', req.query.stock)
      res.send ('fail, regex')
  })
  .catch ((err) => {
    console.log('urlGetParse', req.query.stock, err.message)
    res.send(err.message)
  })
}
)}

module.exports = {urlGetParse}
