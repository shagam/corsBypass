const fs = require ('fs')


const {getDate} = require ('./Utils');


//*  read data from disk
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

//* use for sort array
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

function filterUpcase (attrib, filter) {
  if (! attrib) {
    return false;
  }
  if (! filter) {
    console.log ('missing filter')
    return false;
  }
  if (attrib.toUpperCase().includes(filter.toUpperCase())) {
    console.log ('filter upperCase', attrib, filter)
    return true;
  }

  else return false;
}


//** collect statistics and display user ip of gain  */   
function userList (app) {
  app.get('/users', (req, res) => {


    const LOG = req.query.LOG
    const LOG_EXTRA = req.query.LOG_EXTRA
    const ipList = Object.keys (usersArray);
    console.log ('\n', getDate(), 'users arguments', req.query, 'count=', ipList.length)
    // if (LOG)
    //   console.log (usersArray)

    //** Send all info */
    if (req.query.getAll) {
      if (! req.query.filter) {    
        res.send (usersArray)
        console.log ('usersArray', ipList.length) 
        return;
      }

      //** Create filterd list */
      const filter = req.query.filter;
      console.log (filter, ipList)
      var filteredUsers = {}
      for (let i = 0; i < ipList.length; i++) {
        const ip = ipList[i]
        const oneUser = usersArray[ip]
        // console.log (oneUser)
        if (filterUpcase (oneUser.os, filter))
          filteredUsers[ip] = oneUser;

        if (filterUpcase (oneUser.sym, filter))
          filteredUsers[ip] = oneUser;

        if (filterUpcase (oneUser.country, filter))
          filteredUsers[ip] = oneUser;

        // if (usersArray[ip].countryCode.includes(filter))
        //   filteredUsers[ip] = oneUser;

        if (filterUpcase (oneUser.city, filter))
          filteredUsers[ip] = oneUser;

        if (filterUpcase (oneUser.region, filter))
          filteredUsers[ip] = oneUser;
        
        if (filterUpcase (oneUser.date, filter))
          filteredUsers[ip] = oneUser;

        if (ip.includes(filter))
          filteredUsers[ip] = oneUser;
      }
      res.send (filteredUsers)
      // if (LOG)
        console.log ('filtered users', Object.keys(filteredUsers).length)
      return; 
    }

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
        console.log ('ip is null ipList:', i, ipList)
        console.log ('ip is null', i, usersArray[ip])
        delete usersArray[ip];
        continue
      }
      // remove invalid ip
      // if (ip && LOG_EXTRA && (usersArray[ip].ip === null || usersArray[ip].ip === '' || usersArray[ip].ip === 'undefined')) {
      //   console.log ('remove invalid', ip, usersArray[ip])
      //   delete usersArray[ip]; // remove invalid
      //   userArrayFlush()
      //   continue;
      // }
      
      /** clear bad fields */
      if (LOG_EXTRA) {
        if (usersArray[ip].regionName === 'undefined')
          delete usersArray[ip].regionName
        if (usersArray[ip].countryName === '')
          delete usersArray[ip].countryName
        // if (usersArray[ip].countryName.length > 3 && ! usersArray[ip].country)
          usersArray[ip].country = usersArray[ip].countryName
        if (usersArray[ip].countryCode === '')
          delete usersArray[ip].countryCode
        if (usersArray[ip].city === '')
          delete usersArray[ip].city
        delete usersArray[ip].countryCode
        delete usersArray[ip].countryName

      }

      //** date for sort list */  
      const dateArr = usersArray[ip].date.split(/[-: ]/)
      const seconds = ((((Number(dateArr[0]) * 12 + Number(dateArr[1])) * 31 + Number(dateArr[2]) -1) * 24 + Number(dateArr[3]) -1) * 60 + Number(dateArr[4])) * 60 + Number(dateArr[5])
      // console.log (dateArr)
      usersArray[ip].sec =  seconds;

      usersArr.push (usersArray[ipList[i]]) // ptrepare array
      // skip my ip when searching for last
      if (ip === process.env.NODE_localIP){ //  62.0.92.49') { // skip developer ip
        // console.log ('homeIP', ip )
        continue;
      }

      //* find last access
      if (seconds > lastSeconds) {
        lastSeconds = seconds;
        lastIp = ip;
      }      
      
      
      //* collect statistics
      ipObj[usersArray[ip].ip] = 1;
      cityObj[usersArray[ip].city] = 1;
      countryObj[usersArray[ip].countryName] = 1;
      // userArrayFlush()

    }


    usersArr.sort(compare)  //* sort according to date


    //* highlight last and LOG

    if (LOG )
    for (let i = 0; i <  usersArr.length; i++) {
      const ip = usersArr[i].ip
      if (! ip)
        continue;

      // if (! LOG_EXTRA)
        delete usersArr[i].sec // not needed anymore
      var txt =  JSON.stringify(usersArr[i])
      if (usersArr[i].ip === lastIp)
        txt = '* ' + txt;
      else if (ip === process.env.NODE_localIP) //62.0.92.49')
        txt = '^ ' + txt;
      else        
        txt = '  ' + txt;

        //** Display only last records */
      const DISPLAY_LIMIT = 20
      // const DISPLAY_LIMIT = LOG_EXTRA ? usersArr.length : 20  // LOG_EXTRA display all
      if (i > usersArr.length - DISPLAY_LIMIT - 1)
        console.log (i, txt)
    }


    //* build report obj
    const obj = {
      ipCount:  Object.keys(ipObj).length,
      cityCount:  Object.keys(cityObj).length,
      countryCount: Object.keys(countryObj).length
    }

    //* if none (except mine) found
    if (! lastSeconds){
      res.send('none')
      return;
    }

    // console.log ('\nCounters:', obj)

    obj.date = usersArray[lastIp].date
    obj.sym = usersArray[lastIp].sym
    obj.ip = lastIp

    if (usersArray[lastIp].city)
      obj.city = usersArray[lastIp].city
    if (usersArray[lastIp].region)
      obj.region = usersArray[lastIp].region
    if (usersArray[lastIp].country)
      obj.country = usersArray[lastIp].country


    obj.os = usersArray[lastIp].os
    delete usersArray[lastIp].countryName; // clear old
    delete usersArray[lastIp].regionName;  // clear old
    delete usersArray[lastIp].countryCode;  // clear old

    userArrayFlush();  //* write removed fields
    console.log ('\nUsers info:', obj)
  
    res.send (obj)

   } )   //* end of ip report

} 




//*  collect ip of users called from gain request */
function userAccess (sym, ip, city, country, region, os) {
 
    if (! ip) {
      console.log ('error, missing ip')
      return;
    }

    if (usersArray[ip]) { //* already exist: update data
      usersArray[ip].sym = sym;
      usersArray[ip].date = getDate()
      usersArray[ip].os = os;
      usersArray[ip].ip = ip;
      usersArray[ip].count++
    }
    else // new
      usersArray[ip] = {sym: sym, date: getDate(), ip: ip, count: 1}


    if (country)
      usersArray[ip].country = country;
    if (city)
      usersArray[ip].city = city;
    if (region)
        usersArray[ip].region = region;
    if (region)
      usersArray[ip].region = region;

    delete usersArray[ip].countryName; // clear old
    delete usersArray[ip].regionName;  // clear old
    
    // console.log ('ip collect:', usersArray[ip])
    userArrayFlush();
} //* end of collection


  module.exports = {userAccess, userArrayFlush, userList}