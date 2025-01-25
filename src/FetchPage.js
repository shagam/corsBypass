const axios = require('axios');
const cheerio = require('cheerio');


async function fetchPage(url) {
    try {
        const { data } = await axios.get(url);
        return cheerio.load(data);
    } catch (error) {
        console.error(`Error fetching ${url}:`, error);
        return null;
    }
}

async function fetchSubPages(url, selector) {
    const $ = await fetchPage(url);
    if (!$) return;

    const subPageLinks = [];
    $(selector).each((index, element) => {
        const link = $(element).attr('href');
        if (link) {
            subPageLinks.push(new URL(link, url).href);
        }
    });

    const subPagesContent = await Promise.all(subPageLinks.map(fetchPage));
    return subPagesContent;
}
// //'ttps://www.nasdaq.com/market-activity/etf/qqq/after-hours'
// (async () => {
//     const mainUrl = 'https://example.com';
//     const subPageSelector = 'a.subpage-link'; // Adjust the selector to match your needs

//     const mainPageContent = await fetchPage(mainUrl);
//     const subPagesContent = await fetchSubPages(mainUrl, subPageSelector);

//     console.log('Main Page Content:', mainPageContent.html());
//     subPagesContent.forEach((subPage, index) => {
//         if (subPage) {
//             console.log(`Sub Page ${index + 1} Content:`, subPage.html());
//         }
//     });
// })();

module.exports = {fetchPage}