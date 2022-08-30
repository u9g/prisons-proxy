const { InstantConnectProxy } = require('prismarine-proxy')
const pnbt = require('prismarine-nbt')
const mcdata = require('minecraft-data')('1.8.9')
const constants = require('./constants')
const clientUtils = require('./client_utilities')
const { addPriceInfoToItem } = require('./auction_utilities')
const { stringify, parse } = require('mojangson')

const ArmorLowEnergy = require('./modules/ArmorLowEnergy')
const ArmorLowDurability = require('./modules/ArmorLowDurability')
const Openables = require('./modules/Openables')
const ExecExtenderPerMinutePriceAH = require('./modules/ExecExtenderPerMinutePriceAH')
const CauldronOver = require('./modules/CauldronOver')
const HastePetOver = require('./modules/HastePetOver')
const EnterExecInventoryCheck = require('./modules/EnterExecInventoryCheck')
const ExecExtenderTradePrice = require('./modules/ExecExtenderTradePrice')
const PitConfirmation = require('./modules/PitConfirmation')

const { Worker } = require('worker_threads')

const cachedFetchs = {}
const itemFetcherThread = new Worker(require('path').join(__dirname, 'item_fetcher_thread.js')).on('message', (val) => {
  if (val.type === 'fetch') {
    cachedFetchs[val.value.url] = val.value.response
  }
})

const pchat = require('prismarine-chat')('1.8.9')

function fetch (url) {
  if (cachedFetchs[url]) return cachedFetchs[url]
  itemFetcherThread.postMessage({
    type: 'fetch',
    value: { url }
  })
  return null
}

const state = {}

const config = {
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
  show_average_price: true,
  custom_chat: 'sky', // 'vanilla' || false
  notify_on_low_energy: true,
  notify_on_low_durability: true,
  brag_hover_text: true
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
  new PitConfirmation()
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
  },
  clientOptions: {
    version: '1.8.9',
    host: 'cosmicprisons.com'
  }
})

const timeouts = {}

let lastMidasCorner = null
let lastMidasFingerGivenTime = 0

proxy.on('start', () => modules.forEach(it => it.proxyStart(config, state)))

proxy.on('end', () => modules.forEach(it => it.proxyEnd(config, state)))

const MIDAS_FINGER_DISCOVERY = /\(\d\/\d\) You found a(.+)\.\.\./

let usedHouseOfCards = false

const rankToNumber = {
  I: 1,
  Noble: 1,
  II: 2,
  Imperial: 2,
  III: 3,
  Supreme: 3,
  IV: 4,
  Majesty: 4,
  V: 5,
  Emperor: 5,
  'V+': 5,
  'Emperor+': 5,
  President: 6,
  Helper: 7
}

const rankNumToColor = {
  1: 'f',
  2: 'a',
  3: 'b',
  4: 'd',
  5: 'e',
  6: 'c',
  7: '5§l'
}

const rankNumToRankName = {
  1: 'I',
  2: 'II',
  3: 'III',
  4: 'IV',
  5: 'V',
  6: 'VI',
  7: 'Helper'
}

proxy.on('incoming', async (data, meta, toClient, toServer) => {
  if (config.hide_particles && meta.name === 'world_particles') return
  if (meta.name === 'chat') {
    data.message = handleChat(data.message, toClient, toServer)
    const msg = pchat.fromNotch(data.message).toString()
    modules.forEach(it => it.messageReceivedFromServer(msg, data, toClient, toServer, config, state))
    if (msg === 'Use /itemclaim to claim your item(s)!') {
      // TODO: Make this only happen midas
      if (lastMidasFingerGivenTime - Date.now() > 5000) {
        runMidasCommand(toClient, lastMidasCorner)
      }
    } else if (msg.endsWith('House of Cards')) {
      // TODO: Make this also change to false
      usedHouseOfCards = true
    } else if (msg === 'Teleporting you to Badlands: Diamond... (DO NOT MOVE)') {
      if (config.midas_reminders && !usedHouseOfCards) {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.FORGOT_HOUSE_OF_CARDS_NOTIFICATION)
      }
      // TODO: Also check for headhunter merc
    } else if (MIDAS_FINGER_DISCOVERY.test(msg)) {
      const [, finger] = msg.match(MIDAS_FINGER_DISCOVERY)
      runMidasCommand(toClient, constants.fingers[finger])
    }

    if (config.custom_chat) {
      if (!constants.chatRegex.test(msg)) {
        require('fs').promises.appendFile('not_chat.txt', msg.replace(/\n/g, '\\n') + '\n')
        // return
      } else if (constants.chatRegex.test(msg)) {
        const matched = msg.match(constants.chatRegex)
        require('fs').promises.appendFile('chat.txt', msg.replace(/\n/g, '\\n') + '\n')
        const extra = JSON.parse(data.message).extra
        if (config.custom_chat === 'vanilla') {
          noMoreColor(extra[extra.length - 1])
          clientUtils.sendChat(toClient, `{"text":"<${matched.groups.username}> ", "extra": [${JSON.stringify(extra[extra.length - 1])}]}`)
        } else if (config.custom_chat === 'sky') {
          const rankNum = rankToNumber[matched.groups.rank_name]
          const color = rankNumToColor[rankNum]
          const rank = rankNumToRankName[rankNum]
          clientUtils.sendChat(toClient, `{"text":"", "extra": [{"text":"${matched.groups.gang ? matched.groups.gang + ' ' : ''}§${color}§l${rank}§r§${color}${matched.groups.rep_number ? `●${matched.groups.rep_number}` : ''}${matched.groups.title ? ' §8[§7' + matched.groups.title + '§8]' : ''} §${color}${matched.groups.username}§f: "},${JSON.stringify(extra[extra.length - 1])}]}`)
        }
        return
      }
    }
  } else if (meta.name === 'spawn_entity' || meta.name === 'spawn_entity_living') {
    const { type } = data
    if (type === 30 && meta.name === 'spawn_entity_living' && data.metadata.find(b => b.key === 2)?.value === '' && config.disable_powerball) return // powerball
    else if (type === 2 && meta.name === 'spawn_entity' && config.disable_items_on_ground) return // ore drop animation
  } else if (meta.name === 'set_slot' && data.item.nbtData) {
    handleItem(data.item, toClient, toServer)
    modules.forEach(it => it.setSlot(data.item, data.slot, toClient, toServer, config, state))
    if (!state.inWindow && data.slot >= 5 && data.slot <= 8) onArmorSent(data.item, constants.SLOT_TO_ARMOR_NAME[data.slot], toClient, toServer)
  } else if (meta.name === 'window_items') {
    let i = 0
    for (const item of data.items) {
      handleItem(item, toClient, toServer)
      modules.forEach(it => it.setSlot(item, i, toClient, toServer, config, state))
      i++
    }
    if (!state.inWindow) {
      for (let i = 5; i <= 8; i++) onArmorSent(data.items[i], constants.SLOT_TO_ARMOR_NAME[i], toClient, toServer)
    }
  } else if (meta.name === 'open_window') {
    state.inWindow = true
    state.windowId = data.windowId
    modules.forEach(it => it.openWindow(data.windowTitle, toClient, toServer, config, state))
  } else if (meta.name === 'close_window') {
    modules.forEach(it => it.closeWindow(toClient, toServer, config, state))
    state.inWindow = false
  } else if (meta.name === 'respawn') {
    lastMidasCorner = null
  }

  if (meta.name === 'world_event' && data.effectId === 2001) return
  modules.forEach(it => it.beforeSendPacketToClient(data, meta, toClient, toServer, config, state))
  toClient.write(meta.name, data)
  modules.forEach(it => it.afterSendPacketToClient(data, meta, toClient, toServer, config, state))
})

function noMoreColor (component) {
  for (const extras of (component?.extra ?? [])) {
    extras.color = 'white'
  }
  component.color = 'white'
}

function handleChat (msg, toClient, toServer) {
  let component
  try {
    component = JSON.parse(msg, toClient, toServer)
  } catch (e) { return msg }
  for (const componentPart of (component?.extra ?? [])) {
    remakeItemsInComponent(componentPart, toClient, toServer)
  }
  return JSON.stringify(component)
}

function remakeItemsInComponent (component, toClient, toServer) {
  if (component.hoverEvent && component.hoverEvent.action === 'show_item') {
    const { Count: { value: itemCount }, Damage: { value: itemDamage }, id, tag: { value: nbt } } = parse(component.hoverEvent.value).value
    const item = { blockId: 1, itemCount, itemDamage, nbtData: { type: 'compound', value: nbt } }
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
      component.extra[0].text = nbt.display.value.Name.value
    }
  } else if (config.brag_hover_text && component.clickEvent && component.clickEvent.value.startsWith('/brag ')) {
    component.hoverEvent = {
      action: 'show_text',
      value: '§bClick to view ' + component.clickEvent.value.split(' ')[1] + "'s inventory"
    }
  }
  for (const componentPart of (component.extra ?? [])) {
    remakeItemsInComponent(componentPart)
  }
}

const ColorProfile = {
  bright_rainbow: 'c6ea9b5',
  winter: '3bf'
}

const colorize = (text, colors, settings = { bold: false }) => text.split('').map((letter, ix) => `§${colors[ix % colors.length]}${(settings?.bold ?? false) ? '§l' : ''}${letter}`).join('')

function handleItem (item, toClient, toServer) {
  if (!item.nbtData) return
  const nbt = pnbt.simplify(item.nbtData)
  const lore = item?.nbtData?.value?.display?.value?.Lore?.value?.value
  modules.forEach(it => it.handleItem(item, lore, nbt, toClient, toServer, config, state))

  if (config.remake_item_lore && Array.isArray(lore)) {
    for (let i = 0; i < lore.length; i++) {
      const line = lore[i]
      if (constants.MAX_ENCHANT_REGEX.test(line)) {
        const [, enchName, enchLevel] = line.match(constants.MAX_ENCHANT_REGEX)
        lore[i] = colorizeEnchantment(enchName, enchLevel, '', true)
      } else if (constants.NOT_MAX_ENCHANT_REGEX.test(line)) {
        const [, enchName, enchLevel] = line.match(constants.NOT_MAX_ENCHANT_REGEX)
        lore[i] = colorizeEnchantment(enchName, enchLevel, '', false)
      } else if (constants.NOT_MAX_ENCHANT_WITH_EXTRA_REGEX.test(line)) {
        const [, enchName, enchLevel, extra] = line.match(constants.NOT_MAX_ENCHANT_WITH_EXTRA_REGEX)
        lore[i] = colorizeEnchantment(enchName, enchLevel, extra, false)
      } else if (constants.MAX_ENCHANT_WITH_EXTRA_REGEX.test(line)) {
        const [, enchName, enchLevel, extra] = line.match(constants.MAX_ENCHANT_WITH_EXTRA_REGEX)
        lore[i] = colorizeEnchantment(enchName, enchLevel, extra, true)
      }
    }
    for (let i = 0; i < lore.length; i++) {
      const line = lore[i]
      if (lore[i - 1] === '' && constants.ORE_MINED_AMOUNT_REGEX.test(line)) { // remove ore mined lines
        const first = i - 1
        let last = first
        while (constants.ORE_MINED_AMOUNT_REGEX.test(lore[last + 1])) {
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

    if (constants.CC_REQUIRED_REGEX.test(lore.slice(-1))) {
      lore.splice(-1, 1)
    }

    for (let i = 0; i < lore.length; i++) {
      if (!constants.CHARGE_ORB_SLOT_LINE.test(lore[i])) continue
      lore.splice(i, 2)
      break
    }

    if (config.dotstoops_mode) {
      for (let i = 0; i < lore.length; i++) {
        if (lore[i].includes('Cripple')) {
          if (lore[i].split(' ')[1].length > 1) {
            lore[i] = lore[i].replace('Cripple', 'dotstoops')
          } else {
            lore[i] = lore[i].replace('Cripple', 'dotstoop')
          }
        }
      }

      if (item?.nbtData?.value?.display?.value?.Name?.value?.includes('Cripple')) {
        const [name, ...lvl] = item?.nbtData?.value?.display?.value?.Name?.value.split(' ')
        const letters = lvl.join(' ')
        const levelRomanStr = letters.match(/§b([IV]+)(?: §7\(§f95%§7\))?/)
        const level = levelRomanStr ? constants.romanToInt(levelRomanStr[1]) : 0
        item.nbtData.value.display.value.Name.value = name.replace('Cripple', 'dotstoop') + (level > 1 ? 's ' : ' ') + lvl.join(' ')
      }
    }
  }

  // console.log(nbt)
  if (config.show_pets_on_cooldown && (nbt._x === 'pet' || nbt._x === 'trinket') && nbt?.cosmicData?.cooldown) {
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
      item.nbtData.value.display.value.Name.value += ` §8(§f${str.join(' ')}§8)`
      item.blockId = mcdata.blocksByName.dragon_egg.id
      item.itemDamage = 0
    }
  }

  if (config.show_full_midas_satchels && nbt._x === 'midassatchel' && nbt.__count === 15000) {
    item.nbtData.value.display.value.Name.value = '§c§lFULL §r' + item.nbtData.value.display.value.Name.value
    item.blockId = mcdata.blocksByName.gold_block.id
    item.itemDamage = 0
  }

  // avg price on lore
  if (config.show_average_price) {
    addPriceInfoToItem(nbt, lore, fetch)
  }
}

function colorizeEnchantment (name, level, extraText, isMax) {
  const nonColoredName = name.replace(/§./g, '')
  let finalEnchName = name
  let finalExtraText = extraText
  const finalLevel = '§b' + (isMax ? '§l' : '') + level
  if (extraText) {
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

function runMidasCommand (toClient, message) {
  // TODO: Make this show the time until that boss spawns
  if (MIDAS_CORNERS[message?.replace('/', '')]) {
    timeouts.midas = setTimeout(() => {
      if (config.midas_corner_reminders) {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.midasSpawnedInCorner(message))
      }
      lastMidasCorner = message
      delete timeouts.midas
    }, (10 * constants.minutes) - (5 * constants.seconds))

    timeouts.midasTwoMin = setTimeout(() => {
      if (config.midas_corner_reminders) {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.midasWillSpawnInCorner(message, '2 Minutes'))
      }
      delete timeouts.midas
    }, ((10 * constants.minutes) - (5 * constants.seconds)) - (2 * constants.minutes))

    if (config.midas_corner_reminders) {
      clientUtils.sendChat(toClient, constants.midasCornerCommandConfirm(message))
    }
    lastMidasFingerGivenTime = Date.now()
    return true
  }
  return false
}

// won't work inside a chest
function onArmorSent (item, armorType, toClient, toServer) {
  if (!item.nbtData) return
  const nbt = pnbt.simplify(item.nbtData)
  modules.forEach(it => it.onArmorPieceSent(item, nbt, armorType, toClient, toServer, config, state))
}

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  if (meta.name === 'chat') {
    if (runMidasCommand(toClient, data.message)) return
    else if (modules.some(it => it.onPlayerSendsChatMessageToServerReturnTrueToNotSend(data.message, toClient, toServer, config, state))) return
  } else if (meta.name === 'close_window') {
    state.inWindow = false
  }
  if (modules.some(it => it.playerSendPacketToServerReturnTrueToCancel(data, meta, toClient, toServer, config, state))) return
  toServer.write(meta.name, data)
})
