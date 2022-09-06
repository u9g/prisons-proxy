import { NBTNumber, NBTObject, NBTString } from './types'
export type NBT = {
  _x: 'slotbotticket'
  joe: NBTObject<any>
  __type: NBTNumber
  cosmicData: NBTObject<any>
} | {
  _x: 'mysterychest'
  cosmicData: NBTObject<any>
  cosmicType: NBTString
} | {
  _x: 'trinket'
  trinket: NBTNumber
  ['trinket-energy']: NBTNumber
  ['trinket-lastuse']: NBTObject<any>
  ['trinket-whitescrolled']: NBTNumber
  ['trinket-whitescrollCount']: NBTNumber
} | {
  _x: 'pickaxeprestigetoken'
  ['prestige-token']: NBTNumber
  ['prestige-token-level']: NBTNumber
} | {
  _x: 'skin'
  joe: NBTObject<any>
  cosmicData: NBTObject<any>
} | {
  _x: 'exectimeextender'
  exectimeextender: NBTNumber
} | {
  _x: 'blackscroll'
  ['joeBlackScroll-chance']: NBTNumber
  heroic: NBTNumber
} | {
  _x: 'gear'
  chargable: NBTObject<any>
  cosmicData: NBTObject<any>
} | {
  _x: 'prisonspickaxe'
  chargable: NBTObject<any>
  cosmicData: NBTObject<any>
} | {
  _x: 'cracker'
} | {
  _x: 'pickaxeenchant'
  ['joeEnchantItem-enchant']: NBTString
  ['joeEnchantItem-level']: NBTNumber
  ['joeEnchantItem-chance']: NBTNumber
} | {
  _x: 'tokenheroic'
} | {
  _x: 'gearenchant'
  newEnchant: NBTObject<any>
} | {
  _x: 'mask'
  joe: NBTObject<any>
} | {
  _x: 'enchantreroll'
  enchantReRoll: NBTNumber
} | {
  _x: 'synthetic'
  __type: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'enchantpage'
  joePage: NBTNumber
  joePagePercent2: NBTNumber
} | {
  _x: 'crystalextractor'
  joe: NBTObject<any>
} | {
  _x: 'rank'
  joeRank: NBTNumber
} | {
  _x: 'petleash'
  __petleash: NBTNumber
} | {
  _x: 'midassatchel'
  __count: NBTNumber
} | {
  _x: 'slotbotticketscrap'
  __type: NBTNumber
} | {
  _x: 'meteorflare'
  ['joe-meteor']: NBTNumber
} | {
  _x: 'booster'
  boosterItem: NBTNumber
  ['boosterItem-boost']: NBTNumber
  ['boosterItem-dur']: NBTNumber
} | {
  _x: 'prism'
  __color: NBTNumber
  cosmicData: NBTObject<any>
} | {
  _x: 'satchel'
  chargable: NBTObject<any>
  cosmicData: NBTObject<any>
} | {
  _x: 'randomgkitbeacon'
  ['random-gkit-claim']: NBTNumber
} | {
  _x: 'mysterygkitflare'
  ['mystery-gkit-flare']: NBTNumber
  ['mystery-gkit-flare-purchased']: NBTNumber
} | {
  _x: 'expand'
  expandItem: NBTNumber
  ['expandItem-count']: NBTNumber
} | {
  _x: 'socket'
  joe: NBTObject<any>
  cosmicData: NBTObject<any>
} | {
  _x: 'shard'
  rewardTier: NBTNumber
} | {
  _x: 'whitescroll'
  whiteScroll: NBTNumber
} | {
  _x: 'absorber'
  joeAbsorber: NBTNumber
} | {
  _x: 'cluereroll'
  ['clue-reroll']: NBTNumber
} | {
  _x: 'banditbox'
  cosmicData: NBTObject<any>
  __tier: NBTString
} | {
  _x: 'randomcrate'
  randomCrate: NBTNumber
} | {
  _x: 'customblock'
  cosmicType: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'clue'
  clue: NBTObject<any>
  map_is_scaling: NBTNumber
} | {
  _x: 'questkit'
  ['joe-qkit-claim']: NBTNumber
} | {
  _x: 'miningxp'
  ['joe-miningXP']: NBTNumber
  ['joe-miningXP-amount']: NBTObject<any>
  ['joe-miningXP-extractor']: NBTString
} | {
  _x: 'eraser'
  joe: NBTObject<any>
} | {
  _x: 'enchantslot'
  __category: NBTString
  __amount: NBTNumber
  __chance: NBTNumber
  cosmicData: NBTObject<any>
} | {
  _x: 'pet'
  joe: NBTObject<any>
} | {
  _x: 'gkitbeacon'
  ['joe-gkit-claim']: NBTNumber
} | {
  _x: 'crystal'
  joe: NBTObject<any>
} | {
  _x: 'mysterytrinket'
  mysteryTrinket: NBTNumber
} | {
  _x: 'gkitflare'
  ['joe-gkit']: NBTNumber
  ['joe-gkit-purchased']: NBTNumber
} | {
  _x: 'energy'
  ['joeEnergy-amount']: NBTNumber
  ['joeEnergy-creator']: NBTString
} | {
  _x: 'itemflipcredit'
} | {
  _x: 'holywhitescroll'
} | {
  _x: 'money'
  money: NBTString
  signer: NBTString
} | {
  _x: 'gkitlevelup'
  ['joe-gkit-levelup']: NBTNumber
} | {
  _x: 'contrabandsatchel'
  chargable: NBTObject<any>
} | {
  _x: 'shardsatchel'
  chargable: NBTObject<any>
} | {
  _x: 'crate'
  joeCrate: NBTString
  ['joeCrate-purchaser']: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'enchantbundle'
  __tiers: NBTObject<any>
} | {
  _x: 'rarecandy'
  rareCandy: NBTNumber
} | {
  _x: 'vaultkey'
  __tier: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'socketextractor'
  chance: NBTNumber
} | {
  _x: 'token'
  token: NBTNumber
} | {
  _x: 'crudeore'
  crudeOre: NBTNumber
} | {
  _x: 'disguise'
  joe: NBTObject<any>
} | {
  _x: 'food'
} | {
  _x: 'spookyserum'
  __tier: NBTNumber
  cosmicData: NBTObject<any>
} | {
  _x: 'itemlore'
  itemLore: NBTNumber
} | {
  _x: 'oregenerator'
  oreGenerator: NBTNumber
} | {
  _x: 'chargeorbslot'
  chargeOrbSlot: NBTNumber
} | {
  _x: 'chargeorb'
  ['newChargeOrb-percent']: NBTNumber
} | {
  _x: 'contraband'
  ['joeChest-tier']: NBTNumber
} | {
  _x: 'cellguard'
  cellGuard: NBTObject<any>
} | {
  _x: 'title'
  ['title-text']: NBTString
  ['title-creator']: NBTString
} | {
  _x: 'mysterygearenchant'
  randomEnchant: NBTNumber
} | {
  _x: 'godlytransmogscroll'
} | {
  _x: 'infamykeepsake'
  __npc: NBTString
} | {
  _x: 'forgefuel'
  forge_fuel: NBTNumber
} | {
  _x: 'midastimevial'
} | {
  _x: 'crystalprimer'
} | {
  _x: 'gkitgenerator'
  ['gkit-gen']: NBTNumber
} | {
  _x: 'midas5thfinger'
  cosmicData: NBTObject<any>
} | {
  _x: 'randomizationscroll'
  ['randimz-scroll']: NBTNumber
} | {
  _x: 'stockingfixinitem'
  __type: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'dust'
  joeDust: NBTNumber
  joeDustPercent: NBTNumber
} | {
  _x: 'cluecasket'
  ['clue-casket']: NBTObject<any>
} | {
  _x: 'rawpickaxeenchant'
  rawEnchant: NBTNumber
} | {
  _x: 'itemnametag'
  itemNameTag: NBTNumber
} | {
  _x: 'emote'
  ['emote-text']: NBTString
} | {
  _x: 'gadget'
  __type: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'cluesatchel'
  chargable: NBTObject<any>
} | {
  _x: 'cellguardnametag'
  ['cellGuard-nameTag']: NBTNumber
} | {
  _x: 'randomcontraband'
  randomContraband: NBTNumber
} | {
  _x: 'turkeyfixinitem'
  __type: NBTString
  cosmicData: NBTObject<any>
} | {
  _x: 'easterbasketfixin'
  __type: NBTString
  cosmicType: NBTString
  cosmicData: NBTObject<any>
}
