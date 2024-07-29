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
    console.log ('\n', getDate(), 'users arguments', req.query)

    const LOG = req.query.LOG
    const ipList = Object.keys (usersArray);
    // if (LOG)
    //   console.log (usersArray)
    // collect for count
    var cityObj = {};
    var countryObj = {}
    var ipObj = {};

    var lastIp 
    var lastDays = 0;
    for (let i = 0; i <  ipList.length; i++) {
      const ip = ipList[i]
      if (ip === '62.0.92.49') // skip developer ip
        continue;
      if (LOG )
        console.log ('users', JSON.stringify(usersArray[ipList[i]]))
      ipObj[usersArray[ip].ip] = 1;
      cityObj[usersArray[ip].city] = 1;
      countryObj[usersArray[ip].countryName] = 1;

      // find last access
      const dateArr = usersArray[ip].date.split(/[-: ]/)
      const days = ((dateArr[0] * 12) + dateArr[1]) * 30 + dateArr[2];
      if (days > lastDays) {
        lastDays = days;
        lastIp = ip;

      }

      // console.log (dateArr)
    }
    const obj = {
      ipCount:  Object.keys(ipObj).length,
      cityCount:  Object.keys(cityObj).length,
      countryCount: Object.keys(countryObj).length
    }

    if (! lastIp){
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

    // console.log (sym, ip, city, countryName, countryCode)

    const obj = {sym: sym, date: getDate(),  ip: ip, city: city, countryName: countryName,
       regionName: regionName, count: 1}

    if (usersArray[ip]) {
      usersArray[ip].sym = sym;
      usersArray[ip].date = getDate()
      usersArray[ip].ip = ip;
      if (countryName)
        usersArray[ip].countryName = countryName;
      if (city)
        usersArray[ip].city = city;
      // if (! usersArray[ip].countryCode)
      //   usersArray[ip].countryCode = countryCode;    
      if (regionName)
        usersArray[ip].regionName = regionName;
      usersArray[ip].count++


    }
    else {
      // usersArray[ip] = obj;
      usersArray[ip] = {sym: sym, date: getDate(), ip: ip, count: 1}

      if (countryName)
        usersArray[ip].countryName = countryName;
      if (city)
        usersArray[ip].city = city;
      if (regionName)
         usersArray[ip].regionName = regionName;

      //     usersArray[ip] = obj;
    }
    console.log ('userAccess:', usersArray[ip])
    userArrayFlush();
}
  module.exports = {userAccess, userArrayFlush, userList}