const Module = require('../Module')
const { chatRegex } = require('../../constants')
const VanillaChatFormatter = require('./chat_formatters/VanillaChatFormatter')
const SkyChatFormatter = require('./chat_formatters/SkyChatFormatter')
const clientUtils = require('../../client_utilities')

const chatFormatters = {
  sky: new SkyChatFormatter(),
  vanilla: new VanillaChatFormatter()
}

module.exports = class ChangeChatFormat extends Module {
  messageReceivedFromServerReturnTrueToCancel (msgString, data, toClient, toServer, config, state) {
    if (!config.custom_chat) return false

    if (!chatRegex.test(msgString)) {
      require('fs').promises.appendFile('not_chat.txt', msgString.replace(/\n/g, '\\n') + '\n')
      return false
    }

    if (chatRegex.test(msgString)) {
      const matched = msgString.match(chatRegex)
      require('fs').promises.appendFile('chat.txt', msgString.replace(/\n/g, '\\n') + '\n')
      const extra = JSON.parse(data.message).extra
      const formatter = chatFormatters[config.custom_chat]
      if (formatter) {
        const newChat = formatter.formatChat(msgString, extra, matched.groups)
        clientUtils.sendChat(toClient, newChat)
        return true
      }
    }
    return false
  }
}
