
const axios = require('axios')
const fs = require ('fs')
const {getDate} = require ('./Utils')


function vix (app) {
  const updateMili = Date.now();
  const updateDate = getDate()
    // app.get('/holdingsSch', (req, res) => {
    app.get('/vix', (req, res) => {
      // https://go.cboe.com/l/77532/2021-10-13/bwkqfd
      // https://www.marketwatch.com/investing/index/vix
        
      
      // https://finance.yahoo.com/quote/%5EVIX/history
  //<tr class="svelte-ewueuo"><td class="svelte-ewueuo">May 3, 2024</td> <td class="svelte-ewueuo">14.51</td> <td class="svelte-ewueuo">14.58</td> <td class="svelte-ewueuo">13.69</td> <td class="svelte-ewueuo">14.07</td> <td class="svelte-ewueuo">14.07</td> <td class="svelte-ewueuo">-</td> </tr>

     
        var url = 'https://www.google.com/search?q=vix'
        // url = 'https://finance.yahoo.com/quote/%5EVIX/history'

        console.log ('vix,', url)
        axios.get (url)
        .then ((result) => {
          const text = result.data;
          // console.log ('response length=', text.length)
          // fs.writeFile ('vix.txt', text, err => {
          //   if (err) {
          //     console.err('vix.txt write fail', err)
          //   }
          // })
          pattern = '"BNeawe iBp4i AP7Wnd">13.49 <span dir="ltr" class="rQMQod lB8g7">-1.19 (8.11%)</span>'
          //<span jsname="vWLAgc" class="IsqQVc NprOob wT3VGc">14.87</span>"BNeawe iBp4i AP7Wnd">13.49 <span dir="ltr" class="rQMQod lB8g7">-1.19 (8.11%)</span>
          //<span jsname="vWLAgc" class="IsqQVc NprOob wT3VGc">13.82</span>
        // <span jsname="vWLAgc" class="IsqQVc NprOob wT3VGc">13.92</span>
          var pattern
          pattern = '"BNeawe iBp4i AP7Wnd">([0-9\\.]+) <span dir="ltr" class="rQMQod lB8g7">'

       // pattern = '"BNeawe iBp4i AP7Wnd">13.49 <span dir="ltr" class="rQMQod lB8g7">-1.19 (8.11%)</span>'
          pattern = '"BNeawe iBp4i AP7Wnd">([0-9\\.]+) <span dir="ltr" class="rQMQod lB8g7">([\\-]?[0-9\\.]+) ([\\(]?[0-9\\.]+%[\\)]?)</span>'

          // pattern = 'wT3VGc">([0-9\\.]+)</span>'
          var rx = new RegExp (pattern,'g');
          while ((rs = rx.exec(text)) !== null){
            console.log('vix ', rs[1], '  ', rs[2], '  ', rs[3])
            res.send(rs[1] + '   ' + rs[2] + '   ' + rs[3])
            return
          };
          const failTxt = 'fail, vix data not found' ;
          res.send (failTxt)
          console.log (failTxt)
          return;
        })
        .catch ((err) => {
          console.log(updateDate, err.message)
          res.send('fail, ' + err.message)
          console.log( updateDate, 'fail, holding fail')
        })    
      }
    )
  }
  
  module.exports = {vix}



 //  https://www.google.com/search?q=vix

