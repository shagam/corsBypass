const fs = require ('fs')


const {getDate} = require ('./Utils')

var gainArray = {};   // key is symbol saved one obj per stock

const LOG = false;
const date = getDate();

// read gain from local file once on startup
fs.readFile('gainArray.txt', 'utf8', (err, data) => {
  if (err) {
    gainArray = {};
  }
  if (data)
    gainArray = JSON.parse(data);
  const keys = Object.keys(gainArray);
  console.log('\n', getDate(), 'gainArray.txt  read count=', keys.length)

    var symbols = "";
    for (var i = 0; i < keys.length; i++)
    //   console.log (JSON.stringify (gainArray[keys[i]]))
        symbols += keys[i] + '  '
    console.log(symbols)
});


function gain (app)  {
    // nowMili = Date.now();

    app.get('/gain', (req, res) => {

        const stock = req.query.stock
        const cmd = req.query.cmd; // R, W, F
        // const dat = req.query.dat
        console.log ('\n', stock, date, 'gain  cmd=', cmd)
        // res.send ('ok')
        // return;  

        if (cmd === 'r') { // read one stock
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
            if (LOG)
                console.log ('w write ', req.query.dat)
            var dat = JSON.parse(req.query.dat)
            // dat = req.query.dat
            // console.log (dat)
            gainArray[stock] = dat; // readable format
            console.log (Object.keys(gainArray))
            fs.writeFile ('gainArray.txt', JSON.stringify (gainArray), err => {
                if (err) {
                    console.log('gainArray.txt write fail', err)
                }
                else
                    console.log('gainArray.txt write,, count=', Object.keys(gainArray).length)
            })
            res.send ('ok')
            return;           
        }
        else if (cmd === 'a') { // get all 
            const keys=Object.keys(gainArray)
            console.log ('a  gainAll (', keys.length, ') ', keys)        
            res.send (JSON.stringify(gainArray))
            return;
        }

        else if (cmd === 'b') {//best
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
                    filterdObj[sym] = gainArray[sym]
                }
            })
            const keys=Object.keys(filterdObj)
            console.log(getDate(), keys.length, keys)
            res.send (JSON.stringify(filterdObj))
        }

        else if (cmd === 'f') { // get best
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
                        if (Number(gainArray[sym].year) > Number(qqqValue * factor))
                            filterdObj[sym] = gainArray[sym]
                        break;
                    case 2:
                        if (LOG)
                        console.log (sym, 'filter year val', gainArray[sym].year2, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year2) > Number(qqqValue * factor))
                            filterdObj[sym] = gainArray[sym]
                        break;
                    case 5:
                        if (LOG)
                            console.log (sym, 'filter year val', gainArray[sym].year5, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year5) > Number(qqqValue * factor))
                            filterdObj[sym] = gainArray[sym]
                        break;
                    case 10:
                        if (LOG)
                            console.log (sym, 'filter year val', gainArray[sym].year10, 'q*f', qqqValue* factor)
                        if (Number(gainArray[sym].year10) > Number(qqqValue * factor))
                            filterdObj[sym] = gainArray[sym]
                        break;                       
                }         
            })
            // if (LOG)
            console.log(getDate(), Object.keys(filterdObj))
            res.send (JSON.stringify(filterdObj))
        }
        else
            res.send ('fail cmd invalid')

    })
}


module.exports = {gain}
