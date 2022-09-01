const { Worker } = require('worker_threads')
const { moneyize } = require('./constants')

const itemFetcherThread = new Worker(require('path').join(__dirname, 'item_fetcher_thread.js')).on('message', (val) => {
  if (val.type === 'fetch') {
    cachedFetchs[val.value.url] = val.value.response
  }
})

const cachedFetchs = {}
function fetch (url) {
  if (cachedFetchs[url]) return cachedFetchs[url]
  itemFetcherThread.postMessage({
    type: 'fetch',
    value: { url }
  })
  return null
}

module.exports = {
  addPriceInfoToItem (nbt, lore) {
    function simpleItem (_x, forTheLast) {
      if (nbt._x !== _x) return
      const resp = fetch(`http://localhost/sov/${_x}`)
      if (resp?.ok) {
        lore.push('')
        lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last ${forTheLast})`)
      }
    }

    function oneFieldItem (_x, forTheLast, fieldMatcher, { urlOverride = _x } = {}) {
      if (nbt._x !== _x) return
      const resp = fetch(`http://localhost/sov/${urlOverride}/${fieldMatcher(nbt)}`)
      if (resp?.ok) {
        lore.push('')
        lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last ${forTheLast})`)
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
      const resp = fetch(`http://localhost/sov/heroic_blackscroll/${nbt['joeBlackScroll-chance']}`)
      if (resp?.ok) {
        lore.push('')
        lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last 3 days)`)
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
      if (resp?.ok && (resp.ppm || resp.avgPrice)) {
        lore.push('')
        if (resp.ppm) lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.ppm * dur).toFixed(2))} §8(based on multiplier, for the last 3 days)`)
        if (resp.avgPrice) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for exact item, for the last 3 days)`)
      }
    } else if (nbt._x === 'gkitflare') {
      const resp = fetch(`http://localhost/sov/gkit_flare/${nbt['joe-gkit']}/${nbt['joe-gkit-purchased'] === 1}`)
      if (resp?.ok) {
        lore.push('')
        lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last 3 days)`)
      }
    } else if (nbt._x === 'socket') {
      const resp = fetch(`http://localhost/sov/socket/${nbt.cosmicData.armorSocketItem_type}/${nbt.cosmicData.armorSocketItem_limit}/${nbt.cosmicData.armorSocketItem_applyChance}`)
      if (resp?.ok) {
        lore.push('')
        lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for the last 3 days)`)
        if (nbt.cosmicData.armorSocketItem_applyChance !== 100) lore.push(`§6§l100% Price: §r§a§l$${moneyize(resp.avgPriceOf100.toFixed(2))} §8(for the last 3 days)`)
      }
    } else if (nbt._x === 'socketextractor') {
      const resp = fetch(`http://localhost/sov/socket_extractor/${nbt.chance}`)
      if (resp?.ok && (resp.pricePerPercent || resp.avgPrice)) {
        lore.push('')
        if (resp.pricePerPercent) lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerPercent * nbt.chance).toFixed(2))} §8(based on %, for the last 3 days)`)
        if (resp.avgPrice) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for exact item, for the last 3 days)`)
      }
    } else if (nbt._x === 'eraser') {
      const resp = fetch(`http://localhost/sov/eraser/${nbt.joe.data.count}`)
      if (resp?.ok && (resp.pricePerErase || resp.avgPrice)) {
        lore.push('')
        if (resp.pricePerErase) lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerErase * nbt.joe.data.count).toFixed(2))} §8(based on erase count, for the last 3 days)`)
        if (resp.avgPrice) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for exact item, for the last 3 days)`)
      }
    } else if (nbt._x === 'crystalextractor') {
      const resp = fetch(`http://localhost/sov/crystal_extractor/${nbt.joe.data.successRate}`)
      if (resp?.ok && (resp.pricePerPercent || resp.avgPrice)) {
        lore.push('')
        if (resp.pricePerPercent) lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerPercent * nbt.joe.data.successRate).toFixed(2))} §8(based on %, for the last 3 days)`)
        if (resp.avgPrice) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice.toFixed(2))} §8(for exact item, for the last 3 days)`)
      }
    } else if (nbt._x === 'miningxp' && nbt['joe-miningXP'] === 5) {
      const resp = fetch('http://localhost/sov/miningxp/5')
      if (resp?.ok) {
        lore.push('')
        lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.bilPrice.toFixed(2))} §8/ §a§l1B xp §8(for the last 3 days)`)
      }
    } else if (nbt._x === 'crystal') {
      if (nbt._x === 'crystal') {
        const resp = fetch(`http://localhost/sov/crystals/${JSON.stringify(nbt.joe.data.types)}/${nbt.joe.data.successRate}`)
        if (resp?.ok && (resp.pricePerPercent || resp.avgPrice)) {
          lore.push('')
          if (resp.pricePerPercent && resp.avgPrice) {
            const a = resp.pricePerPercent * nbt.joe.data.successRate
            const b = resp.avgPrice
            // https://www.calculatorsoup.com/calculators/algebra/percent-difference-calculator.php
            // Should this just be if they are not = ?
            // console.log(nbt.joe.data.types, Math.abs(a - b) / ((a + b) / 2))
            if (Math.abs(a - b) / ((a + b) / 2) > 0.2) {
              lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerPercent * nbt.joe.data.successRate))} §8(based on %, for the last 3 days)`)
            }
          } else if (resp.pricePerPercent) {
            lore.push(`§6§lExpected Price: §r§a§l$${moneyize((resp.pricePerPercent * nbt.joe.data.successRate))} §8(based on %, for the last 3 days)`)
          }
          if (resp.avgPrice) lore.push(`§6§lAverage Price: §r§a§l$${moneyize(resp.avgPrice)} §8(for exact item, for the last 3 days)`)
        }
      }
    } else if (nbt._x === 'pet') {
      const currPrice = fetch(`http://localhost/sov/pet/${nbt.joe.data.type}/${nbt.joe.data.level ?? 1}`)?.avgPrice
      const lvlOnePrice = ((nbt.joe.data.level ?? 1) !== 1) ? fetch(`http://localhost/sov/pet/${nbt.joe.data.type}/1`)?.avgPrice : null // only check level one price if this pet isn't already level one
      if (currPrice || lvlOnePrice) {
        lore.push('')
        if (currPrice) lore.push(`§6§lLevel ${nbt.joe.data.level ?? 1} Price: §r§a§l$${moneyize(currPrice.toFixed(2))} §8(for the last 3 days)`)
        if (lvlOnePrice) lore.push(`§6§lLevel 1 Price: §r§a§l$${moneyize(lvlOnePrice.toFixed(2))} §8(for the last 3 days)`)
      }
    }

    // TODO: Slots, Exec Time Extenders, [heroic] meteor flares, cipher, charge orbs, midas satchels, [heroic] cosmic tokens
  }
}
