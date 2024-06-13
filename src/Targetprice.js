const fs = require ('fs')


const {getDate} = require ('./Utils')

var targetArray = {};   // key is symbol saved one obj per stock

const LOG = true;
const date = getDate();

var lastWriteMili;

// read gain from local file once on startup
fs.readFile('txt/target.txt', 'utf8', (err, data) => {
  if (err) {
    targetArray = {};
  }
  if (data)
    targetArray = JSON.parse(data);
  const keys = Object.keys(targetArray);
  console.log('\n', getDate(), 'txt/target.txt  read count=', keys.length)

    var symbols = "";
    for (var i = 0; i < keys.length; i++)
    //   console.log (JSON.stringify (target[keys[i]]))
        symbols += keys[i] + ' (' + targetArray[keys[i]].length + ')  '
    console.log(symbols)
});

var readCount, writeCounter;

// write all to disk
var writeCount = 0
function targetPriceFlush () {
    if (Object.keys(targetArray).length === 0) // avoid write of empty
        return;

    fs.writeFile ('txt/target.txt', JSON.stringify (targetArray), err => {
        if (err) {
            console.log(getDate(), 'txt/target.txt write fail', err)
        }
        else
            console.log(getDate(), 'txt/target.txt write, sym count=', Object.keys(targetArray).length, 'writeCount=', writeCount )
    })
}


function targetPrice (app)  {
    // nowMili = Date.now();
    // console.log ('targetP')
    app.get('/target', (req, res) => {

        const stock = req.query.stock
        const cmd = req.query.cmd; // R, W, F
        const datNew = req.query.dat

        console.log ('\n',getDate(), ' targetPrice query', stock, cmd, datNew, req.query)
        // res.send ('ok_')
        // return

        if (req.query.cmd === 'delOneSym') { // delete one sym
          if (! targetArray[stock]) {
              console.log ('\n\n', getDate(), stock, ' targetPrice delete missing')
              res.send ('fail, splits symbol missing')
          }
          else {
            targetArray[stock] = null; // remove sym
              console.log ('\n\n', getDate(), stock, ' targetPrice delete done')
              res.send ('ok')
          }
          return;   
       }    
    
        else if (cmd === 'readOne') { // read one stock targetPriceArray
            readCount++;
            const dat = targetArray[stock]
            if (! dat) {
                res.send ('fail, no target price history for sym')
                return;          
            }


            if (LOG|true) {
                console.log ('records:', dat.length)
                for (let i = 0; i < dat.length; i++ )
                    console.log (dat[i])
            }

            if (dat) 
                res.send (JSON.stringify(dat))
            else
                res.send ('fail stock not found')
            return;     
        }

        if (cmd === 'readAll') { 
            readCount++;
            // const dat = target[stock]
            // if (LOG|true) {
            //     console.log ('records:', dat.length)
            //     for (let i = 0; i < dat.length; i++ )
            //         console.log (dat[i])
            // }
            console.log (getDate(), 'TargetPrice read All',  Object.keys(targetArray))

            res.send (JSON.stringify(targetArray))
   
            return;     
        }



        else if (cmd === 'writeOne') {  // write one stock
            if (! stock) {
                res.send ('fail, missing stock') 
                console.log (getDate(), stock, 'fail, missing stock')  
                return
            }

            writeCounter++;
            if (LOG)
                console.log ('writeOne ', stock, req.query.dat)
            var dat = JSON.parse(req.query.dat)
            // console.log (getDate(), stock, 'targetPrice new', dat)

            if (!targetArray[stock])
                targetArray[stock]=[] // if missing - add empty array

            // remove adjacent dulicates
            for (let i = 0; i < targetArray[stock].length - 1; i++) {
                if (targetArray[stock][i].target === targetArray[stock][i + 1].target){
                    console.log (i, 'duplicate', targetArray[stock][i].target,targetArray[stock][i+1].target)
                    targetArray[stock].splice(i)
                    i--; // remain on same
                }
            }
           
            // if too many remove some
            const LIMIT = 9;
            if (targetArray[stock].length > LIMIT) {
                // thin too many
                for (let i = 1; i < LIMIT - 2; i += 3) {
                    console.log (stock, 'x', '\x1b[36m remove extra \x1b[0m,', i, targetArray[stock][i])
                    targetArray[stock].splice(i)
                }
            }
            // print
            // console.log(getDate(), stock, 'list', target[stock].length)
            // for (let i = 0; i < target[stock].length; i++) {
            //     console.log (getDate(), stock, i, target[stock][i]) 
            // }

            // if close to last target quit
            if (targetArray[stock].length > 0) {
                const last = targetArray[stock][targetArray[stock].length - 1] // last entry
                if (dat.target / last.target > 0.95 && dat.target / last.target < 1.05) {
                    res.send ('ok');
                    console.log (getDate(), stock, 'target close to last ', dat.target, last.target)
                    return 
                }
            }

            targetArray[stock].push (dat); // add object
            console.log (getDate(), stock, 'new', dat)


            // if (LOG)
                // target[stock].forEach((d)=> {console.log(d)}) //print array
            console.log (getDate(), stock, 'target length ', targetArray[stock].length)

            if (writeCount % 5 === 0) {
                targetPriceFlush()
                lastWriteMili = Date.now()
            }
            else
                console.log ('skip too frequent Writes, writeCount=', writeCount)
            writeCount++;

            res.send ('ok')
            return;           
        }
        else if (cmd === 'moveAll') {  // firbase data replace all for symbol
            if (! stock) {
                res.send ('fail, missing stock') 
                console.log (getDate(), stock, 'fail, missing stock')  
                return
            }
            writeCounter++;
            var dat = JSON.parse(req.query.dat)
            if (LOG)
                console.log (getDate(), stock, 'move from firebase', dat)
            targetArray[stock] = dat // data from firebase replace one sym
            fs.writeFile ('txt/target.txt', JSON.stringify (targetArray), err => {
                if (err) {
                    console.log('txt/target.txt write fail', err)
                }
                else           
                    console.log('txt/target.txt write, count=', Object.keys(targetArray).length)
            })
            lastWriteMili = Date.now()
            res.send ('ok')
            return;           
        }
        else
            res.send (getDate(), cmd, 'fail cmd invalid')

    })
}


module.exports = {targetPrice, targetPriceFlush}
