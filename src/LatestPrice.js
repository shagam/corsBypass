const axios = require('axios')
const {getDate} = require ('./Utils')


function latestPrice (app) {
//   console.log ('prepare latestPrice')
  app.get('/latestPrice', (req, res) => {
    // var nowMili = Date.now();
    console.log ('\n', getDate(), 'latestPrice', req.query)
    const LOG = req.query.LOG
    var url;
    var pattern;
    if (req.query.src === 'goog'){
        url = 'https://www.google.com/finance/quote/' + req.query.stock + ':NASDAQ'
        pattern = 'data-currency-code="USD" data-last-price="([0-9.]+)'
    }
    else if (req.query.src === 'watch') {
        url = 'https://www.nasdaq.com/market-activity/etf/' + req.query.stock
            // <bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">513.26</bg-quote>
        pattern = '<bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">([0-9.]+)</bg-quote>'
    }

    console.log (url)
    axios.get (url)
    .then ((result) => {
        const text = result.data;
        if (LOG)
        console.log ('resp length', JSON.stringify (text).length)

    //   data-currency-code="USD" data-last-price="505.08" 

        const rx = new RegExp (pattern,'g');
        const rs = rx.exec(text) 

        if (rs) {
            const dat = {
                price: rs[1],
            } 
            console.log ('response', dat)
            res.send (dat)
        }
        else {
            console.log ('fail')
            res.send ('fail')     
        }
        })
    .catch ((err) => {
        console.log(req.query.stock, err.message)
        res.send(err.message)
        })
    })
}

module.exports = {latestPrice}