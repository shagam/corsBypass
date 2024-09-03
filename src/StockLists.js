const fs = require ('fs')


const {getDate} = require ('./Utils')

var stockListsArray = {};   // key is symbol saved one obj per stock

const LOG = true;
const date = getDate();

var lastWriteMili;

// read gain from local file once on startup
fs.readFile('txt/stocksLists', 'utf8', (err, data) => {
  if (err) {
    console.log ('txt/stocksLists read fail')
    stockListsArray = {};
  }
  if (data)
    stockListsArray = JSON.parse(data);
  const keys = Object.keys(stockListsArray);
  console.log('\n', getDate(), 'txt/stocksLists  read count=', keys.length)

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

    fs.writeFile ('txt/stocksLists', JSON.stringify (stockListsArray), err => {
        if (err) {
            console.log(getDate(), 'txt/stocksLists write fail', err)
        }
        else
            console.log(getDate(), 'txt/stocksLists write, sym count=', Object.keys(stockListsArray).length, 'writeCount=', writeCount )
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
            console.log ('nameArrayAll=', nameArrayAll, 'filterName=', listName)  
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

            writeCounter++;
            const dat = JSON.parse(req.query.dat)
            const obj = {
                stocks: dat,
                ip: req.query.ip,
                date: getDate()
            }
            if (LOG)
                console.log (listName, obj)

            if (stockListsArray[listName]) {
                console.log ('write replaces old=', stockListsArray[listName]) 
            }
            stockListsArray[listName] = obj; // add object

            if (writeCount % 1 === 0) { // write every time
                stockListsFlush()
                lastWriteMili = Date.now()
            }
            else
                console.log ('skip too frequent Writes, writeCount=', writeCount)
            writeCount++;

            res.send ('ok')
            return;           
        }


        else if (cmd === 'filterNames') {  // write one stock
            const nameArrayFiltered = [];

            for (let i = 0; i < nameArrayAll.length; i++) {
                if (LOG && req.query.ip)
                console.log ('filter, req.query.ip=',  req.query.ip, 'listIp=', stockListsArray[nameArrayAll[i]].ip)
                if (req.query.ip && req.query.ip !== stockListsArray[nameArrayAll[i]].ip) {
                    console.log ('filterNames skip, diffErent request ip=',
                         req.query.ip, 'listIp=', stockListsArray[nameArrayAll[i]].ip)
                    continue; // send only my lists? or all
                }
                if (! req.query.filterName || nameArrayAll[i].toUpperCase().indexOf(req.query.filterName.toUpperCase()) !== -1)
                    nameArrayFiltered.push (nameArrayAll[i])
            }
            res.send(nameArrayFiltered)
            console.log ('filtered list names=',  nameArrayFiltered.length, nameArrayFiltered)
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
            console.log ('getOne', obj)
        }


        else if (cmd === 'delOne') {  // write one stock
            const listName = req.query.listName;
            if (! stockListsArray[listName]) {
                console.log ('delOne missing=', listName)
                res.send('fail, missing=' + listName)
                return;
            }

            if (stockListsArray[listName] && ! req.query.admin
                 && req.query.ip !== stockListsArray[listName].ip) {
                res.send('fail, del rejected, delete only from same ip;  listName=' + listName)
                return;
            }

            delete stockListsArray[listName]
            res.send('ok')
        }


        else
            res.send (getDate(), cmd, 'fail cmd invalid')

    })
}


module.exports = {stockLists, stockListsFlush}
