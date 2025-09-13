const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')


// Zuberi Moshe
const log = true
const FILE_NAME = 'txt/stockOptionArray.txt'
const miliInADay = 24 * 3600 * 1000;
// read from local file once on startup
var stockOptionArray = {};    // saved one obj per stock
fs.readFile(FILE_NAME, 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  if (data === undefined)
    stockOptionArray == {}
  else
    stockOptionArray = JSON.parse(data);

  const keys = Object.keys(stockOptionArray);
  console.log('\n', getDate(), FILE_NAME, '  read count=', keys.length)
  if (log && false)
    for (var i = 0; i < keys.length; i++)
      console.log ('\n', keys[i])// JSON.stringify (stockOptionArray[keys[i]]))
  else {
    var symbols ="";
    for (var i = 0; i < keys.length; i++)
      symbols += keys[i] + '  ' // +' (' + JSON.stringify (stockOptionArray[keys[i]]).length + ')  '
    console.log (symbols)
  }
});



function stockOptionArrayFlush() {
  if (Object.keys(stockOptionArray).length === 0) // avoid write of empty
    return;

  fs.writeFile (FILE_NAME, JSON.stringify(stockOptionArray), err => {
    if (err) {
      console.log (getDate(), FILE_NAME, ' write fail', err)
    }
    else
      console.log ('\n'+getDate(), FILE_NAME , ' write, sym count=', Object.keys(stockOptionArray).length)
  }) 
}



var results = {}
var reqGlobal;
const TOKEN = process.env.MARKET_DATA;


  //** Get option premium for selected expiration and strike */
  function optionPremium (res) {

    //** create expiration group */
    const num = Number(reqGlobal.expirationNum)
    const count = Number(reqGlobal.expirationCount)
    var expirationGroup;
    if (count == 1)
      expirationGroup =  '/?expiration=' + results.expirationArray[reqGlobal.expirationNum]


    if (count > 1 && (num + count < results.expirationArray.length)) {
      expirationGroup =  '/?from=' + results.expirationArray[num] +
       '&to=' + results.expirationArray[num + count -1]

    }
    if (reqGlobal.log) {
        // console.log (results.expirationArray[num + count -1])
        // console.log ('expirationGroup', expirationGroup, 'num', reqGlobal.expirationNum, 'count', reqGlobal.expirationCount)
        // console.log ( '&to=', results.expirationArray[reqGlobal.expirationNum + reqGlobal.expirationCount -1])
    }
    // res.send('fail ' + expirationGroup)
    // return
 
    //** Create strike-group  (list) */
    var strikeGroup = results.strikeArray[reqGlobal.strikeNum];
    // console.log (reqGlobal.strikeNum, 'strikeGroup=', strikeGroup) 
    for (let i = 1; i < reqGlobal.strikeCount; i++) {
      if (reqGlobal.strikeNum + i >= results.strikeArray.length)
        break;
      strikeGroup += ',' + results.strikeArray[reqGlobal.strikeNum + i]
    }
    // if (reqGlobal.log) {
    //   console.log ('__strikeGroup=', strikeGroup) 
    //   console.log ('expirationGroup=', expirationGroup)
    // }
    
    var url = 'https://api.marketdata.app/v1/options/chain/'+ reqGlobal.stock 
        + expirationGroup
        + '&side=' + reqGlobal.side + '&strike=' + strikeGroup 
    url += '&token=' + TOKEN
        // + '?human=true';

    // const TEST = 'https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25'
    // url = TEST;
    if (reqGlobal.log)
      console.log ('\n\n'+ url)

    axios.get (url)
    .then ((result) => {
      // if (reqGlobal.log)
      //   console.log ('primium', result.data)

      if (result.data.s !== 'ok') {

        console.log (reqGlobal.stock, 'option-fee error', result.data.s)
        return
      }

      results.premiumArray = result.data
      results.req = reqGlobal // to campare params for similar request
      results.updateMili = nowMili // avoid too frequent access
      if (reqGlobal.logExtra)
        console.log ('send new results', results)
      stockOptionArray [reqGlobal.stock] = results; //save results
      stockOptionArrayFlush()
      res.send (results)

     })
    // .catch ((err) => {
    //   console.log(err.message)
    // })

  }






  function strikePricesGet (res, expirationsArray) {
    const url = 'https://api.marketdata.app/v1/options/strikes/' + reqGlobal.stock + '/?expiration=' 
        + expirationsArray[reqGlobal.expirationNum] + '&token=' + TOKEN

    if (reqGlobal.log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      // if (reqGlobal.log)
      //   console.log ('strike-prices', result.data)
      // const mili = result.data.updated

      if (result.data.s !== 'ok') {
        console.log (reqGlobal.stock, 'strike-price error', result.data.s)
      }

      const arr = result.data[expirationsArray[reqGlobal.expirationNum]]
      // if(reqGlobal.log)
      //   console.log ('strike-array', arr)

      results.strikeArray = arr


      //** default select just above current price*/
      if (reqGlobal.strikeNum == -1) {
         for (let i = 0; i < arr.length; i++) {
          if (arr[i] > reqGlobal.stockPrice) {
           // if (reqGlobal.log)
            // console.log (reqGlobal.stock, 'search strikeNum', reqGlobal.strikeNum, i, arr[i] > reqGlobal.stockPrice)
            reqGlobal.strikeNum = i;
            results.strikeNum = i // send back to client
            // if (reqGlobal.log)
            //   console.log ('default strike selected', i, arr[i])
            break;
          }
        }
      }
      
      // if (reqGlobal.log)
      //   console.log ('send results', results)
      // res.send (results)
      optionPremium (res)
    })
    .catch ((err) => {
      console.log(err.message)
      res.send ('fail getStrikes exception')
    })
  };
 




function expirationsGet (res) {

    const url = 'https://api.marketdata.app/v1/options/expirations/' + reqGlobal.stock+ '/?token=' + TOKEN
    if (reqGlobal.log)
      console.log (url)

    axios.get (url)
      .then ((result) => {
        if (reqGlobal.log)
          console.log ('expirations__', result.data)
        const mili = result.data.updated
        const status = result.data.s

        if (result.data.s !== 'ok') {
          console.log (reqGlobal.stock, 'expiration error', result.data.s)
        }
         
        results.expirationArray = result.data.expirations
        // if (reqGlobal.func === 'expirations') {
        //   res.send (results) // result.data.expirations)// results)
        //   return
        // }
        // else {
          strikePricesGet (res, results.expirationArray)

          // res.send ('fail')
        // }


    
      })
      .catch ((err) => {
        console.log(err.message)
        res.send ('fail getExpirations exception')
        return 'fail'
      })

  };


function checkSame (req1, req2) {
  if (req1.expirationNum != req2.expirationNum)
    return false;
  if (req1.expirationCount != req2.expirationCount)
    return false;
  if (req1.strikeNum != req2.strikeNum)
    return false;
  if (req1.strikeCount != req2.strikeCount)
    return false;

  if (req1.side != req2.side)
    return false;
  return true;
}


// 
// console.log ('MARKET_DATA')
function stockOptions (app)  {

  app.get('/stockOptions', (req, res) => {
    console.log ('params', req.query)

    reqGlobal = req.query
    const LOG = req.query.log
    // check for saved 
    const daysDelay = 1/4;  // max frequeny 6 hours

    // search saved stockOption retrieved lately
    const nowMili = Date.now();
    var diff;
    if (! reqGlobal.ignoreSaved) {
      var savedOption = stockOptionArray [req.query.stock];
      if (savedOption && savedOption.updateMili)
        diff = nowMili - savedOption.updateMili

      if (savedOption && savedOption.updateMili && (nowMili - savedOption.updateMili)  < daysDelay * miliInADay && checkSame(reqGlobal, savedOption.req)) {
        console.log (req.query.stock, getDate(), '\x1b[36m Saved stockOption found\x1b[0m,',
        ' saveCount=', Object.keys(stockOptionArray).length)
        if (reqGlobal.logExtra)
          console.dir (savedOption)
        if (savedOption.length == 1)
          res.send ('')
        else
          res.send (JSON.stringify(savedOption))
        return;
      }
      else {  // delete old wrong saved format
        stockOptionArray [req.query.stock] = undefined;
        if (reqGlobal.logExtra)
          console.log ("\n", req.query.stock, getDate(), '\x1b[31m stockOption old\x1b[0m days=', (diff / miliInADay).toFixed(0), savedOption);
        savedOption = undefined;
      }
    }
    expirationsGet (res)
  })
}


         




// https://www.marketdata.app/docs/api/

// https://api.marketdata.app/v1/options/strikes/{symbol}/?expiration=YYYY-MM-DD

// https://api.marketdata.app/v1/options/expirations/AAPL

// https://api.marketdata.app/v1/options/quotes/AAPL250817C00150000/
// https://api.marketdata.app/v1/options/chaiside=call
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2025-01-17&side=call
// https://api.marketdata.app/v1/options/strikes/AAPL
// https://api.marketdata.app/v1/options/strikes/AAPL/?expiration=2026-02-20
// https://api.marketdata.app/v1/options/strikes/AAPL/?expiration=2025-01-17

// https://api.marketdata.app/v1/options/quotes/AAPL250117C00150000/?human=true
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-02-20&side=call
// https://api.marketdata.app/v1/options/quotes/AAPL260220C00150000/?human=true
// https://api.marketdata.app/v1/options/chain/AAPL/?from=2027-01-01&to=2027-06-30.

// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25
// https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2025-08-15&side=call&strike=25



module.exports = {stockOptions};