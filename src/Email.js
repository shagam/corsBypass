const nodeMailer = require('nodemailer')
const {getDate} = require ('./Utils')
const fs = require ('fs')

async function main (name, email, html) {
    const transporter = nodeMailer.createTransport({
        // host: 'mail.openjavascript.info',
        host: 'mail.dinagold.org',
        port: 465, // SMTP
        secure: true,
        auth: {
            // user: 'eli@mail.dinagold.org',
            user: 'eli',
            pass: 'm'
        }
    })
    const info = await transporter.sendMail({
        from: 'OpenJavaScript <j32111@gmail.com>',
        to: 'eli.shagam@gmail.com',
        subject: 'Contact Us',
        html: html
    })
    console.log ("Message sent: " + info.messageId)
}



function email (app)  {
    // nowMili = Date.now();

    // filter file
    app.get('/contactGet', (req, res) => {
        console.log('query:', req.query)
        
        var all = req.query.all;
        const last = req.query.last;
        const on = req.query.on;
        const name = req.query.name;

        var msgArr = [];
        var array = fs.readFileSync('txt/contact.txt').toString().split("\n");
        console.log ('length', array.length)
        for(i in array) {
            if (! array[i])
                continue;
            if (name && ! array[i].contains (name))
                continue;
            if (last && (array.length - i) / 2 < last)
                continue;

            console.log(i, array[i]);
            const oneMsg = JSON.parse (array[i])
            msgArr.push(oneMsg)
        }
        res.send (msgArr)
        return;
    


        
        // filter date
        // const date = req.query.date;
        // if (date) {
        //     console.log (date, getDate())

    
    })





    app.get('/email', (req, res) => {

        console.log (getDate(), 'email to be sent, name=', req.query.name, 'email=',
         req.query.email, 'message=', req.query.message)
 
        console.log('query:', req.query)
        const msg = {date: getDate(), name: req.query.name, email: req.query.email, 
            // ip: req.query.ip, city: req.query.city, countryName: req.query.countryName, countryCode: req.query.countryCode,
            txt: req.query.message}

        // console.log (msg)

         const html = `
         <h1> ${req.query.message} </h1>
         `

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



module.exports = {email}