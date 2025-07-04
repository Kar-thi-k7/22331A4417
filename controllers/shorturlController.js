const isValidHttpUrl = require('is-valid-http-url');
const moment = require('moment/ts3.1-typings/moment'); 
const ShortUrl = require('../models/shorturl'); 
const generateUniqueShortcode = require('../utils/shortcodeGenerator');
const { getGeoLocationFromIP } = require('../utils/ipUtils'); 




exports.createShortUrl = async (req, res) => {
    const { url, validity, shortcode } = req.body;
    const baseURL = req.app.locals.baseURL; 


    if (!url || !isValidHttpUrl(url)) {
        return res.status(400).json({ message: 'Invalid or missing "url" in request body. Must be a valid URL.' });
    }


    if (validity !== undefined && (!Number.isInteger(validity) || validity <= 0)) {
        return res.status(400).json({ message: 'Optional "validity" must be a positive integer representing minutes.' });
    }

    if (shortcode !== undefined && (typeof shortcode !== 'string' || shortcode.trim() === '')) {
        return res.status(400).json({ message: 'Optional "shortcode" must be a non-empty string.' });
    }

    try {
        let finalShortcode = shortcode;

        if (finalShortcode) {
            const existingUrl = await ShortUrl.findShortUrlByShortcode(finalShortcode);
            if (existingUrl) {
                return res.status(409).json({ message: `Custom shortcode '${finalShortcode}' is already in use.` });
            }
        } else {
    
            finalShortcode = await generateUniqueShortcode();
        }

       
        const expiryDate = moment().add(validity || 30, 'minutes').toISOString(); // Default to 30 mins

      
        const shortUrlData = {
            originalUrl: url,
            shortcode: finalShortcode,
            creationDate: moment().toISOString(),
            expiry: expiryDate,
            clicks: [] 
        };

        await ShortUrl.createShortUrl(shortUrlData);

       
        res.status(201).json({
            shortLink: `${baseURL}/${finalShortcode}`,
            expiry: expiryDate
        });

    } catch (error) {
        console.error('Error creating short URL:', error);
        res.status(500).json({ message: 'Internal Server Error while creating short URL.' });
    }
};



exports.getShortUrlStatistics = async (req, res) => {
    const { shortcode } = req.params;
    const baseURL = req.app.locals.baseURL;

    try {
        const urlData = await ShortUrl.findShortUrlByShortcode(shortcode);

        if (!urlData) {
            return res.status(404).json({ message: `Short URL with shortcode '${shortcode}' not found.` });
        }

     
        const detailedClickData = urlData.clicks.map(click => {
            const geo = getGeoLocationFromIP(click.ipAddress); 
            return {
                timestamp: click.timestamp,
                source: click.referrer,
                geoLocation: geo ? { city: geo.city, country: geo.country } : null 
            };
        });

        res.status(200).json({
            shortcode: urlData.shortcode,
            shortLink: `${baseURL}/${urlData.shortcode}`,
            totalClicks: urlData.clicks.length,
            originalUrlInfo: {
                originalUrl: urlData.originalUrl,
                creationDate: urlData.creationDate,
                expiryDate: urlData.expiry
            },
            detailedClicks: detailedClickData
        });

    } catch (error) {
        console.error('Error retrieving short URL statistics:', error);
        res.status(500).json({ message: 'Internal Server Error while retrieving statistics.' });
    }
};