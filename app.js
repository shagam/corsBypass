"use strict";
// http://localhost:5000/splits?stock=APPL

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


app.get('/splits', (req, res) => {

  const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  const options = {
    "method": "GET",
  };
  axios.get (url)
  .then ((result) => {
    console.log (result.data)
    res.send (result.data)
  })
  .catch ((err) => {
    console.log(err)
  })

})

  // // Pattern pattern = Pattern.compile("#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)");

//         const pattern = "/#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)/g";
//         }
//   )


