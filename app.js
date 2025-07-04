const express = require('express');
const shorturlRoutes = require('./routes/shorturlRoutes');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const HOSTNAME = process.env.HOSTNAME || `http://localhost:${PORT}`; // Your service's base URL


app.use(express.json()); 
app.locals.baseURL = HOSTNAME;


app.use('/', shorturlRoutes);


app.get('/:shortcode', async (req, res) => {
    const { shortcode } = req.params;
    try {
        const urlData = await require('./models/shorturl').findShortUrlByShortcode(shortcode);

        if (!urlData) {
            return res.status(404).send('Short URL not found or expired.');
        }

 
        if (urlData.expiry && new Date(urlData.expiry) < new Date()) {
            return res.status(404).send('Short URL has expired.');
        }


        await require('./models/shorturl').recordClick(
            shortcode,
            req.ip, 
            req.headers['referer'] || null 
        );

        res.redirect(urlData.originalUrl);

    } catch (error) {
        console.error('Error redirecting short URL:', error);
        res.status(500).send('Internal Server Error during redirection.');
    }
});



app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

app.listen(PORT, () => {
    console.log(`URL Shortener Microservice running on ${HOSTNAME}`);
});