"use strict";

const express = require('express')

const axios = require('axios')
const cors = require ("cors")
// const fetch = require ("node-fetch")

const app = express()
const router = express.Router();

const port = 5000;
app.listen(port, (err) => {
  console.log (`Listening on  ${port}`)
  if (err) {
    console.log ('err: ', err)
  }
})


// app.use (
//   cors({
//     origin: "http://localhost:5000",
//     methods: ["PUT","GET"],
//     credetials: true,
//   })
// )

// respond with "hello world" when a GET request is made to the homepage
app.get('/', (req, res) => {
  console.log ("entry")
  const dat = corsBypass (req, res)
  // console.log (dat.length)
  res.send(dat)
})

const corsBypass = async (req, res) => {
  console.log ("axios")
  const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  // const url = "https://www.stocksplithistory.com/?symbol=AMZN";
  const dat = await axios.get (url);
  console.log ('axios exit ', url)
  return dat.data;
  // return res.status(200).json(dat.data)
}

module.exports = {
  corsBypass
}

app.get('/splits', (req, res) => {
  res.send(req.query.stock, req.url)
  const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  const options = {
    "method": "GET",
  };


  // // Pattern pattern = Pattern.compile("#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)");

//         const pattern = "/#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)/g";
//         }
//   )
})

