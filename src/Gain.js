const fs = require ('fs')


const {getDate} = require ('./Utils')

var gainArray = {};   // key is symbol saved one obj per stock

const LOG = false;
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
        console.log (getDate(), 'txt/gainArray.txt write, sym count=', Object.keys(gainArray).length,
        'writeCount=', writeCount)
  })
}

function gain (app)  {
    // nowMili = Date.now();

    app.get('/gain', (req, res) => {

        const stock = req.query.stock
        const cmd = req.query.cmd; // R, W, F
        const symOnly = req.query.symOnly;
        const factor = req.query.factor;

        console.log ('\n', date, 'gain cmd=', cmd, 'stock=', stock, 'factor=', factor, 'write=', writeCounter, 'read=', readCount,
         'filterCount=', filterCount, 'removeCount=', removeCount, 'symOnly=', symOnly)

        if (cmd === 'r') { // read one stock
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

        else if (cmd === 'w') {  // write one stock
            if (! stock) {
                res.send ('fail, missing stock') 
                console.log ('fail, missing stock')  
                return
            }

            writeCounter++;
            if (LOG)
                console.log ('w write ', req.query.dat)
            var dat = JSON.parse(req.query.dat)

            if ((stock != 'QQQ') &&
            ((Number(dat.year) < Number(gainArray['QQQ'].year / factor)) ||
            (Number(dat.year2) < Number(gainArray['QQQ'].year2 / factor)) ||
            (Number(dat.year5) < Number(gainArray['QQQ'].year5 / factor)) ||
            (Number(dat.year10) < Number(gainArray['QQQ'].year10 / factor))))
           {
            console.log(stock, 'fail, abort write, gain too low')
            res.send ('fail, abort write, gain too low')
            return;
           }

            // console.log (dat)
            gainArray[stock] = dat; // readable format

            if(LOG)
                console.log (Object.keys(gainArray))


            if (writeCount % 5 === 0) {
              gainFlush()
              lastWriteMili = Date.now()
            }
            else
                console.log ('skip too frequent Writes count', writeCount)
            writeCount ++;

            res.send ('ok')
            return;           
        }
        else if (cmd === 'a') { // get all 
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

        else if (cmd === 'b') {//best 1,2,5,10 years
            filterCount ++;
            if (! gainArray['QQQ']) {
                res.send ('fail missing needed QQQ')
                return;
            }
            const factor = req.query.factor;
            console.log ('b  gainFilter_1_2_5_10  factor=', factor)
            const filterdObj = {};
            Object.keys(gainArray).forEach ((sym) => {
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

        else if (cmd === 'd') {//get list for remove gain 1,2,5,10
            filterCount ++;
            if (! gainArray['QQQ']) {
                res.send ('fail missing needed QQQ')
                return;
            }
            const factor = req.query.factor; // overRide 
            if (Number(factor) < 1.05) {
                console.log ('fail, factor too small:', factor)
                res.send ('fail, del bad factor. need to be above 1.05')
                return;
            }
            console.log ('d  list of bad_1_2_5_10  factor=', factor)
            const filterdObj = {};
            Object.keys(gainArray).forEach ((sym) => {

                if (Number(gainArray[sym].year * factor) < Number(gainArray['QQQ'].year) &&
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

        else if (cmd === 'f') { // get best
            filterCount++;
            const period = req.query.period;
            const factor = req.query.factor;
            const qqqValue = req.query.qqqValue;
            console.log ('f gainFilter periodYears=', period, ' factor=', factor, 'qqqValue=', qqqValue)
            const filterdObj = {}

            Object.keys(gainArray).forEach ((sym) => {
                if (LOG)
                    console.log (sym, 'before Switch', gainArray[sym].year, 'qqqValue=', qqqValue, 'period=', period)
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
            })
            // if (LOG)
            console.log(getDate(), Object.keys(filterdObj))
            res.send (JSON.stringify(filterdObj))
        }
        else if (cmd === 'p') { // remove list
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

        else
            res.send ('fail cmd invalid')

    })
}


module.exports = {gain, gainFlush}
   