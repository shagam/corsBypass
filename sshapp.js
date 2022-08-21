"use strict";

const express = require('express')
const https = require('https')
const path = require('path')
const fs = require ('fs')
const axios = require('axios')
const cors = require ('cors')
const detect = require ('detect-browser')

const app = express()

app.use('/', (req,res,next) => { 
  res.send('hello from ssl server')
})

const sslServer = https.createServer({
  key: fs.readFileSync(path.join(__dirname, 'cert', 'key.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'cert', 'cert.pem')),
}, app)

sslServer.listen(5001, () => {
  console.log ('secureServer on port 5001')
})

