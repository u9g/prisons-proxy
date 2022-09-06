import { Module, Item, ServerClient, Client, Config, StateManager } from '../Module'
import { moneyize } from '../../constants'

export class EnchantPagePerPercentPriceAH extends Module {
  override handleItem (_item: Item, lore: string[], nbt: any, _toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): void {
    if (!config.exec_extender_ah_min_price) return
    const priceLine = (nbt?.display?.Lore as string[])?.find(b => b.toLowerCase().includes('price (ea): §a$'))
    if (priceLine != null && nbt._x === 'enchantpage') {
      const ix = nbt.display.Lore.indexOf(priceLine)
      // 'Low ' so category pages match too
      const price = +priceLine.substring(priceLine.includes('Low ') ? 17 + 4 : 17).replace(/,/g, '')
      lore[ix] = priceLine + ` §8(§a$${moneyize(price / nbt.joePagePercent2)} §8/ %)`
    }
  }
}
