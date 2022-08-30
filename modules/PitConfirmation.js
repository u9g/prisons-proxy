const Module = require('./Module')
const { pitGlassClicksToGlassColor } = require('../constants')
const mcdata = require('minecraft-data')('1.8.9')

const warpsInfo = {
  inWarpMenu: false,
  pitClicks: 0,
  warpItem: null
}

module.exports = class PitConfirmation extends Module {
  playerSendPacketToServerReturnTrueToCancel (data, meta, toClient, toServer, config, state) {
    if (meta.name === 'window_click') {
      if (data.slot === 20 && warpsInfo.inWarpMenu && (warpsInfo.pitClicks + 1) in pitGlassClicksToGlassColor) {
        warpsInfo.pitClicks++
        // TODO: Make the item actually say confirm for the second time
        warpsInfo.warpItem.nbtData.value.display.value.Name.value = `§c§lClick ${5 - warpsInfo.pitClicks + 1} more times to go to Pit`
        warpsInfo.warpItem.blockId = mcdata.blocksByName.stained_glass_pane.id
        warpsInfo.warpItem.itemDamage = pitGlassClicksToGlassColor[warpsInfo.pitClicks]

        toClient.write('set_slot', {
          windowId: state.windowId,
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
        return true
      }
    }
    return false
  }

  setSlot (item, slotNum, toClient, toServer, config, state) {
    if (warpsInfo.inWarpMenu && slotNum === 20 && !warpsInfo.warpItem) {
      warpsInfo.warpItem = item
    }
  }

  openWindow (windowTitle, toClient, toServer, config, state) {
    if (config.confirm_enter_pit && windowTitle === '"§lWarps"') {
      warpsInfo.inWarpMenu = true
    }
  }

  closeWindow (toClient, toServer, config, state) {
    warpsInfo.inWarpMenu = false
    warpsInfo.pitClicks = 0
    warpsInfo.warpItem = null
  }

  beforeSendPacketToClient (data, meta, toClient, toServer, config, state) {
    if (warpsInfo.inWarpMenu && meta.name === 'set_slot' && data.slot === 20) {
      data.item = warpsInfo.warpItem
    } else if (warpsInfo.inWarpMenu && meta.name === 'window_items' && data.windowId === state.windowId) {
      data.items[20] = warpsInfo.warpItem
    }
  }
}
