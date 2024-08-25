const dotenv = require('dotenv');
dotenv.config();
const cluster = require('node:cluster');
const { flushBufferInterval } = require('./ingestion');


const kafka = require("./kafka");
const { startServer } = require("./server")

const startApplication = async () => {
    try {
        await startServer();
        await kafka.connectAdmin().catch(e => kafka.logger().error(`[admin] ${e.message}`, { stack: e.stack }))
        await kafka.connectProducer().catch(e => kafka.logger().error(`[producer] ${e.message}`, { stack: e.stack }))
    } catch (error) {
        console.console.error('ERROR on startApplication')
    }
};

// startApplication();

if (cluster.isMaster) {
    console.log("NODE_ENV", process.env.NODE_ENV)
    // FORK it
    for (let i = 0; i < 2; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died`);
        // Restart the worker process if it dies
        cluster.fork();
    });
} else {
    startApplication();
}






// SERVER - unhandled errors and gracefully shutdown
const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.map(type => {
    process.on(type, async e => {
        try {
            console.log('disconnecting');
            await kafka.disconnectAdmin();
            await kafka.disconnectProducer();
            clearInterval(flushBufferInterval);
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})

signalTraps.map(type => {
    process.once(type, async () => {
        console.log(`process.on ${type}`);
        try {
            console.log('disconnecting');
            await kafka.disconnectAdmin();
            await kafka.disconnectProducer();
            clearInterval(flushBufferInterval);
            process.exit(0)
        } catch (_) {
            process.exit(1)
        }
    })
})