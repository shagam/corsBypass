"use strict";

// Certificate is saved at: /etc/letsencrypt/live/dinagold.org/fullchain.pem
// Key is saved at:         /etc/letsencrypt/live/dinagold.org/privkey.pem
// This certificate expires on 2022-11-23.

console.log (module)

// /etc/letsencrypt/live/dinagold.org
// `privkey.pem`  : the private key for your certificate.
// `fullchain.pem`: the certificate file used in most server software.
// `chain.pem`    : used for OCSP stapling in Nginx >=1.3.7.
// `cert.pem`     : will break many server configurations, and should not be used
//                  without reading further documentation (see link below).

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
  key: fs.readFileSync(path.join(__dirname, '/etc/letsencrypt/live/dinagold.org/', 'privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, '/etc/letsencrypt/live/dinagold.org/', 'fullchain.pem')),
}, app)

sslServer.listen(5001, () => {
  console.log ('secureServer on port 5001')
})

