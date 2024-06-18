const fs = require ('fs')
const axios = require('axios')


const {getDate} = require ('./Utils')
const FAIL = 'Request failed with status code 404'

const print_textFiles = false
const miliInADay = 24 * 3600 * 1000;
// read holdingArray from local file once on startup
var holdingsArray = {};    // saved one obj per stock
fs.readFile('txt/holdingsArraySch.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  if (data === undefined)
    holdingsArray == []
  else
    holdingsArray = JSON.parse(data);

  const keys = Object.keys(holdingsArray);
  console.log('\n', getDate(), 'txt/holdingsArraySch.txt  read count=', keys.length)
  // if (print_textFiles)
  //   for (var i = 0; i < keys.length; i++)
  //     console.log ('\n', keys[i], JSON.stringify (holdingsArray[keys[i]]))
  // else {
    var symbols ="";
    for (var i = 0; i < keys.length; i++)
      if (holdingsArray[keys[i]])
        symbols += keys[i] +' (' + JSON.stringify (holdingsArray[keys[i]]).length + ')  '
      else
        console.log(' holdingsSch mismatch', keys[i])
    console.log (symbols)
  // }
  // for (var i = 0; i < keys.length; i++)
  //   console.log (keys[i])
});


var writeCount = 0;
function holdingsSchFlush() {
  if (Object.keys(holdingsArray).length === 0) // avoid write of empty
    return;
  fs.writeFile ('txt/holdingsArraySch.txt', JSON.stringify(holdingsArray), err => {
    if (err) {
      console.log(getDate(), 'txt/holdingsArraySch.txt write fail', err.message)
    }
    else
      console.log(getDate(), 'txt/holdingsArraySch.txt write, sym count',
    Object.keys(holdingsArray).length, 'writeCount=', writeCount)

  })
  writeCount++
}



// http://localhost:5000/holdings?stock=AAPL

function holdingsSch (req, res, daysDelay) {
    // console.log ('\nholdings', req.query.stock)

    const stock = req.query.stock;
    const LOG = req.query.LOG

    if (req.query.cmd === 'delOneSym') { // delete one sym
      if (! holdingsArray[stock]) {
          console.log ('\n\n', getDate(), stock, ' holdingsSch delete missing')
          res.send ('fail, holdingsSch symbol missing')
      }
      else {
        holdingsArray[stock] = null; // remove sym
          console.log ('\n\n', getDate(), stock, ' holdingsSch delete done')
          res.send ('ok')
      }
      return;   
   }    
  

   // search saved holdings retrieved lately
   const updateMili = Date.now();
   const updateDate = getDate()
   var diff;
   if (!req.query.ignoreSaved) {
     var savedHoldings = holdingsArray [req.query.stock];

     if (savedHoldings && savedHoldings.updateMili)
       diff = updateMili - savedHoldings.updateMili

     if (savedHoldings && savedHoldings.updateMili && (updateMili - savedHoldings.updateMili)  < daysDelay * miliInADay) {
       console.log (updateDate, 'holdingsSch', req.query.stock, '\x1b[36m Saved found\x1b[0m,',
       ' saveCount=', Object.keys(holdingsArray).length)
      
     if (savedHoldings.holdArr === FAIL || true)
      if (LOG)
      console.log (req.query.stock, updateDate, savedHoldings )
       if (savedHoldings.length == 1)
         res.send ('')
       else
         res.send (JSON.stringify(savedHoldings))
       return;
     }
     else {  // delete old wrong saved format
       holdingsArray [req.query.stock] = undefined;
       console.log ("\n", req.query.stock, updateDate, 'holdingsSch', '\x1b[31m missing or old\x1b[0m days=', (diff / miliInADay).toFixed(0), savedHoldings);
       savedHoldings = undefined;
     }

   
     // avoid getting from url if any holdings is recent
     if (req.query.savedHoldings) {
       for (var i = 0; i < savedHoldings.length; i++) {
         const oneHoldings = savedHoldings[i];
         if (oneHoldings.year === undefined)
           continue;
         const holdingsDate = new Date([oneHoldings.year, oneHoldings.month, oneHoldings.day])
         const today = new Date();
         // console.log ('checkIfOld', today.getDate(), holdingsDate.getDate()) 
         if ((today.getTime() - holdingsDate.getTime()) / miliInADay < 180) { // less than 180 days
           console.log (req.query.stock, updateDate, 'recentHoldingsSch', holdingsDate.toLocaleDateString())
           console.dir (oneHoldings)
           if (oneHoldings.length == 1)
             res.send ('')
           else
             res.send (JSON.stringify(oneHoldings))
           return;
         }
       }
     }
   }
 
{/* <tr class="alt"><td class="symbol firstColumn" tsraw="QCOM">QCOM</td><td class="description" tsraw="Qualcomm Inc"><span>Qualcomm Inc</span></td><td class="data" tsraw="4.11">4.11%</td><td class="data" tsraw="4175052">4.2M</td><td class="data lastColumn" tsraw="712138620">$712.1M</td></tr> */}
// http://dinagold.org:5000/holdingsSch?stock=QQQ
  var url = 'https://www.schwab.wallst.com/schwab/Prospect/research/etfs/schwabETF/index.asp?type=holdings&symbol=' + req.query.stock
  //  console.log (url)
  // console.log (url)
  const options = {
    "method": "GET",
  };

  axios.get (url)
  .then ((result) => {
    const text = result.data;
    // console.log (text)


    // get stock array
    var pattern='<td class="symbol firstColumn" tsraw="QCOM">QCOM'
    pattern = '<td class="symbol firstColumn" tsraw="([A-Z]+)">([A-Z]+)'

    var stocks=[];
    var rx = new RegExp (pattern,'g');
    while ((rs = rx.exec(text)) !== null){
        stocks.push(rs[1]);
      };
    // pattern= '<td class="rlpad svelte-1jtwn20">[A-Z\\.]+</td>'
    // var rx = new RegExp (pattern,'g');
    // while ((rs = rx.exec(text)) !== null){
    //   stocks.push(rs[1]);
    // };

    // get percentage array

    var percent = [];
    //pattern = '<td class="svelte-1jtwn20">8.74%</td>'
    // <td class="data" tsraw="4.11">4.11%</td>
    pattern = '<td class="data" tsraw="([0-9\\.]+)">([0-9\\.]+)%</td>'
    rx = new RegExp (pattern,'g');
      while ((rs = rx.exec(text)) !== null){
        percent.push(Number(rs[1]).toFixed(2));
    };


    // build jason for send 
    // console.log (JSON.stringify(percent))
    var holdingArray = [];
    holdingArray.push ({sym: stocks.length, perc: percent.length})
    for (let i = 0; i < stocks.length; i++)
        holdingArray.push ({sym: stocks[i], perc: percent[i]})

    console.log (req.query.stock, updateDate, 'sym=', stocks.length, 'percent=', percent.length, 'combined-records=', holdingArray.length)

    // save local holdingsSch
    const holdingsObg = {sym: req.query.stock, updateMili: updateMili, updateDate: updateDate, holdArr: holdingArray}
    holdingsArray [req.query.stock] = holdingsObg;
    // console.dir (holdingsArray)

    if (writeCount % 5 === 0)
      holdingsSchFlush() 
    else
      console.log ('Holdings skip write too frequent, writescount', writeCount)
    writeCount ++ 

    res.send(JSON.stringify(holdingsObg))
  })
  .catch ((err) => {
    console.log(req.query.stock, updateDate, err.message)
    res.send(err.message)
  })

}

function holdingsSchMain (app) {
// holdings of a stock
  const DAYS_DELAY = 3;
  app.get('/holdingsSch', (req, res) => {

    // const ipAddress = req.header('x-forwarded-for') || req.socket.remoteAddress;
    console.log ('\n', getDate(), 'holdingsSch', req.query)
    var nowMili = Date.now();
    holdingsSch (req, res, DAYS_DELAY)
    console.log (getDate(), 'holdingsSch delay=', Date.now() - nowMili)
  })
} 
module.exports = {holdingsSchMain, holdingsSchFlush}



