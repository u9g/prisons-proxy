import { ChatPacket, Module, ServerClient, Client, Config, StateManager } from './Module'
import { once } from 'events'
import mcdLoader from 'minecraft-data'
import { sendChat, sendManyChat } from '../client_utilities'
import { UNHOLIED_MESSAGES, NO_GODLY_XP_BOTTLE_NOTIFICATION, DONT_HAVE_SYNTHETICS_MESSAGES } from '../constants'
const mcdata = mcdLoader('1.8.9')

export class EnterExecInventoryCheck extends Module {
  override messageReceivedFromServerReturnTrueToCancel (msgString: string, _packet: ChatPacket, toClient: ServerClient, toServer: Client, config: Config, _state: StateManager): boolean {
    if (msgString === '(!) Welcome to the Executive Mine.') {
      void onEnterExec(toClient, toServer, config)
    }
    return false
  }
}

async function onEnterExec (toClient: ServerClient, toServer: Client, config: Config): Promise<void> {
  if (!config.exec_reminders) return
  await once(toServer, 'window_items')
  const [{ items }] = await once(toServer, 'window_items')
  let hasNaturalXP = false
  const synthetics: Map<String, boolean> = new Map()
  for (let i = 5; i <= 8; i++) { // iterate armor
    if (items[i]?.nbtData?.value?.chargable?.value != null && items[i]?.nbtData?.value?.chargable?.value?.holyWhiteScroll?.value !== 1) {
      toClient.write('chat', { position: 0, message: UNHOLIED_MESSAGES[i - 5] })
    }
  }
  for (const item of items) {
    if (item.blockId !== -1) {
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const mcdItem = mcdata.items[item.blockId]!
      if (mcdItem.name.endsWith('_pickaxe') && item.nbtData?.value?.chargable?.value?.whiteScroll?.value !== 1) {
        sendChat(toClient, JSON.stringify({ bold: true, extra: [{ text: item?.nbtData?.value?.display?.value?.Name?.value ?? mcdItem.displayName, extra: [{ color: 'red', text: ' << UNWHITESCROLLED' }] }], text: 'YOU LEFT YOUR PICKAXE CALLED >> ' }))
      } else if (item?.nbtData?.value?._x?.value === 'miningxp' && item?.nbtData?.value?.['joe-miningXP-extractor'] == null) {
        hasNaturalXP = true
      } else if (item?.nbtData?.value?._x?.value === 'synthetic') {
        synthetics.set(item.nbtData.value.__type.value, true)
      }
    }
  }

  if (!hasNaturalXP) sendManyChat(toClient, NO_GODLY_XP_BOTTLE_NOTIFICATION)

  Object.entries(DONT_HAVE_SYNTHETICS_MESSAGES)
    .filter(([syntheticName]) => !synthetics.has(syntheticName))
    .forEach(([, msg]) => sendChat(toClient, msg))
}
