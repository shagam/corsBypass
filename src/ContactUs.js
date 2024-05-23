
// const { log } = require('util');
const {getDate} = require ('./Utils')
const fs = require ('fs')



function contact (app)  {
    const LOG = true;

    // nowMili = Date.now();

    // filter file
    app.get('/contactGet', (req, res) => {
        if (LOG)
        console.log('query:', req.query)
        
        var all = req.query.all;
        const last = Number(req.query.last);
        const on = req.query.on;
        const name = req.query.name;

        var msgArr = [];
        var array = fs.readFileSync('txt/contact.txt').toString().split("\n");
        if (LOG)
        console.log ('length', array.length)
        for(let i = array.length - 2*last; i < array.length; i++) {
            if (! array[i])
                continue;
            // if (name && ! array[i].contains (name))
            //     continue;

            
            if (LOG)
            console.log(i, array[i]);
            // const parsedTxt = JSON.parse (array[i].txt) 

            //  array[i].txt = parsedTxt;
            msgArr.push(array[i])
        }
        console.log (msgArr)
        res.send (msgArr)
        return; 
    })





    app.get('/contactUs', (req, res) => {
        const LOG = true;
        const txtArray = req.query.text
        if (LOG)
        console.log (getDate(), 'contactRequest name=', req.query.name, 'email=',
         req.query.email, 'text=', req.query.text)
        if (LOG)
        console.log ('txtArray', txtArray)
        if (LOG)
        console.log('query:', req.query)
        const msg = {date: getDate(), name: req.query.name, email: req.query.email, 
            // ip: req.query.ip, city: req.query.city, countryName: req.query.countryName, countryCode: req.query.countryCode,
            txt: req.query.text}

        if (LOG)
            console.log ('contactObj:', msg)

         fs.appendFile ('txt/contact.txt', '\n\n' + JSON.stringify (req.query), err => {
            if (err) {
                console.log('txt/contact.txt write fail', err)
            }
            else
                console.log('txt/contact.txt write, ')
        })

        //  main(req.query.name, req.query.email, html)
        //  .catch(e => console.log('send fail', e))
         
        res.send ('ok')
    })
}



module.exports = {contact}