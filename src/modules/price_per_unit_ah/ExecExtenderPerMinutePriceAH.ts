import { moneyize } from '../../constants'
import { Module, Item, ServerClient, Client, Config, StateManager } from '../Module'

export class ExecExtenderPerMinutePriceAH extends Module {
  override handleItem (item: Item, lore: string[], nbt: any, _toClient: ServerClient, _toServer: Client, config: Config, _state: StateManager): void {
    if (!config.exec_extender_ah_min_price) return
    const priceLine = item.nbtData?.value?.display?.value?.Lore?.value?.value?.find(b => b.toLowerCase().includes('price (ea): §a$'))
    if (priceLine != null && nbt._x === 'exectimeextender') {
      const ix = nbt.display.Lore.indexOf(priceLine)
      // 'Low ' so category pages match too
      const price = +priceLine.substring(priceLine.includes('Low ') ? 17 + 4 : 17).replace(/,/g, '')
      const mins = nbt.exectimeextender / 60
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      lore[ix] = `${priceLine} §8(§a$${moneyize((price / mins) * 60)} §8/ hr)`
    }
  }
}
