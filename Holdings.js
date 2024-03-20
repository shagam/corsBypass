const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')
const FAIL = 'Request failed with status code 404'

const print_textFiles = false
const miliInADay = 24 * 3600 * 1000;
// read holdingArray from local file once on startup
var holdingsArray = {};    // saved one obj per stock
fs.readFile('holdingsArray.txt', 'utf8', (err, data) => {
  if (err) {
    fs.readFile('holdingsArray.txt_save', 'utf8', (err, data) => {
    if (err) {
      console.error (err)
      return;
    }})
  }
  if (data === undefined)
    holdingsArray == []
  else
    holdingsArray = JSON.parse(data);

  const keys = Object.keys(holdingsArray);
  console.log('\nholdingsArray.txt  read count=', keys.length)
  if (print_textFiles)
    for (var i = 0; i < keys.length; i++)
      console.log ('\n', keys[i], JSON.stringify (holdingsArray[keys[i]]))
  else {
    var symbols ="";
    for (var i = 0; i < keys.length; i++)
      symbols += keys[i] +' (' + JSON.stringify (holdingsArray[keys[i]]).length + ')  '
    console.log (symbols)
  }
  // for (var i = 0; i < keys.length; i++)
  //   console.log (keys[i])
});



function parse_1 (stocks, percent) {

  // get stock array
  var pattern='<a href="/stocks/msft/">MSFT</a>'
  pattern='<a href="/stocks/[a-z\\.]+/" >([A-Z\\.]+)</a>'

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
}


// http://localhost:5000/holdings?stock=AAPL

function holdings (req, res, daysDelay, ignoreSaved) {
    // console.log ('holdings', req.query.stock)

   // search saved holdings retrieved lately
   const updateMili = Date.now();
   const updateDate = getDate()
   var diff;
   if (! ignoreSaved) {
     var savedHoldings = holdingsArray [req.query.stock];

     if (savedHoldings && savedHoldings.updateMili)
       diff = updateMili - savedHoldings.updateMili

     if (savedHoldings && savedHoldings.updateMili && (updateMili - savedHoldings.updateMili)  < daysDelay * miliInADay) {
       console.log ("\n", req.query.stock, getDate(), '\x1b[36m Saved holdings found\x1b[0m,',
       ' saveCount=', Object.keys(holdingsArray).length)
      
     if (savedHoldings.holdArr === FAIL)
      console.log (savedHoldings )
       if (savedHoldings.length == 1)
         res.send ('')
       else
         res.send (JSON.stringify(savedHoldings))
       return;
     }
     else {  // delete old wrong saved format
       holdingsArray [req.query.stock] = undefined;
       console.log ("\n", req.query.stock, getDate(), '\x1b[31m holdings old\x1b[0m days=', (diff / miliInADay).toFixed(0), savedHoldings);
       savedHoldings = undefined;
     }

   
     // avoid getting from url if any holdings is recent
     if (savedHoldings) {
       for (var i = 0; i < savedHoldings.length; i++) {
         const oneHoldings = savedHoldings[i];
         if (oneHoldings.year === undefined)
           continue;
         const holdingsDate = new Date([oneHoldings.year, oneHoldings.month, oneHoldings.day])
         const today = new Date();
         // console.log ('checkIfOld', today.getDate(), holdingsDate.getDate()) 
         if ((today.getTime() - holdingsDate.getTime()) / miliInADay < 180) { // less than 180 days
           console.log (req.query.stock, 'recentHoldings', holdingsDate.toLocaleDateString())
          //  console.dir (oneHoldings)
           if (oneHoldings.length == 1)
             res.send ('')
           else
             res.send (JSON.stringify(oneHoldings))
           return;
         }
       }
     }
   }
 

    // return;
// https://stockanalysis.com/etf/xlk/holdings/
  var url = 'https://stockanalysis.com/etf/'+req.query.stock+'/holdings/'   
   console.log (url)
  // console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    const text = result.data;
    // console.log (text)


    parse_0 (stocks, percent)


    // build jason for send 
    // console.log (JSON.stringify(percent))
    var holdingArray = [];
    holdingArray.push ({sym: stocks.length, perc: percent.length})
    for (let i = 0; i < stocks.length; i++)
        holdingArray.push ({sym: stocks[i], perc: percent[i]})

    console.log ('sym=', stocks.length, 'percent=', percent.length, 'combined-records=', holdingArray.length)

    // save local holdings
    const holdingsObg = {sym: req.query.stock, updateMili: updateMili, updateDate: updateDate, holdArr: holdingArray}
    holdingsArray [req.query.stock] = holdingsObg;
    // console.dir (holdingsArray)

    fs.writeFile ('holdingsArray.txt', JSON.stringify(holdingsArray), err => {
      if (err) {
        console.err('holdingsArray.txt write fail', err)
      }
    })

    res.send(JSON.stringify(holdingsObg))
  })
  .catch ((err) => {
    console.log(err.message)
    res.send(err.message)
    const holdingsObg = {sym: req.query.stock, updateMili: updateMili, updateDate: updateDate, holdArr: err.message}
    holdingsArray [req.query.stock] = holdingsObg;

    fs.writeFile ('holdingsArray.txt', JSON.stringify(holdingsArray), err => {
      if (err) {
        console.err('holdingsArray.txt write fail', err)
      }
    })

  })

}

function holdingsMain (app) {
  app.get('/holdings', (req, res) => {
    var nowMili = Date.now();
    holdings (req, res, 7, false)
    console.log ('holdings delay=', Date.now() - nowMili)
  })
}

module.exports = {holdingsMain}



