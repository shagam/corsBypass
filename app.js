"use strict";
// http://localhost:5000/splits?stock=APPL
// https://www.stocksplithistory.com/?symbol=APPL

const express = require('express')

const axios = require('axios')
const cors = require ("cors")
const proxy = require ("http-proxy-middleware")

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

app.options('*', cors()) 

app.use (
  cors({
    origin: "http://localhost:3000",
    methods: ["PUT","GET"],
    credetials: true,
    optionsSuccessStatus: 200,
  })
)

// app.use('/api',
// proxy ({target: })
// )



app.get('/splits', (req, res) => {
  
  const iCalContent = "summery=blablabla"
  var rx = /summery=(.*)/g;
  var arr = rx.exec(iCalContent);
  console.log ('substring2 ',arr);

  
const input = '[2021-05-29] Version 2.24.9  13.13.14';
const regex = /(\d+)\.(\d+)\.(\d+)/g;
let x = regex.exec(input);
console.log('substring3 ', x)


  const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  const options = {
    "method": "GET",
  };
  axios.get (url)
  .then ((result) => {
    console.log (result.data.length, url)
    // res.send (result.data)

    var pattern = "#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)";
    // pattern = "CCCCCC"
    const regex1 = new RegExp (pattern, 'g');


    const text = result.data;
    const found1 = [...text.matchAll(regex1)];
    // const found = regex1.matchAll (pattern);
    console.log ('found ' + found1)

    res.send (result.data.length + " " + url)
  })
  .catch ((err) => {
    console.log(err)
  })

})

  // // Pattern pattern = Pattern.compile("#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)");


//         }
//   )


