const fs = require ('fs')


const {getDate} = require ('./Utils')

var gainArray = {};   // key is symbol saved one obj per stock

const LOG = true;
const date = getDate();

// read price from local file once on startup
fs.readFile('gainArray.txt', 'utf8', (err, data) => {
  if (err) {
    gainArray = {};
  }
  if (data)
    gainArray = JSON.parse(data);
  const keys = Object.keys(gainArray);
  console.log('\ngainArray.txt  read, count=', keys.length)
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
        console.log (stock, date, cmd)
        if (cmd == 'r') { // read one stock
            res.send (JSON.stringify(gainArray[stock]))
        }

        else if (cmd === 'w') {  // write one stock
            const dat = JSON.parse(req.query.dat)
            gainArray[stock] = dat; // readable format
            fs.writeFile ('gainArray.txt', JSON.stringify (priceArray), err => {
                if (err) {
                    console.err('gainArray.txt write fail', err)
                }
            })
        }
        else if (cmd === 'a') { // get all         
            res.send (JSON.stringify(gainArray))
        }

    })


}


module.exports = {gain}
