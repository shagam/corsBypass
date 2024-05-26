const fs = require ('fs')


const {getDate} = require ('./Utils')

var target = {};   // key is symbol saved one obj per stock

const LOG = true;
const date = getDate();

var lastWriteMili;

// read gain from local file once on startup
fs.readFile('txt/target.txt', 'utf8', (err, data) => {
  if (err) {
    target = {};
  }
  if (data)
    target = JSON.parse(data);
  const keys = Object.keys(target);
  console.log('\n', getDate(), 'txt/target.txt  read count=', keys.length)

    var symbols = "";
    for (var i = 0; i < keys.length; i++)
    //   console.log (JSON.stringify (target[keys[i]]))
        symbols += keys[i] + ' (' + target[keys[i]].length + ')  '
    console.log(symbols)
});

var readCount, writeCount;

function targetPrice (app)  {
    // nowMili = Date.now();
    // console.log ('targetP')
    app.get('/target', (req, res) => {

        const stock = req.query.stock
        const cmd = req.query.cmd; // R, W, F
        const datNew = req.query.dat

        console.log ('\n',getDate(), ' targetPrice ', stock, cmd, datNew)
        // res.send ('ok_')
        // return


        if (cmd === 'r') { // read one stock
            readCount++;
            const dat = target[stock]
            if (LOG)
                console.log ('r', stock, req.query.dat)
            if (dat) 
                res.send (JSON.stringify(dat))
            else
                res.send ('fail stock not found')
            return;     
        }

        else if (cmd === 'writeOne') {  // write one stock
            if (! stock) {
                res.send ('fail, missing stock') 
                console.log (getDate(), stock, 'fail, missing stock')  
                return
            }

            writeCount++;
            if (LOG)
                console.log ('writeOne ', stock, req.query.dat)
            var dat = JSON.parse(req.query.dat)
            // console.log (getDate(), stock, 'targetPrice new', dat)

            if (!target[stock])
                target[stock]=[] // if missing - add empty array

            // remove adjacent dulicates
            for (let i = 0; i < target[stock].length - 1; i++) {
                if (target[stock][i].target === target[stock][i + 1].target){
                    console.log (i, 'duplicate', target[stock][i].target,target[stock][i+1].target)
                    target[stock].splice(i)
                    i--; // remain on same
                }
            }

            // print
            // console.log(getDate(), stock, 'list', target[stock].length)
            // for (let i = 0; i < target[stock].length; i++) {
            //     console.log (getDate(), stock, i, target[stock][i]) 
            // }

            // if close to last target quit
            if (target[stock].length > 0) {
                const last = target[stock][target[stock].length - 1] // last entry
                if (dat.target / last.target > 0.95 && dat.target / last.target < 1.05) {
                    res.send ('ok');
                    console.log (getDate(), stock, 'target close to last ', dat.target, last.target)
                    return 
                }
            }

            target[stock].push (dat); // add object
            console.log (getDate(), stock, 'new', dat)


            // if (LOG)
                // target[stock].forEach((d)=> {console.log(d)}) //print array
            console.log (getDate(), stock, 'target length ', target[stock].length)

            if (true || Date.now() - lastWriteMili > 200) {
                fs.writeFile ('txt/target.txt', JSON.stringify (target), err => {
                    if (err) {
                        console.log('txt/target.txt write fail', err)
                    }
                     
                        console.log('txt/target.txt write, count=', Object.keys(target).length)
                })
                lastWriteMili = Date.now()
            }
            res.send ('ok')
            return;           
        }
        else if (cmd === 'a') { // get all 
            filterCount ++;
            const keys=Object.keys(target)
            
            console.log ('a  gainAll (', keys.length, ') ', keys, '')
            const filterdObj = {}; 
            if (symOnly) {
                const keys = Object.keys(target)
                keys.map((sym) => {
                    filterdObj[sym] = '';
                })
                res.send (JSON.stringify(filterdObj))
                return;                
            }       
            res.send (JSON.stringify(target))
            return;
        }

     
        else if (cmd === 'd') {//get list for remove gain 1,2,5,10
            filterCount ++;
            if (! target['QQQ']) {
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
            Object.keys(target).forEach ((sym) => {

            })
            const keys=Object.keys(filterdObj)
            console.log(getDate(), keys.length, keys)
            res.send (JSON.stringify(filterdObj))
        }

        else if (cmd === 'p') { // remove list
            removeCount++;
            var dat = JSON.parse(req.query.dat)
            console.log('stocks for remove', dat.length, dat)
            dat.forEach ((sym) => {
            if (LOG)
                console.log (sym, 'remove')
                delete target[sym]
            })
            // console.log(getDate())
            res.send ('ok')
        }

        else
            res.send (getDate(), cmd, 'fail cmd invalid')

    })
}


module.exports = {targetPrice}
