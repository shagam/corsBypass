const nodeMailer = require('nodemailer')
const {getDate} = require ('./Utils')


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
 
         const html = `
         <h1> ${req.query.message} </h1>
         `

         main(req.query.name, req.query.email, html)
         .catch(e => console.log('send fail', e))
         
        res.send ('ok')
    })
}



module.exports = {email}