const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')
const FAIL = 'Request failed with status code 404'

const print_textFiles = false
const miliInADay = 24 * 3600 * 1000;
// read holdingArray from local file once on startup
var holdingsArray = {};    // saved one obj per stock
fs.readFile('txt/holdingsArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  if (data === undefined)
    holdingsArray == []
  else
    holdingsArray = JSON.parse(data);

  const keys = Object.keys(holdingsArray);
  console.log('\n', getDate(), 'txt/holdingsArray.txt  read count=', keys.length)
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



function parse_0 (stocks, percent, text) {

  // get stock array
  var pattern='<a href="/stocks/msft/">MSFT</a>'
  pattern =  pattern='<a href="/stocks/[a-z\\.]+/" >([A-Z\\.]+)</a>'
  // pattern='<a href="/stocks/[a-z\\.]+/" >([A-Z\\.]+)</a>|<td class="rlpad svelte-1jtwn20">([A-Z0-9\\.]+)</td>'
  // pattern='<td class="rlpad svelte-1jtwn20">([A-Z0-9\\.]+)</td>'
  // pattern='<td class="rlpad svelte-1jtwn20">(6861.T)</td>'
  var rx = new RegExp (pattern,'g');
  while ((rs = rx.exec(text)) !== null){
      stocks.push(rs[1]);
    };
  
  // get percentage array

  //pattern = '<td class="svelte-1jtwn20">8.74%</td>'
  // <td class="svelte-1yyv6eq">2.29%</td>
  pattern = '<td class="svelte-1yyv6eq">([0-9.]+)%</td>'
  rx = new RegExp (pattern,'g');
    while ((rs = rx.exec(text)) !== null){
      percent.push(rs[1]);
  };
  // console.log ('stock', stocks.length, 'percent', percent.length)
}

var writeCount = 0
function holdingArrayFlush () {
  if (Object.keys(holdingsArray).length === 0) // avoid write of empty
    return;
  fs.writeFile ('txt/holdingsArray.txt', JSON.stringify(holdingsArray), err => {
    if (err) {
      console.err(getDate(), 'txt/holdingsArray.txt write fail', err)
    }
    else
      console.log(getDate(), 'txt/holdingsArray.txt write, sym count=',
       Object.keys(holdingsArray).length, 'writeCount=', writeCount)
  })
}
// http://localhost:5000/holdings?stock=AAPL

function holdings (req, res, daysDelay) {

  const stock = req.query.stock;
  const LOG = req.query.LOG
  if (req.query.cmd === 'delOneSym') { // delete one sym
    if (! holdingsArray[stock]) {
        console.log ('\n\n', getDate(), stock, ' holdings delete missing')
        res.send ('fail, holdings symbol missing')
    }
    else {
      holdingsArray[stock] = null; // remove sym
        console.log ('\n\n', getDate(), stock, ' holdings delete done')
        res.send ('ok')
    }
    return;   
 }    


    // console.log ('holdings', req.query.stock)
    const MAX_MISMATCH = 3;
  const sym = req.query.stock;
   // search saved holdings retrieved lately
   const updateMili = Date.now();
   const updateDate = getDate()
   var diff;
   if (! req.query.ignoreSaved) {
     var savedHoldings = holdingsArray [req.query.stock];

     if (savedHoldings && savedHoldings.updateMili)
       diff = updateMili - savedHoldings.updateMili

     if (savedHoldings && savedHoldings.updateMili
       && (updateMili - savedHoldings.updateMili)  < daysDelay * miliInADay
       && Math.abs(savedHoldings.holdArr[0].sym - savedHoldings.holdArr[0].perc) < 3) // if mismatch get new
       {
       console.log (getDate(), 'holdings ', req.query.stock, '\x1b[36m Saved found\x1b[0m,',
       ' saveCount=', Object.keys(holdingsArray).length)
      
     if (savedHoldings.holdArr === FAIL || true)
      if (LOG)
      console.log (req.query.stock, updateDate, savedHoldings)
       if (savedHoldings.length == 1)
         res.send ('')
       else
         res.send (JSON.stringify(savedHoldings))
       return;
     }
     else {  // delete old wrong saved format
       holdingsArray [req.query.stock] = undefined;
       if (LOG)
       console.log ("\n", req.query.stock, getDate(), '\x1b[31m holdings missing or old\x1b[0m days=', (diff / miliInADay).toFixed(0), savedHoldings);
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
           console.log (req.query.stock, updateDate, 'recentHoldings', holdingsDate.toLocaleDateString())
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
   console.log (updateDate, req.query.stock, url)
  // console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    const text = result.data;


    var stocks=[];
    var percent = [];
    parse_0 (stocks, percent, text)


    // build jason for send 
    // console.log (JSON.stringify(percent))
    var holdingArray = [];
    holdingArray.push ({sym: stocks.length, perc: percent.length})

    if (Math.abs(holdingArray[0].sym - holdingArray[0].perc) >= MAX_MISMATCH
      || holdingArray[0].sym === 0) {
      const holdingsObg = {sym: req.query.stock, updateMili: updateMili, updateDate: updateDate, holdArr: holdingArray}
      console.log (sym, 'parse mismatch', 'sym:', stocks.length, 'perc:', percent.length, holdingsObg)
      holdingsObg['err']= 'fail, parse mismatch'
      res.send(JSON.stringify(holdingsObg))
      return;
    }

    console.log (holdingArray) // verify count
    for (let i = 0; i < stocks.length; i++)
        holdingArray.push ({sym: stocks[i], perc: percent[i]})

    // console.log (req.query.stock, updateDate, 'sym=', stocks.length, 'percent=', percent.length, 'combined-records=', holdingArray.length)

    // save local holdings
    const holdingsObg = {sym: req.query.stock, updateMili: updateMili, updateDate: updateDate, holdArr: holdingArray}
    holdingsArray [req.query.stock] = holdingsObg;
    // console.dir (holdingsArray)

    if (writeCount % 5 === 0)
      holdingArrayFlush()
    else
      console.log ('Holding write skip too frequent, writeCount', writeCount);
    writeCount++

    res.send(JSON.stringify(holdingsObg))
  })
  .catch ((err) => {
    console.log(req.query.stock, updateDate, err.message)
    res.send('fail,' + err.message)
    console.log(req.query.stock, updateDate, 'fail, holding fail')
  })

}

function holdingsMain (app) {
  const DAYS_DELAY = 3;
  app.get('/holdings', (req, res) => {
    var nowMili = Date.now();
    console.log ('\n', getDate(), 'holdings', req.query)
    holdings (req, res, DAYS_DELAY)
    console.log (getDate(), 'holdings delay=', Date.now() - nowMili)
  })
}

module.exports = {holdingsMain, holdingArrayFlush}



