const { nanoid } = require('nanoid');
const ShortUrl = require('../models/shorturl'); // To check for uniqueness

const SHORTCODE_LENGTH = 7; // You can adjust this length

/**
 * Generates a unique shortcode.
 * @returns {Promise<string>} A unique shortcode.
 */
async function generateUniqueShortcode() {
    let shortcode;
    let isUnique = false;

    // Keep generating until a unique one is found
    while (!isUnique) {
        shortcode = nanoid(SHORTCODE_LENGTH); // Generate a random shortcode
        const existingUrl = await ShortUrl.findShortUrlByShortcode(shortcode);
        if (!existingUrl) {
            isUnique = true;
        }
    }
    return shortcode;
}

module.exports = generateUniqueShortcode;