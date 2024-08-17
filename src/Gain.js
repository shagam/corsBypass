const fs = require ('fs')


const {getDate} = require ('./Utils')
const {userAccess} = require ('./Users') 
var gainArray = {};   // key is symbol saved one obj per stock

// const LOG = false;
const date = getDate();
var writeCounter = 0;
var readCount = 0;
var filterCount = 0;
var removeCount = 0;
var lastWriteMili;

// read gain from local file once on startup
fs.readFile('txt/gainArray.txt', 'utf8', (err, data) => {
  if (err) {
    gainArray = {};
  }
  if (data)
    gainArray = JSON.parse(data);
  const keys = Object.keys(gainArray);
  console.log('\n', getDate(), 'txt/gainArray.txt  read count=', keys.length)

    var symbols = "";
    for (var i = 0; i < keys.length; i++)
    //   console.log (JSON.stringify (gainArray[keys[i]]))
        symbols += keys[i] + '  '
    console.log(symbols)
});

var writeCount = 0;
function gainFlush() {
    if (Object.keys(gainArray).length === 0) // avoid write of empty
        return;
    
  fs.writeFile ('txt/gainArray.txt', JSON.stringify (gainArray), err => {
    if (err) {
        console.log (getDate(), 'txt/gainArray.txt write fail', err)
    }
    else
        console.log (getDate(), 'txt/gainArray.txt gain-write, sym-count=', Object.keys(gainArray).length,
        'writeCount=', writeCount)
  })
}

function gain (app)  {
    // nowMili = Date.now();

    app.get('/gain', (req, res) => {
        // console.log ('query params', req.query)
        const stock = req.query.stock
        const cmd = req.query.cmd; // R, W, F
        const symOnly = req.query.symOnly;
        const factor = req.query.factor;
        const LOG = req.query.LOG

        console.log ('\n\n', getDate(), 'gain ', req.query, 'write=', writeCounter, 'read=', readCount,
         'filterCount=', filterCount, 'removeCount=', removeCount)

        if (cmd === 'r' || cmd === 'readOne') { // read one stock
            readCount++;
            const dat = gainArray[stock]
            if (LOG)
                console.log ('r', stock, req.query.dat)
            if (dat) 
                res.send (JSON.stringify(dat))
            else
                res.send ('fail stock not found')
            return;     
        }

        else if (cmd === 'w' || cmd === 'writeOneSym') {  // write one stock
            if (! stock) {
                res.send ('fail, missing stock') 
                console.log ('fail, missing stock')  
                return
            }

            writeCounter++;

            userAccess (req.query.stock, req.query.ip, req.query.city, req.query.country, req.query.region, req.query.os)
            // if (LOG)
                console.log ('gainWrite', req.query)
            var dat = JSON.parse(req.query.dat)
            if (LOG)
                console.log ('w write ', dat)

            if ((stock != 'QQQ') && gainArray['QQQ'] && 

            (
            (Number(dat.mon3) < Number(gainArray['QQQ'].mon3 / factor)) && 
            (Number(dat.mon6) < Number(gainArray['QQQ'].mon6 / factor)) && 
            (Number(dat.year) < Number(gainArray['QQQ'].year / factor)) &&
            (Number(dat.year2) < Number(gainArray['QQQ'].year2 / factor)) &&
            (Number(dat.year5) < Number(gainArray['QQQ'].year5 / factor)) &&
            (Number(dat.year10) < Number(gainArray['QQQ'].year10 / factor))))
           {
            console.log(stock, 'fail, abort write, gain too low')
            res.send ('fail, abort write, gain too low')
            return;
           }

            // console.log (dat)
            gainArray[stock] = dat; // readable format
            console.log (getDate(), 'gainWrite', dat)

            if(LOG)
                console.log (Object.keys(gainArray))


            if (writeCount % 1 === 0) { // write every update
              gainFlush()
              lastWriteMili = Date.now()
            }
            else
                console.log ('gain write, skip too frequent WritesCount', writeCount)
            writeCount ++;

            res.send ('ok')
            return;           
        }
        else if (cmd === 'delOneSym') { // delete one sym
            if (! gainArray[stock]) {
                console.log ('\n\n', getDate(), stock, ' gain delete missing')
                res.send ('fail, gain delete symbol missing')
            }
            else {
                delete gainArray[stock]; // remove sym
                console.log ('\n\n', getDate(), stock, ' gain delete done')
                res.send ('ok')
            }
            return;           
        }

        else if (cmd === 'searchName') { // delete one sym
            const stocks = Object.keys(gainArray)
            var foundList = [];
            for (let i = 0; i < stocks.length; i++) {
                const str = stocks[i]
                // console.log ('includes', str, stock)
                if (str.includes (stock))
                    foundList.push(str)
            }
            res.send (foundList)
            console.log ('\n\n', getDate(), stock, foundList)

            return;           
        }

        else if (cmd === 'a' || cmd === 'getAll') { // get all 
            filterCount ++;
            const keys=Object.keys(gainArray)
            
            console.log ('a  gainAll (', keys.length, ') ', keys, '')
            const filterdObj = {}; 
            if (symOnly) {
                const keys = Object.keys(gainArray)
                keys.map((sym) => {
                    filterdObj[sym] = '';
                })
                res.send (JSON.stringify(filterdObj))
                return;                
            }       
            res.send (JSON.stringify(gainArray))
            return;
        }

        else if (cmd === 'b' || cmd === 'betterThanQQQ_1_2_5_10') {//best 1,2,5,10 years
            filterCount ++;
            if (! gainArray['QQQ']) {
                res.send ('fail missing needed QQQ')
                return;
            }
            const factor = req.query.factor;
            console.log ('b  gainFilter_1_2_5_10 ')
            const filterdObj = {};
            Object.keys(gainArray).forEach ((sym) => {
                if (! gainArray[sym].year || ! gainArray[sym].year2 || ! gainArray[sym].year5 || ! gainArray[sym].year10)
                    console.log ('missing year ', gainArray[sym])
                    //  continue;
            
                
                if (LOG)
                    console.log (sym, 'before Switch', gainArray[sym].year, 'qqqValue=', qqqValue, 'period=', period)
                if (Number(gainArray[sym].year) > Number(gainArray['QQQ'].year * factor) ||
                 (Number(gainArray[sym].year2) > Number(gainArray['QQQ'].year2 * factor)) ||
                 (Number(gainArray[sym].year5) > Number(gainArray['QQQ'].year5 * factor)) ||
                 (Number(gainArray[sym].year10) > Number(gainArray['QQQ'].year10 * factor))) 
                {
                    if (symOnly)
                        filterdObj[sym]=''
                    else
                        filterdObj[sym] = gainArray[sym]
                }
            })
            const keys=Object.keys(filterdObj)
            console.log(getDate(), keys.length, keys)
            res.send (JSON.stringify(filterdObj))
        }

        else if (cmd === 'd'|| cmd === 'listForDelete') {//get list for remove gain 1,2,5,10

            filterCount ++;
            if (! gainArray['QQQ'] || ! gainArray['QQQ'].year) {
                res.send ('fail missing needed QQQ')
                return;
            }
            // console.log ('verify QQQ exists', gainArray['QQQ']) // 
            const factor = req.query.factor; // overRide 
            if (Number(factor) < 1.05) {
                console.log ('fail, factor too small:', factor)
                res.send ('fail, del bad factor. need to be above 1.05')
                return;
            }
            console.log ('d  list of bad_1_2_5_10  factor=', factor)
            const filterdObj = {};
            Object.keys(gainArray).forEach ((sym) => {
                if (! gainArray[sym] || ! gainArray[sym].year) {
                    res.send ('fail, missing year ' + sym + ' ' + gainArray[sym])
                    return
                }
                // console.log ('verify QQQ exists', gainArray['QQQ']) // 
                if (
                 (Number(gainArray[sym].year * factor) < Number(gainArray['QQQ'].year)) &&
                 (Number(gainArray[sym].year2 * factor) < Number(gainArray['QQQ'].year2)) &&
                 (Number(gainArray[sym].year5 * factor) < Number(gainArray['QQQ'].year5)) &&
                 (Number(gainArray[sym].year10 * factor) < Number(gainArray['QQQ'].year10))) 
                {
                    if (LOG)
                        onsole.log (sym, 'bad gain')
                     if (symOnly)
                        filterdObj[sym]=''
                    else
                        filterdObj[sym] = gainArray[sym]
                    // delete gainArray[sym]
                }
            })
            const keys=Object.keys(filterdObj)
            console.log(getDate(), keys.length, keys)
            res.send (JSON.stringify(filterdObj))
        }

        else if (cmd === 'f' || cmd === 'filterBetterThanQQQ') { // get best
            filterCount++;
            const period = req.query.period;
            const factor = req.query.factor;
            const qqqValue = req.query.qqqValue;

            const filterdObj = {}

            Object.keys(gainArray).forEach ((sym) => {
                
                if (true || gainArray[sym].year &&  gainArray[sym].year2 &&  gainArray[sym].year5 && gainArray[sym].year10) {


                if (LOG)
                    console.log (sym, 'before Switch', gainArray[sym].year)
                switch (Number(period)){
                    case 1:
                        if (LOG)
                            console.log (sym, 'filter year val', gainArray[sym].year, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year) > Number(qqqValue * factor)){
                            if (symOnly)
                                filterdObj[sym]=''
                            else
                                filterdObj[sym] = gainArray[sym]
                        }
                        break;
                    case 2:
                        if (LOG)
                        console.log (sym, 'filter year val', gainArray[sym].year2, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year2) > Number(qqqValue * factor)){
                            if (symOnly)
                                filterdObj[sym]=''
                            else       
                                filterdObj[sym] = gainArray[sym]
                        }
                        break;
                    case 5:
                        if (LOG)
                            console.log (sym, 'filter year val', gainArray[sym].year5, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year5) > Number(qqqValue * factor)){
                            if (symOnly)
                                filterdObj[sym]=''
                            else
                                filterdObj[sym] = gainArray[sym]
                        }
                        break;
                    case 10:
                        if (LOG)
                            console.log (sym, 'filter year val', gainArray[sym].year10, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year10) > Number(qqqValue * factor)){
                            if (symOnly)
                                filterdObj[sym]=''
                            else
                                filterdObj[sym] = gainArray[sym]
                        }
                        break;                       
                }
            } 
            else
                console.log ('missing year', gainArray[sym])  // missing year or year2     
            })
            // if (LOG)
            console.log(getDate(), Object.keys(filterdObj))
            res.send (JSON.stringify(filterdObj))
        }
        else if (cmd === 'p' || cmd === 'purgeList') { // remove list
            removeCount++;
            var dat = JSON.parse(req.query.dat)
            console.log('stocks for remove', dat.length, dat)
            dat.forEach ((sym) => {
            if (LOG)
                console.log (sym, 'remove')
                delete gainArray[sym]
            })
            // console.log(getDate())
            res.send ('ok')
        }
        //** delete sym with missing year, year2 ... */
        else if (cmd === 'verifyAll') {
            const keys = Object.keys(gainArray);
            console.log ('countBefore=', keys.length)
            keys.forEach ((sym) => {
            
                if (! gainArray[sym].year === null)
                    console.log ('missing year')
                if (LOG)
                    console.log (gainArray[sym])
                else
                    console.log (JSON.stringify(gainArray[sym]))

                if (gainArray[sym] === undefined)
                    delete gainArray.sym                    
                // console.log (gainArray[sym][year], gainArray[sym][year2], gainArray[sym][year5], gainArray[sym][year10])
                // if (! gainArray[sym].year || ! gainArray[sym].year2 || ! gainArray[sym].year5 || ! gainArray[sym].year10)  {
                //     console.log ('gain verify delete ', gainArray.sym)
                //     delete gainArray.sym
                // }
            })
            console.log ('countAfter=', Object.keys(gainArray).length)
            res.send ('ok')
        }

        else
            res.send ('fail cmd invalid')

    })
}


module.exports = {gain, gainFlush}
   