const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')


// Zuberi Moshe
const log = true
const FILE_NAME = 'txt/stockOptionArray.txt'
const miliInADay = 24 * 3600 * 1000;
var compareText;

// read from local file once on startup
var stockOptionArray = {};    // saved one obj per stock


function purgeOld () {
  const keys = Object.keys (stockOptionArray)
  for (let i = 0; i < keys.length; i++) {
    if (Date.now () - stockOptionArray[keys[i]].updateMili > 30 * 60 * 1000) {
      console.log ('delete old option', keys[i])
      delete stockOptionArray[keys[i]]
    }
  }
  console.log ('keys after purge old', 'keys=', Object.keys(stockOptionArray).length, Object.keys(stockOptionArray))
}

var results = {}
var reqGlobal;
const TOKEN = process.env.MARKET_DATA;


  //** Get option premium for selected expiration and strike */
  function optionPremium (res, expirationDayIndex) {
    // console.log ('expirationDayIndex', expirationDayIndex)

    //** create expiration group */
    const count = Number(reqGlobal.expirationCount)

    var expirationGroup;
    if (count == 1)
      expirationGroup =  '/?expiration=' + results.expirationArray[expirationDayIndex]

    const endIndex = expirationDayIndex  + count < results.expirationArray.length ? expirationDayIndex  + count - 1 :
     results.expirationArray.length -1 
    
     if (!TOKEN) {
      res.send ('fail, missing tolen. check .env')
      console.log ('fail,  missing tolen. check .env')
      return;
     }

    if (endIndex <  expirationDayIndex || expirationDayIndex < 0){
      res.send ('fail, to build expirationGroup   index=' + expirationDayIndex + 'endIndex='+ endIndex)
      console.log ('fail, to build expirationGroup  start=' + expirationDayIndex, 'end=' + endIndex)
      return;
    }


    expirationGroup =  '/?from=' + results.expirationArray[expirationDayIndex ] +
      '&to=' + results.expirationArray[endIndex]


    if (reqGlobal.log) {
        // console.log (results.expirationArray[num + count -1])
        console.log('\nexpirationDayIndex=' + expirationDayIndex, 'count=' + reqGlobal.expirationCount)
        console.log ('expirationGroup=', expirationGroup)
        // console.log ( '&to=', results.expirationArray[expirationDayIndex + reqGlobal.expirationCount -1])
    }
    // res.send('fail ' + expirationGroup)
    // return
    //** Create strike-group  (list) */
    if (results.strikeArray.length <= results.strikeIndex) {
      console.log ('requested strike beyond strikeArray; strikeNum=' + reqGlobal.strikeNum, 'len=' + results.strikeArray.length, results.strikeArray)
      res.send ('fail, requested strike beyond strikeArray; len=' + results.strikeArray.length)
      return
    }
    var strikeGroup = results.strikeArray[results.strikeIndex];
    if (reqGlobal.log) 
      console.log ('strikeGroup', results.strikeIndex, 'strikeGroup=', strikeGroup) 
    for (let i = 1; i < reqGlobal.strikeCount; i++) {
      if (results.strikeIndex + i >= results.strikeArray.length)
        break;
      strikeGroup += ',' + results.strikeArray[results.strikeIndex + i]
    }
    if (reqGlobal.log) {
      console.log ('strikeGroup_len=' + strikeGroup.length, 'strikeGroup=' + strikeGroup, 'strikeIndex=' + results.strikeIndex) 
    }
    
    var url = 'https://api.marketdata.app/v1/options/chain/'+ reqGlobal.stock 
        + expirationGroup
        + '&side=' + reqGlobal.side + '&strike=' + strikeGroup 
    url += '&token=' + TOKEN
        // + '?human=true';

    // const TEST = 'https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25'
    // url = TEST;
    if (reqGlobal.log)
      console.log ('\n'+ url + '\n')

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
      results.updateMili = Date.now() // avoid too frequent access
      if (reqGlobal.logExtra)
        console.log ('send new results', results)
      results.compareStatus = compareText;
      // purgeOld () 
      stockOptionArray [reqGlobal.stock] = results; //save results
      res.send (results)

     })
    .catch ((err) => {
      console.log(reqGlobal.stock, 'getPrimium', err.message)
      res.send ('fail ' + reqGlobal.stock + ' getPrimium' + err.message)
    })

  }






  function strikePricesGet (res, expirationsArray, expirationDayIndex) {
    const url = 'https://api.marketdata.app/v1/options/strikes/' + reqGlobal.stock + '/?expiration=' 
        + expirationsArray[expirationDayIndex] + '&token=' + TOKEN

    if (reqGlobal.log)
      console.log ('\n', url + '\n')

    axios.get (url)
    .then ((result) => {
      if (reqGlobal.logExtra)
        console.log ('strike-prices raw', result.data)
      // const mili = result.data.updated

      if (result.data.s !== 'ok') {
        console.log (reqGlobal.stock, 'strike-price error', result.data.s)
      }
      if (reqGlobal.expir_last) {
        expirationDayIndex = results.expirationArray.length -1;
        console.log ("choose Last expiration=", results.expirationArray[expirationDayIndex], 'index=' + expirationDayIndex)
      }
      else if (reqGlobal.expir_oneBeforeLast) {
        expirationDayIndex = results.expirationArray.length -2;
        console.log ("choose Last expiration=", results.expirationArray[expirationDayIndex], 'index=' + expirationDayIndex)
      }

      const arr = result.data[expirationsArray[expirationDayIndex]]
      if(reqGlobal.log)
        console.log ('strike-array', 'date=' + expirationsArray[expirationDayIndex], ' len=' + arr.length, arr)
      results.strikeArray = arr
      //if (reqGlobal.logExtra)
        results.strikeFull = result.data // for debug


      //** strikeNum calc as percent abobe today price */

      const requiredStrike =  reqGlobal.stockPrice * (1 + Number(reqGlobal.strikeNum) / 100)
        for (let i = 0; i < arr.length; i++) {
        if (arr[i] > requiredStrike) {
          // if (reqGlobal.log)
          // console.log (reqGlobal.stock, 'search strikeNum', reqGlobal.strikeNum, i, arr[i] > reqGlobal.stockPrice)

          results.strikeIndex = i // send back to client
          // if (reqGlobal.log)
            console.log ('found strike=' + arr[i], 'requiredStrike=' + requiredStrike.toFixed(2), 'index=' + i, 'percentAbovePrice=' + reqGlobal.strikeNum)
          break;
        }
      }

      
      // if (reqGlobal.log)
      //   console.log ('send results', results)
      // res.send (results)
      optionPremium (res, expirationDayIndex)
    })
    .catch ((err) => {
      console.log(err.message)
      res.send ('fail getStrikes exception')
    })
  };
 




function expirationsGet (res) {

    const url = 'https://api.marketdata.app/v1/options/expirations/' + reqGlobal.stock+ '/?token=' + TOKEN
    if (reqGlobal.log)
      console.log ('\n', url, '\n')

    axios.get (url)
      .then ((result) => {
        if (reqGlobal.log)
          console.log ('expirations__', result.data)

        if (result.data.s !== 'ok') {
          console.log (reqGlobal.stock, 'expiration error', result.data.s)
        }
         
        results.expirationArray = result.data.expirations

        // search expration (days-to-expire)
        var expirationDayIndex = -1;
        const todayDays = new Date().getTime() / 1000 / 3600 / 24
        console.log ('today=' + todayDays.toFixed(0))

        if (reqGlobal.expir_last || reqGlobal.expirationNum == -11) {
          expirationDayIndex = results.expirationArray.length -1;
          console.log ("choose Last expiration=", results.expirationArray[expirationDayIndex], 'index=' + expirationDayIndex)
        }
        else if (reqGlobal.expir_oneBeforeLast || reqGlobal.expirationNum == -12) {
          expirationDayIndex = results.expirationArray.length -2;
          console.log ("choose Last expiration=", results.expirationArray[expirationDayIndex], 'index=' + expirationDayIndex)
        } else
        for (let i = 0; i < results.expirationArray.length; i++) {
          const expirationDays = (new Date(results.expirationArray[i]).getTime() / 1000 / 3600 / 24 - todayDays).toFixed(0)
          if (reqGlobal.log)
            console.log (i, 'today=' + todayDays.toFixed(0), results.expirationArray[i], 
           'expirationDays=' + expirationDays, 'expirationNum=' + reqGlobal.expirationNum,
            'diff=', expirationDays)
          if (expirationDays >  Number(reqGlobal.expirationNum)) {
            console.log(getDate(), 'expirationDayIndex=' + i)
            expirationDayIndex = i;  // found requre expiration
            break;
          }
        }
        if (expirationDayIndex === -1) { // expirationIndex not found
          console.log ('fail, expirationDate not found')
          res.send ('fail, expirationDate not found')
          return;
        }
        console.log ('expirationDayIndex='+ expirationDayIndex, 'dte=' + reqGlobal.expirationNum, 'date=' + results.expirationArray[expirationDayIndex])

   
        strikePricesGet (res, results.expirationArray, expirationDayIndex)

          // res.send ('fail')
        // }
    
      })
      .catch ((err) => {
        console.log(err.message)
        res.send ('fail getExpirations exception')
        return 'fail'
      })

  };



function checkSame (req1, savedOption) {
  compareText = 'default same'
    // console.log('checkSame compareStatus5=', compareStatus)
  if (reqGlobal.logExtra)
    console.log (Object.keys(savedOption))

  const req2 = savedOption.req
  if (req1.expirationNum != req2.expirationNum) {
    compareText = 'get fresh. expirationNum diff'
    return false;
  }
  if (req1.expirationCount != req2.expirationCount) {
    compareText = 'get fresh. cexpirationCount diff'
    return false;
  }
  if (req1.strikeNum != req2.strikeNum) {
    compareText = 'get fresh. strikeNum diff'
    return false;
  }
  // prepare to replace strikeNum
  if (req1.strike != req2.strike) {
    compareText = 'get fresh. strike diff'
    return false;
  }

  if (req1.strikeCount != req2.strikeCount) {
    compareText = 'get fresh. expirationCount diff'
    return false;
  }

  if (req1.side != req2.side) {
    compareText = 'get fresh. side diff'
    return false;
  }

  if (req1.expir_last != req2.expir_last) {
    compareText = 'get fresh. expir_last diff'
    return false;
  }

  if (req1.expir_oneBeforeLast!= req2.expir_oneBeforeLast) {
    compareText = 'get fresh. expir_oneBeforeLast diff'
    return false;
  }


  // check for fresh data
  const nowMili = Date.now();
  const diff = (nowMili - savedOption.updateMili) / 1000   // diff in seconds;
  if (diff > 600) {  // 10 minutes
    compareText = 'get fresh. too old last request ' + diff + ' seconds ago'
    return false;
  }

  compareText = 'get saved'
  return true; // same:  use saved info
}  


// 
// console.log ('MARKET_DATA')
function stockOptions (app)  {

  app.get('/stockOptions', (req, res) => {
    console.log ('\n\ngetOptions params', getDate(), req.query)

    reqGlobal = req.query


    // search saved stockOption retrieved lately

    var savedOption = stockOptionArray [req.query.stock];
    // console.log (savedOption.premiumArray.underlying[0])
    var checkSameStatus = false // checkSame (reqGlobal, savedOption)
    // 
    if (savedOption) {
      if (reqGlobal.log)
        console.log ('saved sym=', savedOption.premiumArray.underlying[0])
              if (savedOption.premiumArray.underlying[0] !== req.query.stock)
        compareText = "stock diff"
      else
        checkSameStatus = checkSame(reqGlobal, savedOption)
      if (reqGlobal.log)
        console.log ('checkSame=', checkSameStatus, 'text=' + compareText)
    }
    else {
      if (reqGlobal.log)
        console.log ('savedOption  not found')
    }

    if (savedOption && checkSameStatus) {

       console.log (req.query.stock, getDate(), '\x1b[36m Saved stockOption found\x1b[0m,', 'compareStatus1=', compareText)

        savedOption.compareStatus = compareText;
        if (reqGlobal.logExtra)
          console.dir (savedOption)
        if (savedOption.length == 1)
          res.send ('')
        else
          res.send (JSON.stringify(savedOption))
        return;
      
      // else {  // delete old wrong saved format
      //   stockOptionArray [req.query.stock] = undefined;
      //   // if (reqGlobal.logExtra)
      //   //   console.log ("\n", req.query.stock, getDate(), '\x1b[31m stockOption old\x1b[0m days=', (diff / miliInADay).toFixed(0), savedOption);
      //   savedOption = undefined;
      // }
    }
    compareText  = ''
    expirationsGet (res)
    // console.log ('keys=', Object.keys(stockOptionArray))
    purgeOld()
  })
}


function stockOptionsHistory (app) {

   app.get('/stockOptionsHistory', (req, res) => {
    console.log ('params', req.query)
    const log = req.query.log

    var url = 'https://api.marketdata.app/v1/options/quotes/' + req.query.optionSymbol
    // YYYY-MM-DD&to=YYYY-MM-DD'
    url += '?from=' + req.query.from + '&to=' + req.query.to;
    url += '&token=' + TOKEN
    if (log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      if (req.query.log)
        console.log ('historical option data', result.data)

      if (result.data.s !== 'ok') {
        console.log ( req.query.optionSymbol, 'historical option data fail', result.data.s)
        res.send ('fail getExpirations exception')
        return   
      }

      res.send (result.data)
    })

    .catch ((err) => {
      console.log(err.message)
      res.send ('fail getQuote history exception')
      return 'fail'
    })

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



module.exports = {stockOptions, stockOptionsHistory};