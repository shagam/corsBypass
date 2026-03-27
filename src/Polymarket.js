const axios = require('axios')
const {getDate} = require ('./Utils')
// const cors = require('cors')


function polymarket (app)  {
    // nowMili = Date.now();
    const POLYMARKET_API = "https://gamma-api.polymarket.com/markets";
    console.log ('\n\n\n', getDate(), 'polymarket prepare')

    app.get('/polymarket', async (req, res) => {
        console.log ('polymarket query params', req.query) 
   
      // var url = "https://gamma-api.polymarket.com/markets"
      // var url = "https://polymarket.com/event/ndx-above-dec-2026"
      var url = "https://gamma-api.polymarket.com/events?slug=ndx-above-dec-2026&limit=2"
      if (req.query.url)
        url = req.query.url

      var index = 0;
      if (req.query.index)
        index = req.query.index

     try {

      // url = "https://gamma-api.polymarket.com/markets?limit=2"
      const resp = await axios.get (url,
        // "https://gamma-api.polymarket.com/events?slug=ndx-above-dec-2026&limit=1",
        {
          headers: {
            "Accept": "application/json",
            "User-Agent": "Mozilla/5.0 (Node.js)" // mimic browser
          },
          responseType: "json"
        }
      )

        const data = resp.data
          if (!Array.isArray(data)) {
          const err ="Not JSON, got HTML instead"
          console.error(getDate(), err);
            const response = {
            status: 'fail',
            message: err
          }
          res.send(response)
          return;
        }


        // check response
        const event = data[index]
        if (! event) {
          const err ="event not found"
          console.error(getDate(), err);
          const response = {
            status: 'fail',
            message: err
          }
          res.send(response)
          if (req.query.log)
            console.log (data)
          return;
        }


        if (req.query.log && event)
          console.log (event)
        // const markets = event.markets
        // console.log('\n\n\n', markets.length)
        
        const markets = event.markets.map(market => ({
            question: market.question,
            slug: market.slug,
            yesPrice: JSON.parse(market.outcomePrices)[0],
            noPrice: JSON.parse(market.outcomePrices)[1],
            volume: market.volume
        }));

        // console.log ('\n\n', event.markets)
        // console.log (markets)


        const response = {
          data: markets,
        }
        res.send (response)
        console.log ('response', response)
        return


      
   
       

      
      // const response = axios.get(POLYMARKET_API, {
      // params: {
      //   active: true,
      //   closed: false,
      //   limit: 500
      // }
      // });

      // const filtered = markets.filter(m =>
      //   m.question.toLowerCase().includes("nasdaq") ||
      //   m.question.toLowerCase().includes("ndx") ||
      //   m.question.toLowerCase().includes("qqq")
      // );

      
  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch polymarket data" });
      const result = {
          status: 500,
          message: err.message,
          code:  err.code 
      }
    }
  })

}

module.exports = {polymarket}