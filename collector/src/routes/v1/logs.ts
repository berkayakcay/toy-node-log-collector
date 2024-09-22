// src/routes/logs.ts

import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { getKafkaProducer } from "../../kafka";
import { CompressionTypes } from "kafkajs";

export async function logsRoutes(fastify: FastifyInstance) {
  fastify.addContentTypeParser(
    "application/json",
    { parseAs: "buffer" },
    function (req, body, done) {
      done(null, body);
    }
  );

  fastify.post(
    "/v1/logs",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const producer = await getKafkaProducer();
        const rawBody = request.body as Buffer;

        // Send the raw body directly to Kafka
        await producer.send({
          topic: "logx-ingesting-kafka-topic",
          messages: [
            {
              value: rawBody,
            },
          ],
          compression: CompressionTypes.GZIP,
        });

        reply.code(200).send({ status: "OK" });
      } catch (error: any) {
        console.error("Error processing logs:", error);
        reply.code(500).send({ status: "Error", message: error.message });
      }
    }
  );
}
