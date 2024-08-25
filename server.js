
const express = require("express");
const compression = require('compression');
const ingestion = require('./ingestion')

const app = express();
app.use(express.json({ limit: '10mb' })); // Middleware for parsing JSON

app.use(compression());
const port = process.env.PORT || 3000;

const startServer = () => {
    return new Promise((resolve, reject) => {
        const server = app.listen(port, () => {
            console.log(`LOGX  listening at http://localhost:${port}`);
            resolve(server);
        });
        server.on("error", reject)
    });
};



app.post('/log', async (req, res) => {
    // console.log('Received request');
    const logs = req.body; // Handle single or multiple logs
    try {
        // console.log('Starting ingestion...');
        await ingestion.ingest(logs);
        // console.log('Ingestion complete');
        res.status(204).end();
    } catch (error) {
        console.error('Error ingesting logs:', error);
        res.status(500).json({ error: 'Internal Server Error' }).end();
    }
});



module.exports = {
    startServer
}