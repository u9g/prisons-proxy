import { Module, PacketMeta, ServerClient, Client, Config, StateManager, Item } from './Module'
import { moneyize, oppositeSideSlots, ourSide } from '../constants'
import mcdLoader from 'minecraft-data'
const mcdata = mcdLoader('1.8.9')

const trade = {
  inTrade: false,
  tradeData: new Map()
}

export class ExecExtenderTradePrice extends Module {
  override afterSendPacketToClient (_data: any, meta: PacketMeta, toClient: ServerClient, _toServer: Client, config: Config, state: StateManager): void {
    if (config.exec_extender_trade_price && (meta.name === 'set_slot' || meta.name === 'window_items') && trade.inTrade) {
      const theirSideMins = numberOfExecMinsInOppositeSide()
      const yourSideMoney = numberOfMoneyInYourSide()
      if ((theirSideMins ?? 0) > 0 && (yourSideMoney ?? 0) > 0) {
        toClient.write('set_slot', {
          windowId: state.window.windowId,
          slot: 22,
          item: {
            blockId: mcdata.itemsByName['pumpkin']?.id ?? 1,
            itemCount: 1,
            itemDamage: 0,
            nbtData: {
              type: 'compound',
              name: '',
              value: {
                display: {
                  type: 'compound',
                  value: {
                    Name: { type: 'string', value: `§a$${moneyize(yourSideMoney / theirSideMins)} §8/ min` },
                    Lore: {
                      type: 'list',
                      value: {
                        type: 'string',
                        value:
                [
                  '',
                  `§a$${moneyize(yourSideMoney)} §8to §a${theirSideMins} mins`
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
  }

  override proxyStart (_config: Config, _state: StateManager): void {
    trade.inTrade = false
    trade.tradeData.clear()
  }

  override proxyEnd (_config: Config, _state: StateManager): void {
    trade.inTrade = false
    trade.tradeData.clear()
  }

  override setSlot (item: Item, slotNum: number, _toClient: ServerClient, _toServer: Client, _config: Config, _state: StateManager): void {
    if (trade.inTrade) trade.tradeData.set(slotNum, item)
  }

  override openWindow (windowTitle: string, _toClient: ServerClient, _toServer: Client, _config: Config, _state: StateManager): void {
    trade.inTrade = /§l([a-zA-Z0-9_]+) +([a-zA-Z0-9_]+)/.test(windowTitle) // FIX THIS SHOULDNT SHOW UP DURING /itemclaim OR for brags
    if (!trade.inTrade && trade.tradeData.size > 0) {
      trade.tradeData.clear()
    }/* else if (trade.inTrade && trade.tradeData.size === 0) {
      // Called when the trade is started
      trade.tradeData.clear()
    } */
  }
}

function numberOfExecMinsInOppositeSide (): number {
  if (trade.tradeData.size === 0) return 0
  let mins = 0
  for (const slotNum of oppositeSideSlots) {
    const item = trade.tradeData.get(slotNum)
    mins += item?.nbtData?.value?.exectimeextender?.value as number ?? 0
  }
  return mins / 60
}

function numberOfMoneyInYourSide (): number {
  if (trade.tradeData.size === 0) return 0
  let money = 0
  for (const slotNum of ourSide) {
    const item = trade.tradeData.get(slotNum)
    money += parseInt(item?.nbtData?.value?.money?.value as string ?? '0')
  }
  return money
}
