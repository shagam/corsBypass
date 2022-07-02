"use strict";
// http://localhost:5000/splits?stock=APPL
// https://www.stocksplithistory.com/?symbol=APPL

import express from 'express'
// const express = require('express')
import axios from 'axios'
// const axios = require('axios')
import cors from 'cors'
// const cors = require ("cors")
// const proxy = require ("http-proxy-middleware")

// const fetch = require ("node-fetch")
import fs from 'fs'

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
    origin: "*",
    methods: ["GET","PUT","POST","DELETE"],
    credetials: true,
    optionsSuccessStatus: 200,
  })
)

// app.use('/api',
// proxy ({target: })
// )

function getDate() {
  const today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
  return date + " " + time;    
}

app.get('/splits', (req, res) => {

  const url = "https://www.stocksplithistory.com/?symbol=" + req.query.stock;
  const options = {
    "method": "GET",
  };
  axios.get (url)
  .then ((result) => {
    console.log ("\n", getDate(), "pageSize: " + result.data.length, req.query.stock, url)
    // res.send (result.data)

    var pattern = "#CCCCCC\">(\\d\\d)/(\\d\\d)/(\\d\\d\\d\\d)</TD><TD align=\"center\" style=\"padding: 4px; border-bottom: 1px solid #CCCCCC\">(\\d*) for (\\d*)";
    // pattern = "CCCCCC"
    const regex1 = new RegExp (pattern, 'g');


    const text = result.data;
    var count = 0;
    const splits = [];
    while ((result = regex1.exec(text)) !== null){
      if (count == 0)
        console.dir(JSON.stringify(result)) //log first
      count++
      const oneSplit = {
        jump: (Number(result[4] / result[5])).toFixed(4),
        year: Number(result [3]),
        month: Number(result[1]),
        day: Number(result[2]),
      }
      splits.push(oneSplit);

    };
    console.log (JSON.stringify(splits))
    // const found1 = [...text.matchAll(regex1)];
    // const found = regex1.matchAll (pattern);
    // console.log ('found ' + found1)

    //res.send (text.length + " " + url)
    res.send (JSON.stringify(splits))
  })
  .catch ((err) => {
    console.log(err)
  })

})

// Historical Quote
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F17&x=26&y=20
// msft  6/30/17

// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10&x=28&y=18
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10
// msft Jun 30 2010 

// http://localhost:5000/price?stock=APPL&mon=6&day=30&year=10
// http://localhost:5000/splits?stock=APPL



app.get('/val', (req, res) => {
  console.log (getDate(), req.query, req.params, req.hostname)
  res.send ('Hello' + JSON.stringify(req.query))
})

app.get('/price', (req, res) => {
  console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)

  var url = "https://bigcharts.marketwatch.com/historical/default.asp?symb=" + req.query.stock
  url += '&closeDate=' + req.query.mon
  url += '%2F' + req.query.day
  url += '%2F' + req.query.year
  // url += '&x=28&y=18'

  // console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    console.log ("\n", getDate(), "pageSize: ", result.data.length, url)
  
    const filler = "[\\s]*";
    var pattern = 
    "<th>Closing Price:</th>" + filler + "<td>([\\d\\.]+)</td>" + filler
    + "</tr>" + filler + "<tr>" + filler +
    "<th>Open:</th>" + filler + "<td>([\\d\\.]+)</td>"

    var text = "<th>Open:</th> <td>55.64</td>"

    var regex1 = new RegExp (pattern);
    var regExpResult = regex1.exec(result.data)

    console.log (JSON.stringify(regExpResult))

    const info = {
      stock: req.query.stock,
      close: Number(regExpResult[1]),
      open: Number(regExpResult[2]),
      // close: -1
    };

    console.log (JSON.stringify(info))

    res.send (JSON.stringify(info))
  })
  .catch ((err) => {
    console.log(err)
  })

})




//               <tr>\r\n' +
// '                <td colspan="2" class="shouldbecaption">\r\n' +
// '                    <div class="aleft">Microsoft Corp.</div>\r\n' +
// '                    <div class="aleft understated">Wed, Jun 30, 2010</div>\r\n' +
// '                </td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Closing Price:</th>\r\n' +
// '                <td>23.01</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Open:</th>\r\n' +
// '                <td>23.30</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>High:</th>\r\n' +
// '                <td>23.68</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Low:</th>\r\n' +
// '                <td>22.95</td>\r\n' +
// '            </tr>\r\n' +
// '            <tr>\r\n' +
// '                <th>Volume:</th>\r\n' +
// '                <td>81,058,000</td>\r\n' +
// '            </tr>\r\n' +

