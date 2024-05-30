const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')

const print_textFiles = false
const LOG = true
const LOG_EXTRA = false 
// Historical Quote
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F17&x=26&y=20
// msft  6/30/17

// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10&x=28&y=18
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10
// msft Jun 30 2010 

// http://localhost:5000/price?stock=APPL&mon=6&day=30&year=10
// http://localhost:5000/splits?stock=APPL

// NZC-x6kxVdYZ4fDxzawH

// {
//     "dataset_data":{
//        "limit":null,
//        "transform":null,
//        "column_index":null,
//        "column_names":[
//           "Date",
//           "Open",
//           "High",
//           "Low"
//        ],
//        "start_date":"2015-05-24",
//        "end_date":"2015-05-28",
//        "frequency":"daily",
//        "data":[
//           [
//              "2015-05-28",
//              9.58,
//              10.17,
//              12.96
//           ],
//           [
//              "2015-05-27",
//              9.53,
//              10.13,
//              12.97
//           ],
//           [
//              "2015-05-26",
//              9.53,
//              10.11,
//              12.98
//           ]
//        ],
//        "collapse":null,
//        "order":"desc"
//     }
//   }
  


var priceArray = {};   // saved one obj per stock

// read price from local file once on startup

fs.readFile('txt/priceNasdaqArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error ('txt/priceNasdaqArray.txt', err)
    return;
  }

  priceArray =  JSON.parse(data);
  const keys = Object.keys(priceArray);
  console.log('\n',getDate(), 'txt/priceNasdaqArray.txt  read, count=', keys.length)
  if (print_textFiles) {
    for (var i = 0; i < keys.length; i++)
      console.log (JSON.stringify (priceArray[keys[i]]))
  }
  else {
      var symbols = "";
      for (var i = 0; i < keys.length; i++)
        symbols += keys[i] + '  '
      console.log(symbols)
  }
});

var writeCount = 0
function historicPriceNasdaqFlush () {
    fs.writeFile ('txt/priceNasdaqArray.txt', JSON.stringify (priceArray), err => {
      if (err) {
        console.log(getDate(), 'txt/priceNasdaqArray.txt write fail', err)
      }
      else
        console.log(getDate(), 'txt/priceNasdaqArray.txt write sym count=', Object.keys(priceArray).length,
          'writeCount=', writeCount)

    })
    writeCount++;
}

// delete bad data
// app.get('/priceDel', (req, res) => {
  

// app.get('/price', (req, res) => {
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)
function priceNasdaq (app) {

  app.get('/priceNasdaqDel', (req, res) => {
    priceArray[req.query.stock] = undefined;
    res.send('price deleted')
  })


  app.get('/priceNasdaq', (req, res) => {
  nowMili = Date.now();
  const start_date = '&start_date=' + req.query.year + '-' + req.query.mon + '-' + req.query.day
  const end_date = '&end_date=' + (Number(req.query.year)) + '-' + req.query.mon + '-' + req.query.day
  if (LOG)
  console.log('\n', req.query.stock, start_date, end_date)


  const savedPrice = priceArray[req.query.stock];
  if (savedPrice && (nowMili - savedPrice.updateMili < 3 * 24 * 3600 * 1000) && // 3 days
  req.query.year === savedPrice.year && req.query.mon === savedPrice.mon && req.query.day === savedPrice.day) {
    console.log ('\n' + req.query.stock, getDate() + '\x1b[36m Saved price found\x1b[0m',
     'saveCount=' + Object.keys(priceArray).length)
    console.log (JSON.stringify(savedPrice))
    res.send (JSON.stringify(savedPrice))
    return;
  }
  const api_key = 'NZC-x6kxVdYZ4fDxzawH'
  const api_key_txt = '&api_key=NZC-x6kxVdYZ4fDxzawH'

  var url = "https://bigcharts.marketwatch.com/historical/default.asp?symb=" + req.query.stock
  url =  "https://data.nasdaq.com/api/v3/datasets/WIKI/qqq/data.json?start_date=2019-05-01&limit=1&api_key=NZC-x6kxVdYZ4fDxzawH&"
  url='https://data.nasdaq.com/api/v3/datasets/WIKI/'+req.query.stock+'/data.json?limit=1'+start_date+end_date+api_key_txt
//   url += '&closeDate=' + req.query.mon
//   url += '%2F' + req.query.day
//   url += '%2F' + req.query.year
  // url += '&x=28&y=18'

    if (LOG_EXTRA)
  console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    if (LOG_EXTRA)
    console.log ('result.code: ', result.code, )
    if (LOG) console.log ('log 2')
    // if (result.code !== undefined){
    //     res.send (JSON.stringify(
    //      {
    //         stock: req.query.stock,
    //         year: req.query.year,
    //         mon: req.query.mon,
    //         day: req.query.day,
    //         close: -1,
    //         open: -1,
    //         updateMili: nowMili,
    //         code: result.code
    //      }   
    //     ))
    //     return;
    // }
    if (LOG) console.log ('\n', req.query.stock, 'raw', result.data.dataset_data)
    const res_date = result.data.dataset_data.data[0][0];
    const res_open = result.data.dataset_data.data[0][8].toFixed(2);
    const res_close = result.data.dataset_data.data[0][11].toFixed(2);
    if(LOG_EXTRA)
        console.log("\n",result.data.dataset_data.column_names, result.data.dataset_data.data,
        res_date, res_open, res_close)

        if (LOG) console.log ('log 3')
    // console.log ("\n", getDate(), "pageSize: ", result.data.length, url)
    // Split Adjusted Price:</span> <span class="padded">26.0255</span>
    // <div class="acenter"><span class="understated">Split Adjusted Price:</span> <span class="padded">26.0255</span> <span class="understated">Adjustment Factor:</span> <span class="padded">20:1</span></div>'
    // var pattern = '<div class="acenter"><span class="understated">Split Adjusted Price:</span> <span class="padded">([\\d\\.]+)</span> <span class="understated">Adjustment Factor:</span> <span class="padded">([\\d\\.]+)</span></div>'
    var pattern = 'Split Adjusted Price:</span> <span class="padded">([\\d\\.]+)</span>'
 
    var regex1 = new RegExp (pattern);
    var regExpResult = regex1.exec(result.data)
    var saveValidData = true;
    var priceObject = undefined;
    if (LOG) console.log ('log 4')
    // if (regExpResult !== null) {
      saveValidData= true;
      priceObject = {
        source: 'nasdaq',
        stock: req.query.stock,
        year: req.query.year,
        mon: req.query.mon,
        day: req.query.day,
        close: res_close,
        open: res_open,
        // factor: Number(regExpResult[2]),
        updateMili: nowMili,
      };
      if (LOG) console.log ('log 5')
      // res.send (JSON.stringify(priceObject))
      if (LOG)
      console.log ('nasdaqVerify: ', priceObject)
      // return;
    // }

    if (LOG) console.log ('log 6')

    if (priceObject === undefined) {
      const filler = "[\\s]*";
      var pattern = 
      "<th>Closing Price:</th>" + filler + "<td>([\\d\\.]+)</td>" + filler
      + "</tr>" + filler + "<tr>" + filler +
      "<th>Open:</th>" + filler + "<td>([\\d\\.]+)</td>"
    //   regex1 = new RegExp (pattern);
    //   regExpResult = regex1.exec(result.data)
      if (regExpResult) {
        saveValidData = true;
        priceObject = { 
          stock: req.query.stock,
          year: req.query.year,
          mon: req.query.mon,
          day: req.query.day,
          close: Number(regExpResult[1]),
          open: Number(regExpResult[2]),
          updateMili: nowMili,
        };
      }
    }
    if (LOG) console.log ('log 7')

    // if (priceObject === undefined) {
    //   var pattern = '<div>No data for <span class="upper">'+ req.query.stock + '</span></div>'
    //   // var pattern = 'No data for'
    //   regex1 = new RegExp (pattern);
    //   regExpResult = regex1.exec(result.data)      
    //   if (regExpResult)
    //     priceObject = {
    //       stock: req.query.stock,
    //       year: req.query.year,
    //       mon: req.query.mon,
    //       day: req.query.day,
    //       close: Number(-1),
    //       open: Number(-1),
    //       updateMili: nowMili,
    //       err: 'No data'
    //     };
    // }
  if (LOG) console.log ('log 8')
    // if (priceObject === undefined) {
    //   priceObject = {
    //     stock: req.query.stock,
    //     year: req.query.year,
    //     mon: req.query.mon,
    //     day: req.query.day,

    //     updateMili: nowMili,
    //     err: 'noMatch'
    //   }
    // }
    if (LOG) console.log ('log 8')
    // save local price
    if (saveValidData)
      priceArray [req.query.stock] = priceObject;
    else {
      if (priceArray [req.query.stock])
        console.log (req.query.stock, 'erase obsolete')
      priceArray [req.query.stock] = undefined; //erase obsolete

    }
    // console.log ('\n', req.query.stock, getDate(), 'priceObj', Object.keys(priceArray).length, JSON.stringify(priceObject), 'length:', result.data.length)
    if (LOG) console.log ('log 9')
    console.dir (priceArray)

    if (writeCount % 5 === 0)
      historicPriceNasdaqFlush()




    res.send (JSON.stringify(priceObject))
  })
  .catch ((err) => {

    priceObject = {
        source: 'nasdaq', 
        stock: req.query.stock,
        year: req.query.year,
        mon: req.query.mon,
        day: req.query.day,

        // factor: Number(regExpResult[2]),
        updateMili: nowMili,
        err: err.message
      };
      res.send (JSON.stringify(priceObject))
      console.log('catch err', JSON.stringify(priceObject))
      // console.log (url)
  })
})
}

module.exports = {priceNasdaq, historicPriceNasdaqFlush}



// dataset_data	
// limit	1
// transform	null
// column_index	null
// column_names	
// 0	"Date"
// 1	"Open"
// 2	"High"
// 3	"Low"
// 4	"Close"
// 5	"Volume"
// 6	"Ex-Dividend"
// 7	"Split Ratio"
// 8	"Adj. Open"
// 9	"Adj. High"
// 10	"Adj. Low"
// 11	"Adj. Close"
// 12	"Adj. Volume"
// start_date	"2010-05-01"
// end_date	"2010-05-10"
// frequency	"daily"
// data	
// 0	
// 0	"2010-05-10"
// 1	14.8
// 2	14.98
// 3	14.4
// 4	14.56
// 5	24478900
// 6	0
// 7	1
// 8	13.732915244444
// 9	13.899937186606
// 10	13.361755372972
// 11	13.510219321561
// 12	24478900
// collapse	null
// order	null