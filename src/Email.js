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

    
    app.get('/email', (req, res) => {

        console.log (getDate(), 'email to be sent, name=', req.query.name, 'email=',
         req.query.email, 'message=', req.query.message)
 
        console.log('query:', req.query)
        const msg = {date: getDate(), name: req.query.name, email: req.query.email, ip: req.query.ip,
             city: req.query.city, countryName: req.query.countryName, countryCode: req.query.countryCode,
            txt: req.query.message}

        console.log (msg)

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