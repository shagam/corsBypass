
// const { log } = require('util');
const {getDate} = require ('./Utils')
const fs = require ('fs')



function contact (app)  {


    // nowMili = Date.now();

    // filter file
    app.get('/contactGet', (req, res) => {

        console.log(getDate(), 'cantactGet query:', req.query)
        
        var search = req.query.name;
        if (search)
            search = search.toUpperCase()
        const count = Number(req.query.count);
        const mili = Number(req.query.mili);
        const LOG = req.query.LOG;


        var msgArr = [];
        var array = fs.readFileSync('txt/contact.txt').toString().split("\n");
    
        if (LOG)
            console.log ('array.length', array.length)

        for (let i = 0; i < array.length; i++) {
            if (! array[i])
                continue;

            const parsed = JSON.parse (array[i]) 
            // console.log (parsed)

            if (search && array[i] && ! parsed.name.toUpperCase().includes (search) && ! parsed.email.toUpperCase().includes (search)
                && ! parsed.text.toUpperCase().includes (search)
            )  continue; // skip when name missing

            // console.log ('query:', mili, 'item:', parsed.mili)
            if (mili > parsed.mili) 
                continue // skip older recors

            msgArr.push(parsed)
        }


        //** clip array. send last <count> and make newest first.*/

        const loopCount = count < msgArr.length ? count : msgArr.length 
        console.log ('msgArr.length=', msgArr.length, 'loopCount=', loopCount, 'newest:', msgArr[msgArr.length - 1])
        const msgArrForSend = []
        for ( let i = 0; i < loopCount; i++) {
            msgArrForSend.push (msgArr[msgArr.length - i -1])
        }


        if (LOG)
            console.log (getDate(), 'Arrey to be sent',  msgArr.length, msgArrForSend)
        console.log (getDate(), 'sent count:', msgArrForSend.length)
        res.send (JSON.stringify(msgArrForSend))
        return; 
    })





    app.get('/contactUs', (req, res) => {
        var LOG = req.query.LOG;
        // LOG = true;
        console.log(getDate(), 'cantactUs', req.query)
        const txtArray = req.query.text
        if (LOG)
        console.log (getDate(), 'contactRequest name=', req.query.name, 'email=',
         req.query.email, 'text=', req.query.text)
        if (LOG)
        console.log ('txtArray', txtArray)
        if (LOG)
        console.log('query:', req.query)
        const msg = {date: getDate(), mili: Date.now(), name: req.query.name, email: req.query.email, 
            // ip: req.query.ip,
            ip: req.query.ip, city: req.query.city, region: req.query.region, country: req.query.country, os: req.query.os,
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