// src/index.ts

import Fastify from "fastify";
import { logsRoutes } from "./routes/v1/logs";
import { getKafkaProducer } from "./kafka";
import { fastifyCors } from "@fastify/cors";
import { fastifyRateLimit } from "@fastify/rate-limit";

const fastify = Fastify({
  logger: true, // Disable logging to improve performance
  bodyLimit: 1048576 * 10, // Increase body limit if needed (e.g., 10 MB)
  // Adjust other Fastify options for performance if necessary
  //   maxConcurrentRequests: 1000, // Adjust based on your server's capacity
  connectionTimeout: 2000,
});

fastify.register(fastifyCors, {
  origin: "http://localhost:3000", // Allow requests from this origin
  methods: ["POST", "GET", "OPTIONS"], // Allowed HTTP methods
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "X-Requested-With",
    "traceparent",
    "tracestate",
  ], // Allowed headers
  exposedHeaders: [
    "Content-Length",
    "Content-Length",
    "Authorization",
    "traceparent",
    "tracestate",
  ], // Headers to expose to the browser
  credentials: true, // Whether to allow credentials
});

// Register the rate limit plugin
fastify.register(fastifyRateLimit, {
  max: 100, // Maximum number of requests
  timeWindow: "1 minute", // Time window
  keyGenerator: (request) => request.ip, // Rate limit based on IP
  errorResponseBuilder: (req, context) => {
    const retryAfter = Math.round(context.ttl / 1000); // in seconds

    // Log the rate limit exceeded event
    fastify.log.warn("Rate limit exceeded", { ip: req.ip, retryAfter });

    return {
      statusCode: 429,
      error: "Too Many Requests",
      message: `You have exceeded the ${context.max} requests in ${context.ttl}. Please try again in ${retryAfter} seconds.`,
      headers: {
        "Retry-After": retryAfter.toString(),
      },
    };
  },
});

fastify.register(logsRoutes);

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: "0.0.0.0" });
    console.log("Server is running on http://localhost:3001");
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

start();

// Graceful shutdown
const shutdown = async () => {
  try {
    await fastify.close();
    const producer = await getKafkaProducer();
    await producer.disconnect();
    console.log("Kafka producer disconnected");
    process.exit(0);
  } catch (error) {
    console.error("Error during shutdown:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
