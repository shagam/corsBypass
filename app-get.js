
"use strict";

const cors = require ('cors')

const splitsGet = require ('./SplitsGet')
const {price, priceDel} = require ('./HistoricPrice')
// const  {getLocalIp, user, userTest, root} = require ('./Tests')


// const router = express.Router();

const externalIp = '62.90.44.227'
const l2_Ip = '10.100.102.4'
const pc_ip = '10.100.102.3'


var nowMili = Date.now();

function getDate() {
  const today = new Date();
  var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  var date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
  // var formattedDate = format(date, "yyyy-MMM-dd HH:mm");
  return date + " " + time;    
}



// access both ssh and vanilla

function appGet (app, port) {
   
  app.options('*', cors()) 

  app.use (
    cors({
      origin: "*",
      methods: ["GET","PUT","POST","DELETE"],
      credetials: true,
      optionsSuccessStatus: 200,
    })
  )

  app.listen(port, (err) => {
      if (port == 5000)
        console.log (`\nno ssl Listening on  ${port}`)
      else
        console.log (`ssl Listening on  ${port}`)
      if (err) {
          console.log ('err: ', err)
      }
  })
      
  app.options('*', cors()) 

  app.use (
      cors({
      origin: "*",
      methods: ["GET","PUT","POST","DELETE"],
      credetials: true,
      optionsSuccessStatus: 200,
      })
  )
   

  app.get('/', (req, res) => {
  // res.send('root')
  root (req, res)
  })

  app.get('/userTest', (req, res) => {
  userTest (req, res)
  })

  app.get('/user', (req, res) => {
  user (req, res)
  })


  //============================================================================


  // 7 day delay
  app.get('/splits', (req, res) => {
  splitsGet (req, res, 7, false)
  })

  // 1 day delay
  app.get('/splitsDay', (req, res) => {
  splitsGet (req, res, 1, false)
  })

  app.get('/splitsNew', (req, res) => {
  console.log ( req.query.stock, 'ignore saved splits')
  splitsGet (req, res, 1, true)
  })


  //============================================================================


  app.get('/val', (req, res) => {
  console.log (getDate(), req.query, req.params, req.hostname)
  res.send ('Hello' + JSON.stringify(req.query))
  })

  //============================================================================

  // delete bad data
  app.get('/priceDel', (req, res) => {
  priceDel  (req, res)
  })

  app.get('/price', (req, res) => {
  price(req, res)
  // console.log (getDate(), req.query)
  // console.log (getDate(), req.query.stock, req.query.mon, req.query.day, req.query.year)

  })

}

module.exports = appGet