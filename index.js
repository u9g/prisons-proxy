const { InstantConnectProxy } = require('prismarine-proxy')
const pnbt = require('prismarine-nbt')
const mcdata = require('minecraft-data')('1.8.9')
const constants = require('./constants')
const { moneyize } = constants
const clientUtils = require('./client_utilities')

const pchat = require('prismarine-chat')('1.8.9')
const { onceWithCleanup } = require('mineflayer/lib/promise_utils')

const { fetch } = require('undici')

const config = {
  remake_item_lore: true,
  exec_extender_ah_min_price: true,
  disable_powerball: true,
  disable_items_on_ground: true,
  show_pets_on_cooldown: true,
  exec_extender_trade_price: true,
  show_full_midas_satchels: true
}

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

const trade = {
  inTrade: false,
  tradeData: null
}

const activeBuffs = {
  cauldron: false,
  hastePet: false
}

const timeouts = {}

proxy.on('start', () => {
  trade.inTrade = false
  trade.tradeData = null
})

proxy.on('end', () => {
  trade.inTrade = false
  trade.tradeData = null
})

proxy.on('incoming', async (data, meta, toClient, toServer) => {
  if (meta.name === 'world_particles') return
  if (meta.name === 'chat') {
    const msg = pchat.fromNotch(data.message).toString()
    if (msg.startsWith(constants.CAULDRON_OVER_MESSAGE)) {
      activeBuffs.cauldron = false
      clientUtils.sendBigTitleAndManyChat(toClient, constants.CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION)
    } else if (msg.startsWith(constants.HASTE_PET_OVER_MESSAGE)) {
      activeBuffs.hastePet = true
      clientUtils.sendBigTitleAndManyChat(toClient, constants.HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION)
    } else if (msg === '(!) Welcome to the Executive Mine.') {
      await onEnterExec()
    } else if (msg === constants.CAULDRON_ACTIVE_MESSAGE) {
      activeBuffs.cauldron = true
    } else if (constants.HASTE_PET_ACTIVE_REGEX.test(msg)) {
      activeBuffs.hastePet = true
    }
  } else if (meta.name === 'spawn_entity' || meta.name === 'spawn_entity_living') {
    const { type } = data
    if (type === 30 && meta.name === 'spawn_entity_living' && data.metadata.find(b => b.key === 2)?.value === '' && config.disable_powerball) return // powerball
    else if (type === 2 && meta.name === 'spawn_entity' && config.disable_items_on_ground) return // ore drop animation
  } else if (meta.name === 'set_slot' && data.item.nbtData) {
    await handleItem(data.item)
    if (trade.inTrade) {
      trade.tradeData[data.slot] = data.item
    }
  } else if (meta.name === 'window_items') {
    let i = 0
    for (const item of data.items) {
      await handleItem(item)
      if (trade.inTrade && data.windowId !== 0) {
        trade.tradeData[i++] = item
      }
    }
  } else if (meta.name === 'open_window') {
    trade.inTrade = /§l([a-zA-Z0-9_]+) +([a-zA-Z0-9_]+)/.test(data.windowTitle) // FIX THIS SHOULDNT SHOW UP DURING /itemclaim OR for brags
    if (!trade.inTrade && trade.tradeData) {
      trade.tradeData = null
    } else if (trade.inTrade && !trade.tradeData) {
      trade.tradeData = {}
    }
    windowId = data.windowId
  } if (meta.name === 'close_window') {
    trade.inTrade = false
    trade.tradeData = null
  }

  if (meta.name === 'world_event' && data.effectId === 2001) return
  toClient.write(meta.name, data)

  if (config.exec_extender_trade_price && (meta.name === 'set_slot' || meta.name === 'window_items')/* && (trade?.tradeData?.theirSideMins??0) > 0 && (trade?.tradeData?.yourSideMoney??0) > 0 */ && trade.inTrade) {
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

// MOJANGSON PARSER CANT HANDLE ITEMS

// function handleChat(msg) {
//   let component
//   try {
//     component = JSON.parse(msg)
//   } catch (e) { return msg }
//   for (const componentPart of (component?.extra??[])) {
//     remakeItemsInComponent(componentPart)
//   }
//   return JSON.stringify(component)
// }

// function remakeItemsInComponent(component) {
//   if (component.hoverEvent && component.hoverEvent.action === 'show_item') {
//     const {Count: count, Damage: damage, id, tag: nbtData} = mojangson.parse(component.hoverEvent.value)
//     const item = {blockId: 1, itemCount: count, itemDamage: damage, nbtData}
//     handleItem(item)

//     component.hoverEvent.value.Count.value = item.count
//     component.hoverEvent.value.itemDamage.value = item.damage
//     component.hoverEvent.value.tag.value = item.nbtData
//   }
//   for (const componentPart of (component.extra??[])) {
//     remakeItemsInComponent(componentPart)
//   }
// }

const ColorProfile = {
  bright_rainbow: 'c6ea9b5',
  winter: '3bf'
}

const colorize = (text, colors, settings = { bold: false }) => text.split('').map((letter, ix) => `§${colors[ix % colors.length]}${(settings?.bold ?? false) ? '§l' : ''}${letter}`).join('')

async function handleItem (item) {
  if (!item.nbtData) return
  const nbt = pnbt.simplify(item.nbtData)
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

    for (let i = 0; i < lore.length; i++) {
      if (lore[i].includes('XP Mastery')) {
        lore[i] = lore[i].replace(/(§.)/g, '$1§l')
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
    item.nbtData.value.display.value.Name.value = '§4§lFULL §r' + item.nbtData.value.display.value.Name.value
    item.blockId = mcdata.blocksByName.gold_block.id
    item.itemDamage = 0
  }

  // avg price on lore
  if (nbt._x === 'whitescroll') {
    const resp = await (await fetch('http://localhost/sov/whitescroll')).json()
    if (resp.ok) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last day)`)
    }
  } else if (nbt._x === 'holy_whitescroll') {
    const resp = await (await fetch('http://localhost/sov/holy_whitescroll')).json()
    if (resp.ok) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last day)`)
    }
  } else if (nbt._x === 'blackscroll' && nbt.heroic !== 1) {
    const resp = await (await fetch(`http://localhost/sov/blackscroll/${nbt['joeBlackScroll-chance']}`)).json()
    if (resp.ok) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last 3 days)`)
    }
  } else if (nbt._x === 'blackscroll' && nbt.heroic === 1) {
    const resp = await (await fetch(`http://localhost/sov/heroic_blackscroll/${nbt['joeBlackScroll-chance']}`)).json()
    if (resp.ok) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last 3 days)`)
    }
  } else if (nbt._x === 'skin') {
    const resp = await (await fetch(`http://localhost/sov/skin/${nbt.joe.data.types}`)).json()
    if (resp.ok) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last 3 days)`)
    }
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

proxy.on('outgoing', (data, meta, toClient, toServer) => {
  if (meta.name === 'chat') {
    const { message } = data
    if (message in constants.MIDAS_CORNERS) {
      timeouts.midas = setTimeout(() => {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.midasSpawnedInCorner(message))
        delete timeouts.midas
      }, (10 * constants.minutes) - (10 * constants.seconds))

      timeouts.midasTwoMin = setTimeout(() => {
        clientUtils.sendBigTitleAndManyChat(toClient, constants.midasWillSpawnInCorner(message, '2 Minutes'))
        delete timeouts.midas
      }, ((10 * constants.minutes) - (10 * constants.seconds)) - (2 * constants.minutes))

      clientUtils.sendChat(toClient, constants.midasCornerCommandConfirm(message))
      return
    }
  }
  toServer.write(meta.name, data)
})
