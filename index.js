const { InstantConnectProxy } = require('prismarine-proxy')
const pnbt = require('prismarine-nbt')
const mcdata = require('minecraft-data')('1.8.9')
const constants = require('./constants')
const { moneyize } = constants
const clientUtils = require('./client_utilities')
const { addPriceInfoToItem } = require('./auction_utilities')
const { stringify, parse } = require('mojangson')

const ArmorLowEnergy = require('./modules/ArmorLowEnergy')
const ArmorLowDurability = require('./modules/ArmorLowDurability')

const { Worker } = require('worker_threads')

const cachedFetchs = {}
const itemFetcherThread = new Worker(require('path').join(__dirname, 'item_fetcher_thread.js')).on('message', (val) => {
  if (val.type === 'fetch') {
    cachedFetchs[val.value.url] = val.value.response
  }
})

const pchat = require('prismarine-chat')('1.8.9')
const { onceWithCleanup } = require('mineflayer/lib/promise_utils')

function fetch (url) {
  if (cachedFetchs[url]) return cachedFetchs[url]
  itemFetcherThread.postMessage({
    type: 'fetch',
    value: { url }
  })
  return null
}

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

const modules = [new ArmorLowEnergy(), new ArmorLowDurability()]

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

let windowId = 0
let inWindow = false

const trade = {
  inTrade: false,
  tradeData: null
}

const activeBuffs = {
  cauldron: false,
  hastePet: false
}

const timeouts = {}

let lastMidasCorner = null
let lastMidasFingerGivenTime = 0

proxy.on('start', () => {
  trade.inTrade = false
  trade.tradeData = null
})

proxy.on('end', () => {
  trade.inTrade = false
  trade.tradeData = null
})

const MIDAS_FINGER_DISCOVERY = /\(\d\/\d\) You found a(.+)\.\.\./

let usedHouseOfCards = false

const warpsInfo = {
  inWarpMenu: false,
  pitClicks: 0,
  warpItem: null
}

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
    data.message = handleChat(data.message)
    const msg = pchat.fromNotch(data.message).toString()
    // console.log('***')
    // console.log(msg)
    // console.log('***')
    if (msg.startsWith(constants.CAULDRON_OVER_MESSAGE)) {
      activeBuffs.cauldron = false
      if (config.cauldron_off_notification) {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION)
      }
    } else if (msg.startsWith(constants.HASTE_PET_OVER_MESSAGE)) {
      activeBuffs.hastePet = true
      if (config.haste_pet_off_notification) {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION)
      }
    } else if (msg === 'Use /itemclaim to claim your item(s)!') {
      // TODO: Make this only happen midas
      if (lastMidasFingerGivenTime - Date.now() > 5000) {
        runMidasCommand(toClient, lastMidasCorner)
      }
    } else if (msg === '(!) Welcome to the Executive Mine.') {
      await onEnterExec()
    } else if (msg.endsWith('House of Cards')/* mutated */) {
      // TODO: Make this also change to false
      usedHouseOfCards = true
    } else if (msg === 'Teleporting you to Badlands: Diamond... (DO NOT MOVE)') {
      if (config.midas_reminders && !usedHouseOfCards) {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.FORGOT_HOUSE_OF_CARDS_NOTIFICATION)
      }
      // TODO: Also check for headhunter merc
    } else if (msg === constants.CAULDRON_ACTIVE_MESSAGE) {
      activeBuffs.cauldron = true
    } else if (constants.HASTE_PET_ACTIVE_REGEX.test(msg)) {
      activeBuffs.hastePet = true
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
      // console.log(matched)
      }
    }
    // console.log(msg.replace(/\n/g, '\\n'), 'was matched?', constants.chatRegex.test(msg))
  } else if (meta.name === 'spawn_entity' || meta.name === 'spawn_entity_living') {
    const { type } = data
    if (type === 30 && meta.name === 'spawn_entity_living' && data.metadata.find(b => b.key === 2)?.value === '' && config.disable_powerball) return // powerball
    else if (type === 2 && meta.name === 'spawn_entity' && config.disable_items_on_ground) return // ore drop animation
  } else if (meta.name === 'set_slot' && data.item.nbtData) {
    handleItem(data.item)
    if (trade.inTrade) trade.tradeData[data.slot] = data.item
    if (!inWindow && data.slot >= 5 && data.slot <= 8) onArmorSent(data.item, constants.SLOT_TO_ARMOR_NAME[data.slot], toClient, toServer)
  } else if (meta.name === 'window_items') {
    let i = 0
    for (const item of data.items) {
      handleItem(item)
      if (trade.inTrade && data.windowId !== 0) {
        trade.tradeData[i] = item
      } else if (warpsInfo.inWarpMenu && i === 20 && !warpsInfo.warpItem) {
        warpsInfo.warpItem = item
      }
      i++
    }
    if (!inWindow) {
      for (let i = 5; i <= 8; i++) onArmorSent(data.items[i], constants.SLOT_TO_ARMOR_NAME[i], toClient, toServer)
    }
  } else if (meta.name === 'open_window') {
    inWindow = true
    if (config.confirm_enter_pit && data.windowTitle === '"§lWarps"') {
      warpsInfo.inWarpMenu = true
    } else {
      trade.inTrade = /§l([a-zA-Z0-9_]+) +([a-zA-Z0-9_]+)/.test(data.windowTitle) // FIX THIS SHOULDNT SHOW UP DURING /itemclaim OR for brags
      if (!trade.inTrade && trade.tradeData) {
        trade.tradeData = null
      } else if (trade.inTrade && !trade.tradeData) {
        trade.tradeData = {}
      }
    }
    windowId = data.windowId
  } else if (meta.name === 'close_window') {
    trade.inTrade = false
    trade.tradeData = null
    warpsInfo.inWarpMenu = false
    warpsInfo.pitClicks = 0
    warpsInfo.warpItem = null
    inWindow = false
  } else if (meta.name === 'respawn') {
    lastMidasCorner = null
  }

  if (warpsInfo.inWarpMenu && meta.name === 'set_slot' && data.slot === 20) {
    data.item = warpsInfo.warpItem
  } else if (warpsInfo.inWarpMenu && meta.name === 'window_items' && data.windowId === windowId) {
    data.items[20] = warpsInfo.warpItem
  }

  if (meta.name === 'world_event' && data.effectId === 2001) return
  toClient.write(meta.name, data)

  if (config.exec_extender_trade_price && (meta.name === 'set_slot' || meta.name === 'window_items') && trade.inTrade) {
    trade.tradeData.theirSideMins = numberOfExecMinsInOppositeSide()
    trade.tradeData.yourSideMoney = numberOfMoneyInYourSide()
    if ((trade?.tradeData?.theirSideMins ?? 0) > 0 && (trade?.tradeData?.yourSideMoney ?? 0) > 0) {
      toClient.write('set_slot', {
        windowId,
        slot: 22,
        item: {
          blockId: mcdata.blocksByName.pumpkin.id,
          itemCount: 1,
          itemDamage: 0,
          nbtData: {
            type: 'compound',
            name: '',
            value: {
              display: {
                type: 'compound',
                value: {
                  Name: { type: 'string', value: `§a$${moneyize(trade.tradeData.yourSideMoney / trade.tradeData.theirSideMins)} §8/ min` },
                  Lore: {
                    type: 'list',
                    value: {
                      type: 'string',
                      value:
            [
              '',
              `§a$${moneyize(trade.tradeData.yourSideMoney)} §8to §a${trade.tradeData.theirSideMins} mins`
            ]
                    }
                  }
                }
              }
            }
          }
        }
      })
    }
  }
})

function noMoreColor (component) {
  for (const extras of (component?.extra ?? [])) {
    extras.color = 'white'
  }
  component.color = 'white'
}

// MOJANGSON PARSER CANT HANDLE ITEMS

function handleChat (msg) {
  let component
  try {
    component = JSON.parse(msg)
  } catch (e) { return msg }
  for (const componentPart of (component?.extra ?? [])) {
    remakeItemsInComponent(componentPart)
  }
  return JSON.stringify(component)
}

function remakeItemsInComponent (component) {
  if (component.hoverEvent && component.hoverEvent.action === 'show_item') {
    const { Count: { value: itemCount }, Damage: { value: itemDamage }, id, tag: { value: nbt } } = parse(component.hoverEvent.value).value
    const item = { blockId: 1, itemCount, itemDamage, nbtData: { type: 'compound', value: nbt } }
    handleItem(item)
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

function handleItem (item) {
  if (!item.nbtData) return
  const nbt = pnbt.simplify(item.nbtData)
  if (config.make_openables_different) {
    item.blockId = nbt?.cosmicData?.mysteryChest === 'loot_midas_sadistdepositbox' ? mcdata.blocksByName.emerald_block.id : nbt?._x === 'mysterychest' ? mcdata.blocksByName.diamond_block.id : mcdata.blocksByName.stone.id
    item.itemDamage = 0
  }
  const lore = item?.nbtData?.value?.display?.value?.Lore?.value?.value

  if (config.exec_extender_ah_min_price) {
    const priceLine = nbt?.display?.Lore?.find(b => b.toLowerCase().includes('price (ea): §a$'))
    if (priceLine && nbt._x === 'exectimeextender') {
      const ix = nbt.display.Lore.indexOf(priceLine)
      const price = +priceLine.substring(priceLine.includes('Low ') ? 17 + 4 : 17).replace(/,/g, '')
      const mins = nbt.exectimeextender / 60
      lore[ix] = priceLine + ` §8(§a$${moneyize(price / mins)} §8/ min)`
    }
  }

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

    // if (config.notify_on_low_energy && nbt?._x === 'gear' && !debounce[nbt._xl.toString()] &&
    //     nbt.chargable?.givenEnchants && Array.isArray(nbt.chargable?.givenEnchants)) {
    //   const energy = nbt?.chargable?.energy ?? 0

    //   // if (+nbt.chargable.energy < 100_000_000) {
    //   //   // antivirus -> 60m
    //   //   // system reboot -> 25m
    //   //   debounce[nbt._xl] = true
    //   //   // clientUtils.sendChat()
    //   //   setTimeout(() => { delete debounce[nbt._xl] }, 5000)
    //   // }
    // } else {
    //   console.log(nbt?.chargable?.enchants)
    // }
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

function numberOfExecMinsInOppositeSide () {
  if (Object.keys(trade.tradeData) === 0) return 0
  let mins = 0
  for (const slotNum of constants.oppositeSideSlots) {
    const item = trade.tradeData[slotNum]
    mins += item?.nbtData?.value?.exectimeextender?.value ?? 0
  }
  return mins / 60
}

function numberOfMoneyInYourSide () {
  if (Object.keys(trade.tradeData) === 0) return 0
  let money = 0
  for (const slotNum of constants.ourSide) {
    const item = trade.tradeData[slotNum]
    money += parseInt(item?.nbtData?.value?.money?.value ?? '0')
  }
  return money
}

async function onEnterExec () {
  if (!config.exec_reminders) return
  await onceWithCleanup(proxy, 'incoming', {
    checkCondition: (data, meta, toClient, toServer) => meta.name === 'window_items'
  })
  const [{ items },, toClient] = await onceWithCleanup(proxy, 'incoming', {
    checkCondition: (data, meta, toClient, toServer) => meta.name === 'window_items'
  })
  let hasNaturalXP = false
  const synthetics = {}
  for (let i = 5; i <= 8; i++) { // iterate armor
    if (items[i]?.nbtData?.value?.chargable?.value && items[i]?.nbtData?.value?.chargable?.value?.holyWhiteScroll?.value !== 1) {
      toClient.write('chat', { position: 0, message: constants.UNHOLIED_MESSAGES[i - 5] })
    }
  }
  for (const item of items) {
    if (item.blockId !== -1) {
      const mcdItem = mcdata.items[item.blockId]
      if (mcdItem.name.endsWith('_pickaxe') && item.nbtData?.value?.chargable?.value?.whiteScroll?.value !== 1) {
        clientUtils.sendChat(toClient, JSON.stringify({ bold: true, extra: [{ text: item?.nbtData?.value?.display?.value?.Name?.value ?? mcdItem.displayName, extra: [{ color: 'red', text: ' << UNWHITESCROLLED' }] }], text: 'YOU LEFT YOUR PICKAXE CALLED >> ' }))
      } else if (item?.nbtData?.value?._x?.value === 'miningxp' && !item?.nbtData?.value?.['joe-miningXP-extractor']) {
        hasNaturalXP = true
      } else if (item?.nbtData?.value?._x?.value === 'synthetic') {
        synthetics[item.nbtData.value.__type.value] = true
      }
    }
  }

  if (!hasNaturalXP) clientUtils.sendManyChat(toClient, constants.NO_GODLY_XP_BOTTLE_NOTIFICATION)

  Object.entries(constants.DONT_HAVE_SYNTHETICS_MESSAGES)
    .filter(([syntheticName]) => !synthetics[syntheticName])
    .forEach(([, msg]) => clientUtils.sendChat(toClient, msg))
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
  modules.forEach(it => it.onArmorPieceSent(item, nbt, armorType, toClient, toServer, config))
}

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  if (meta.name === 'chat') {
    if (runMidasCommand(toClient, data.message)) return
    else if (data.message === '/open') {
      config.make_openables_different = !config.make_openables_different
      clientUtils.sendChat(toClient, `{"text": "§b§lYou have just toggled /open to: §a§n${config.make_openables_different === true ? 'on' : 'off'}\n§r§b§nRight Click§r §ca block§r§f to have the changes apply."}`)
      return
    }
  }

  if (meta.name === 'window_click') {
    if (data.slot === 20 && warpsInfo.inWarpMenu && (warpsInfo.pitClicks + 1) in constants.pitGlassClicksToGlassColor) {
      warpsInfo.pitClicks++
      // TODO: Make the item actually say confirm for the second time
      warpsInfo.warpItem.nbtData.value.display.value.Name.value = `§c§lClick ${5 - warpsInfo.pitClicks + 1} more times to go to Pit`
      warpsInfo.warpItem.blockId = mcdata.blocksByName.stained_glass_pane.id
      warpsInfo.warpItem.itemDamage = constants.pitGlassClicksToGlassColor[warpsInfo.pitClicks]

      toClient.write('set_slot', {
        windowId,
        slot: 20,
        item: warpsInfo.warpItem
      })
      toClient.write('set_slot', {
        windowId: -1,
        slot: -1,
        item: {
          blockId: -1,
          itemCount: undefined,
          itemDamage: undefined,
          nbtData: undefined
        }
      })
      return
    }
  } else if (meta.name === 'close_window') {
    inWindow = false
  }
  toServer.write(meta.name, data)
})
