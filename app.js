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
const fs = require ('fs')
const axios = require('axios')
const cors = require ('cors')
//const detect = require ('detect-browser')


const splitsGet = require ('./SplitsGet')
const {price, priceDel} = require ('./HistoricPrice')
const  {getLocalIp, user, userTest, root} = require ('./Tests')


const app = express()
const router = express.Router();

const externalIp = '84.95.84.236'
const l2_Ip = '192.168.1.4'
const pc_ip = '192.168.1.3'


// app.use('/', (req,res,next) => { 
//   res.send('hello from ssl server')
// })

const ssl = true
if (ssl) {
var sslServer;
if (getLocalIp() == l2_Ip)
  sslServer = https.createServer({
    key: fs.readFileSync( '/etc/letsencrypt/live/dinagold.org/privkey.pem'),
    cert: fs.readFileSync( '/etc/letsencrypt/live/dinagold.org/fullchain.pem'),
}, app)
else
  sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
  }, app)



sslServer.listen(5000, (err) => {
  console.log ('secureServer on port 5000')
  if (err) {
    console.log ('err: ', err)
  }
})
}

// const getLocalIp = require ('./getLocalIp')
// import http from 'http'
// import expressUseragent from 'express-useragent'


if (! ssl) {
const port = 5000;
app.listen(port, (err) => {
  console.log (`no ssl Listening on  ${port}`)
  if (err) {
    console.log ('err: ', err)
  }
})
}

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


app.get('/', (req, res) => {
  // res.send('root')
  root (req, res)
})

app.get('/userTest', (req, res) => {
  userTest (req, res)
})

app.get('/user', (req, res) => {
  user (req, res)
})


//============================================================================


// 7 day delay
app.get('/splits', (req, res) => {
  splitsGet (req, res, 7, false)
})

// 1 day delay
app.get('/splitsDay', (req, res) => {
   splitsGet (req, res, 1, false)
})

app.get('/splitsNew', (req, res) => {
  console.log ( req.query.stock, 'ignore saved splits')
  splitsGet (req, res, 1, true)
})


//============================================================================


app.get('/val', (req, res) => {
  console.log (getDate(), req.query, req.params, req.hostname)
  res.send ('Hello' + JSON.stringify(req.query))
})

//============================================================================

// delete bad data
app.get('/priceDel', (req, res) => {
  priceDel  (req, res)
})

app.get('/price', (req, res) => {
  price(req, res)
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)

})