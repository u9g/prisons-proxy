const ChatFormatter = require('./ChatFormatter')
const { skyChat: { rankToNumber, rankNumToColor, rankNumToRankName } } = require('../../../constants')

module.exports = class SkyChatFormatter extends ChatFormatter {
  formatChat (originalMsgString, extra, { prestige, gang, rankPrefix, rankName, repNumber, rankSuffix, username, title, message }) {
    const rankNum = rankToNumber[rankName]
    const color = rankNumToColor[rankNum]
    const rank = rankNumToRankName[rankNum]
    const _gang = gang ? gang + ' ' : ''
    const _rep = repNumber ? `●${repNumber}` : ''
    const _title = title ? ' §8[§7' + title + '§8]' : ''
    return `{"text":"", "extra": [{"text":"${_gang}§${color}§l${rank}§r§${color}${_rep}${_title} §${color}${username}§f: "},${JSON.stringify(extra[extra.length - 1])}]}`
  }
}
