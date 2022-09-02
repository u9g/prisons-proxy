const Module = require('./Module')
const { moneyize } = require('../constants')

module.exports = class ExecExtenderPerMinutePriceAH extends Module {
  handleItem (item, lore, nbt, toClient, toServer, config, state) {
    if (!config.exec_extender_ah_min_price) return
    const priceLine = nbt?.display?.Lore?.find(b => b.toLowerCase().includes('price (ea): §a$'))
    if (priceLine && nbt._x === 'enchantpage') {
      const ix = nbt.display.Lore.indexOf(priceLine)
      // 'Low ' so category pages match too
      const price = +priceLine.substring(priceLine.includes('Low ') ? 17 + 4 : 17).replace(/,/g, '')
      lore[ix] = priceLine + ` §8(§a$${moneyize(price / nbt.joePagePercent2)} §8/ %)`
    }
  }
}
