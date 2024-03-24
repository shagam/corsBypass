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
  console.log('\ngainArray.txt  read, count=', keys.length, keys)
  if (LOG) {
    for (var i = 0; i < keys.length; i++)
      console.log (JSON.stringify (gainArray[keys[i]]))
  } 
});


function gain (app)  {
    // nowMili = Date.now();

    app.get('/gain', (req, res) => {

        const stock = req.query.stock
        const cmd = req.query.cmd; // R, W, F
        // const dat = req.query.dat
        console.log (stock, date, 'gain  cmd=', cmd)// 'dat=', dat.length)
        // res.send ('ok')
        // return;  

        if (cmd == 'r') { // read one stock
            const dat = gainArray[stock]
            if (dat) 
                res.send (JSON.stringify(dat))
            else
            res.send ('fail not found')
            return;     
        }

        else if (cmd === 'w') {  // write one stock
            const dat = JSON.parse(req.query.dat)
            // console.log (dat)
            gainArray[stock] = dat; // readable format
            console.log (Object.keys(gainArray))
            fs.writeFile ('gainArray.txt', JSON.stringify (gainArray), err => {
                if (err) {
                    console.log('gainArray.txt write fail', err)
                }
                else
                    console.log('gainArray.txt write, count=', Object.keys(gainArray).length)
            })
            res.send ('ok')
            return;           
        }
        else if (cmd === 'a') { // get all         
            res.send (JSON.stringify(gainArray))
            return;
        }
        else
            res.send ('fail cmd invalid')

    })


}


module.exports = {gain}
