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
    for (var i = 0; i < keys.length; i++)
    //   console.log (JSON.stringify (target[keys[i]]))
        symbols += keys[i] + ' (' + stockListsArray[keys[i]].length + ')  '
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
    console.log ('stockLists')
    app.get('/stockLists', (req, res) => {

        const listName = req.query.listName
        const cmd = req.query.cmd; // R, W, F
        const datNew = req.query.dat
        const LOG = req.query.LOG

        console.log ('\n',getDate(), ' stocksLists stock=', listName, 'cmd=', cmd, 'datNew=', datNew, 'query=', req.query)
        // res.send ('ok_')
        // return

        if (req.query.cmd === 'delOneSym') { // delete one sym
          if (! stockListsArray[listName]) {
              console.log ('\n\n', getDate(), listName, ' stocksLists delete missing')
              res.send ('fail, splits symbol missing')
          }
          else {
            delete stockListsArray[listName] // remove sym
            console.log ('\n\n', getDate(), listName, ' stocksLists delete done')
            res.send ('ok')
          }
          return;   
       }    
    
        else if (cmd === 'readOne') { // read one stock stocksListsArray
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
            if (LOG)
                console.log ('writeOne ', listName, dat)

            stockListsArray[listName] = dat; // add object
            console.log (getDate(), listName, 'new', dat)


            // if (LOG)
                // target[stock].forEach((d)=> {console.log(d)}) //print array
            console.log (getDate(), listName, 'target length ', stockListsArray[listName].length)

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

        else
            res.send (getDate(), cmd, 'fail cmd invalid')

    })
}


module.exports = {stockLists, stockListsFlush}
