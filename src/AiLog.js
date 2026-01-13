const fs = require ('fs')
const axios = require('axios')
const {getDate} = require ('./Utils')

const print_textFiles = false
var tokenCountArray = {};   // saved one obj per stock

// read tokenCount from local file once on startup
fs.readFile('txt/tokenCountArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  tokenCountArray = JSON.parse(data);
  const keys = Object.keys(tokenCountArray);
  console.log('\n', getDate(), 'txt/tokenCountArray.txt  read, count=', keys.length)
  if (print_textFiles) {
    for (var i = 0; i < keys.length; i++)
      console.log (JSON.stringify (tokenCountArray[keys[i]]))
  }
  else {
      var symbols = "";
      for (var i = 0; i < keys.length; i++)
        symbols += keys[i] + '  '
      console.log(symbols)
  }
});

function tokenCountFlush () {
  if (Object.keys(tokenCountArray).length === 0) // avoid write of empty
    return;
  fs.writeFile ('txt/tokenCountArray.txt', JSON.stringify (tokenCountArray), err => {
    if (err) {
      console.log (getDate(), 'txt/tokenCountArray.txt write fail', err)
    }
    else
      console.log (getDate(), 'txt/tokenCountArray.txt sym count:', Object.keys(tokenCountArray).length)
  })
}

function aiLog (app) {
  nowMili = Date.now();
//   console.log ('aiLog')

  app.get('/ai', (req, res) => {

    console.log ('\n\n' + getDate(), 'aiLog', req.query)

    // read records
    if (req.query.read) {
        res.send (tokenCountArray)
        console.log (tokenCountArray)
        return;
    }

    const ip = req.query.ip
    if (! tokenCountArray[ip]) {
        tokenCountArray[ip] = {openAi: 0,   deepSeek: 0,}
    }


    if (req.query.brand==='OpenAI')
        tokenCountArray[ip].openAi += Number(req.query.tokenCount)
    else if (req.query.brand==='DeepSeek')
        tokenCountArray[ip].deepSeek += Number(req.query.tokenCount)
    else {
        res.send ( {
            openAi: tokenCountArray[ip].openAi,
            deepSeek: tokenCountArray[ip].deepSeek, 
            status: 'fail',
            error: 'invalid brand'})
        return;
    }
    tokenCountFlush () 

    // save user info
    tokenCountArray[ip].params = req.query;



    var tokenCount = {
        openAi: tokenCountArray[ip].openAi,
        deepSeek: tokenCountArray[ip].deepSeek, 
        status: 'ok'
    }

    console.log ('AI returned tokenCounters', tokenCount)
    res.send (tokenCount)

    return;   
  })
}

module.exports = {aiLog};
