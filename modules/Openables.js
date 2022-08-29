const Module = require('./Module')
const clientUtils = require('../client_utilities')
const mcdata = require('minecraft-data')('1.8.9')

module.exports = class Openables extends Module {
  onPlayerSendsChatMessageToServerReturnFalseToNotSend (msg, toClient, toServer, config) {
    if (msg !== '/open') return false
    config.make_openables_different = !config.make_openables_different
    clientUtils.sendChat(toClient, `{"text": "§b§lYou have just toggled /open to: §a§n${config.make_openables_different === true ? 'on' : 'off'}\n§r§b§nRight Click§r §ca block§r§f to have the changes apply."}`)
    return true
  }

  handleItem (item, nbt, toClient, toServer, config) {
    if (!config.make_openables_different) return
    if (nbt?.cosmicData?.mysteryChest === 'loot_midas_sadistdepositbox') {
      item.blockId = mcdata.blocksByName.emerald_block.id
    } else if (nbt?._x === 'mysterychest') {
      item.blockId = mcdata.blocksByName.diamond_block.id
    } else {
      item.blockId = mcdata.blocksByName.stone.id
    }
    item.itemDamage = 0
  }
}
