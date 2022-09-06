import { Module, ChatPacket, Client, Config, ServerClient, StateManager } from '../Module'

const MERCENARY_START = /\(!\) (.+) Mercenary: Prestige [IV]+ \[(\d+)m\]/
const MERCENARY_OVER = /\(!\) Your (.+) Mercenary effect has expired\./

export class MercenaryStateManager extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, _toClient: ServerClient, _toServer: Client, _config: Config, state: StateManager): boolean {
    if (MERCENARY_START.test(msgString)) {
      const matched = msgString.match(MERCENARY_START)
      if (matched == null || typeof matched[1] !== 'string') return false
      console.log(`Setting '${matched[1]}' to true`)
      state.buffs.setActive(matched[1] as any, true)
    } else if (MERCENARY_OVER.test(msgString)) {
      const matched = msgString.match(MERCENARY_OVER)
      if (matched == null || typeof matched[1] !== 'string') return false
      console.log(`Setting '${matched[1]}' to false`)
      state.buffs.setActive(matched[1] as any, true)
    }
    return false
  }
}
