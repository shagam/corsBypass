const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')


// Zuberi Moshe

var results = {}
var reqGlobal;
const TOKEN = process.env.MARKET_DATA;


  //** Get option premium for selected expiration and strike */
  function optionPremium (res) {

    //** create expiration group */
      var expirationGroup =  '/?expiration=' + expirationsArray[reqGlobal.expirationNum] + '&token=' + TOKEN;

    if (reqGlobal.expirationCount > 1 && (reqGlobal.expirationNum + reqGlobal.expirationCount < expirationsArray.length)) {
      expirationGroup =  '/?from=' + expirationsArray[reqGlobal.expirationNum] +
       '&to=' + expirationsArray[reqGlobal.expirationNum + reqGlobal.expirationCount -1]
       + '&token=' + TOKEN
    }

 
    //** Create strike-group  (list) */
    var strikeGroup = strikeArray[reqGlobal.strikeNum];
    
    for (let i = 1; i < reqGlobal.strikeCount; i++) {
      if (reqGlobal.strikeNum + i >= strikeArray.length)
        break;
      strikeGroup += ',' + strikeArray[reqGlobal.strikeNum + i]
    }
    if (reqGlobal.log) {
      console.log ('strikeGroup=', strikeGroup) 
      console.log ('expirationGroup=', expirationGroup)
    }
    
    const url = 'https://api.marketdata.app/v1/options/chain/'+ reqGlobal.stock 
        + expirationGroup
        + '&side=' + callOrPut + '&strike=' + strikeGroup + '&api_key=' + TOKEN
        // + '?human=true';

    // const TEST = 'https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25'
    // url = TEST;
    if (reqGlobal.log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      if (reqGlobal.log)
        console.log ('primium', result.data)

      if (result.data.s !== 'ok') {

        console.log (reqGlobal.stock, 'option-fee error', result.data.s)
        return
      }

      results.premiumArray = result.data
      if (reqGlobal.log)
        console.log ('send results', results)
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
      const mili = result.data.updated

      if (result.data.s !== 'ok') {
        console.log (reqGlobal.stock, 'strike-price error', result.data.s)
      }

      const arr = result.data[expirationsArray[reqGlobal.expirationNum]]
      // if(reqGlobal.log)
      //   console.log ('strike-array', arr)

      results.strikeArray = arr


      //** default select just above current price*/
      if (reqGlobal.strikeNum === -1) {
         for (let i = 0; i < arr.length; i++) {
          if (arr[i] > reqGlobal.stockPrice) {
          if (reqGlobal.log)
            console.log (reqGlobal.stock, 'search strikeNum', reqGlobal.strikeNum, i, arr[i] > reqGlobal.stockPrice)
            reqGlobal.strikeNum = i;

            // if (reqGlobal.log)
            //   console.log ('default strike selected', i, arr[i])
            break;
          }
        }
      }
      
      if (reqGlobal.log)
        console.log ('send results', results)
      res.send (results)
      // optionPremium (res)
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
        if (reqGlobal.func === 'expirations') {
          res.send (results) // result.data.expirations)// results)
          return
        }
        else {
          strikePricesGet (res, results.expirationArray)

          // res.send ('fail')
        }


    
      })
      .catch ((err) => {
        console.log(err.message)
        res.send ('fail getExpirations exception')
        return 'fail'
      })

  };



// 
// console.log ('MARKET_DATA')
function stockOptions (app)  {

    app.get('/stockOptions', (req, res) => {
      console.log ('params', req.query)

      reqGlobal = req.query

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