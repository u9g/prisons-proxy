export const one = {
  billion: 1.0e+9,
  million: 1.0e+6,
  thousand: 1.0e+3
}

const romanHash = {
  I: 1,
  V: 5,
  X: 10,
  L: 50,
  C: 100,
  D: 500,
  M: 1000
}

const internalMoneyize = (v: number, sizeOfSuffix: number, suffix: 'b' | 'm' | 'k'): string => (+(v / sizeOfSuffix).toFixed(2) === +(v / sizeOfSuffix).toFixed(0) ? (v / sizeOfSuffix).toFixed(0) : (v / sizeOfSuffix).toFixed(2)) + suffix

export const HASTE_PET_ACTIVE_REGEX = /\(!\) Haste Pet: you now have a (\d+)% Mining Speed Booster with (.+) remaining\./
export const CAULDRON_ACTIVE_MESSAGE = "Sets your current highest unlocked tier of ore's /skill booster to 200% for 10 minutes."
export const CAULDRON_OVER_MESSAGE = '(!) Your Cauldron: 200% /skill booster effect has expired.'
export const CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION = '{"bold":true,"color":"green","extra":[{"color":"red","text":"OVER"}],"text":"CAULDRON "}'
export const HASTE_PET_OVER_MESSAGE = '(!) Your Mining Speed Booster has expired.'
export const HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION = '{"bold":true,"color":"aqua","extra":[{"color":"red","text":"OVER"}],"text":"HASTE PET "}'
export const FORGOT_HOUSE_OF_CARDS_NOTIFICATION = '{"bold":true,"extra":[{"color":"red","text":"DID NOT"},{"text":" use "},{"color":"green","text":"House of Cards"}],"text":"You "}'
export const NO_GODLY_XP_BOTTLE_NOTIFICATION = '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"NATURAL GODLY XP BOTTLE"}],"text":"YOU "}'
export const DONT_HAVE_SYNTHETICS_MESSAGES = {
  MUSCLE_MEMORY: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"Muscle Memory"},{"text":" "},{"color":"aqua","text":"Synthetic"}],"text":"YOU "}',
  MULTI_TOOL: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"Multi Tool"},{"text":" "},{"color":"aqua","text":"Synthetic"}],"text":"YOU "}',
  PURE_LUCK: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"Pure Luck"},{"text":" "},{"color":"aqua","text":"Synthetic"}],"text":"YOU "}'
}
export const NOT_MAX_ENCHANT_REGEX = /^(.+) ??b([IV]+)$/ // need forced start end for timewarp
export const MAX_ENCHANT_REGEX = /^(.+) ??b??l([IV]+)$/ // need forced start end for timewarp
export const NOT_MAX_ENCHANT_WITH_EXTRA_REGEX = /(.+) ??b([IV]+)(??7 .+)/
export const MAX_ENCHANT_WITH_EXTRA_REGEX = /(.+) ??b??l([IV]+)(??7 .+)/
export const ORE_MINED_AMOUNT_REGEX = /??f[\d,]+ ??.??l(?:[a-zA-Z]+) Ore/
export const CC_REQUIRED_REGEX = /??7\(??nCosmicClient.com??7 required\)/
export const CHARGE_ORB_SLOT_LINE = /??f??l??n(\d+)??7\/??f(\d+)??b Charge Orb ??7slots unlocked/
export type ArmorType = 'Helmet' | 'Chestplate' | 'Leggings' | 'Boots'
interface SlotToArmorName {
  [key: number]: ArmorType | undefined
}
export const SLOT_TO_ARMOR_NAME: SlotToArmorName = {
  5: 'Helmet',
  6: 'Chestplate',
  7: 'Leggings',
  8: 'Boots'
}
export const UNHOLIED_MESSAGES = [
  "{ bold: true, extra: [{ color: 'green', text: 'HELMET' }, { text: ' IS ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' }",
  "{ bold: true, extra: [{ color: 'green', text: 'CHESTPLATE' }, { text: ' IS ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' }",
  "{ bold: true, extra: [{ color: 'green', text: 'LEGGINGS' }, { text: ' ARE ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' }",
  "{ bold: true, extra: [{ color: 'green', text: 'BOOTS' }, { text: ' ARE ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' }"
]
export const ourSide = [
  0, 1, 2, 3,
  10, 11, 12, 13,
  19, 20, 21, 22,
  28, 29, 30, 31,
  37, 38, 39, 40,
  46, 47, 48, 49
]
export const oppositeSideSlots = [
  5, 6, 7, 8,
  14, 15, 16, 17,
  23, 24, 25, 26,
  32, 33, 34, 35,
  41, 42, 43, 44,
  50, 51, 52, 53
]
export function moneyize (v: number): string {
  if (v >= one.billion) {
    return internalMoneyize(v, one.billion, 'b')
  } else if (v >= one.million) {
    return internalMoneyize(v, one.million, 'm')
  } else if (v >= one.thousand) {
    return internalMoneyize(v, one.thousand, 'k')
  }
  return v.toString()
}
export const seconds = 1000
export const minutes = 60 * 1000
export const midasCornerCommandConfirm = (corner: string): string => `{"extra":[{"bold":true,"color":"gray","extra":[{"color":"gold","text":"MIDAS"},{"text":"]"}],"text":"["},{"text":" You will be told in "},{"underlined":true,"color":"aqua","text":"10 minutes"},{"text":" when "},{"bold":true,"extra":[{"color":"green","text":"${corner.toUpperCase()}"},{"text":" has "},{"color":"red","text":"respawned"}],"text":""}],"text":""}`
export const midasWillSpawnInCorner = (corner: string, inTime: string): string => `{"extra":[{"bold":true,"color":"gray","extra":[{"color":"gold","text":"MIDAS"},{"text":"]"}],"text":"["},{"text":" "},{"bold":true,"extra":[{"color":"green","text":"${corner.toUpperCase()}"},{"text":" will respawn in "},{"underlined":true,"color":"aqua","text":"${inTime}"}],"text":""}],"text":""}`
export const midasSpawnedInCorner = (corner: string): string => `{"extra":[{"bold":true,"color":"gray","extra":[{"color":"gold","text":"MIDAS"},{"text":"]"}],"text":"["},{"text":" "},{"bold":true,"extra":[{"color":"green","text":"${corner.toUpperCase()}"},{"text":" has "},{"color":"red","text":"respawned"}],"text":""}],"text":""}`
export const fingers = {
  ' pinky': 'se',
  ' middle finger': 'ne',
  'n index finger': 'nw',
  ' thumb': 'sw'
}
export function romanToInt (s: string): number {
  let accumulator = 0
  for (let i = 0; i < s.length; i++) {
    if (s[i] === 'I' && s[i + 1] === 'V') {
      accumulator += 4
      i++
    } else if (s[i] === 'I' && s[i + 1] === 'X') {
      accumulator += 9
      i++
    } else if (s[i] === 'X' && s[i + 1] === 'L') {
      accumulator += 40
      i++
    } else if (s[i] === 'X' && s[i + 1] === 'C') {
      accumulator += 90
      i++
    } else if (s[i] === 'C' && s[i + 1] === 'D') {
      accumulator += 400
      i++
    } else if (s[i] === 'C' && s[i + 1] === 'M') {
      accumulator += 900
      i++
    } else {
      accumulator += romanHash[s[i] as keyof typeof romanHash]
    }
  }
  return accumulator
}
export const chatRegex = /^(?:(?<prestige><[IV]+>) )?(?:(?<gang>\**[a-zA-Z]+) )?(?:[?:[<](?<realRankIfStaff>(?:President|Noble|Imperial|Supreme|Majesty|Emperor|Emperor|I|II|III|IV|V|V|Helper)\+?)[?:\]>] (?=\[Helper))?(?:[?:[<](?<rankName>(?:President|Noble|Imperial|Supreme|Majesty|Emperor|Emperor|I|II|III|IV|V|V|Helper|Trainee)\+?)(?:[??? ](?<repNumber>\d+))?[?:\]>] )(?<username>[~a-zA-Z0-9_]+)(?: (?:\[(?<title>(?:.+))\]))?: (?<message>.+)$/
export const OUT_OF_ANTIVIRUS_ENERGY = (piece: string): string => `{"color":"red","extra":[{"bold":true,"underlined":true,"text":"${piece}"},{"text":" are low on "},{"bold":true,"color":"aqua","text":"Energy"},{"text":" for "},{"bold":true,"color":"dark_aqua","text":"Antivirus"}],"text":"Your "}`
export const OUT_OF_SYSTEMS_ENERGY = '{"color":"red","extra":[{"bold":true,"underlined":true,"text":"Boots"},{"text":" are low on "},{"bold":true,"color":"aqua","text":"Energy"},{"text":" for "},{"bold":true,"color":"dark_aqua","text":"System Reboot"}],"text":"Your "}'
export const CRITICAL_DURABILITY = (piece: string): string => `{"color":"red","extra":[{"bold":true,"underlined":true,"color":"dark_red","text":"${piece}"},{"text":" are on "},{"bold":true,"color":"dark_red","text":"CRITICAL DURABILITY"}],"text":"Your "}`
export const pitGlassClicksToGlassColor = {
  1: 14, // red
  2: 6, // pink
  3: 1, // orange
  4: 4, // yellow
  5: 5
}
export const ARMOR_SUFFIXES = ['_helmet', '_chestplate', '_leggings', '_boots']

interface Number2String {
  [ix: number]: string | null
}

export const skyChat = {
  rankToNumber: {
    Trainee: 0,
    I: 1,
    Noble: 1,
    II: 2,
    Imperial: 2,
    III: 3,
    Supreme: 3,
    IV: 4,
    Majesty: 4,
    V: 5,
    Emperor: 5,
    'V+': 5,
    'Emperor+': 5,
    President: 6,
    Helper: 7,
    Admin: 8
  },
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  rankNumToColor: {
    0: '7',
    1: 'f',
    2: 'a',
    3: 'b',
    4: 'd',
    5: 'e',
    6: 'c',
    7: '5',
    8: 'c'
  } as Number2String,
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  rankNumToRankName: {
    0: '',
    1: 'I',
    2: 'II',
    3: 'III',
    4: 'IV',
    5: 'V',
    6: 'VI',
    7: 'Helper'
  } as Number2String
}
export const BAH_OVER_IN_30S = '{"extra":[{"bold":true,"color":"green","text":"BAH"},{"text":" is ending in "},{"color":"red","extra":[{"bold":true,"text":"30"},{"text":" seconds"}],"text":""}],"text":""}'
