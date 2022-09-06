import { Module, ChatPacket, Client, Config, ServerClient, StateManager } from '../Module'

export class CustomBlockStateManager extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, _toClient: ServerClient, _toServer: Client, _config: Config, state: StateManager): boolean {
    if (msgString === 'Gain a Midas Vault buff for 1h 30m') {
      console.log('Setting \'House Of Cards\' to false')
      state.buffs.setActive('House Of Cards', true)
    }
    return false
  }
}
