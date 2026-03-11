const axios = require('axios')
const {getDate} = require ('./Utils')
// const cors = require('cors')


function polymarket (app)  {
    // nowMili = Date.now();
    console.log ('\n\n\npolymarket prepare')

    app.get('/polymarket', (req, res) => {
        console.log ('polymarket query params', req.query)
   
        var url = "https://gamma-api.polymarket.com/markets"
        if (req.query.url)
            url = req.query.url

        console.log ('\n\n', getDate(), 'polymarket ', req.query, )

        axios.get (url)
        .then ((result) => {
        if (req.query.log)
          console.log (getDate(), 'polymarket result', result.data)

        if (true) {
          console.log (getDate(), 'polymarket ', result.data)
        }
         
        res.send ({status: 'ok', data: result.data})
       
      })
      .catch ((err) => {

        const result = {
            status: 'fail',
            message: err.message,
            code:  err.code
        }
              // console.log (result)
        // console.log (JSON.stringify(err))
        res.send (result)
        return 'fail'
      })







        // app.get("/markets", async (req, res) => {
        //     const r = await fetch("https://gamma-api.polymarket.com/markets");
        //     const data = await r.json();

        //     res.json({status: 'ok', data: data});
        // });



    //    res.send ('fail')
    })


}

module.exports = {polymarket}