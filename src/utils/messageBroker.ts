// imports
import * as amqp from 'amqplib'
import { Connection, Channel, ConsumeMessage } from 'amqplib'
/**
 * Broker for async messaging
 * Singleton class
 */
export class MessageBroker {
  // declare class properties
  // declare class properties
  public connection!: Connection
  public channel!: Channel
  private static instance: MessageBroker

  /**
   * The Singleton classes' constructor should always be private to prevent
   * direct construction calls with the `new` operator
   */

  private constructor() {}

  /**
   * Initialize connection to rabbitMQ
   */
  private async init(): Promise<MessageBroker> {
    this.connection = await amqp.connect(
      process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672'
    )
    this.channel = await this.connection.createChannel()
    return this
  }

  /**
   * This method sends message to connected application listening on this queue
   * @param queue Queue to be sended with name
   * @param msg Message to be sended in buffer form
   */
  public async send(
    queue: string,
    msg: Buffer,
    options?: amqp.Options.Publish | null
  ) {
    if (!this.connection) {
      await this.init()
    }
    await this.channel.assertQueue(queue, { durable: true })
    if (options) {
      this.channel.sendToQueue(queue, msg, options)
    } else {
      this.channel.sendToQueue(queue, msg)
    }
  }

  /**
   * This method consumes message from connected application sending on this queue
   * @param queue Queue to be consumed with name
   * @param onMessage Message handler function to be consumed from buffer form
   */
  public async consume(
    queue: string,
    onMessage: (msg: ConsumeMessage | null) => void
  ) {
    if (!this.connection) {
      await this.init()
    }
    await this.channel.assertQueue(queue, { durable: true })
    await this.channel.consume(queue, onMessage, { noAck: true })
  }

  /**
   * This method used to close rabbitmq connection when server turns down
   */
  public async close() {
    if (!this.connection) {
      await this.init()
    }
    await this.connection.close()
  }

  /**
   * This method for getting message broker instance
   * @returns Singleton instance of Message Broker
   */
  public static async getInstance(): Promise<MessageBroker> {
    if (!MessageBroker.instance) {
      const broker = new MessageBroker()
      MessageBroker.instance = await broker.init()
    }
    return MessageBroker.instance
  }
}
