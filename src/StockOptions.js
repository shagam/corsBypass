const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')


// Zuberi Moshe
const log = true
const FILE_NAME = 'txt/stockOptionArray.txt'
const miliInADay = 24 * 3600 * 1000;
var compareStatus;

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
  function optionPremium (res, expirationDayIndex) {
    // console.log ('expirationDayIndex', expirationDayIndex)

    //** create expiration group */
    const count = Number(reqGlobal.expirationCount)

    var expirationGroup;
    if (count == 1)
      expirationGroup =  '/?expiration=' + results.expirationArray[expirationDayIndex]

    const endIndex = expirationDayIndex  + count < results.expirationArray.length ? expirationDayIndex  + count - 1 :
     results.expirationArray.length -1 

    if (endIndex <=  expirationDayIndex || expirationDayIndex < 0){
      res.send ('fail, to build expirationGroup for url request')
      console.log ('fail, to build expirationGroup for url request', expirationDayIndex, endIndex)
      return;
    }


    expirationGroup =  '/?from=' + results.expirationArray[expirationDayIndex ] +
      '&to=' + results.expirationArray[endIndex]


    if (reqGlobal.log) {
        // console.log (results.expirationArray[num + count -1])
        console.log ('expirationGroup', expirationGroup, 'num', expirationDayIndex, 'count', reqGlobal.expirationCount)
        // console.log ( '&to=', results.expirationArray[expirationDayIndex + reqGlobal.expirationCount -1])
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
      console.log ('\n\n'+ url + '\n')

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
      results.compareStatus = compareStatus;
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

      const arr = result.data[expirationsArray[expirationDayIndex]]
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
        const mili = result.data.updated
        const status = result.data.s

        if (result.data.s !== 'ok') {
          console.log (reqGlobal.stock, 'expiration error', result.data.s)
        }
         
        results.expirationArray = result.data.expirations

        // search expration (days-to-expire)
        var expirationDayIndex = -1;
        const todayDays = new Date().getTime() / 1000 / 3600 / 24
           console.log ('today=' + todayDays)
        for (let i = 0; i < results.expirationArray.length; i++) {
          const expirationDays = new Date(results.expirationArray[i]).getTime() / 1000 / 3600 / 24
          if (reqGlobal.logExtra)
            console.log (i, 'today=' + todayDays.toFixed(2), results.expirationArray[i],  'expirationDays=' + expirationDays)
          if (expirationDays > todayDays + Number(reqGlobal.expirationNum)) {
            expirationDayIndex = i;  // found requre expiration
            break;
          }
        }
        if (expirationDayIndex === -1) { // expirationIndex not found
          console.log ('fail, expirationDayIndex not found')
          res.send ('fail, expirationDayIndex not found')
          return;
        }
        console.log ('expirationDayIndex=', expirationDayIndex, results.expirationArray[expirationDayIndex])

   
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
  if (reqGlobal.logExtra)
    console.log (Object.keys(savedOption))

  const req2 = savedOption.req
  if (req1.expirationNum != req2.expirationNum) {
    compareStatus = 'expirationNum diff'
    return false;
  }
  if (req1.expirationCount != req2.expirationCount) {
    compareStatus = 'expirationCount diff'
    return false;
  }
  // if (req1.strikeNum != req2.strikeNum) {
  //   compareStatus = 'strikeNum diff'
  //   return false;
  // }
  if (req1.strikeCount != req2.strikeCount) {
    compareStatus = 'expirationCount diff'
    return false;
  }

  if (req1.side != req2.side) {
    compareStatus = 'side diff'
    return false;
  }

  const nowMili = Date.now();
  const diff = (nowMili - savedOption.updateMili) / 1000   // diff in seconds;
  if (diff > 600) {  // 10 minutes
    compareStatus = 'last request ' + diff + ' seconds ago'
    return false;
  }

  compareStatus = 'get saved'
  return true; // same:  use saved info
}


// 
// console.log ('MARKET_DATA')
function stockOptions (app)  {

  app.get('/stockOptions', (req, res) => {
    console.log ('params', req.query)

    reqGlobal = req.query


    // search saved stockOption retrieved lately

    var savedOption = stockOptionArray [req.query.stock];
    if (savedOption && ! reqGlobal.ignoreSaved && checkSame(reqGlobal, savedOption)) {

       console.log (req.query.stock, getDate(), '\x1b[36m Saved stockOption found\x1b[0m,')

        savedOption.compareStatus = compareStatus;
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