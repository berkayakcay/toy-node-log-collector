const kafkajs = require('kafkajs');

const kafka = new kafkajs.Kafka({
    logLevel: kafkajs.logLevel.WARN,
    clientId: 'logx-service',
    brokers: ['localhost:9092']
});


const topic = 'topic-logx-001'
const desiredPartitionCount = 3; // Desired number of partitions
const admin = kafka.admin()
const connectAdmin = async () => {
    try {
        await admin.connect();

        // Check if the topic exists
        const topics = await admin.listTopics();

        if (!topics.includes(topic)) {
            // Create the topic if it does not exist
            await admin.createTopics({
                topics: [
                    {
                        topic: topic,
                        numPartitions: 3,
                        replicationFactor: 1
                    },
                ],
            });
            console.debug(`Topic "${topic}" created`);
        } else {
            console.debug(`Topic "${topic}" already exists`);
        }


        // Get metadata for the topic
        const metadata = await admin.fetchTopicMetadata({ topics: [topic] });
        const topicMetadata = metadata.topics.find(f => f.name === topic);

        if (!topicMetadata) {
            console.error(`Topic "${topic}" does not exist`);
            return;
        }

        const currentPartitionCount = topicMetadata.partitions.length;
        console.debug(`Current partition count for topic "${topic}": ${currentPartitionCount}`);


        // Check if more partitions are needed
        if (currentPartitionCount < desiredPartitionCount) {
            // Create additional partitions
            await admin.createPartitions({
                topicPartitions: [
                    {
                        topic: topic,
                        count: desiredPartitionCount - currentPartitionCount,
                    },
                ],
            });
            console.debug(`Increased partitions for topic "${topic}" to ${desiredPartitionCount}`);
        } else {
            console.debug(`Topic "${topic}" already has ${currentPartitionCount} partitions`);
        }
    } catch (error) {
        console.error('Error:', error);
    }
    finally {
        await disconnectAdmin()
        console.debug("connectAdmin");
    }
}

async function disconnectAdmin() {
    await admin.disconnect();
    console.debug("disconnectAdmin");
}




const producer = kafka.producer({
    maxInFlightRequests: 5, // Control the number of in-flight requests (higher = better throughput)
    lingerMs: 10, // Time to wait before sending a batch, allows more messages to be batched together
    maxRetryTime: 30000, // Maximum retry time for transient errors
    allowAutoTopicCreation: true,
    idempotent: false, // Disable idempotence for higher throughput
    transactionTimeout: 60000,
    retry: {
        retries: 5, // Number of retries on transient failures
        initialRetryTime: 300, // Initial wait time before a retry
        maxRetryTime: 30000, // Maximum total retry time
    }
});

async function connectProducer() {
    await producer.connect();
    console.debug("connectProducer");
}

async function disconnectProducer() {
    await producer.disconnect();
    console.debug("disconnectProducer");
}


async function produceLogBatch(logs) {
    try {
        await producer.send({
            topic: topic,
            acks: 1, // Set acks to 1 for better throughput (acknowledge only leader)
            compression: kafkajs.CompressionTypes.GZIP, // Use compression for reducing message size
            messages: [{ value: JSON.stringify(logs) }],
        });
    } catch (error) {
        console.error('Error sending log to Kafka', error);
    }
}


module.exports = {
    connectAdmin,
    disconnectAdmin,
    connectProducer,
    disconnectProducer,
    produceLogBatch
}