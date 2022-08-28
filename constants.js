const one = {
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

module.exports = {
  HASTE_PET_ACTIVE_REGEX: /\(!\) Haste Pet: you now have a (\d+)% Mining Speed Booster with (.+) remaining\./,
  CAULDRON_ACTIVE_MESSAGE: "Sets your current highest unlocked tier of ore's /skill booster to 200% for 10 minutes.",
  CAULDRON_OVER_MESSAGE: '(!) Your Cauldron: 200% /skill booster effect has expired.',
  CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION: '{"bold":true,"color":"green","extra":[{"color":"red","text":"OVER"}],"text":"CAULDRON "}',
  HASTE_PET_OVER_MESSAGE: '(!) Your Mining Speed Booster has expired.',
  HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION: '{"bold":true,"color":"aqua","extra":[{"color":"red","text":"OVER"}],"text":"HASTE PET "}',
  FORGOT_HOUSE_OF_CARDS_NOTIFICATION: '{"bold":true,"extra":[{"color":"red","text":"DID NOT"},{"text":" use "},{"color":"green","text":"House of Cards"}],"text":"You "}',
  NO_GODLY_XP_BOTTLE_NOTIFICATION: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"NATURAL GODLY XP BOTTLE"}],"text":"YOU "}',
  DONT_HAVE_SYNTHETICS_MESSAGES: {
    MUSCLE_MEMORY: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"Muscle Memory"},{"text":" "},{"color":"aqua","text":"Synthetic"}],"text":"YOU "}',
    MULTI_TOOL: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"Multi Tool"},{"text":" "},{"color":"aqua","text":"Synthetic"}],"text":"YOU "}',
    PURE_LUCK: '{"bold":true,"extra":[{"color":"red","text":"DO NOT"},{"text":" HAVE A "},{"color":"red","text":"Pure Luck"},{"text":" "},{"color":"aqua","text":"Synthetic"}],"text":"YOU "}'
  },
  NOT_MAX_ENCHANT_REGEX: /^(.+) §b([IV]+)$/, // need forced start end for timewarp
  MAX_ENCHANT_REGEX: /^(.+) §b§l([IV]+)$/, // need forced start end for timewarp
  NOT_MAX_ENCHANT_WITH_EXTRA_REGEX: /(.+) §b([IV]+)(§7 .+)/,
  MAX_ENCHANT_WITH_EXTRA_REGEX: /(.+) §b§l([IV]+)(§7 .+)/,
  ORE_MINED_AMOUNT_REGEX: /§f[\d,]+ §.§l(?:[a-zA-Z]+) Ore/,
  CC_REQUIRED_REGEX: /§7\(§nCosmicClient.com§7 required\)/,
  CHARGE_ORB_SLOT_LINE: /§f§l§n(\d+)§7\/§f(\d+)§b Charge Orb §7slots unlocked/,
  UNHOLIED_MESSAGES: [
    { bold: true, extra: [{ color: 'green', text: 'HELMET' }, { text: ' IS ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' },
    { bold: true, extra: [{ color: 'green', text: 'CHESTPLATE' }, { text: ' IS ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' },
    { bold: true, extra: [{ color: 'green', text: 'LEGGINGS' }, { text: ' ARE ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' },
    { bold: true, extra: [{ color: 'green', text: 'BOOTS' }, { text: ' ARE ' }, { color: 'red', text: 'UNHOLIED' }], text: 'YOUR ' }
  ].map(b => JSON.stringify(b)),
  ourSide: [
    0, 1, 2, 3,
    10, 11, 12, 13,
    19, 20, 21, 22,
    28, 29, 30, 31,
    37, 38, 39, 40,
    46, 47, 48, 49
  ],
  oppositeSideSlots: [
    5, 6, 7, 8,
    14, 15, 16, 17,
    23, 24, 25, 26,
    32, 33, 34, 35,
    41, 42, 43, 44,
    50, 51, 52, 53
  ],
  one,
  moneyize (v) {
    if (v >= one.billion) { return (v / one.billion).toFixed(0) + 'b' } else if (v >= one.million) { return (v / one.million).toFixed(0) + 'm' } else if (v >= one.thousand) { return (v / one.thousand).toFixed(0) + 'k' }
    return v
  },
  seconds: 1000,
  minutes: 60 * 1000,
  midasCornerCommandConfirm: corner => `{"extra":[{"bold":true,"color":"gray","extra":[{"color":"gold","text":"MIDAS"},{"text":"]"}],"text":"["},{"text":" You will be told in "},{"underlined":true,"color":"aqua","text":"10 minutes"},{"text":" when "},{"bold":true,"extra":[{"color":"green","text":"${corner.toUpperCase()}"},{"text":" has "},{"color":"red","text":"respawned"}],"text":""}],"text":""}`,
  midasWillSpawnInCorner: (corner, inTime) => `{"extra":[{"bold":true,"color":"gray","extra":[{"color":"gold","text":"MIDAS"},{"text":"]"}],"text":"["},{"text":" "},{"bold":true,"extra":[{"color":"green","text":"${corner.toUpperCase()}"},{"text":" will respawn in "},{"underlined":true,"color":"aqua","text":"${inTime}"}],"text":""}],"text":""}`,
  midasSpawnedInCorner: corner => `{"extra":[{"bold":true,"color":"gray","extra":[{"color":"gold","text":"MIDAS"},{"text":"]"}],"text":"["},{"text":" "},{"bold":true,"extra":[{"color":"green","text":"${corner.toUpperCase()}"},{"text":" has "},{"color":"red","text":"respawned"}],"text":""}],"text":""}`,
  fingers: {
    ' pinky': 'se',
    ' middle finger': 'ne',
    'n index finger': 'nw',
    ' thumb': 'sw'
  },
  romanToInt (s) {
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
        accumulator += romanHash[s[i]]
      }
    }
    return accumulator
  }
}
