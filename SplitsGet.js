const fs = require ('fs')
const axios = require('axios')

function getDate() {
    const today = new Date();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
    return date + " " + time;    
  }
  

// main body allow multipple
function splitsGet (req, res, daysDelay, ignoreSaved, splitsArray) {

    // search saved splits retrieved lately
    nowMili = Date.now();
  
    if (! ignoreSaved) {
    const savedSplit = splitsArray [req.query.stock];
    if (savedSplit && (nowMili - savedSplit[0].updateMili)  < daysDelay * 24 * 3600 * 1000) {
      console.log ("\n", req.query.stock, getDate(), 'Saved split found, saveCount=', Object.keys(splitsArray).length)
      console.dir (savedSplit)
      if (savedSplit.length == 1)
        res.send ('')
      else
        res.send (JSON.stringify(savedSplit))
      return;
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
        console.log ('\n', req.query.stock, getDate(), 'no splits', Object.keys(splitsArray).length) 
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