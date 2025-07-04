const moment = require('moment/ts3.1-typings/moment');


const shortUrls = [];


/**
 * Creates a new short URL entry in the database.
 * @param {object} data - The short URL data.
 * @returns {Promise<object>} The created short URL object.
 */
async function createShortUrl(data) {
    // In a real DB, this would be an insert operation
    shortUrls.push(data);
    console.log('Short URL created (in-memory):', data);
    return data;
}

/**
 * Finds a short URL by its shortcode.
 * @param {string} shortcode - The shortcode to find.
 * @returns {Promise<object|null>} The found short URL object or null if not found.
 */
async function findShortUrlByShortcode(shortcode) {
    // In a real DB, this would be a findOne operation
    const url = shortUrls.find(url => url.shortcode === shortcode);
    return url || null;
}

/**
 * Records a click for a given shortcode.
 * @param {string} shortcode - The shortcode that was clicked.
 * @param {string} ipAddress - The IP address of the clicker.
 * @param {string} referrer - The HTTP referrer.
 */
async function recordClick(shortcode, ipAddress, referrer) {
    const url = await findShortUrlByShortcode(shortcode);
    if (url) {
        url.clicks.push({
            timestamp: moment().toISOString(),
            ipAddress: ipAddress,
            referrer: referrer
        });
        console.log(`Click recorded for shortcode '${shortcode}' (in-memory).`);
    }
}

module.exports = {
    createShortUrl,
    findShortUrlByShortcode,
    recordClick
};