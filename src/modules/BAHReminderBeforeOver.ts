import { Module, ServerClient, Client, ChatPacket, Config, StateManager } from './Module'
import { sendBigTitle } from '../client_utilities'
import { BAH_OVER_IN_30S } from '../constants'

export class BAHReminderBeforeOver extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): boolean {
    if (!config.bah_reminder || !/\[\/bah\] (?:.+) has 60 seconds remaining!/.test(msgString)) return false
    setTimeout(() => sendBigTitle(toClient, BAH_OVER_IN_30S), 30 * 1000)
    return false
  }
}
