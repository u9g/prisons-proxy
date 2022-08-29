const Module = require('./Module')
const { moneyize } = require('../constants')

module.exports = class ExecExtenderPerMinutePriceAH extends Module {
  handleItem (item, lore, nbt, toClient, toServer, config) {
    if (!config.exec_extender_ah_min_price) return
    const priceLine = nbt?.display?.Lore?.find(b => b.toLowerCase().includes('price (ea): §a$'))
    if (priceLine && nbt._x === 'exectimeextender') {
      const ix = nbt.display.Lore.indexOf(priceLine)
      const price = +priceLine.substring(priceLine.includes('Low ') ? 17 + 4 : 17).replace(/,/g, '')
      const mins = nbt.exectimeextender / 60
      lore[ix] = priceLine + ` §8(§a$${moneyize(price / mins)} §8/ min)`
    }
  }
}
