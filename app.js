"use strict";

const express = require('express')

const axios = require('axios')
const cors = require ("cors")
// const fetch = require ("node-fetch")

const app = express()
const router = express.Router();

const port = 5000;
app.listen(port, (err) => {
  console.log (`Example ${port}`)
  if (err) {
    console.log ('err: ', err)
  }
})


app.use (
  cors({
    origin: "http://localhost:5000",
    methods: ["PUT","GET"],
    credetials: true,
  })
)

// respond with "hello world" when a GET request is made to the homepage
// app.get('/', (req, res) => {
//   res.send("hello " + req.query)
// })

const corsBypass = async (req, res) => {
  console.log ("axios")
  //const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  const url = "https://www.stocksplithistory.com/?symbol=AMZN";
  const dat = await axios.get (url);
  return "Hello"
  // return res.status(200).json(dat)
}

app.get('/splits', (req, res) => {
  res.send(req.query.stock, req.url)
  const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  const options = {
    "methosd": "GET",
  };

  // const res__ =  axios.get(url)
  // // onsole.log(res__.data)
  // .then (console.log(res__.data))
  // // res.send("hello " + res__.data)

  


//   fetch(url)
//   .then(
//         function(response) {
//               const respStr = JSON.stringify (response);
//               if (respStr.indexOf (' status: 200, ok: true') !== -1)
//               console.log(response);
//               // return response();
//         }
//   )
//   .then(
//         (chartData) => {
//         const dataStr = JSON.stringify(chartData);
//         // console.log (url);
//         console.log (dataStr.substring(0,150));

// // Pattern pattern = Pattern.compile("#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)");

//         const pattern = "/#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)/g";
//         }
//   )
})

