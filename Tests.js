const axios = require('axios');
const { rootCertificates } = require('tls');
// var ip = require("ip")

// for windows onlynpm i ip
function getLocalIp () {
    var localIp = '';
    var ip = require("ip")

    // console.log ('ipAddress: ', addr);
    const addr = ip.address();
    if (addr)
      return addr;
  
    const {networkInterfaces} = require ('os')
    const nets = networkInterfaces().Ethernet;
    // console.log ('nets', nets)
    const pattern = '"address":"([\\d\\.]+)"';
    const regex0 = new RegExp (pattern, 'gm');
    
    var match;
    const str = JSON.stringify(nets)
    // console.log ('getLocalIp', str)
    while ((match = regex0.exec(str)) !== null){
      localIp = match[1]
    }
    // console.log ('\nlocal ip:', localIp)
    return localIp;
  }
  
  function getPublicIp () {
    const result1 = axios.get('https://geolocation-db.com/json/')
    .then ((result1) => {
      const publicIp = result1.data.IPv4;
      console.log ('\nPublic global IPv4', publicIp)
      // console.dir(result1.data)
      return publicIp;
    })
    .catch ((err) => {
      console.log(err)
      // res.send('')
      return '';
    })
  
  }
  
  function collectInfo (req, res) {
    var source = req.headers['user-agent']
    var txt = '\nsource: ' + source;
  
    txt += '\nlocalIp: ' + getLocalIp();
    getPublicIp();
    txt += '\nheaders: ' + res.getHeaderNames()
    console.log ('collected: ', txt)
    return txt;
  }
  
  function root (req, res) {
    res.send('root')
  }
  
//   app.get('/userTest', (req, res) => {
   function userTest (req, res) {
   
    var txt = collectInfo (req, res);
    var localIp = getLocalIp();
  
    // get data from remote    192.168.1.3 192.168.1.4
    const testIp = localIp === '10.100.102.3' ? '10.100.102.4' : '10.100.102.3' 
    var url = 'http://'
    const result = axios.get('http://' + testIp + ':5000/user')
    .then ((result) => {
      console.log ('testIp', testIp)
      console.log('\nfrom other: ', JSON.stringify(result.data))
      txt += result.data;
      res.send (txt)  
    })
    .catch ((err) => {
      console.log(err)
      res.send(err)
    })
  }
  
  
//   app.get('/user', (req, res) => {
function user (req, res) {
    const txt = collectInfo (req, res)
    res.send(txt)
  
}
  

    
module.exports = {getLocalIp, user, userTest, root}




