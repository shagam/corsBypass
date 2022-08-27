"use strict";
// http://localhost:5000/splits?stock=APPL
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

const app = express()
const router = express.Router();

const externalIp = '84.95.84.236'
const l2_Ip = '192.168.1.4'
const pc_ip = '192.168.1.3'


// app.use('/', (req,res,next) => { 
//   res.send('hello from ssl server')
// })

const ssl = false
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
  console.log ('secureServer on port 5001')
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

// for windows onlynpm i ip
function getLocalIp () {
  var localIp = '';

  var ip = require("ip")
  // console.log ('ipAddress: ', addr);
  const addr = ip.address();
  if (addr)
    return addr;

  const {networkInterfaces} = require ('os')
  const nets = networkInterfaces().Ethernet;
  // console.log ('nets', nets)
  const pattern = '"address":"([\\d\\.]+)"';
  const regex0 = new RegExp (pattern, 'gm');
  
  var match;
  const str = JSON.stringify(nets)
  // console.log ('getLocalIp', str)
  while ((match = regex0.exec(str)) !== null){
    localIp = match[1]
  }
  // console.log ('\nlocal ip:', localIp)
  return localIp;
}

function getPublicIp () {
  const result1 = axios.get('https://geolocation-db.com/json/')
  .then ((result1) => {
    const publicIp = result1.data.IPv4;
    console.log ('\nPublic global IPv4', publicIp)
    // console.dir(result1.data)
    return publicIp;
  })
  .catch ((err) => {
    console.log(err)
    // res.send('')
    return '';
  })

}

function collectInfo (req, res) {
  var source = req.headers['user-agent']
  var txt = '\nsource: ' + source;

  txt += '\nlocalIp: ' + getLocalIp();
  getPublicIp();
  txt += '\nheaders: ' + res.getHeaderNames()
  console.log ('collected: ', txt)
  return txt;
}

app.get('/', (req, res) => {
  res.send('root')
})

app.get('/userTest', (req, res) => {

  var txt = collectInfo (req, res);
  var localIp = getLocalIp();

  // get data from remote    192.168.1.3 192.168.1.4
  const testIp = localIp === '192.168.1.3' ? '192.168.1.4' : '192.168.1.3' 
  var url = 'http://'
  const result = axios.get('http://' + testIp + ':5000/user')
  .then ((result) => {
    console.log ('testIp', testIp)
    console.log('\nfrom other: ', JSON.stringify(result.data))
    txt += result.data;
    res.send (txt)  
  })
  .catch ((err) => {
    console.log(err)
    res.send(err)
  })
})


app.get('/user', (req, res) => {

  const txt = collectInfo (req, res)
  res.send(txt)


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