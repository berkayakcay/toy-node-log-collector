// src/kafka.ts

import { Kafka, Producer } from "kafkajs";

let producer: Producer;

export async function getKafkaProducer(): Promise<Producer> {
  if (producer) {
    return producer;
  }

  const kafka = new Kafka({
    clientId: "logx-ingestion",
    brokers: ["localhost:9092"],
    connectionTimeout: 3000,
    requestTimeout: 30000,
    // SSL/SASL configurations
  });

  producer = kafka.producer({
    allowAutoTopicCreation: false, // Disable auto topic creation for production
    maxInFlightRequests: 5, // Control the number of in-flight requests (higher = better throughput)
    // lingerMs: 10, // Time to wait before sending a batch, allows more messages to be batched together
    // maxRetryTime: 30000, // Maximum retry time for transient errors
    idempotent: false, // Disable idempotence for higher throughput
    transactionTimeout: 60000,
    retry: {
      retries: 5, // Number of retries on transient failures
      initialRetryTime: 300, // Initial wait time before a retry
      maxRetryTime: 30000, // Maximum total retry time
      factor: 2,
      multiplier: 1.5,
    },
  });

  await producer.connect();

  return producer;
}
