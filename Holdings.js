const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')

const print_textFiles = false


// http://localhost:5000/holdings?stock=AAPL

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



    // get stock array
    var pattern='<a href="/stocks/msft/">MSFT</a>'
    pattern='<a href="/stocks/[a-z]+/" >([A-Z]+)</a>'

    var stocks=[];
    var rx = new RegExp (pattern,'g');
    while ((rs = rx.exec(text)) !== null){
        stocks.push(rs[1]);
      };



    // get percentage array

    var percent = [];
    //pattern = '<td class="svelte-1jtwn20">8.74%</td>'
    pattern = '<td class="svelte-1jtwn20">([0-9.]+)%</td>'
    rx = new RegExp (pattern,'g');
      while ((rs = rx.exec(text)) !== null){
        percent.push(rs[1]);
    };


    // get company name
    var names = [];
    '<td class="shr svelte-1jtwn20">Microsoft Corporation</td>'
    pattern = '<td class="shr svelte-1jtwn20">([a-zA-Z0-9&\\.\\, \'\\-]+)</td>'
    rx = new RegExp (pattern,'g');
      while ((rs = rx.exec(text)) !== null){
        names.push(rs[1]);
    };
    console.log ('sym=', stocks.length, 'percent=', percent.length, 'names=', names.length)

    // build jason for send 
    // console.log (JSON.stringify(percent))
    var combined = [];
    combined.push ({sym: stocks.length, perc: percent.length, nam: names.length})
    for (let i = 0; i < stocks.length; i++)
        combined.push ({sym: stocks[i], perc: percent[i], nam: names[i]})



    res.send(JSON.stringify(combined))
  })
  .catch ((err) => {
    console.log(err.message)
    res.send('err' + err.message)
  })

}

module.exports = {holdings}



