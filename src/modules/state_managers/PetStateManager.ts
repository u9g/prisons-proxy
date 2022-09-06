import { Module, ChatPacket, Client, Config, ServerClient, StateManager } from '../Module'

const PET_START = /\(!\) (.+) Pet: .+/
const PET_RUN_OUT = /\(!\) Your (.+) Pet has run out\./
const SONIC_PET_STARTED = /\(!\) Sonic Pet: you now have Gears IV for (\d+) seconds/

export class PetStateManager extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, _toClient: ServerClient, _toServer: Client, _config: Config, state: StateManager): boolean {
    if (PET_START.test(msgString)) {
      const matched = msgString.match(PET_START)
      if (matched == null || typeof matched[1] !== 'string') return false
      console.log(`Setting '${matched[1]}' to true`)
      state.buffs.setActive(matched[1] as any, true)
      if (matched[1] === 'Sonic') {
        const matched = msgString.match(SONIC_PET_STARTED)
        if (matched != null) {
          const time = matched[1]
          if (time != null) {
            setTimeout(() => {
              console.log('Setting \'Sonic\' to false')
              state.buffs.setActive('Sonic', false)
            }, +time * 1000)
          }
        }
      }
    } else if (PET_RUN_OUT.test(msgString)) {
      const matched = msgString.match(PET_RUN_OUT)
      if (matched == null || typeof matched[1] !== 'string') return false
      console.log(`Setting '${matched[1]}' to false`)
      state.buffs.setActive(matched[1] as any, false)
    } else if (msgString === '(!) Your Mining Speed Booster has expired.') {
      console.log('Setting \'Haste\' to false')
      state.buffs.setActive('Haste', false)
    } else if (/\(!\) Your \+(\d+)% ore \/sell price booster has run out\./.test(msgString)) {
      console.log('Setting \'Sell\' to false')
      state.buffs.setActive('Sell', false)
    } else if (state.buffs.isActive('Energy') && /\(!\) Your (\d+(?:\.\d+)?)x Energy Booster has expired\./.test(msgString)) {
      console.log('Setting \'Energy\' to false')
      state.buffs.setActive('Energy', false)
    } else if (state.buffs.isActive('XP') && /(!) Your 2.2x Mining XP Booster has expired./.test(msgString)) {
      console.log('Setting \'XP\' to false')
      state.buffs.setActive('XP', false)
    } else if (/Shockwave Pet \+\d+ XP (\d+ \/ \d+)/.test(msgString)) {
      console.log('Setting \'Shockwave\' to false')
      state.buffs.setActive('Shockwave', true)
    }
    return false
  }
}
