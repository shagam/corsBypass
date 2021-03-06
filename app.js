"use strict";
// http://localhost:5000/splits?stock=APPL
// https://www.stocksplithistory.com/?symbol=APPL

// import express from 'express'
const express = require('express')
// import axios from 'axios'
const axios = require('axios')
const cors = require ('cors')
const detect = require ('detect-browser')
const getLocalIp_ = require ('./getLocalIp')

// import http from 'http'
// import expressUseragent from 'express-useragent'

const fs = require ('fs')

const app = express()
const router = express.Router();
var IPv4 = '';
const externalIp = '84.95.84.236'
const l2Ip = '192.168.1.4'

const port = 5000;
app.listen(port, (err) => {
  console.log (`Listening on  ${port}`)
  if (err) {
    console.log ('err: ', err)
  }
})

app.options('*', cors()) 

app.use (
  cors({
    origin: "*",
    methods: ["GET","PUT","POST","DELETE"],
    credetials: true,
    optionsSuccessStatus: 200,
  })
)

var nowMili = Date.now();

function getDate() {
  const today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
  return date + " " + time;    
}

app.get('/userTest', (req, res) => {

  // getLocalIp().then((ipAddr) => {
  //   console.log(ipAddr); // 192.168.0.122
  // });


  var source = req.headers['user-agent']
  var txt = source;
  console.dir (source)
  var IPv4 = '';

  const browser = detect();
  if (browser) {
    console.dir(browser)
    txt += JSON.stringify(browser);
  }

  const result1 = axios.get('https://geolocation-db.com/json/')
  .then ((result1) => {
    console.dir(result1.data)
    IPv4 = result1.data.IPv4;
    console.log ('IPv4', IPv4)

    txt += JSON.stringify(result1.data);
    txt += " " + IPv4;
    // res.send(result1.data)
  })

  .catch ((err) => {
    console.log(err)
    res.send('')
    return;
  })

  // 192.168.1.3
  var url = 'http://'

  const result = axios.get('http://' + externalIp + ':5000/user')
  .then ((result) => {
    console.log('from other: ', JSON.stringify(result.data))
    // txt += result.data;
  })
  .catch ((err) => {
    console.log(err)
    res.send('')
    return;
  })

  console.dir (res.getHeaderNames())
  res.send (txt)  


})


app.get('/user', (req, res) => {

  // console.log (req.user)
  var source = req.headers['user-agent']
  console.dir (source)

  // const browser = detect();
  // if (browser) {
  //   console.dir(browser)
  // }

  const result = axios.get('https://geolocation-db.com/json/')
  .then ((result) => {
    console.dir(result.data)
    res.send(result.data)
  })

  .catch ((err) => {
    console.log(err)
    res.send('')
  })

  })


//============================================================================

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
  for (var i = 0; i < keys.length; i++)
    console.log ('\n', keys[i], JSON.stringify (splitsArray[keys[i]]))
  // for (var i = 0; i < keys.length; i++)
  //   console.log (keys[i])
});


// 7 day delay
app.get('/splits', (req, res) => {
  get (req, res, 7)
})


// 1 day delay
app.get('/splitsDay', (req, res) => {
   get (req, res, 1)
})


// main body allow multipple
function get (req, res, daysDelay) {

  // search saved splits retrieved lately
  nowMili = Date.now();
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
      console.log (today.getDate(), splitDate.getDate()) 
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
      console.log ('no splits', req.query.stock, Object.keys(splitsArray).length) 
    }
    else
      console.log ('\nsplits:', req.query.stock, Object.keys(splitsArray).length, splits)

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

//============================================================================


app.get('/val', (req, res) => {
  console.log (getDate(), req.query, req.params, req.hostname)
  res.send ('Hello' + JSON.stringify(req.query))
})

//============================================================================

// Historical Quote
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F17&x=26&y=20
// msft  6/30/17

// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10&x=28&y=18
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10
// msft Jun 30 2010 

// http://localhost:5000/price?stock=APPL&mon=6&day=30&year=10
// http://localhost:5000/splits?stock=APPL


var priceArray = {};   // saved one obj per stock
// read price from local file once on startup
fs.readFile('priceArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  priceArray = JSON.parse(data);
  const keys = Object.keys(priceArray);
  console.log('\npriceArray.txt  read, count=', keys.length)
  for (var i = 0; i < keys.length; i++)
    console.log (JSON.stringify (priceArray[keys[i]]))
});

app.get('/price', (req, res) => {
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)

  nowMili = Date.now();

  const savedPrice = priceArray[req.query.stock];
  if (savedPrice && (nowMili - savedPrice.updateMili < 3 * 24 * 3600 * 1000) && // 3 days
  req.query.year === savedPrice.year && req.query.mon === savedPrice.mon && req.query.day === savedPrice.day) {
    console.log ('\n', req.query.stock, getDate(), 'Saved price found, saveCount=', Object.keys(priceArray).length, JSON.stringify(savedPrice))
    res.send (JSON.stringify(savedPrice))
    return;
  }

  var url = "https://bigcharts.marketwatch.com/historical/default.asp?symb=" + req.query.stock
  url += '&closeDate=' + req.query.mon
  url += '%2F' + req.query.day
  url += '%2F' + req.query.year
  // url += '&x=28&y=18'

  // console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    // console.log ("\n", getDate(), "pageSize: ", result.data.length, url)
  
    const filler = "[\\s]*";
    var pattern = 
    "<th>Closing Price:</th>" + filler + "<td>([\\d\\.]+)</td>" + filler
    + "</tr>" + filler + "<tr>" + filler +
    "<th>Open:</th>" + filler + "<td>([\\d\\.]+)</td>"
 
    var regex1 = new RegExp (pattern);
    var regExpResult = regex1.exec(result.data)

    // console.log (JSON.stringify(regExpResult))

    const priceObject = {
      stock: req.query.stock,
      year: req.query.year,
      mon: req.query.mon,
      day: req.query.day,
      close: Number(regExpResult[1]),
      open: Number(regExpResult[2]),
      updateMili: nowMili
      // close: -1
    };


    // save local price
    priceArray [req.query.stock] = priceObject;
    console.log (getDate(), 'priceObj', Object.keys(priceArray).length, JSON.stringify(priceObject))
    // console.dir (priceArray)

    fs.writeFile ('priceArray.txt', JSON.stringify (priceArray), err => {
      if (err) {
        console.err('priceArray.txt write fail', err)
      }
    })


    res.send (JSON.stringify(priceObject))
  })
  .catch ((err) => {
    console.log(err)
    res.send('')
  })

})




//               <tr>\r\n' +
// '                <td colspan="2" class="shouldbecaption">\r\n' +
// '                    <div class="aleft">Microsoft Corp.</div>\r\n' +
// '                    <div class="aleft understated">Wed, Jun 30, 2010</div>\r\n' +
// '                </td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Closing Price:</th>\r\n' +
// '                <td>23.01</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Open:</th>\r\n' +
// '                <td>23.30</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>High:</th>\r\n' +
// '                <td>23.68</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Low:</th>\r\n' +
// '                <td>22.95</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Volume:</th>\r\n' +
// '                <td>81,058,000</td>\r\n' +
// '            </tr>\r\n' +

