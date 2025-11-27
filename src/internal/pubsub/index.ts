import type { ConfirmChannel, ChannelModel } from "amqplib";
import amqp from "amqplib";

export type SimpleQueueType = "durable" | "transient";

export async function publishJSON<T>(
  ch: ConfirmChannel,
  exchange: string,
  routingKey: string,
  value: T
): Promise<void> {
  const valueJSON = JSON.stringify(value);
  ch.publish(exchange, routingKey, Buffer.from(valueJSON), {
    contentType: "application/json",
  });
}

export async function declareAndBind(
  conn: amqp.ChannelModel,
  exchange: string,
  queueName: string,
  key: string,
  queueType: SimpleQueueType
): Promise<[amqp.Channel, amqp.Replies.AssertQueue]> {
  const channel = await conn.createChannel();

  const queue = await channel.assertQueue(queueName, {
    autoDelete: queueType === "transient" ? true : false,
    exclusive: queueType === "transient" ? true : false,
    durable: queueType === "durable" ? true : false,
    arguments: null,
  });

  await channel.bindQueue(queueName, exchange, key);
  return [channel, queue];
}
