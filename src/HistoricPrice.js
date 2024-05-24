const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')

const print_textFiles = false

// Historical Quote
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F17&x=26&y=20
// msft  6/30/17

// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10&x=28&y=18
// https://bigcharts.marketwatch.com/historical/default.asp?symb=msft&closeDate=6%2F30%2F10
// msft Jun 30 2010 

// http://localhost:5000/price?stock=APPL&mon=6&day=30&year=10
// http://localhost:5000/splits?stock=APPL

var priceArray = {};   // saved one obj per stock

// read price from local file once on startup
fs.readFile('txt/priceArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    eturn;
  }
  priceArray = JSON.parse(data);
  const keys = Object.keys(priceArray);
  console.log('\n', getDate(), 'txt/priceArray.txt  read, count=', keys.length)
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



// app.get('/price', (req, res) => {
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)
function price (app) {
  nowMili = Date.now();

  // delete bad data
  app.get('/priceDel', (req, res) => {
    console.log (req.query.stock, 'priceDel')
    priceArray[req.query.stock] = undefined;
    res.send('price deleted')
  })



  app.get('/price', (req, res) => {
    // price(req, res)
    // console.log (getDate(), req.query)
    // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)
  


  const savedPrice = priceArray[req.query.stock];
  if (savedPrice && (nowMili - savedPrice.updateMili < 3 * 24 * 3600 * 1000) && // 3 days
  req.query.year === savedPrice.year && req.query.mon === savedPrice.mon && req.query.day === savedPrice.day) {
    console.log ('\n' + req.query.stock, getDate() + '\x1b[36m Saved price found\x1b[0m',
     'saveCount=' + Object.keys(priceArray).length)
    console.log (JSON.stringify(savedPrice))
    res.send (JSON.stringify(savedPrice))
    return;
  }

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

    // console.log ("\n", getDate(), "pageSize: ", result.data.length, url)
    // Split Adjusted Price:</span> <span class="padded">26.0255</span>
    // <div class="acenter"><span class="understated">Split Adjusted Price:</span> <span class="padded">26.0255</span> <span class="understated">Adjustment Factor:</span> <span class="padded">20:1</span></div>'
    // var pattern = '<div class="acenter"><span class="understated">Split Adjusted Price:</span> <span class="padded">([\\d\\.]+)</span> <span class="understated">Adjustment Factor:</span> <span class="padded">([\\d\\.]+)</span></div>'
    var pattern = 'Split Adjusted Price:</span> <span class="padded">([\\d\\.]+)</span>'
 
    var regex1 = new RegExp (pattern);
    var regExpResult = regex1.exec(result.data)
    var saveValidData = false;
    var priceObject = undefined;

    if (regExpResult !== null) {
      saveValidData= true;
      priceObject = {
        stock: req.query.stock,
        year: req.query.year,
        mon: req.query.mon,
        day: req.query.day,
        close: Number(regExpResult[1]),
        open: Number(regExpResult[1]),
        // factor: Number(regExpResult[2]),
        updateMili: nowMili,
      };
    }
    if (priceObject === undefined) {
      const filler = "[\\s]*";
      var pattern = 
      "<th>Closing Price:</th>" + filler + "<td>([\\d\\.]+)</td>" + filler
      + "</tr>" + filler + "<tr>" + filler +
      "<th>Open:</th>" + filler + "<td>([\\d\\.]+)</td>"
      regex1 = new RegExp (pattern);
      regExpResult = regex1.exec(result.data)
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

    if (priceObject === undefined) {
      var pattern = '<div>No data for <span class="upper">'+ req.query.stock + '</span></div>'
      // var pattern = 'No data for'
      regex1 = new RegExp (pattern);
      regExpResult = regex1.exec(result.data)      
      if (regExpResult)
        priceObject = {
          stock: req.query.stock,
          year: req.query.year,
          mon: req.query.mon,
          day: req.query.day,
          close: Number(-1),
          open: Number(-1),
          updateMili: nowMili,
          err: 'No data'
        };
    }

    if (priceObject === undefined) {
      priceObject = {
        stock: req.query.stock,
        year: req.query.year,
        mon: req.query.mon,
        day: req.query.day,

        updateMili: nowMili,
        err: 'noMatch'
      }
    }

    // save local price
    if (saveValidData)
      priceArray [req.query.stock] = priceObject;
    else {
      if (priceArray [req.query.stock])
        console.log (req.query.stock, 'erase obsolete')
      priceArray [req.query.stock] = undefined; //erase obsolete

    }
    console.log ('\n', req.query.stock, getDate(), 'priceObj', Object.keys(priceArray).length, JSON.stringify(priceObject), 'length:', result.data.length)
    // console.dir (priceArray)

    fs.writeFile ('txt/priceArray.txt', JSON.stringify (priceArray), err => {
      if (err) {
        console.err('txt/priceArray.txt write fail', err)
      }
    })


    res.send (JSON.stringify(priceObject))
  })
  .catch ((err) => {
    console.log(err)
    res.send('')
  })
})
}

module.exports = {price}

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

