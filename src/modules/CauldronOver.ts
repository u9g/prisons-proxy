import { sendBigTitleAndManyChat } from '../client_utilities'
import { ChatPacket, Module, Client, ServerClient, Config, StateManager } from './Module'
import { CAULDRON_OVER_MESSAGE, CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION, CAULDRON_ACTIVE_MESSAGE } from '../constants'

// let cauldronActive = false

export class CauldronOver extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): boolean {
    if (msgString.startsWith(CAULDRON_OVER_MESSAGE)) {
      //   cauldronActive = false

      if (config.cauldron_off_notification) {
        sendBigTitleAndManyChat(toClient, CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION)
      }
    } else if (msgString === CAULDRON_ACTIVE_MESSAGE) {
      //   cauldronActive = true
    }
    return false
  }
}
