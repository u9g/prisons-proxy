/* eslint @typescript-eslint/restrict-template-expressions: 0 */
import { Worker } from 'worker_threads'
import { moneyize } from './constants'
import { join } from 'path'

interface APIResponse {
  ok: boolean
  avgPrice?: number
  pricePerPercent?: number
  ppm?: number
  avgPriceOf100?: number
  pricePerErase?: number
  bilPrice?: number
}

interface APICache {
  [queryUrl: string]: APIResponse
}

const cachedFetchs: APICache = {}

const itemFetcherThread = new Worker(join(__dirname, 'item_fetcher_thread.js')).on('message', (val) => {
  if (val.type === 'fetch') {
    cachedFetchs[val.value.url] = val.value.response
  }
})

function fetch (url: string): APIResponse | null {
  if (cachedFetchs[url] != null) return cachedFetchs[url] ?? null
  itemFetcherThread.postMessage({
    type: 'fetch',
    value: { url }
  })
  return null
}

export function addPriceInfoToItem (nbt: any, lore: string[]): void {
  function simpleItem (_x: string, forTheLast: string): void {
    if (nbt._x !== _x) return
    const resp = fetch(`http://localhost/sov/${_x}`)
    if (resp?.ok === true && resp.avgPrice != null) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for the last ${forTheLast})`)
    }
  }

  function oneFieldItem (_x: string, forTheLast: string, fieldMatcher: (nbt: any) => string, { urlOverride = _x } = {}): void {
    if (nbt._x !== _x) return
    const resp = fetch(`http://localhost/sov/${urlOverride}/${fieldMatcher(nbt)}`)
    if (resp?.ok === true && resp.avgPrice != null) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for the last ${forTheLast})`)
    }
  }

  simpleItem('whitescroll', 'day')
  simpleItem('holywhitescroll', 'day')
  simpleItem('petleash', 'day')
  simpleItem('absorber', 'day')
  simpleItem('rarecandy', 'day')
  oneFieldItem('skin', '3 days', nbt => nbt.joe.data.types)
  oneFieldItem('mask', '3 days', nbt => nbt.joe.data.types)
  if (nbt.heroic !== 1) oneFieldItem('blackscroll', '3 days', nbt => nbt['joeBlackScroll-chance'])
  else if (nbt._x === 'blackscroll' && nbt.heroic === 1) {
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    const resp = fetch(`http://localhost/sov/heroic_blackscroll/${nbt['joeBlackScroll-chance']}`)
    if (resp?.ok === true) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice as number)} §8(for the last 3 days)`)
    }
  }
  oneFieldItem('mystery_chest', '3 days', nbt => nbt.cosmicData.mysteryChest)
  oneFieldItem('gkitbeacon', '3 days', nbt => nbt['joe-gkit-claim'], { urlOverride: 'gkit' })
  oneFieldItem('mysterygkitflare', '3 days', nbt => nbt['mystery-gkit-flare-purchased'], { urlOverride: 'mystery_gkit_flare' })
  oneFieldItem('synthetic', 'day', nbt => nbt.__type)
  oneFieldItem('gadget', 'day', nbt => nbt.__type)
  oneFieldItem('trinket', 'day', nbt => nbt.trinket)

  if (nbt._x === 'booster') {
    const { 'boosterItem-dur': dur, boosterItem: type, 'boosterItem-boost': mult } = nbt
    const resp = fetch(`http://localhost/sov/booster/${type}/${mult}/${dur}`)
    if (resp?.ok === true && (resp.ppm != null || resp.avgPrice != null)) {
      lore.push('')
      if (resp.ppm != null) lore.push(`§6§lExpected Price: §r§a§l$${moneyize(resp.ppm * dur)} §8(based on multiplier, for the last 3 days)`)
      if (resp.avgPrice != null) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for exact item, for the last 3 days)`)
    }
  } else if (nbt._x === 'gkitflare') {
    const resp = fetch(`http://localhost/sov/gkit_flare/${nbt['joe-gkit']}/${nbt['joe-gkit-purchased'] === 1}`)
    if (resp?.ok === true) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice ?? 0)} §8(for the last 3 days)`)
    }
  } else if (nbt._x === 'socket') {
    const resp = fetch(`http://localhost/sov/socket/${nbt.cosmicData.armorSocketItem_type}/${nbt.cosmicData.armorSocketItem_limit}/${nbt.cosmicData.armorSocketItem_applyChance}`)
    if (resp?.ok === true) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice ?? 0)} §8(for the last 3 days)`)
      if (nbt.cosmicData.armorSocketItem_applyChance !== 100) lore.push(`§6§l100% Price: §r§a§l$${moneyize(resp.avgPriceOf100 ?? 0)} §8(for the last 3 days)`)
    }
  } else if (nbt._x === 'socketextractor') {
    const resp = fetch(`http://localhost/sov/socket_extractor/${nbt.chance}`)
    if (resp?.ok === true && (resp.pricePerPercent != null || resp.avgPrice != null)) {
      lore.push('')
      if (resp.pricePerPercent != null) lore.push(`§6§lExpected Price: §r§a§l$${moneyize(resp.pricePerPercent * nbt.chance)} §8(based on %, for the last 3 days)`)
      if (resp.avgPrice != null) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for exact item, for the last 3 days)`)
    }
  } else if (nbt._x === 'eraser') {
    const resp = fetch(`http://localhost/sov/eraser/${nbt.joe.data.count}`)
    if (resp?.ok === true && (resp.pricePerErase != null || resp.avgPrice != null)) {
      lore.push('')
      if (resp.pricePerErase != null) lore.push(`§6§lExpected Price: §r§a§l$${moneyize(resp.pricePerErase * nbt.joe.data.count)} §8(based on erase count, for the last 3 days)`)
      if (resp.avgPrice != null) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for exact item, for the last 3 days)`)
    }
  } else if (nbt._x === 'crystalextractor') {
    const resp = fetch(`http://localhost/sov/crystal_extractor/${nbt.joe.data.successRate}`)
    if (resp?.ok === true && (resp.pricePerPercent != null || resp.avgPrice != null)) {
      lore.push('')
      if (resp.pricePerPercent != null) lore.push(`§6§lExpected Price: §r§a§l$${moneyize(resp.pricePerPercent * nbt.joe.data.successRate)} §8(based on %, for the last 3 days)`)
      if (resp.avgPrice != null) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for exact item, for the last 3 days)`)
    }
  } else if (nbt._x === 'miningxp' && nbt['joe-miningXP'] === 5) {
    const resp = fetch('http://localhost/sov/miningxp/5')
    if (resp?.ok === true) {
      lore.push('')
      lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.bilPrice ?? 0)} §8/ §a§l1B xp §8(for the last 3 days)`)
    }
  } else if (nbt._x === 'crystal') {
    if (nbt._x === 'crystal') {
      const resp = fetch(`http://localhost/sov/crystals/${JSON.stringify(nbt.joe.data.types)}/${nbt.joe.data.successRate}`)
      if (resp?.ok === true && (resp.pricePerPercent != null || resp.avgPrice != null)) {
        lore.push('')
        if (resp.pricePerPercent != null && resp.avgPrice != null) {
          const a = resp.pricePerPercent * nbt.joe.data.successRate
          const b = resp.avgPrice
          // https://www.calculatorsoup.com/calculators/algebra/percent-difference-calculator.php
          // Should this just be if they are not = ?
          // console.log(nbt.joe.data.types, Math.abs(a - b) / ((a + b) / 2))
          if (Math.abs(a - b) / ((a + b) / 2) > 0.2) {
            lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerPercent * nbt.joe.data.successRate))} §8(based on %, for the last 3 days)`)
          }
        } else if (resp.pricePerPercent != null) {
          lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerPercent * nbt.joe.data.successRate))} §8(based on %, for the last 3 days)`)
        }
        if (resp.avgPrice != null) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for exact item, for the last 3 days)`)
      }
    }
  } else if (nbt._x === 'pet') {
    const currPrice = fetch(`http://localhost/sov/pet/${nbt.joe.data.type}/${nbt.joe.data.level ?? 1}`)?.avgPrice
    const lvlOnePrice = ((nbt.joe.data.level ?? 1) !== 1) ? fetch(`http://localhost/sov/pet/${nbt.joe.data.type}/1`)?.avgPrice : null // only check level one price if this pet isn't already level one
    if (currPrice != null || lvlOnePrice != null) {
      lore.push('')
      if (currPrice != null) lore.push(`§6§lLevel ${nbt.joe.data.level ?? 1} Price: §r§a§l$${moneyize(currPrice)} §8(for the last 3 days)`)
      if (lvlOnePrice != null) lore.push(`§6§lLevel 1 Price: §r§a§l$${moneyize(lvlOnePrice)} §8(for the last 3 days)`)
    }
  }

  // TODO: Slots, Exec Time Extenders, [heroic] meteor flares, cipher, charge orbs, midas satchels, [heroic] cosmic tokens
}
