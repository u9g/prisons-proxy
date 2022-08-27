module.exports = {
  sendChat (toClient, jsonMsg) {
    toClient.write('chat', { message: jsonMsg, position: 0 })
  },
  sendBigTitle (toClient, jsonMsg) {
    toClient.write('title', { action: 0, text: jsonMsg })
  },
  sendManyChat (toClient, jsonMsg) {
    for (let i = 0; i < 5; i++) this.sendChat(toClient, jsonMsg)
  },
  sendBigTitleAndManyChat (toClient, jsonMsg) {
    this.sendBigTitle(toClient, jsonMsg)
    this.sendManyChat(toClient, jsonMsg)
  }
}
