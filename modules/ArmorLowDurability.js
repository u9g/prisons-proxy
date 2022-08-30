const Module = require('./Module')
const { ARMOR_SUFFIXES, CRITICAL_DURABILITY } = require('../constants')
const clientUtils = require('../client_utilities')
const mcdata = require('minecraft-data')('1.8.9')
const debounce = {}

module.exports = class ArmorLowDurability extends Module {
  onArmorPieceSent (item, nbt, armorType, toClient, toServer, config, state) {
    if (!config.notify_on_low_durability) return
    if (!nbt?._xl) return
    if (item.blockId === -1) return
    const mcdItem = mcdata.items[item.blockId]
    const { name, maxDurability } = mcdItem
    const _xl = nbt._xl.toString()
    if (ARMOR_SUFFIXES.some(suffix => name.endsWith(suffix)) && !debounce[_xl]) {
      if ((maxDurability - item.itemDamage) / maxDurability < 0.9) {
        clientUtils.sendBigTitleAndManyChat(toClient, CRITICAL_DURABILITY(armorType))
      }
      debounce[_xl] = true
      setTimeout(() => { delete debounce[_xl] }, 2000)
    }
  }
}
