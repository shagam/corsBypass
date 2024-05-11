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

const {vix} = require('./Vix')
const {targetPrice} = require ('./Targetprice')

const splitsGet = require('./SplitsGet')
const { price, priceDel } = require('./HistoricPrice')
const { priceNasdaq, priceNasdaqDel } = require('./HistoricPriceNasdaq')
const appGet = require('./app-get')
// const  {getLocalIp, user, userTest, root} = require ('./Tests')

const {holdingsMain} = require('./Holdings')
const {holdingsSchMain} = require('./HoldingsSch')


const {gain} = require('./Gain')
const {email} = require('./Email') 

const app = express()
const router = express.Router();

var metadata = require("node-ec2-metadata");

var port;
var EC2 = false;
metadata.isEC2().then(function (onEC2) {
  console.log("\nRunning on EC2? " + onEC2 + '\n');
  EC2 = true
});

if (EC2)
  port = 443
else
  port = 5000


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
      if (EC2)
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
    console.log('secureServer on port=', port)
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

gain (app)

email (app)

vix (app)

targetPrice (app)

// 7 day delay
app.get('/splits', (req, res) => {
  var nowMili = Date.now();
  splitsGet(req, res, 7, false)
  console.log ('splits delay=', Date.now() - nowMili)
})

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

// delete bad data
// app.get('/priceDel', (req, res) => {
//   priceDel(req, res)
// })

app.get('/price', (req, res) => {
  price(req, res)
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)

})


// app.get('/priceNasdaqDel', (req, res) => {
//   priceNasdaqDel(req, res)
// })

app.get('/priceNasdaq', (req, res) => {
  priceNasdaq(req, res)
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)

})

