
const axios = require('axios')
const fs = require ('fs')
const {getDate} = require ('./Utils')


function vix (app) {
  const updateMili = Date.now();
  const updateDate = getDate()
    // app.get('/holdingsSch', (req, res) => {
    app.get('/vix', (req, res) => {
        const url = 'https://www.google.com/search?q=vix'
        console.log ('vix,', url)
        axios.get (url)
        .then ((result) => {
          const text = result.data;
          console.log ('response length=', text.length)

          // fs.writeFile ('vix.txt', text, err => {
          //   if (err) {
          //     console.err('vix.txt write fail', err)
          //   }
          // })
      
          //<span jsname="vWLAgc" class="IsqQVc NprOob wT3VGc">14.87</span>
          //<span jsname="vWLAgc" class="IsqQVc NprOob wT3VGc">13.82</span>
        // <span jsname="vWLAgc" class="IsqQVc NprOob wT3VGc">13.92</span>
          var pattern
          pattern = '"BNeawe iBp4i AP7Wnd">([0-9\\.]+) <span dir="ltr" class="rQMQod lB8g7">'
          // pattern = 'wT3VGc">([0-9\\.]+)</span>'
          var rx = new RegExp (pattern,'g');
          while ((rs = rx.exec(text)) !== null){
            res.send(rs[1])
            console.log('vix ', rs[1])
                return
            };
          const failTxt = 'fail, vix data not found' ;
          res.send (failTxt)
          console.log (failTxt)
          return;
        })
        .catch ((err) => {
          console.log(updateDate, err.message)
          res.send('fail,' + err.message)
          console.log( updateDate, 'fail, holding gail')
        })    
      }
    )
  }
  
  module.exports = {vix}



 //  https://www.google.com/search?q=vix

