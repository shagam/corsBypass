const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')

// Zuberi Moshe

var results = {}
var reqGlobal;



  function strikePricesGet (res, expirationsArray) {
    const url = 'https://api.marketdata.app/v1/options/strikes/' + reqGlobal.stock + '/?expiration=' 
        + expirationsArray[reqGlobal.expirationNum] + '&token=' + TOKEN

    if (reqGlobal.log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      if (reqGlobal.log)
        console.log ('strike-prices', result.data)
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
      // optionPremium ()
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
          console.log (props.symbol, 'expiration error', result.data.s)
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
        // if (req.query.func === 'strikes')
        //   res.send (result.data.expirations)
        // if (req.query.func === 'expirations')
        //   res.send (result.data.expirations)

    
      })
      .catch ((err) => {
        console.log(err.message)
        res.send ('fail getExpirations exception')
        return 'fail'
      })

  };



// 
TOKEN=process.env.MARKET_DATA
console.log ('MARKET_DATA')
function stockOptions (app)  {

    app.get('/stockOptions', (req, res) => {
      console.log ('params', req.query)
      const stock = req.query.stock;

      reqGlobal = req.query
      expirationsGet (res)

    })
  }

function OptionQuote (props) {
  const {eliHome} = IpContext();
  // const [quote, setQuote] = useState(null);
  const optionSymbol = 'AAPL'+'250817C00' + '150000'; // Jan 2025 $150 AAPL Call
  const TOKEN = process.env.REACT_APP_MARKETDATA;
  var url = 'https://marketdata.app/api/v1/marketdata?token=' + TOKEN;


  
  const columnsAll = [
    "expiration","firstTraded","updated","underlying","side","strike","dte","bid","bidSize","mid","ask",
    "askSize","last","openInterest","volume","inTheMoney","intrinsicValue","extrinsicValue",
    "underlyingPrice","iv","delta","gamma","theta","vega"]
   
         
  //** Get option premium for selected expiration and strike */
  function optionPremium (selectedExpiration, selectedStrike) {
    //** clear */
    // setOptionQuote({})

    setLineNumberArr([]);
    //** create expiration group */
    // console.log (expirationCount, selectedExpiration, expirationsArray.length)
    var expirationGroup =  '/?expiration=' + expirationsArray[selectedExpiration] + '&token=' + TOKEN;
    // console.log ('expirationCount=', expirationCount)
    if (expirationCount > 1 && (selectedExpiration + expirationCount < expirationsArray.length)) {
      expirationGroup =  '/?from=' + expirationsArray[selectedExpiration] + '&to=' + expirationsArray[selectedExpiration + expirationCount -1]
       + '&token=' + TOKEN
    }

 
    //** Create strike-group  (list) */

    var strikeGroup = strikeArray[selectedStrike];
    
    for (let i = 1; i < strikeCount; i++) {
      if (selectedStrike + i >= strikeArray.length)
        break;
      strikeGroup += ',' + strikeArray[selectedStrike + i]
    }
    if (log) {
      console.log ('strikeGroup=', strikeGroup) 
      console.log ('expirationGroup=', expirationGroup)
    }
    
    // url = 'https://api.marketdata.app/v1/options/quotes/' + props.symbol
    const url = 'https://api.marketdata.app/v1/options/chain/'+ props.symbol 
        + expirationGroup
        + '&side=' + callOrPut + '&strike=' + strikeGroup + '&api_key=' + TOKEN
        // + '?human=true';

    // const TEST = 'https://api.marketdata.app/v1/options/chain/AAPL/?expiration=2026-05-15&side=call&strike=25'
    // url = TEST;
    if (log)
      console.log (url)

    axios.get (url)
    .then ((result) => {
      if (log)
        console.log ('primium', result.data)

      if (result.data.s !== 'ok') {
        props.errorAdd ([props.symbol, 'option-fee error', result.data.s])
        console.log (props.symbol, 'option-fee error', result.data.s)
        return
      }

      //** copy and convert date format of result.data */
      var lineArr = []
      var OptionQuoteFiltered = {}
      OptionQuoteFiltered.expiration = [] 
      OptionQuoteFiltered.firstTraded = []
      OptionQuoteFiltered.updated = []
      const rows = result.data.expiration.length;  // row count
      Object.keys(result.data).forEach((key) => {

        // delete result.data.optionSymbol
        // delete result.data.s
        if (key === 's' || key === 'optionSymbol')
          return;

          // convert date to YYYY-mm-dd format
          OptionQuoteFiltered[key] = []
          for (let i = 0; i < rows; i++) {
            if (key === 'expiration' || key === 'firstTraded' || key === 'updated') {
              OptionQuoteFiltered.expiration[i] = getDate_YYYY_mm_dd__(new Date(result.data.expiration[i] * 1000))
              OptionQuoteFiltered.firstTraded[i] = getDate_YYYY_mm_dd__(new Date(result.data.firstTraded[i] * 1000))
              OptionQuoteFiltered.updated[i] = getDate_YYYY_mm_dd__(new Date(result.data.updated[i] * 1000))
            }
            else {
              OptionQuoteFiltered[key][i] = result.data[key][i]; // all other just copy
            }
            if (key === 'expiration')
              lineArr.push (i) 
          }
        } )
      console.log ('filtered', OptionQuoteFiltered)
      setLineNumberArr(lineArr);
      if (log)
        console.log ('lineNumberArr', lineArr)

      
      //** calc yearly yield */
      const miliNow = Date.now()
      OptionQuoteFiltered.yield_ = OptionQuoteFiltered.yield_ || [];
      OptionQuoteFiltered.yearlyYield = OptionQuoteFiltered.yearlyYield || [];
      OptionQuoteFiltered.breakEven = OptionQuoteFiltered.breakEven || [];
      for (let i = 0; i < rows; i++) {
      const mid = OptionQuoteFiltered.mid[i];
        const dte = OptionQuoteFiltered.dte[i];

        const yield_ = (mid / props.stockPrice);
        const yearlyYield = compoundYield ? ((yield_ + 1) ** (365 / dte)).toFixed(4) : ((yield_ ) * (365 / dte)).toFixed(4);

        const breakEven = (OptionQuoteFiltered.strike[i] + OptionQuoteFiltered.mid[i]);


        OptionQuoteFiltered.yield_[i] = ! percent ? yield_.toFixed(4) : (yield_ * 100).toFixed(3);  
        OptionQuoteFiltered.yearlyYield[i] = ! percent ? yearlyYield : Number(yearlyYield * 100).toFixed(3);
        OptionQuoteFiltered.breakEven[i] = breakEven.toFixed(4); // add breakEven to OptionQuoteFiltered

        if (log)
          console.log ('expiration=', OptionQuoteFiltered.expiration[i], 'strike', OptionQuoteFiltered.strike[i], 
            'dte(days)=', result.data.dte[i], 'yield', yield_.toFixed(3), 'yearlyYield=', yearlyYield,
          )  
      }
      // if (!columnShow.includes('yield_')) // if gain is not in columnShow, add it
      //   columnShow.push('yield_')
      // if (!columnShow.includes('yearlyYield')) // if yearlyGain is not in columnShow, add it
      //   columnShow.push ('yearlyYield'); // add yearlyGain to columnShow_  
      // if (!columnShow.includes('breakEven')) // if breakEven is not in columnShow, add it
      //   columnShow.push ('breakEven');   



      const keys = Object.keys(OptionQuoteFiltered);

      //** find highest yearlyYield */
      var maxYearlyYield_ = 0;
     for (let i = 0; i < rows; i++) {
        if (OptionQuoteFiltered.yearlyYield[i] === 'Infinity')
          continue
         OptionQuoteFiltered.yearlyYield[i] = Number(OptionQuoteFiltered.yearlyYield[i])
         if (OptionQuoteFiltered.yearlyYield[i] > maxYearlyYield_) {
          // if (log)
          //   console.log ('i=', i, 'yearlyYield=', OptionQuoteFiltered.yearlyYield[i], 'maxYearlyYield_',  maxYearlyYield_)  
          maxYearlyYield_ = OptionQuoteFiltered.yearlyYield[i];
          setMaxYearlyYieldIndex(i); // save index of max yearly yield
         }
      }
      setMaxYearlyYield(maxYearlyYield_); // set maxYearlyYield
      setOptionQuote(OptionQuoteFiltered); // take the first one, there could be more
      if (log)
        console.log ('maxYearlyYield=', maxYearlyYield_)


      if(log)
        console.log ('columnShow set to all keys', keys)
      
      // if columnShow is empty, set it to all keys
      if (columnShow_.length === 0) {
        setColumnShow(keys)
        localStorage.setItem('columnShow (keys)', JSON.stringify(keys));
      }

      setOptionKeys(keys)
      if (columnShow.length === 0) {
        setColumnShow(keys) // if columnShow is empty, set it to all keys
        // columnShow__= keys; // update the columnShow_ to all keys
        localStorage.setItem('columnShow', JSON.stringify(keys));
        console.log ('columnShow set to all keys', keys)
      }

      if (log)
        console.log ('keys', Object.keys(result.data))

     })
    // .catch ((err) => {
    //   console.log(err.message)
    //   props.errorAdd ([props.symbol, 'expiration error', err.message])
    // })

  }



  

  

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