const Module = require('./Module')
const { moneyize, oppositeSideSlots, ourSide } = require('../constants')
const mcdata = require('minecraft-data')('1.8.9')

const trade = {
  inTrade: false,
  tradeData: null
}

module.exports = class ExecExtenderTradePrice extends Module {
  afterSendPacketToClient (data, meta, toClient, toServer, config, state) {
    if (config.exec_extender_trade_price && (meta.name === 'set_slot' || meta.name === 'window_items') && trade.inTrade) {
      const theirSideMins = numberOfExecMinsInOppositeSide()
      const yourSideMoney = numberOfMoneyInYourSide()
      if ((theirSideMins ?? 0) > 0 && (yourSideMoney ?? 0) > 0) {
        toClient.write('set_slot', {
          windowId: state.windowId,
          slot: 22,
          item: {
            blockId: mcdata.blocksByName.pumpkin.id,
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

  proxyStart (config, state) {
    trade.inTrade = false
    trade.tradeData = null
  }

  proxyEnd (config, state) {
    trade.inTrade = false
    trade.tradeData = null
  }

  setSlot (item, slotNum, toClient, toServer, config, state) {
    if (trade.inTrade) trade.tradeData[slotNum] = item
  }

  openWindow (windowTitle, toClient, toServer, config, state) {
    trade.inTrade = /§l([a-zA-Z0-9_]+) +([a-zA-Z0-9_]+)/.test(windowTitle) // FIX THIS SHOULDNT SHOW UP DURING /itemclaim OR for brags
    if (!trade.inTrade && trade.tradeData) {
      trade.tradeData = null
    } else if (trade.inTrade && !trade.tradeData) {
      trade.tradeData = {}
    }
  }
}

function numberOfExecMinsInOppositeSide () {
  if (Object.keys(trade.tradeData) === 0) return 0
  let mins = 0
  for (const slotNum of oppositeSideSlots) {
    const item = trade.tradeData[slotNum]
    mins += item?.nbtData?.value?.exectimeextender?.value ?? 0
  }
  return mins / 60
}

function numberOfMoneyInYourSide () {
  if (Object.keys(trade.tradeData) === 0) return 0
  let money = 0
  for (const slotNum of ourSide) {
    const item = trade.tradeData[slotNum]
    money += parseInt(item?.nbtData?.value?.money?.value ?? '0')
  }
  return money
}
