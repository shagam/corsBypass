"use strict";
// http://localhost:5000/splits?stock=QQQ
// http://dinagold.org:5000/splitsNew?stock=AMZN
// http://dinagold.org:5000/splitsDay?stock=AMZN
// https://www.stocksplithistory.com/?symbol=APPL
// http://localhost:5000/price?stock=APPL&mon=6&day=30&year=10
// http://localhost:5000/user
// http://84.95.84.236:5000/userTest

// import express from 'express'
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require('fs')
const axios = require('axios')
const cors = require('cors')

require('dotenv').config()
// console.log ('\n\n\nenv', process.env)
//const detect = require ('detect-browser')

const {targetPrice, targetPriceFlush} = require ('./src/Targetprice')

const {splitsGet, splitArrayFlush} = require('./src/Splits')
const { price, priceDel, historicPriceFlush } = require('./src/HistoricPrice')
const { priceNasdaq, priceNasdaqDel, historicPriceNasdaqFlush } = require('./src/HistoricPriceNasdaq')
const {stockLists, stockListsFlush} = require ('./src/StockLists')

// const appGet = require('./src/app-get')
// const  {getLocalIp, user, userTest, root} = require ('./Tests')

const {holdingsMain, holdingArrayFlush} = require('./src/Holdings')
const {holdingsSchMain, holdingsSchFlush} = require('./src/HoldingsSch')
const {latestPrice} = require('./src/LatestPrice')

const {gain, gainFlush} = require('./src/Gain')
const {contact} = require('./src/Contact') 
const {userAccess, userArrayFlush, userList} = require('./src/Users') 
const {futures, futuresFlush} = require('./src/Futures') 
const {urlGetParse} = require('./src/UrlGetParse')
const {fetchPage} = require('./src/FetchPage')
const {stockOptions, stockOptionsHistory} = require('./src/StockOptions')
const {image} = require('./src/Image')

const app = express()
const router = express.Router();

var metadata = require("node-ec2-metadata");

var port;

metadata.isEC2().then(function (onEC2) {


if (onEC2)
  port = 5000
else
  port = 5000

  console.log("\nRunning on EC2? " + onEC2 + ',  port=' + port + '\n');

console.log ('\n\n\nip=', process.env.NODE_localIP, port)
const externalIp = process.env.NODE_localIP // '62.0.90.49'
const l2_Ip = '10.100.102.4'
const pc_ip = '10.100.102.3'


// console.log ('AWS_ENV=', process.env.AWS_ENV)

// app.use('/', (req,res,next) => { 
//   res.send('hello from ssl server')
// })


const ssl = true
var key_; 
var cert_;

if (ssl) {
  var sslServer;
  // if (getLocalIp() == l2_Ip) {
  if (true) {
    if (true) {// letsaencrypt
      var url
      if (onEC2) {
        url = 'dinagold.net' //'portfolio-chk.com';
        console.log('Certificate letsEncrypt EC2 production ' + url)
        key_ =  fs.readFileSync('/etc/letsencrypt/live/' + url + '/privkey.pem')
        cert_= fs.readFileSync('/etc/letsencrypt/live/' + url + '/fullchain.pem')
      }
      else {
        url = 'portfolio-chk.xyz'
        console.log('Certificate letsEncrypt home test server ' + url)
        key_ = fs.readFileSync('/etc/letsencrypt/live/' + url + '/privkey.pem')
        cert_= fs.readFileSync('/etc/letsencrypt/live/' + url + '/fullchain.pem')
      }
    }
    else {  // ca  https://www.golinuxcloud.com/create-certificate-authority-root-ca-linux/
      console.log('certificate local authority')
        key_ =  fs.readFileSync('/home/eli/react/corsBypass/cert_ca/server.key')
        cert_= fs.readFileSync('/home/eli/react/corsBypass/cert_ca/server.crt')
    }
  }
  else { // certificate local
    console.log('certificate without authority')
      key_ = fs.readFileSync(path.join(__dirname, 'cert', 'key.pem'))
      cert_ = fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem'))

  }
}
  else {
    console.log('certificate none')
    sslServer = app;
  }

  console.log ('key', key_)
  console.log ('cert', cert_)
  sslServer = https.createServer({
    key: key_,
    cert: cert_,
  }, app)


  // appGet (sslServer, app, port) 


  sslServer.listen(port, '0.0.0.0', (err) => {
    // console.log('secureServer on port=', port)
    if (err) {
      console.log('err: ', err)
    }
  })


// const getLocalIp = require ('./getLocalIp')
// import http from 'http'
// import expressUseragent from 'express-useragent'

app.options('*', cors())

app.use(
  cors({
    origin: "*",
    methods: ["GET", "PUT", "POST", "DELETE"],
    credetials: true,
    optionsSuccessStatus: 200,
  })
)

// const stat = app.use('/uploads', express.static('uploads'));
// app.get('/uploads', (req, res) => {
//   const imagePath = path.join('/uploads/', req.file.filename); // Adjust path as needed
//   console.log ('/uploads', 'public', req.file.filename)
//   res.sendFile(imagePath, (err) => {
//     if (err) {
//       console.error('Error sending file:', err, req.file.filename);
//       res.status(404).send('Image not found');
//     }
//   });
// });

  //  let defaultImage = await fs.readFileSync("public/default.jpg")
  //   defaultImage = Buffer.from(defaultImage, "base64")
    
  //   result.writeHead(200, {
  //     "Content-Type": "image/jpg",
  //     "Content-Length": defaultImage.length
  //   })
  //   result.end(defaultImage)



var nowMili = Date.now();

// function getDate() {
//   const today = new Date();
//   var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
//   var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
//   // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
//   return date + " " + time;
// }


// app.get('/', (req, res) => {
//   // res.send('root')
//   root(req, res)
// })

// app.get('/userTest', (req, res) => {
//   userTest(req, res)
// })

// app.get('/user', (req, res) => {
//   user(req, res)
// })


//============================================================================

image (app)

// holdings of a stock
holdingsMain (app)
holdingsSchMain (app)
// holdingsYahooMain (app)
// holdingsMarketwatchMain(app)

gain (app)

userList (app)

contact (app)

targetPrice (app)

splitsGet(app)

stockLists(app)

futures(app)

urlGetParse(app)

latestPrice(app)

stockOptions(app)

stockOptionsHistory(app)

// fetchPage('https://www.nasdaq.com/market-activity/etf/qqq/after-hours')
// fetchPage('https://example.com')

// 1 day delay
// app.get('/splitsDay', (req, res) => {
//   splitsGet(req, res, 1, false)
// })

// app.get('/splitsNew', (req, res) => {
//   console.log(req.query.stock, 'ignore saved splits')
//   splitsGet(req, res, 1, true)
// })


//============================================================================


// app.get('/val', (req, res) => {
//   console.log(getDate(), req.query, req.params, req.hostname)
//   res.send('Hello' + JSON.stringify(req.query))
// })

//============================================================================



  price(app)

  priceNasdaq(app)

 function flush() {
  targetPriceFlush()
  historicPriceNasdaqFlush()
  gainFlush()
  historicPriceFlush()
  holdingArrayFlush()
  holdingsSchFlush()
  splitArrayFlush()
  userArrayFlush()
  stockListsFlush()
  futuresFlush()
 }


app.get('/flushAll', (req, res) => {
  console.log('\n', getDate(), 'flushAll', req.query)
  flush()
  res.send('ok' + JSON.stringify(req.query))
})

// test response time
app.get('/ping', (req, res) => {
  console.log ('ping query', req.query)

  res.send('ok')
})


function timeout(delay) {
  return new Promise (res => setTimeout(res, delay))
}

process.on('SIGINT', function() {
  console.log ('  SIGINT ^C')
  timeout (20000)

  console.log ('delay end')
  process.exit()
})


}); // onEC2
