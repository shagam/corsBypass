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
//const detect = require ('detect-browser')

const {targetPrice, targetPriceFlush} = require ('./src/Targetprice')

const {splitsGet, splitArrayFlush} = require('./src/Splits')
const { price, priceDel, historicPriceFlush } = require('./src/HistoricPrice')
const { priceNasdaq, priceNasdaqDel, historicPriceNasdaqFlush } = require('./src/HistoricPriceNasdaq')
const appGet = require('./src/app-get')
// const  {getLocalIp, user, userTest, root} = require ('./Tests')

const {holdingsMain, holdingArrayFlush} = require('./src/Holdings')
const {holdingsSchMain, holdingsSchFlush} = require('./src/HoldingsSch')


const {gainVerify, gainVerifyFlush} = require('./src/GainVerify')
const {contact} = require('./src/ContactUs') 

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

const externalIp = '62.0.90.49'
const l2_Ip = '10.100.102.4'
const pc_ip = '10.100.102.3'


// console.log ('AWS_ENV=', process.env.AWS_ENV)

// app.use('/', (req,res,next) => { 
//   res.send('hello from ssl server')
// })


const ssl = true
if (ssl) {
  var sslServer;
  // if (getLocalIp() == l2_Ip) {
  if (true) {
    if (true) {// letsaencrypt
      console.log('Certificate letsEncrypt')
      if (onEC2)
        sslServer = https.createServer({
          key: fs.readFileSync('/etc/letsencrypt/live/dinagold.net/privkey.pem'),
          cert: fs.readFileSync('/etc/letsencrypt/live/dinagold.net/fullchain.pem'),
        }, app)
      else
        sslServer = https.createServer({
          key: fs.readFileSync('/etc/letsencrypt/live/dinagold.org/privkey.pem'),
          cert: fs.readFileSync('/etc/letsencrypt/live/dinagold.org/fullchain.pem'),
        }, app)

    }
    else {  // ca  https://www.golinuxcloud.com/create-certificate-authority-root-ca-linux/
      console.log('certificate local authority')
      sslServer = https.createServer({
        key: fs.readFileSync('/home/eli/react/corsBypass/cert_ca/server.key'),
        cert: fs.readFileSync('/home/eli/react/corsBypass/cert_ca/server.crt'),
      }, app)
    }
  }
  else { // certificate local
    console.log('certificate without authority')
    sslServer = https.createServer({
      key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
      cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
    }, app)
  }
}
  else {
    console.log('certificate none')
    sslServer = app;
  }


  // appGet (sslServer, app, port) 


  sslServer.listen(port, (err) => {
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

var nowMili = Date.now();

function getDate() {
  const today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
  // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
  return date + " " + time;
}


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

// holdings of a stock
holdingsMain (app)
holdingsSchMain (app)
// holdingsYahooMain (app)
// holdingsMarketwatchMain(app)

gainVerify (app)

contact (app)

targetPrice (app)

splitsGet(app)



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
  gainVerifyFlush()
  historicPriceFlush()
  holdingArrayFlush()
  holdingsSchFlush()
  splitArrayFlush()
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
