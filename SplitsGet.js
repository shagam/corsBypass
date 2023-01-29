const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')


const print_textFiles = false
const miliInADay = 24 * 3600 + 1000;
// read splitsArray from local file once on startup
var splitsArray = {};    // saved one obj per stock
fs.readFile('splitsArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  splitsArray = JSON.parse(data);
  const keys = Object.keys(splitsArray);
  console.log('\nsplitArray.txt  read count=', keys.length)
  if (print_textFiles)
    for (var i = 0; i < keys.length; i++)
      console.log ('\n', keys[i], JSON.stringify (splitsArray[keys[i]]))
  else {
    var symbols ="";
    for (var i = 0; i < keys.length; i++)
      symbols += keys[i] + ' (' + splitsArray[keys[i]].length + ')  ';
    console.log (symbols)
  }
  // for (var i = 0; i < keys.length; i++)
  //   console.log (keys[i])
});



// main body allow multipple
function splitsGet (req, res, daysDelay, ignoreSaved) {

    // search saved splits retrieved lately
    nowMili = Date.now();
    var diff;
    if (! ignoreSaved) {
      var savedSplit = splitsArray [req.query.stock];
      if ((savedSplit && savedSplit[0].updateMili) {
        diff = nowMili - savedSplit[0].updateMili
      }
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
        console.log ("\n", req.query.stock, getDate(), '\x1b[31m splits old\x1b[0m', diff / miliInADay, savedSplit);
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
          if ((today.getTime() - splitDate.getTime()) / (1000 * 3600 * 24) < 180) { // less than 180 days
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
  
      fs.writeFile ('splitsArray.txt', JSON.stringify(splitsArray), err => {
        if (err) {
          console.err('splitsArray.txt write fail', err)
        }
      })
  
      if (splits.length == 1)
        res.send ('')
      else
        res.send (JSON.stringify(splits))
    })
    .catch ((err) => {
      console.log(err)
      res.send('')
    })
  
  }
  
  module.exports = splitsGet