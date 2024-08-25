const { produceLogBatch } = require('./kafka');

let logBuffer = [];
const bufferLimit = 100; // Buffer limit (number of logs)
const flushInterval = 15000; // Flush every x seconds


// Function to flush the buffer to Kafka
const flushBuffer = async () => {
    if (logBuffer.length > 0) {
        const logsToFlush = [...logBuffer];
        logBuffer = []; // Clear buffer before sending
        try {
            await produceLogBatch(logsToFlush);
        } catch (error) {
            console.error('Error producing log batch:', error);
            // keep the logs in the buffer or handle errors differently
        }
    }
};
// Periodically flush the buffer to Kafka
const flushBufferInterval = setInterval(flushBuffer, flushInterval);

const ingest = async (logs) => {
    const logEntry = logs;

    logBuffer.push(logEntry);

    if (logBuffer.length >= bufferLimit) {
        const logsToFlush = [...logBuffer];
        logBuffer = []; // Clear buffer before sending
        try {
            produceLogBatch(logsToFlush);
        } catch (error) {
            console.error('Error producing log batch:', error);
            // Handle error as needed, such as keeping the logs in buffer
        }
    }
};

module.exports = { ingest, flushBufferInterval };