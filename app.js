"use strict";
// http://localhost:5000/splits?stock=QQQ
// http://dinagold.org:5000/splitsNew?stock=AMZN
// http://dinagold.org:5000/splitsDay?stock=AMZN
// https://www.stocksplithistory.com/?symbol=APPL
// http://localhost:5000/price?stock=APPL&mon=6&day=30&year=10
// http://localhost:5000/user
// http://84.95.84.236:5000/userTest
// stocks.dinagold.org       (local linux server) 


// import express from 'express'
const express = require('express')
const https = require('https')
const path = require('path')
const fs = require ('fs')


//const detect = require ('detect-browser')

const appGet = require ('./app-get') 

const app = express()
const appssl = express()
// const router = express.Router();


// app.use('/', (req,res,next) => { 
//   res.send('hello from ssl server')
// })



var sslServer;
// if (getLocalIp() == l2_Ip) {
if (true) {
  if (true) {// letsaencrypt
    console.log ('Certificate letsEncrypt')
    sslServer = https.createServer({ 
      key: fs.readFileSync( '/etc/letsencrypt/live/dinagold.org/privkey.pem'),
      cert: fs.readFileSync( '/etc/letsencrypt/live/dinagold.org/fullchain.pem'),
    }, appssl)
  }
  else {  // ca  https://www.golinuxcloud.com/create-certificate-authority-root-ca-linux/
    console.log ('certificate local authority')
    sslServer = https.createServer({
      key: fs.readFileSync( '/home/eli/react/corsBypass/cert_ca/server.key'),
      cert: fs.readFileSync( '/home/eli/react/corsBypass/cert_ca/server.crt'),
    }, appssl)
  }
}
else { // certificate local
  console.log ('certificate without authority')
  sslServer = https.createServer({
    key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
    cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
  }, appssl)
}

// const getLocalIp = require ('./getLocalIp')
// import http from 'http'
// import expressUseragent from 'express-useragent'


appGet (app, 5000)

appGet (appssl, 5001)
