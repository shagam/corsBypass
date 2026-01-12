const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')

var tokenCount = {
    deepSeek:5,
    openAi: 5,
    status: 'ok'
}

function aiLog (app) {
  nowMili = Date.now();
//   console.log ('aiLog')

  app.get('/ai', (req, res) => {
    // price(req, res)
    console.log ('\n\n' + getDate(), 'aiLog', req.query)

    const stock = req.query.stock
    if (req.query.brand==='OpenAI')
        tokenCount.openAi += Number(req.query.tokenCount)
    else if (req.query.brand==='DeepSeek')
        tokenCount.deepSeek += Number(req.query.tokenCount)
    else {
        res.send ({status: 'fail', err: ' wrong brand'})
    }
 
    console.log (tokenCount)
    res.send (tokenCount)


    return;   
  })
}

module.exports = {aiLog};
