import { MessageBroker } from './utils'

const result = [
  {
    id: 1,
    name: 'apple',
    price: 123
  },
  {
    id: 2,
    name: 'manga',
    price: 23
  },
  {
    id: 3,
    name: 'pomodore',
    price: 1
  }
]

const appHandler = async () => {
  console.log('HEEE')
  const broker = await MessageBroker.getInstance()
  await broker.consume('products:get-all', async msg => {
    console.log('Products get_products service is recieved')
    console.log(JSON.parse(msg!.content.toString()))

    await broker.send(
      msg!.properties.replyTo,
      Buffer.from(JSON.stringify(result)),
      {
        correlationId: msg!.properties.correlationId
      }
    )
  })
}

appHandler()

// stop rabbitmq connection when server stops
process.on('beforeExit', async () => {
  const amqp = await MessageBroker.getInstance()
  console.log('closing')
  await amqp.close()
})
