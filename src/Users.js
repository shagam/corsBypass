const fs = require ('fs')


const {getDate} = require ('./Utils');
const JSONTransport = require('nodemailer/lib/json-transport');


const print_textFiles = false
const miliInADay = 24 * 3600 * 1000;
// read splitsArray from local file once on startup
var usersArray = {};    // saved one obj per stock
fs.readFile('txt/userArray.txt', 'utf8', (err, data) => {
  if (err) {
    console.error (err)
    return;
  }
  usersArray = JSON.parse(data);
  const keys = Object.keys(usersArray);
  console.log('\n', getDate(), 'txt/userArray.txt  read count=', keys.length)
  if (print_textFiles)
    for (var i = 0; i < keys.length; i++)
      console.log ('\n', keys[i], JSON.stringify (usersArray[keys[i]]))
  else {
    var symbols ="";
    for (var i = 0; i < keys.length; i++)
      if (usersArray[keys[i]])
      symbols += keys[i] + ' (' + usersArray[keys[i]].count +') ';
      else 
        console.log ('splitsArray mismatch', keys[i]) 
    console.log (symbols)
  }
  // for (var i = 0; i < keys.length; i++)
  //   console.log (keys[i])
});

// use for sort array
function compare( a, b ) {
  if ( a.sec < b.sec ){
    return -1;
  }
  if ( a.sec > b.sec ){
    return 1;
  }
  return 0;
}


var writeCount = 0;
function userArrayFlush() {
  if (Object.keys(usersArray).length === 0) // avoid write of empty
    return;

  fs.writeFile ('txt/userArray.txt', JSON.stringify(usersArray), err => {
    if (err) {
      console.log (getDate(), 'txt/userArray.txt write fail', err)
    }
    else
      console.log (getDate(), 'txt/userArray.txt sym write, sym count=', Object.keys(usersArray).length,
        'writeCount=', writeCount)
  }) 
}

function userList (app) {
  app.get('/users', (req, res) => {


    const LOG = req.query.LOG
    const ipList = Object.keys (usersArray);
    console.log ('\n', getDate(), 'users arguments', req.query, 'count=', ipList.length)
    // if (LOG)
    //   console.log (usersArray)
    // collect for count
    var cityObj = {};
    var countryObj = {}
    var ipObj = {};
    const usersArr = []
    var lastIp 
    var lastSeconds = 0;
    for (let i = 0; i <  ipList.length; i++) {
      const ip = ipList[i]
      if (! ip) {
        console.log ('ip null')
        continue
      }
      // remove invalid ip
      if (! usersArray[ip].ip || usersArray[ip].ip === '') {
        console.log ('remove invalid', ip, usersArray[ip])
        usersArray[ip]= null; // remove invalid
        userArrayFlush()
        continue;
      }
      const dateArr = usersArray[ip].date.split(/[-: ]/)
      const seconds = ((((Number(dateArr[0]) * 12 + Number(dateArr[1])) * 30 + Number(dateArr[2])) * 24 + Number(dateArr[3])) * 60 + Number(dateArr[4])) * 60 + Number(dateArr[5])
      // console.log (dateArr)
      usersArray[ip].sec =  seconds;
      // if (LOG )
      //   console.log ('users', JSON.stringify(usersArray[ipList[i]]))

      // skip my ip when searching for last
      if (ip === '62.0.92.49') { // skip developer ip
        // console.log ('homeIP', ip )
        continue;
      }
      // collect statistics
      ipObj[usersArray[ip].ip] = 1;
      cityObj[usersArray[ip].city] = 1;
      countryObj[usersArray[ip].countryName] = 1;

      // find last access
      if (seconds > lastSeconds) {
        lastSeconds = seconds;
        lastIp = ip;
      }

      usersArr.push (usersArray[ipList[i]])
      // console.log (dateArr)
    }


    // highlight last and LOG

    usersArr.sort(compare)
    console.log ('arr', usersArr)

    
    if (LOG )
    for (let i = 0; i <  ipList.length; i++) {
      const ip = ipList[i]
      if (! ip)
        continue;
      const LAST = usersArray[ip].sec === lastSeconds;




      delete usersArray[ip].sec // not needed anymore
      var txt =  JSON.stringify(usersArray[ipList[i]])
      if (LAST)
        txt = '* ' + txt;
      else if (ip === '62.0.92.49')
        txt = '^ ' + txt;
      else        
        txt = '  ' + txt;

      console.log (txt)
    }


    // build report obj
    const obj = {
      ipCount:  Object.keys(ipObj).length,
      cityCount:  Object.keys(cityObj).length,
      countryCount: Object.keys(countryObj).length
    }

    if (! lastSeconds){ // if none (except mine) found
      res.send('none')
      return;
    }
    // console.log ('\nCounters:', obj)

    obj['lastIP'] = lastIp
    obj['lastDate'] = usersArray[lastIp].date
    obj['lastSym'] = usersArray[lastIp].sym
    if (LOG)
      console.log ('\nCounters:', obj)
  
    res.send (obj)

   } )   

} 


function userAccess (sym, ip, city, countryName, countryCode, regionName) {
    //    regionName: regionName, count: 1}
    // console.log ('params', sym, ip, 'city=', city, 'countryName=', countryName, 'countryCode=', countryCode, 'regionName=', regionName)

    if (! ip) {
      console.log ('error, missing ip')
      return;
    }

    if (usersArray[ip]) {
      usersArray[ip].sym = sym;
      usersArray[ip].date = getDate()
      usersArray[ip].ip = ip;
      usersArray[ip].count++
    }
    else // new
      usersArray[ip] = {sym: sym, date: getDate(), ip: ip, count: 1}


    if (countryName)
      usersArray[ip].countryName = countryName;
    if (city)
      usersArray[ip].city = city;
    if (regionName)
        usersArray[ip].regionName = regionName;
    if (regionName)
      usersArray[ip].regionName = regionName;

    
    console.log ('userAccess:', usersArray[ip])
    userArrayFlush();
}
  module.exports = {userAccess, userArrayFlush, userList}