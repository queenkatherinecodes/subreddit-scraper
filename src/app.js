// imports the necessary libraries
const axios = require('axios')
const express = require('express')

// sets the default limit for number of subreddit posts to 100
const DEFAULT_LIMIT = 100;

// sets the error messages
const NO_SUBREDDIT_ERROR = 'There is no subreddit with that name: ';
const ERROR = 'Failed to fetch data from the Reddit url';
const SERVER_ERROR = 'Failed to start the server at local port 3000';

// creates an instance of the express module
const app = express()

// creates an instance of the express-winston and winston library logger
const expressWinston = require('express-winston')
const { transports, format } = require('winston')
const logger = require('./logger')

// configures expressWinston to log HTTP requests
app.use(
    expressWinston.logger({
    winstonInstance: logger,
    statusLevels: true
    })
);

// tries to get the desired reddit data and catches the appropriate error(s)
app.get('/reddit-viewer/:subreddit', async (req, res) => {
    try{
        const subreddit = req.params.subreddit;
        const limit = req.query.limit || DEFAULT_LIMIT;

        // uses the axios library to get the json objects from the reddit url
        const response = await axios.get(`http://www.reddit.com/r/${subreddit}/top/.json?limit=${limit}`);

        /** If the json response's children data is empty, the subreddit does not exist.
         * Thus, returns a 404 error and message to the local host.
         * Else, sanitizes the json object(s) to only return the desired fields.
         */
        if(response.data.data.children.length === 0) {
            logger.error(NO_SUBREDDIT_ERROR + subreddit);
            res.status(404).json({error: NO_SUBREDDIT_ERROR + subreddit});
            return;
        }else{
            const sanitizedData = response.data.data.children.map((child) => 
            {
            const { title, url, author, score } = child.data;
            return { title, url, author, score };
            });
            res.json(sanitizedData);
        }
    }catch (error) {
        logger.error(ERROR, error);
        res.status(500).json({error: ERROR});
    }
});

// initializes the port environment variable
const port = process.env.PORT || 3000;
try {
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
}catch(error){
    logger.error(SERVER_ERROR, error);
}

// exports the module for unit testing
module.exports = app;