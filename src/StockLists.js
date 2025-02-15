const fs = require ('fs')


const {getDate} = require ('./Utils')

var stockListsArray = {};   // key is symbol saved one obj per stock

const LOG = true;
const date = getDate();

var lastWriteMili;

// read gain from local file once on startup
fs.readFile('txt/stocksLists.txt', 'utf8', (err, data) => {
  if (err) {
    console.log ('txt/stocksLists.txt read fail')
    stockListsArray = {};
  }
  if (data)
    stockListsArray = JSON.parse(data);
  const keys = Object.keys(stockListsArray);
  console.log('\n', getDate(), 'txt/stocksLists.txt  read count=', keys.length)

    var symbols = "";
    for (var i = 0; i < keys.length; i++) {
        //   console.log (JSON.stringify (target[keys[i]]))
        if (stockListsArray[keys[i]].stocks)
            symbols += keys[i] + ' (' + stockListsArray[keys[i]].stocks.length + ')  '
        else
            symbols += keys[i] + ' (' + stockListsArray[keys[i]].length + ') ^stocks^ '
        // console.log ('\n\n', keys[i], stockListsArray[keys[i]])
    }
    console.log(symbols)
});

var readCount, writeCounter;

// write all to disk
var writeCount = 0
function stockListsFlush () {
    if (Object.keys(stockListsArray).length === 0) // avoid write of empty
        return;

    fs.writeFile ('txt/stocksLists.txt', JSON.stringify (stockListsArray), err => {
        if (err) {
            console.log(getDate(), 'txt/stocksLists.txt write fail', err)
        }
        else
            console.log(getDate(), 'txt/stocksLists.txt write, sym count=', Object.keys(stockListsArray).length, 'writeCount=', writeCount )
    })
}


function stockLists (app)  {

    app.get('/stockLists', (req, res) => {

        const listName = req.query.listName
        const cmd = req.query.cmd; // R, W, F
        const datNew = req.query.dat
        const LOG = req.query.LOG
        const nameArrayAll = Object.keys(stockListsArray)
        
        console.log ('\n\n', getDate(), 'stockList', req.query)

        if (LOG) {
            console.log (getDate(), 'nameArrayAll=', nameArrayAll, 'filterName=', listName)  
        }

   
         if (cmd === 'readOne') { // read one stock stocksListsArray
            readCount++;
            const dat = stockListsArray[listName]
            if (! dat) {
                res.send ('fail, no target price history for sym')
                return;          
            }

            if (dat) 
                res.send (dat)
            else
                res.send ('fail stock not found')
            return;     
        }


        else if (cmd === 'writeOne') {  // write one stock
            const listName = req.query.listName
            if (! listName) {
                res.send ('fail, missing stock') 
                console.log (getDate(), listName, 'fail, missing stock')  
                return
            }

            if (! req.query.admin && stockListsArray[listName] && stockListsArray[listName].ip !== req.query.ip) {
                console.log (getDate(), 'fail, write over different ip listName=', listName, 
                    'oldList ip=', stockListsArray[listName].ip, ' new write ip=', req.query.ip)  
                res.send('fail, write over different ip listName=' + listName + 
                    '  oldList ip=' + stockListsArray[listName].ip + ' new write ip=' + req.query.ip)
                return;
            }

            writeCounter++;
            const dat = JSON.parse(req.query.dat)
            const obj = {
                stocks: dat,
                ip: req.query.ip,
                date: getDate()
            }
            if (LOG)
                console.log (getDate(), listName, obj)

            if (stockListsArray[listName]) {
                console.log (getDate(), 'write replaces old=', listName, stockListsArray[listName], 'oldIp=', stockListsArray[listName].ip) 
            }
            stockListsArray[listName] = obj; // add object

            if (writeCount % 1 === 0) { // write every time
                stockListsFlush()
                lastWriteMili = Date.now()
            }
            else
                console.log (getDate(), 'skip too frequent Writes, writeCount=', writeCount)
            writeCount++;

            res.send ('ok')
            return;           
        }


        else if (cmd === 'filterNames') {  // write one stock
            const nameArrayFiltered = [];
            if (LOG)
                console.log (stockListsArray, 'count=' + Object.keys(stockListsArray).length)

            for (let i = 0; i < nameArrayAll.length; i++) {
                if (req.query.ip)
                    console.log ('filter,',  'listIp=', stockListsArray[nameArrayAll[i]].ip, nameArrayAll[i])
                if (req.query.filterName && nameArrayAll[i].toUpperCase().indexOf(req.query.filterName.toUpperCase()) === -1)
                    continue; // txt not found

                if (req.query.ip) {
                    if (req.query.myIp && req.query.ip === stockListsArray[nameArrayAll[i]].ip ||
                        req.query.otherIp && req.query.ip !== stockListsArray[nameArrayAll[i]].ip) {
                        if (LOG)
                            console.log ('filterNames request', req.query.ip, 'listIp=', nameArrayAll[i], tockListsArray[nameArrayAll[i]].ip)
                        nameArrayFiltered.push (nameArrayAll[i])
                    }
                }
                else {

                }
            }
            res.send(nameArrayFiltered)
            console.log (getDate(), 'filtered list names=',  nameArrayFiltered.length, nameArrayFiltered)
        }


        else if (cmd === 'getOne') {  // write one stock
            const listName = req.query.listName;
            if (LOG)
                console.log (listName, stockListsArray[listName] )
            const obj = {
                listName: listName,
                stocks: stockListsArray[listName].stocks,
                date: stockListsArray[listName].date,
                ip:  stockListsArray[listName].ip
            }
            res.send(obj)
            console.log (getDate(), 'getOne', obj)
        }


        else if (cmd === 'delOne') {  // write one stock
            const listName = req.query.listName;
            if (! stockListsArray[listName]) {
                console.log (getDate(), 'delOne missing=', listName)
                res.send('fail, missing=' + listName)
                return;
            }

            if (stockListsArray[listName]) {
                if (req.query.ip !== stockListsArray[listName].ip && ! req.query.delOtherIp) {
                    console.log (getDate(), 'fail, delete only from same ip;  listName=' + listName)
                    res.send('fail, delete allowed only from same ip;  listName=' + listName)
                    return;
                }
            }

            delete stockListsArray[listName]
            console.log(getDate(), 'delete ok list=', listName)
            res.send('ok, delete')
        }


        else {
            res.send (cmd + ' fail cmd invalid')
            console.log(getDate, ' fail cmd invalid')
        }
    })
}


module.exports = {stockLists, stockListsFlush}
