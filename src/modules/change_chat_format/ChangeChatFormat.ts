import { Module, ServerClient, Client, Config, StateManager, ChatPacket } from '../Module'
import { chatRegex } from '../../constants'
import { appendFile } from 'fs/promises'
import { SkyChatFormatter } from './chat_formatters/SkyChatFormatter'
import { VanillaChatFormatter } from './chat_formatters/VanillaChatFormatter'
import { sendChat } from '../../client_utilities'
const chatFormatters = new Map()
chatFormatters.set('sky', new SkyChatFormatter())
chatFormatters.set('vanilla', new VanillaChatFormatter())

export class ChangeChatFormat extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, packet: ChatPacket, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): boolean {
    if (config.custom_chat === false) return false

    if (!chatRegex.test(msgString)) {
      void appendFile('not_chat.txt', msgString.replace(/\n/g, '\\n') + '\n')
      return false
    }

    if (chatRegex.test(msgString)) {
      const matched = msgString.match(chatRegex)
      void appendFile('chat.txt', msgString.replace(/\n/g, '\\n') + '\n')
      const extra = JSON.parse(packet.message).extra
      if (chatFormatters.has(config.custom_chat)) {
        const newChat = chatFormatters.get(config.custom_chat).formatChat(msgString, extra, (matched ?? { groups: {} }).groups)
        sendChat(toClient, newChat)
        return true
      }
    }
    return false
  }
}
