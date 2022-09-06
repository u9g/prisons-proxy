import { InstantConnectProxy } from 'prismarine-proxy'
import * as pnbt from 'prismarine-nbt'
import mcdLoader from 'minecraft-data'
import * as clientUtils from './client_utilities'
import { ArmorLowEnergy } from './modules/ArmorLowEnergy'
import { ArmorLowDurability } from './modules/ArmorLowDurability'
import { Openables } from './modules/Openables'
import { EnchantPagePerPercentPriceAH } from './modules/price_per_unit_ah/EnchantPagePerPercentPriceAH'
import { CauldronOver } from './modules/CauldronOver'
import { HastePetOver } from './modules/HastePetOver'
import { EnterExecInventoryCheck } from './modules/EnterExecInventoryCheck'
import { ExecExtenderTradePrice } from './modules/ExecExtenderTradePrice'
import { PitConfirmation } from './modules/PitConfirmation'
import { ChangeChatFormat } from './modules/change_chat_format/ChangeChatFormat'
import { BAHReminderBeforeOver } from './modules/BAHReminderBeforeOver'
import { ExecExtenderPerMinutePriceAH } from './modules/price_per_unit_ah/ExecExtenderPerMinutePriceAH'
import { parse, stringify } from 'mojangson'
import pchatLoader from 'prismarine-chat'
import {
  fingers,
  ORE_MINED_AMOUNT_REGEX,
  SLOT_TO_ARMOR_NAME,
  MAX_ENCHANT_REGEX,
  NOT_MAX_ENCHANT_REGEX,
  NOT_MAX_ENCHANT_WITH_EXTRA_REGEX,
  MAX_ENCHANT_WITH_EXTRA_REGEX,
  CC_REQUIRED_REGEX,
  CHARGE_ORB_SLOT_LINE,
  romanToInt,
  minutes, seconds,
  midasSpawnedInCorner,
  midasWillSpawnInCorner,
  midasCornerCommandConfirm,
  ArmorType
} from './constants'
import { Config, Item, StateManager } from './types'
import { ChatComponent, Packet } from './packet_types'
import { Client, ServerClient } from 'minecraft-protocol'
import { addPriceInfoToItem } from './auction_utilities'
import { BadlandsReadyCheck } from './modules/BadlandsReadyCheck'
import { MercenaryStateManager } from './modules/state_managers/MercenaryStateManager'
import { PetStateManager } from './modules/state_managers/PetStateManager'
import { CustomBlockStateManager } from './modules/state_managers/CustomBlockStateManager'
const mcdata = mcdLoader('1.8.9')
const pchat = pchatLoader('1.8.9')
// const { addPriceInfoToItem } = require('./auction_utilities')

const state = new StateManager()
const config: Config = {
  remake_item_lore: true,
  exec_extender_ah_min_price: true,
  disable_powerball: true,
  disable_items_on_ground: false,
  show_pets_on_cooldown: true,
  exec_extender_trade_price: true,
  show_full_midas_satchels: true,
  dotstoops_mode: false,
  make_openables_different: false,
  hide_particles: true,
  midas_corner_reminders: true,
  exec_reminders: true,
  midas_reminders: true,
  cauldron_off_notification: true,
  haste_pet_off_notification: true,
  confirm_enter_pit: true,
  show_average_price: false,
  custom_chat: 'sky', // 'vanilla' || false
  notify_on_low_energy: true,
  notify_on_low_durability: true,
  brag_hover_text: true,
  bah_reminder: true
}

console.log('it started')

const DEBUG = {
  log_inWindow_changes: false
}

const modules = [
  new ArmorLowEnergy(),
  new ArmorLowDurability(),
  new Openables(),
  new ExecExtenderPerMinutePriceAH(),
  new CauldronOver(),
  new HastePetOver(),
  new EnterExecInventoryCheck(),
  new ExecExtenderTradePrice(),
  new PitConfirmation(),
  new ChangeChatFormat(),
  new BAHReminderBeforeOver(),
  new EnchantPagePerPercentPriceAH(),
  new BadlandsReadyCheck(),
  new MercenaryStateManager(),
  new CustomBlockStateManager(),
  new PetStateManager()
]

const proxy = new InstantConnectProxy({
  loginHandler: (client) => {
    if (client.username === 'U9GBot' || client.username === '4h1' || client.username === 'PullRequest') return { username: client.username + '2', auth: 'microsoft' }
    return { username: client.username, auth: 'microsoft' }
  },
  serverOptions: {
    version: '1.8.9',
    fakeHost: 'cosmicprisons.com',
    port: 25566
  } as any,
  clientOptions: {
    version: '1.8.9',
    host: 'cosmicprisons.com'
  }
})

const timeouts: any = {}

let lastMidasCorner = ''
let lastMidasFingerGivenTime = 0

proxy.on('start', () => modules.forEach(it => it.proxyStart(config, state)))

proxy.on('end', () => modules.forEach(it => it.proxyEnd(config, state)))

const MIDAS_FINGER_DISCOVERY = /\(\d\/\d\) You found a(.+)\.\.\./

// eslint-disable-next-line @typescript-eslint/no-misused-promises
proxy.on('incoming', async (data: Packet, meta, toClient, toServer) => {
  (data as any)._name = meta.name
  if (config.hide_particles && data._name === 'world_particles') return
  if (data._name === 'chat') {
    data.message = handleChat(data.message, toClient, toServer)
    const msg = pchat.fromNotch(data.message).toString()
    if (modules.some(it => it.messageReceivedFromServerReturnTrueToCancel(msg, data, toClient, toServer, config, state))) return
    if (msg === 'Use /itemclaim to claim your item(s)!') {
      // TODO: Make this only happen during midas
      // Q: Is this even right? wouldnt this just make midas boxes not be counted since they drop right when the finger does?
      // A: no its right since were assuming you only get a box after you've done a full rotation
      if (lastMidasFingerGivenTime - Date.now() > 5000) {
        runMidasCommand(toClient, lastMidasCorner)
      }
    } else if (MIDAS_FINGER_DISCOVERY.test(msg)) {
      const [, finger] = msg.match(MIDAS_FINGER_DISCOVERY) as Array<keyof typeof fingers>
      runMidasCommand(toClient, fingers[finger as keyof typeof fingers])
    }
  } else if (data._name === 'spawn_entity' || data._name === 'spawn_entity_living') {
    const { type } = data
    if (type === 30 && data._name === 'spawn_entity_living' && data.metadata.find(b => b.key === 2)?.value === '' && config.disable_powerball) return // powerball
    else if (type === 2 && data._name === 'spawn_entity' && config.disable_items_on_ground) return // ore drop animation
  } else if (data._name === 'set_slot' && data.item.nbtData != null) {
    // this shouldn't do any harm, but fixes us firing events after the chest has been closed
    if (!state.window.inWindow && data.windowId > 0) return
    handleItem(data.item, toClient, toServer)
    modules.forEach(it => it.setSlot(data.item, data.slot, toClient, toServer, config, state))
    if (!state.window.inWindow && data.slot >= 5 && data.slot <= 8) onArmorSent(data.item, SLOT_TO_ARMOR_NAME[data.slot] as ArmorType, toClient, toServer)
  } else if (data._name === 'window_items') {
    // this shouldn't do any harm, but fixes us firing events after the chest has been closed
    if (!state.window.inWindow && data.windowId > 0) return
    let i = 0
    for (const item of data.items) {
      handleItem(item, toClient, toServer)
      modules.forEach(it => it.setSlot(item, i, toClient, toServer, config, state))
      i++
    }
    if (!state.window.inWindow) {
      for (let i = 5; i <= 8; i++) {
        const item = data.items[i]
        if (item == null) continue
        onArmorSent(item, SLOT_TO_ARMOR_NAME[i] as ArmorType, toClient, toServer)
      }
    }
  } else if (data._name === 'open_window') {
    state.window.inWindow = true
    if (DEBUG.log_inWindow_changes) console.log('(server > open_window) state.inWindow = true')
    state.window.windowId = data.windowId
    modules.forEach(it => it.openWindow(data.windowTitle, toClient, toServer, config, state))
  } else if (data._name === 'close_window') {
    modules.forEach(it => it.closeWindow(toClient, toServer, config, state))
    if (DEBUG.log_inWindow_changes) console.log('(server > close_window) state.inWindow = false')
    state.window.inWindow = false
  } else if (data._name === 'respawn') {
    lastMidasCorner = ''
  }

  if (data._name === 'world_event' && data.effectId === 2001) return
  modules.forEach(it => it.beforeSendPacketToClient(data, meta, toClient, toServer, config, state))
  toClient.write(meta.name, data)
  modules.forEach(it => it.afterSendPacketToClient(data, meta, toClient, toServer, config, state))
})

function handleChat (msg: string, toClient: ServerClient, toServer: Client): string {
  let component
  try {
    component = JSON.parse(msg)
  } catch (e) { return msg }
  for (const componentPart of (component?.extra ?? [])) {
    remakeItemsInComponent(componentPart, toClient, toServer)
  }
  return JSON.stringify(component)
}

function remakeItemsInComponent (component: ChatComponent, toClient: ServerClient, toServer: Client): void {
  if (component.hoverEvent != null && component.hoverEvent.action === 'show_item') {
    const { Count: { value: itemCount }, Damage: { value: itemDamage }, id, tag: { value: nbt } } = (parse(component.hoverEvent.value) as any).value
    const item: Item = { blockId: 1, itemCount, itemDamage, nbtData: { type: 'compound', value: nbt } }
    handleItem(item, toClient, toServer)
    const stringified = stringify({
      type: 'compound',
      value: {
        id: { type: 'string', value: id.value },
        Count: { type: 'byte', value: item.itemCount },
        Damage: { type: 'short', value: item.itemDamage },
        tag: {
          type: 'compound',
          value: {
            display: {
              type: 'compound',
              value: {
                Name: {
                  type: 'string',
                  value: nbt.display.value.Name.value
                },
                Lore: {
                  type: 'list',
                  value: {
                    type: 'string',
                    value: nbt.display.value.Lore.value.value
                  }
                }
              }
            }
          }
        }
      }
    })
    if (component.text === '»') {
      component.hoverEvent.value = stringified
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      component.extra[0]!.text = nbt.display.value.Name.value
    }
  } else if (config.brag_hover_text && component.clickEvent != null && component.clickEvent.value.startsWith('/brag ')) {
    component.hoverEvent = {
      action: 'show_text',
      value: `§bClick to view ${component.clickEvent.value.split(' ')[1] as string}'s inventory`
    }
  }
  for (const componentPart of (component.extra ?? [])) {
    remakeItemsInComponent(componentPart, toClient, toServer)
  }
}

const ColorProfile = {
  bright_rainbow: 'c6ea9b5',
  winter: '3bf'
}

const colorize = (text: string, colors: typeof ColorProfile[keyof typeof ColorProfile], settings = { bold: false }): string => text.split('').map((letter, ix) => `§${colors[ix % colors.length] as string}${(settings?.bold ?? false) ? '§l' : ''}${letter}`).join('')

function handleItem (item: Item, toClient: ServerClient, toServer: Client): void {
  if (item.nbtData == null) return
  const nbt = pnbt.simplify(item.nbtData as any)
  const lore = item?.nbtData?.value?.display?.value?.Lore?.value?.value
  if (lore != null) modules.forEach(it => it.handleItem(item, lore, nbt, toClient, toServer, config, state))

  if (config.remake_item_lore && Array.isArray(lore)) {
    for (let i = 0; i < lore.length; i++) {
      const line = lore[i] as string
      if (MAX_ENCHANT_REGEX.test(line)) {
        const [, enchName, enchLevel] = line.match(MAX_ENCHANT_REGEX) as string[]
        lore[i] = colorizeEnchantment(enchName as string, enchLevel as string, '', true)
      } else if (NOT_MAX_ENCHANT_REGEX.test(line)) {
        const [, enchName, enchLevel] = line.match(NOT_MAX_ENCHANT_REGEX) as string[]
        lore[i] = colorizeEnchantment(enchName as string, enchLevel as string, '', false)
      } else if (NOT_MAX_ENCHANT_WITH_EXTRA_REGEX.test(line)) {
        const [, enchName, enchLevel, extra] = line.match(NOT_MAX_ENCHANT_WITH_EXTRA_REGEX) as string[]
        lore[i] = colorizeEnchantment(enchName as string, enchLevel as string, extra as string, false)
      } else if (MAX_ENCHANT_WITH_EXTRA_REGEX.test(line)) {
        const [, enchName, enchLevel, extra] = line.match(MAX_ENCHANT_WITH_EXTRA_REGEX) as string[]
        lore[i] = colorizeEnchantment(enchName as string, enchLevel as string, extra as string, true)
      }
    }
    for (let i = 0; i < lore.length; i++) {
      const line = lore[i] as string
      if (lore[i - 1] === '' && ORE_MINED_AMOUNT_REGEX.test(line)) { // remove ore mined lines
        const first = i - 1
        let last = first
        while (ORE_MINED_AMOUNT_REGEX.test(lore[last + 1] as string)) {
          last++
        }
        lore.splice(first, last - first + 1)
      }
    }

    // remove gkit story on pickaxe
    const story = nbt?.chargable?.desc?.split('\n')
    if (story?.length > 0) {
      for (let i = 0; i < lore.length; i++) {
        if (lore[i] !== story[0]) continue
        lore.splice(i, story.length)
        break
      }
    }

    if (CC_REQUIRED_REGEX.test(lore.slice(-1)[0] as string)) {
      lore.splice(-1, 1)
    }

    for (let i = 0; i < lore.length; i++) {
      if (!CHARGE_ORB_SLOT_LINE.test(lore[i] as string)) continue
      lore.splice(i, 2)
      break
    }

    if (config.dotstoops_mode) {
      for (let i = 0; i < lore.length; i++) {
        const line = lore[i] as string
        if (line.includes('Cripple')) {
          if ((line.split(' ')[1] as string).length > 1) {
            lore[i] = line.replace('Cripple', 'dotstoops')
          } else {
            lore[i] = line.replace('Cripple', 'dotstoop')
          }
        }
      }

      if ((item?.nbtData?.value?.display?.value?.Name?.value ?? '').includes('Cripple')) {
        const [name, ...lvl] = (item?.nbtData?.value?.display?.value?.Name?.value ?? '').split(' ')
        const letters = lvl.join(' ')
        const levelRomanStr = letters.match(/§b([IV]+)(?: §7\(§f95%§7\))?/)
        const level = (levelRomanStr != null) ? romanToInt(levelRomanStr[1] as string) : 0
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        item.nbtData.value.display.value.Name!.value = (name as string).replace('Cripple', 'dotstoop') + (level > 1 ? 's ' : ' ') + lvl.join(' ')
      }
    }
  }

  if (config.show_pets_on_cooldown && (nbt._x === 'pet' || nbt._x === 'trinket') && nbt?.cosmicData?.cooldown != null) {
    const canProcAgainAt = +nbt.cosmicData.lastUsed.toString() + +nbt.cosmicData.cooldown.toString()
    const now = Date.now()
    if (canProcAgainAt > now) {
      let diffSec = (canProcAgainAt - now) / 1000
      const str = []
      if (diffSec > (60 * 60)) {
        str.push(`${Math.floor(diffSec / (60 * 60))} hr`)
        diffSec %= (60 * 60)
      }
      if (diffSec > 60) {
        str.push(`${Math.floor(diffSec / 60)} min`)
        diffSec %= 60
      }
      str.push(`${Math.floor(diffSec)} sec`)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      item.nbtData.value.display.value.Name!.value += ` §8(§f${str.join(' ')}§8)`
      item.blockId = mcdata.itemsByName['dragon_egg']?.id ?? item.blockId
      item.itemDamage = 0
    }
  }

  if (config.show_full_midas_satchels && nbt._x === 'midassatchel' && nbt.__count === 15000) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    item.nbtData.value.display.value.Name!.value = '§c§lFULL §r' + item.nbtData.value.display.value.Name!.value
    item.blockId = mcdata.itemsByName['gold_block']?.id ?? item.blockId
    item.itemDamage = 0
  }

  // avg price on lore
  if (config.show_average_price) {
    addPriceInfoToItem(nbt, lore as string[])
  }
}

function colorizeEnchantment (name: string, level: string, extraText: string, isMax: boolean): string {
  const nonColoredName = name.replace(/§./g, '')
  let finalEnchName = name
  let finalExtraText = extraText
  const finalLevel = '§b' + (isMax ? '§l' : '') + level
  if (extraText !== '') {
    /* || nonColoredName === 'Ore Miner' */
    if (nonColoredName === 'Time Warp' || nonColoredName === 'Warp Miner') {
      finalEnchName = colorize(nonColoredName, ColorProfile.bright_rainbow, { bold: true })
    } else {
      finalExtraText = ''
    }
  }

  return `${finalEnchName} ${finalLevel} ${finalExtraText}`
}

const MIDAS_CORNERS = {
  nw: true,
  ne: true,
  se: true,
  sw: true
}

function runMidasCommand (toClient: ServerClient, message: string): boolean {
  // TODO: Make this show the time until that boss spawns
  if (MIDAS_CORNERS[message?.replace('/', '') as keyof typeof MIDAS_CORNERS]) {
    timeouts.midas = setTimeout(() => {
      if (config.midas_corner_reminders) {
        clientUtils.sendBigTitleAndManyChat(toClient, midasSpawnedInCorner(message))
      }
      lastMidasCorner = message
      delete timeouts.midas
    }, (10 * minutes) - (5 * seconds))

    timeouts.midasTwoMin = setTimeout(() => {
      if (config.midas_corner_reminders) {
        clientUtils.sendBigTitleAndManyChat(toClient, midasWillSpawnInCorner(message, '2 Minutes'))
      }
      delete timeouts.midas
    }, ((10 * minutes) - (5 * seconds)) - (2 * minutes))

    if (config.midas_corner_reminders) {
      clientUtils.sendChat(toClient, midasCornerCommandConfirm(message))
    }
    lastMidasFingerGivenTime = Date.now()
    return true
  }
  return false
}

// won't work inside a chest
function onArmorSent (item: Item, armorType: ArmorType, toClient: ServerClient, toServer: Client): void {
  if (item.nbtData == null) return
  const nbt = pnbt.simplify(item.nbtData as any)
  modules.forEach(it => it.onArmorPieceSent(item, nbt, armorType, toClient, toServer, config, state))
}

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  if (meta.name === 'chat') {
    if (runMidasCommand(toClient, data.message)) return
    else if (modules.some(it => it.onPlayerSendsChatMessageToServerReturnTrueToCancel(data.message, toClient, toServer, config, state))) return
  } else if (meta.name === 'close_window') {
    state.window.inWindow = false
    if (DEBUG.log_inWindow_changes) console.log('(client > close_window) state.inWindow = false')
  }
  if (modules.some(it => it.playerSendPacketToServerReturnTrueToCancel(data, meta, toClient, toServer, config, state))) return
  toServer.write(meta.name, data)
})
