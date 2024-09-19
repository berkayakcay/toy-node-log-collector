
const fastify = require("fastify")({ logger: true });
const compress = require('@fastify/compress');
const cors = require('@fastify/cors'); // Import the CORS plugin
const zlib = require('zlib');
const util = require('util');

// Promisify gzip decompress
const gunzip = util.promisify(zlib.gunzip);

// Register the compress plugin for response compression
fastify.register(compress, {
    global: false, // We'll handle response compression manually if needed
    threshold: 1024, // Compress responses larger than 1KB
});

// Custom Content Type Parser for application/json with optional gzip decompression
fastify.addContentTypeParser('application/json', { parseAs: 'buffer' }, async (req, body, done) => {
    try {
        if (req.headers['content-encoding'] === 'gzip') {
            // Decompress the gzip-encoded body
            const decompressed = await gunzip(body);
            const json = JSON.parse(decompressed.toString());
            fastify.log.info(null, json)
            done(null, json);
        } else {
            // If not compressed, parse as JSON normally
            const json = JSON.parse(body.toString());
            fastify.log.info(null, json)
            done(null, json);
        }
    } catch (err) {
        done(err);
    }
});


// Register the CORS plugin with configuration
fastify.register(cors, {
    origin: 'http://localhost:3000', // Allow requests from this origin
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Allowed methods
    credentials: true
});



const port = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await fastify.listen({ port: port, host: '0.0.0.0' })
    } catch (error) {
        fastify.log.error(err)
        process.exit(1)
    }
};



const ingestion = require('./ingestion')
// Define the Fastify route to accept OpenTelemetry JSON
fastify.post('/v1/logs', async (request, reply) => {
    const logs = request.body; // Handle single or multiple logs
    try {
        await ingestion.ingest(logs);
        reply.code(200).send({ status: 'success' });
    } catch (error) {
        fastify.log.error('Error sending data to Kafka:', err);
        reply.code(500).send({ status: 'error', message: err.message });
    }
});


module.exports = {
    startServer
}