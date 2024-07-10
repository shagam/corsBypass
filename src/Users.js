const fs = require ('fs')


const {getDate} = require ('./Utils')


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
      symbols += keys[i] + '  ';
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
    if (LOG)
      console.log (usersArray)
    // collect for count
    var cityObj = {};
    var countryObj = {}
    var ipObj = {};

    for (let i = 0; i <  ipList.length; i++) {
      const ip = ipList[i]
      ipObj[usersArray[ip].ip] = 1;
      cityObj[usersArray[ip].city] = 1;
      countryObj[usersArray[ip].countryName] = 1;
      // if (LOG)
      //   console.log ('iploop:', ipObj, cityObj, countryObj)
    }
    const obj = {
      ipCount:  Object.keys(ipObj).length,
      cityCount:  Object.keys(cityObj).length,
      countryCount: Object.keys(countryObj).length
    }

    console.log (obj)

    res.send (obj)

   } )   

} 


function userAccess (sym, ip, city, countryName, countryCode) {

    // console.log (sym, ip, city, countryName, countryCode)

    const obj = {sym: sym, date: getDate(),  ip: ip, city: city, countryName: countryName,
       countryCode: countryCode, count: 0}

    if (usersArray[ip]) {
        usersArray[ip].count++
        const count = usersArray[ip].count;
        usersArray[ip] = obj; // replace old by new sym, new date
        usersArray[ip].count = count; // copy count
        console.log (usersArray[ip])
    }
    else {
          usersArray[ip] = obj;
    }
    userArrayFlush();
}
  module.exports = {userAccess, userArrayFlush, userList}