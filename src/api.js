const express = require('express');
const serverless = require ('serverless-http');


const app = express();



const router = express.Router();

let records = []

// get all students

router.get ('/', (req, res) => {
    res.json ({'hellow': 'hi!'})
})

app.use('/.netlify/functions/api', router)

// Create a new record 
router.get('/add', (req,res) => {
    res.json ({'hellow': 'hi add'})
})

module.exports.handler = serverless(app);

  