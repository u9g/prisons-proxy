import { Module, Item, PacketMeta, ServerClient, Client, Config, StateManager } from './Module'
import { pitGlassClicksToGlassColor } from '../constants'
import mcdLoader from 'minecraft-data'
const mcdata = mcdLoader('1.8.9')

const warpsInfo: {
  inWarpMenu: boolean
  pitClicks: number
  warpItem: Item | null
} = {
  inWarpMenu: false,
  pitClicks: 0,
  warpItem: null
}

export class PitConfirmation extends Module {
  override playerSendPacketToServerReturnTrueToCancel (data: any, meta: PacketMeta, toClient: ServerClient, _toServer: Client, _config: Config, state: StateManager): boolean {
    if (meta.name === 'window_click') {
      if (data.slot === 20 && warpsInfo.inWarpMenu && (warpsInfo.pitClicks + 1) in pitGlassClicksToGlassColor) {
        warpsInfo.pitClicks++
        // TODO: Make the item actually say confirm for the second time
        if (warpsInfo.warpItem != null) {
          (warpsInfo.warpItem as any).nbtData.value.display.value.Name.value = `§c§lClick ${5 - warpsInfo.pitClicks + 1} more times to go to Pit`
          warpsInfo.warpItem.blockId = mcdata.itemsByName['stained_glass_pane']?.id ?? warpsInfo.warpItem.blockId
          warpsInfo.warpItem.itemDamage = pitGlassClicksToGlassColor[warpsInfo.pitClicks as keyof typeof pitGlassClicksToGlassColor]
        }

        toClient.write('set_slot', {
          windowId: state.window.windowId,
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

  override setSlot (item: Item, slotNum: number, _toClient: ServerClient, _toServer: Client, _config: Config, _state: StateManager): void {
    if (warpsInfo.inWarpMenu && slotNum === 20 && (warpsInfo.warpItem == null)) {
      warpsInfo.warpItem = item
    }
  }

  override openWindow (windowTitle: string, _toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): void {
    if (config.confirm_enter_pit && windowTitle === '"§lWarps"') {
      warpsInfo.inWarpMenu = true
    }
  }

  override closeWindow (_toClient: ServerClient, _toServer: Client, _config: Config, _state: StateManager): void {
    warpsInfo.inWarpMenu = false
    warpsInfo.pitClicks = 0
    warpsInfo.warpItem = null
  }

  override beforeSendPacketToClient (data: any, meta: PacketMeta, _toClient: ServerClient, _toServer: Client, _config: Config, state: StateManager): void {
    if (warpsInfo.inWarpMenu && meta.name === 'set_slot' && data.slot === 20) {
      data.item = warpsInfo.warpItem
    } else if (warpsInfo.inWarpMenu && meta.name === 'window_items' && data.windowId === state.window.windowId) {
      data.items[20] = warpsInfo.warpItem
    }
  }
}
