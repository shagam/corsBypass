
const {getDate} = require ('./Utils')

function email (app)  {
    // nowMili = Date.now();

    app.get('/email', (req, res) => {

        console.log (getDate(), 'Send email, name=', req.query.name, 'email=',
         req.query.email, 'message=', req.query.message)


        res.send ('ok')
    })
}

module.exports = {email}