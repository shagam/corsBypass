const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')

function aiLog (app) {
  nowMili = Date.now();
  console.log ('aiLog')

  app.get('/ai', (req, res) => {
    // price(req, res)
    console.log ('\n\n' + getDate(), 'aiLog', req.query)
    // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)
    const stock = req.query.stock
    res.send ('ok')
      return;   
  })
}

module.exports = {aiLog};
