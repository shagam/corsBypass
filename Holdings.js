const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')

const print_textFiles = false


// http://localhost:5000/holdings?stock=APPL

function holdings (req, res) {
    nowMili = Date.now();
    console.log ('holdings', req.query.stock)

    // return;
// https://stockanalysis.com/etf/xlk/holdings/
  var url = 'https://stockanalysis.com/etf/'+req.query.stock+'/holdings/'   

  // console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    const text = result.data;
    // console.log (text)
    var pattern='<a href="/stocks/msft/">MSFT</a>'
    pattern='<a href="/stocks/nvda/" >(NVDA)</a>'

    var stocks=[];
    var count = 0;
    console.log (text.length)
    var rx = new RegExp (pattern,'g'); // , 'g'
 
    // const regExpResult = rx.exec(text)
    // console.log (regExpResult[1])

    while ((rs = rx.exec(text)) !== null){
        count++
        console.log (rs[1])
        stocks.push(rs[1]);
      };
  
    res.send('Holdings (' + stocks.length + ') ' + JSON.stringify(stocks))
  })
  .catch ((err) => {
    console.log(err)
    res.send('test' + '')
  })

}

module.exports = {holdings}



