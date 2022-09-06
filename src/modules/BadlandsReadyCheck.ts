import { sendBigTitleAndManyChat } from '../client_utilities'
import { FORGOT_HOUSE_OF_CARDS_NOTIFICATION } from '../constants'
import { Client, Config, StateManager, ServerClient, ChatPacket, Module } from './Module'

export class BadlandsReadyCheck extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, toClient: ServerClient, _toServer: Client, config: Config, state: StateManager): boolean {
    if (!config.midas_reminders) return false
    if (msgString === 'Teleporting you to Badlands: Diamond... (DO NOT MOVE)') {
      if (!state.buffs.isActive('House Of Cards')) {
        sendBigTitleAndManyChat(toClient, FORGOT_HOUSE_OF_CARDS_NOTIFICATION)
      }
    }
    // TODO: Also check for headhunter merc
    return false
  }
}
