import { sendBigTitleAndManyChat } from '../client_utilities'
import { Module, ChatPacket, ServerClient, Client, Config, StateManager } from './Module'
import { HASTE_PET_OVER_MESSAGE, HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION, HASTE_PET_ACTIVE_REGEX } from '../constants'

// let hastePetActive = false

export class HastePetOver extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): boolean {
    if (msgString.startsWith(HASTE_PET_OVER_MESSAGE)) {
      //   hastePetActive = false

      if (config.haste_pet_off_notification) {
        sendBigTitleAndManyChat(toClient, HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION)
      }
    } else if (HASTE_PET_ACTIVE_REGEX.test(msgString)) {
      //   hastePetActive = true
    }
    return false
  }
}
