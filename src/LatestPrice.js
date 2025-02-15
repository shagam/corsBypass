const axios = require('axios')
const {getDate} = require ('./Utils')
const {fetchPage} = require('./FetchPage')
const cheerio = require('cheerio');



// Fetch the URL
const fetchUrl = async (url, res) => {
     try {
        const { data } = await axios.get(url);
        return data;
        } catch (error) {
            console.error(`Error fetching the URL: ${error.message}`);
        return null;
        }
    };
    
    // Parse and fetch subpages
    const fetchSubPages = async (baseUrl, html, res) => {
        const $ = cheerio.load(html);
        const links = $('a'); // Get all anchor tags
        const subPageUrls = [];
        
        links.each((_, link) => {
            const href = $(link).attr('href');
            if (href && href.startsWith('/')) {
                subPageUrls.push(`${baseUrl}${href}`);
            }
        });
        console.log ('subPageUrls', subPageUrls)
        for (const subPageUrl of subPageUrls) {
            const subPageHtml = await fetchUrl(subPageUrl, res);
            if (subPageHtml === null)
            console.log(`Fetched subpage: ${subPageUrl}`);
            // Process the subpage HTML as needed
        }

    };
    
    const main = async (res, url_) => {
        var url = 'https://example.com';
        if (url_)
            url = url_;

        const baseUrl =  url; //'https://example.com';
    
        const mainPageHtml = await fetchUrl(url, res);
        if (mainPageHtml) {
            await fetchSubPages(baseUrl, mainPageHtml, res);
        }
    };
    
    // main();




function latestPrice (app) {
//   console.log ('prepare latestPrice')
  app.get('/latestPrice', (req, res) => {
    // var nowMili = Date.now();
    console.log ('\n', getDate(), 'latestPrice', req.query)
    const LOG = req.query.LOG
    const stock = req.query.stock

    var url;
    var pattern;



    if (req.query.src === 'fetchPage') {
        
        if (! url)
            url = 'https://www.nasdaq.com/market-activity/etf/' + stock + '/after-hours'
        pattern = '<bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">([0-9.]+)</bg-quote>'

        console.log ('url=', url)
        // fetchPage('https://www.nasdaq.com/market-activity/etf/qqq/after-hours')
        const txt = fetchPage (url)
        console.log ('latestPrice fechPage_length=', txt.length)
        res.send (txt.length);
        return;
    }



    if (req.query.src === 'goog'){
        url = 'https://www.google.com/finance/quote/' + req.query.stock + ':NASDAQ'
        pattern = 'data-currency-code="USD" data-last-price="([0-9.]+)'
    }
    else if (req.query.src === 'nasdaq') {
        url = 'https://www.nasdaq.com/market-activity/etf/' + req.query.stock
            // <bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">513.26</bg-quote>
        pattern = '<bg-quote class="value" field="Last" format="0,0.00" channel="/zigman2/quotes/208575548/composite,/zigman2/quotes/208575548/lastsale" session="pre">([0-9.]+)</bg-quote>'
    }
    else if (req.query.src === 'yahoo') {
        url = 'https://finance.yahoo.com/quote/' + req.query.stock + '/'
        pattern = 'data-testid="qsp-pre-price">([0-9.]+)'
    }
    else if (req.query.src === 'watch') {
        url = 'https://www.marketwatch.com/investing/fund/' + req.query.stock 
        pattern = 'data-last-raw="([0-9.]+)">([0-9.]+)</bg-quote>'
    }
    else {
        res.send ('fail, invalid src type');
        return;
    }

    if (req.query.subPages) {
        main(res, url)
        res.send('done')
        console.log ('done')
        return;
    }


    console.log (url)
    axios.get (url)
    .then ((result) => {
        const text = result.data;
        if (LOG)
        console.log ('resp length', JSON.stringify (text).length)

    //   data-currency-code="USD" data-last-price="505.08" 

        const rx = new RegExp (pattern,'g');
        const rs = rx.exec(text) 

        if (rs) {
            const dat = {
                price: rs[1],
            } 
            console.log ('response', dat)
            res.send (dat)
        }
        else {
            console.log ('fail')
            res.send ('fail')     
        }
        })
    .catch ((err) => {
        console.log(req.query.stock, err.message)
        res.send('fail' + err.message)
        })
    })
}






module.exports = {latestPrice}