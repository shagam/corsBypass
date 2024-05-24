
// const { log } = require('util');
const {getDate} = require ('./Utils')
const fs = require ('fs')



function contact (app)  {
    const LOG = false;

    // nowMili = Date.now();

    // filter file
    app.get('/contactGet', (req, res) => {
        // if (LOG)
        console.log(getDate(), 'query:', req.query)
        
        const name = req.query.name;
        const count = Number(req.query.count);
        const mili = Number(req.query.mili);


        var msgArr = [];
        var array = fs.readFileSync('txt/contact.txt').toString().split("\n");
    
        const loopStart = array.length - 2*count >= 0 ? array.length - 2*count : 0
        if (LOG)
            console.log ('length', array.length)

        for(let i = loopStart; i < array.length; i++) {
            if (! array[i])
                continue;

            const parsed = JSON.parse (array[i]) 
            // console.log (parsed)

            if (name && array[i] && ! parsed.name.includes (name) && ! parsed.email.includes (name))
                continue; // skip when name missing

            // console.log ('query:', mili, 'item:', parsed.mili)
            if (mili > parsed.mili) 
                continue // skip older recors

            //  array[i].txt = parsedTxt;
            msgArr.push(parsed)
        }
        if (LOG)
            console.log (getDate(), 'Arrey to be sent', msgArr)
        console.log (getDate(), 'sent count:', msgArr.length)
        res.send (JSON.stringify(msgArr))
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
        const msg = {date: getDate(), mili: Date.now(), name: req.query.name, email: req.query.email, 
            // ip: req.query.ip, city: req.query.city, countryName: req.query.countryName, countryCode: req.query.countryCode,
            text: req.query.text}

        if (LOG)
            console.log ('contactObj:', msg)

         fs.appendFile ('txt/contact.txt', '\n\n' + JSON.stringify (msg), err => {
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