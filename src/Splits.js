const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')


const print_textFiles = false
const miliInADay = 24 * 3600 * 1000;
// read splitsArray from local file once on startup
var splitsArray = {};    // saved one obj per stock
fs.readFile('txt/splitsArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  splitsArray = JSON.parse(data);
  const keys = Object.keys(splitsArray);
  console.log('\n', getDate(), 'txt/splitArray.txt  read count=', keys.length)
  if (print_textFiles)
    for (var i = 0; i < keys.length; i++)
      console.log ('\n', keys[i], JSON.stringify (splitsArray[keys[i]]))
  else {
    var symbols ="";
    for (var i = 0; i < keys.length; i++)
      if (splitsArray[keys[i]])
      symbols += keys[i] + ' (' + splitsArray[keys[i]].length + ')  ';
      else 
        console.log ('splitsArray mismatch', keys[i]) 
    console.log (symbols)
  }
  // for (var i = 0; i < keys.length; i++)
  //   console.log (keys[i])
});

var writeCount = 0;
function splitArrayFlush() {
  if (Object.keys(splitsArray).length === 0) // avoid write of empty
    return;

  fs.writeFile ('txt/splitsArray.txt', JSON.stringify(splitsArray), err => {
    if (err) {
      console.log (getDate(), 'txt/splitsArray.txt write fail', err)
    }
    else
      console.log (getDate(), 'txt/splitsArray.txt sym write, sym count=', Object.keys(splitsArray).length,
        'writeCount=', writeCount)
  }) 
}

// 7 day delay
// main body allow multipple
function splitsGet (app) {

  app.get('/splits', (req, res) => {
    console.log (getDate(), req.query)
    var nowMili = Date.now();
    splitsGet(req, res, 7, false)
    console.log ('splits delay=', Date.now() - nowMili)

    const stock = req.query.stock;
    if (req.query.cmd === 'delOneSym') { // delete one sym
      if (! splitsArray[stock]) {
          console.log ('\n\n', getDate(), stock, ' split delete missing')
          res.send ('fail, splits symbol missing')
      }
      else {
        splitsArray[stock] = null; // remove sym
          console.log ('\n\n', getDate(), stock, ' split delete done')
          res.send ('ok')
      }
      return;   
   }    
    
    
    const daysDelay = 7;

    // search saved splits retrieved lately
    nowMili = Date.now();
    var diff;
    if (! req.query.ignoreSaved) {
      var savedSplit = splitsArray [req.query.stock];
      if (savedSplit && savedSplit[0].updateMili)
        diff = nowMili - savedSplit[0].updateMili

      if (savedSplit && savedSplit[0].updateMili && (nowMili - savedSplit[0].updateMili)  < daysDelay * miliInADay) {
        console.log ("\n", req.query.stock, getDate(), '\x1b[36m Saved split found\x1b[0m,',
        ' saveCount=', Object.keys(splitsArray).length)
        console.dir (savedSplit)
        if (savedSplit.length == 1)
          res.send ('')
        else
          res.send (JSON.stringify(savedSplit))
        return;
      }
      else {  // delete old wrong saved format
        splitsArray [req.query.stock] = undefined;
        console.log ("\n", req.query.stock, getDate(), '\x1b[31m splits old\x1b[0m days=', (diff / miliInADay).toFixed(0), savedSplit);
        savedSplit = undefined;
      }

    
      // avoid getting from url if any split is recent
      if (savedSplit) {
        for (var i = 0; i < savedSplit.length; i++) {
          const oneSplit = savedSplit[i];
          if (oneSplit.year === undefined)
            continue;
          const splitDate = new Date([oneSplit.year, oneSplit.month, oneSplit.day])
          const today = new Date();
          // console.log ('checkIfOld', today.getDate(), splitDate.getDate()) 
          if ((today.getTime() - splitDate.getTime()) / miliInADay < 180) { // less than 180 days
            console.log (req.query.stock, 'recentSplit', splitDate.toLocaleDateString())
            console.dir (oneSplit)
            if (oneSplit.length == 1)
              res.send ('')
            else
              res.send (JSON.stringify(oneSplit))
            return;
          }
        }
      }
    }
  
    // console.log ('\nsaved splits not found', Object.keys(splitsArray).length, req.query.stock)
  
    const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
    const options = {
      "method": "GET",
    };
    axios.get (url)
    .then ((result) => {
      // console.log ("\n", getDate(), 'splitInfo', "pageSize: " + result.data.length, req.query.stock, url)
      // res.send (result.data)
  
      var pattern = "#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)";
      // pattern = "CCCCCC"
      const regex1 = new RegExp (pattern, 'g');
  
      const text = result.data;
      var count = 0;
      const splits = [];
      splits.push ({
        updateMili: nowMili
      })
      while ((result = regex1.exec(text)) !== null){
        // if (count == 0)
        //   console.dir(JSON.stringify(result)) //log first
        if (result[3] < 1995)
          continue;   // ignore splits older than year 1998  
        count++
        const oneSplit = {
          stock: req.query.stock,
          jump: (Number(result[4] / result[5])).toFixed(4),
          year: Number(result [3]),
          month: Number(result[1]),
          day: Number(result[2]),
        }
        splits.push(oneSplit);
  
      };
  
      if (splits.length == 1) {
        console.log ('\n', req.query.stock, getDate(), '\x1b[33m no splits\x1b[0m count=', Object.keys(splitsArray).length) 
      }
      else
        console.log ('\n', req.query.stock, getDate(), 'splits:', Object.keys(splitsArray).length, splits)
      
      // save local split
      splitsArray [req.query.stock] = splits;
      // console.dir (splitsArray)
  
      if (writeCount % 1 === 0)
        splitArrayFlush()
      else
        console.log ('splits write skip too frequent Writes, writeCount=', writeCount)
      writeCount++;

      if (splits.length == 1)
        res.send ('')
      else
        res.send (JSON.stringify(splits))
    })
    .catch ((err) => {
      console.log(err)
      res.send('')
    })
  
  })
}
  module.exports = {splitsGet, splitArrayFlush}