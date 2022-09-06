import type { NBT } from './cosmic'
export interface NBTObject<T> {
  type: 'compound'
  value: T
}

export interface NBTNumber {
  type: string
  value: number
}

export interface NBTString {
  type: 'string'
  value: string
}

export interface NBTStringArray {
  type: 'string'
  value: {
    type: 'list'
    value: string[]
  }
}

interface Display {
  display: NBTObject<{
    Name?: NBTString
    Lore?: NBTStringArray
  }>
}

export interface Item {
  blockId: number
  itemCount: number
  itemDamage: number
  nbtData?: NBTObject<NBT & Display>
}

export type { NBT } from './cosmic'

export interface Config {
  remake_item_lore: boolean
  exec_extender_ah_min_price: boolean
  disable_powerball: boolean
  disable_items_on_ground: boolean
  show_pets_on_cooldown: boolean
  exec_extender_trade_price: boolean
  show_full_midas_satchels: boolean
  dotstoops_mode: boolean
  make_openables_different: boolean
  hide_particles: boolean
  midas_corner_reminders: boolean
  exec_reminders: boolean
  midas_reminders: boolean
  cauldron_off_notification: boolean
  haste_pet_off_notification: boolean
  confirm_enter_pit: boolean
  show_average_price: boolean
  custom_chat: 'sky' | 'vanilla' | false
  notify_on_low_energy: boolean
  notify_on_low_durability: boolean
  brag_hover_text: boolean
  bah_reminder: boolean
}

export { StateManager } from './core/StateManager'
