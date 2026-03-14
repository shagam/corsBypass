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
      var url = "https://polymarket.com/event/ndx-above-dec-2026"
      url = "https://gamma-api.polymarket.com/events?slug=ndx-above-dec-2026&limit=1"
      url = "https://gamma-api.polymarket.com/events?slug=ndx-above-dec-2026&limit=1"

    // if (req.query.url)
        url = req.query.url


     try {

      // url = "https://gamma-api.polymarket.com/markets?limit=2"
      const resp = await axios.get ("https://gamma-api.polymarket.com/events?slug=ndx-above-dec-2026&limit=1",
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

    //  const markets = event.markets.map(market => ({
    //       question: market.question,
    //       yesPrice: market.outcomePrices[0],
    //       noPrice: market.outcomePrices[1],
    //       volume: market.volume
    //   }));
        const response = {
          data: resp.data.length,
        }
        res.send (response)
        console.log ('response', response)
        return


      
   
    // console.log(markets);
    //     console.log ('response:', result.data)
    //     const response = {
    //     status: 'fail',
    //     data: result.data
    //   }
    //     res.send (response)
    //     return 'ok'
    //  })
      

      
      // const response = axios.get(POLYMARKET_API, {
      // params: {
      //   active: true,
      //   closed: false,
      //   limit: 500
      // }
      // });

      // console.log ('response:', response)
      // const markets = response.data;


      // const filtered = markets.filter(m =>
      //   m.question.toLowerCase().includes("nasdaq") ||
      //   m.question.toLowerCase().includes("ndx") ||
      //   m.question.toLowerCase().includes("qqq")
      // );

      // const result = filtered.map(m => ({
      //   question: m.question,
      //   slug: m.slug,
      //   yesPrice: m.outcomePrices?.[0],
      //   noPrice: m.outcomePrices?.[1],
      //   volume: m.volume
      // }));

      // res.json(response);

  } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Failed to fetch polymarket data" });
      const result = {
          status: 500,
          message: err.message,
          code:  err.code 
      }
            // console.log (result)
      // console.log (JSON.stringify(err))
      // res.send (result)
      return 'fail'
      }

    })

  }

module.exports = {polymarket}