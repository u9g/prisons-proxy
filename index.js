const { InstantConnectProxy } = require('prismarine-proxy')
const pnbt = require('prismarine-nbt')
const mojangson = require('mojangson')

const pchat = require('prismarine-chat')('1.8.9')

const proxy = new InstantConnectProxy({
  loginHandler: (client) => {
    console.log('logging in with: ' + client.username)
    if (client.username === 'U9GBot' || client.username === '4h1') return { username: client.username+'1', auth: 'microsoft' }
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

const wait = require('util').promisify(setTimeout)

const one = {
  billion: 1.0e+9,
  million: 1.0e+6,
  thousand: 1.0e+3
}

function moneyize (v) {
  if (v >= one.billion)
    return (v / one.billion).toFixed(0) + 'b'
  else if (v >= one.million)
    return (v / one.million).toFixed(0) + 'm'
  else if (v >= one.thousand)
    return (v / one.thousand).toFixed(0) + 'k'
  return v
}

proxy.on('incoming', async (data, meta, toClient, toServer) => {
  if (meta.name === 'world_particles') return
  if (meta.name === 'chat') {
    const msg = pchat.fromNotch(data.message).toString()
    if (msg.startsWith("(!) Your Cauldron: 200% /skill booster effect has expired."))  {
      const m = JSON.stringify({"bold":true,"color":"green","extra":[{"color":"red","text":"OVER"}],"text":"CAULDRON "})
      toClient.write('title', { action: 0, text: m })
      for(let i=0;i<5;i++)toClient.write('chat', {message: m, position: 0})
    } else if (msg.startsWith("(!) Your Mining Speed Booster has expired.")) {
      const m = JSON.stringify({"bold":true,"color":"aqua","extra":[{"color":"red","text":"OVER"}],"text":"HASTE PET "})
      toClient.write('title', { action: 0, text: m })
      for(let i=0;i<5;i++)toClient.write('chat', {message: m, position: 0})
    }
  }
  if (meta.name === 'spawn_entity' || meta.name === 'spawn_entity_living') {
    const { type } = data
    if (type === 30 && meta.name === 'spawn_entity_living' && data.metadata.find(b => b.key === 2)?.value === '') return // ore drop animation
    if (meta.name === 'spawn_entity' && type === 2) return // powerball
  }

  if (meta.name === 'set_slot' && data.item.nbtData) {
    handleItem(data.item)
  } else if (meta.name === 'window_items') {
    for (const item of data.items) {
      handleItem(item)
    }
  }

  // if (meta.name === 'chat') {
  //   data.message = handleChat(data.message)
  // }
  toClient.write(meta.name, data) 
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

const NOT_MAX_ENCHANT_REGEX = /^§.(.+) §b([IV]+)$/ // need forced start end for timewarp
const MAX_ENCHANT_REGEX = /^§.§l(.+) §b§l([IV]+)$/ // need forced start end for timewarp
const NOT_MAX_ENCHANT_WITH_EXTRA_REGEX = /§.(.+) §b([IV]+)(§7 .+)/
const MAX_ENCHANT_WITH_EXTRA_REGEX = /§.§l(.+) §b§l([IV]+)(§7 .+)/
const ORE_MINED_AMOUNT_REGEX = /§f[\d,]+ §.§l(?:[a-zA-Z]+) Ore/
const CC_REQUIRED_REGEX = /§7\(§nCosmicClient.com§7 required\)/
const CHARGE_ORB_SLOT_LINE = /§f§l§n(\d+)§7\/§f(\d+)§b Charge Orb §7slots unlocked/

const ColorProfile = {
  bright_rainbow: 'c6ea9b5',
  winter: '3bf'
}

const colorize = (text, colors, settings = { bold: false }) => text.split('').map((letter, ix) => `§${colors[ix % colors.length]}${(settings?.bold??false) ? '§l' : ''}${letter}`).join('')

function handleItem(item) {
  if (!item.nbtData) return
  const nbt = pnbt.simplify(item.nbtData)
  const lore = item?.nbtData?.value?.display?.value?.Lore?.value?.value

  // console.log(nbt)
  const priceLine = nbt?.display?.Lore?.find(b => b.toLowerCase().includes('price (ea): §a$'))
  if (priceLine && nbt._x === 'exectimeextender') {
    const ix = nbt.display.Lore.indexOf(priceLine)
    const price = +priceLine.substring(priceLine.includes('Low ') ? 17 + 4 : 17).replace(/,/g, '')
    const mins = nbt.exectimeextender/60
    // console.log('changed line')
    lore[ix] = priceLine + ` §8(§a$${moneyize(price/mins)} §8/ min)`
  }

  
  if (Array.isArray(lore)) {
    for (let i = 0; i < lore.length; i++) {
      const line = lore[i]
      if (MAX_ENCHANT_REGEX.test(line)) {
        const [,enchName, enchLevel] = line.match(MAX_ENCHANT_REGEX)
        lore[i] = `§8${enchName} ${enchLevel}`
      } else if (NOT_MAX_ENCHANT_REGEX.test(line)) {
        const [,enchName, enchLevel] = line.match(NOT_MAX_ENCHANT_REGEX)
        lore[i] = `§8${enchName} ${enchLevel}`
      } else if (NOT_MAX_ENCHANT_WITH_EXTRA_REGEX.test(line)) {
        const [,enchName, enchLevel, extra] = line.match(NOT_MAX_ENCHANT_WITH_EXTRA_REGEX)
        lore[i] = `§8${enchName} ${enchLevel}${extra}`
        // lore[i] = lore[i].replace(/§./g, '§8')
      } else if (MAX_ENCHANT_WITH_EXTRA_REGEX.test(line)) {
        const [,enchName, enchLevel, extra] = line.match(MAX_ENCHANT_WITH_EXTRA_REGEX)
        lore[i] = `${colorize(enchName.replace(/§./g, ''), ColorProfile.winter, {bold: true})} §b§l${enchLevel}${extra}`
      } /*else if (CHARGE_ORB_SLOT_LINE.test(line))*/
      // §dEnergy Hoarder §bII
    }
    for (let i = 0; i < lore.length; i++) {
      const line = lore[i]
      if (lore[i-1] === '' && ORE_MINED_AMOUNT_REGEX.test(line)) { // remove ore mined lines
        let first = i-1
        let last = first
        while (ORE_MINED_AMOUNT_REGEX.test(lore[last + 1])) {
          last++
        }
        lore.splice(first, last-first + 1)
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

    if (CC_REQUIRED_REGEX.test(lore.slice(-1))) {
      lore.splice(-1, 1)
    }

    for (let i = 0; i < lore.length; i++) {
      if (!CHARGE_ORB_SLOT_LINE.test(lore[i])) continue
      lore.splice(i, 2)
      break
    }
  }
}

proxy.on('outgoing', (data, meta, toClient, toServer) => { 
  toServer.write(meta.name, data)
})