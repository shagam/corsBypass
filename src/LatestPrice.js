const axios = require('axios')
const {getDate} = require ('./Utils')


function latestPrice (app) {
//   console.log ('prepare latestPrice')
  app.get('/latestPrice', (req, res) => {
    // var nowMili = Date.now();
    console.log ('\n', getDate(), 'latestPrice', req.query)

    var url;
    if (req.query.src === 'goog')
        url = 'https://www.google.com/finance/quote/' + req.query.stock + ':NASDAQ'

    console.log (url)
    axios.get (url)
    .then ((result) => {
        const text = result.data;
        if (LOG)
        console.log ('resp length', JSON.stringify (text).length)

    //   data-currency-code="USD" data-last-price="505.08" 
        const pattern = 'data-currency-code="USD" data-last-price="([0-9.]+)'
        const rx = new RegExp (pattern,'g');
        const rs = rx.exec(text) 

        const dat = {
            price: rs[1],
        } 
        console.log ('response', dat)
        res.send (dat)

        })
    .catch ((err) => {
        console.log(req.query.stock, err.message)
        res.send(err.message)
        })
    })
}

module.exports = {latestPrice}