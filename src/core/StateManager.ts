type Buff =
// Mercenary
| 'Head Hunter'
| 'Mirror'
| 'Thief'
// Custom Block Zone
| 'House Of Cards'
// Pets
| 'Haste'
| 'Sell'
| 'Anti XP Tax'
| 'Bandit King'
| 'Energy'
| 'Gluttony'
| 'XP'
| 'Shockwave'
| 'Sonic'

const BUFF_2_SECONDS_TO_EXPIRE: { [index in Buff]?: number} = {
  'House Of Cards': 1.5 * 60 * 60
}

class BuffManager {
  private readonly _activeBuffs2LastUseTime: Map<Buff, number> = new Map()

  public isActive (name: Buff): boolean {
    const buffLastUseTime = this._activeBuffs2LastUseTime.get(name)
    if (buffLastUseTime == null) return false
    const secondsToExpire = BUFF_2_SECONDS_TO_EXPIRE[name]
    if (secondsToExpire == null) {
      return true
    }
    const toRet = buffLastUseTime + (secondsToExpire * 1000) > Date.now()
    if (!toRet) this._activeBuffs2LastUseTime.delete(name)
    return toRet
  }

  public setActive (name: Buff, active: boolean): void {
    if (!active) this._activeBuffs2LastUseTime.delete(name)
    else this._activeBuffs2LastUseTime.set(name, Date.now())
  }
}

class WindowManager {
  public inWindow: boolean = false
  public windowId: number = 0
}

export class StateManager {
  public buffs: BuffManager = new BuffManager()
  public window: WindowManager = new WindowManager()
}
