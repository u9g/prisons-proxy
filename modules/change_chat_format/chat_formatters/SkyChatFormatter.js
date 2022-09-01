const ChatFormatter = require('./ChatFormatter')
const { skyChat: { rankToNumber, rankNumToColor, rankNumToRankName } } = require('../../../constants')

module.exports = class SkyChatFormatter extends ChatFormatter {
  formatChat (originalMsgString, extra, { prestige, gang, rankPrefix, rankName, repNumber, rankSuffix, username, title, message, realRankIfStaff }) {
    const makeRankStr = (rank) => {
      const rankNum = rankToNumber[rank]
      const color = rankNumToColor[rankNum]
      const rankStr = rankNumToRankName[rankNum]
      return `§${color}§l${rankStr}`
    }
    if (rankName === 'Helper' || rankName === 'Admin') boldStaffsChat(extra[extra.length - 1])
    const { hoverEvent } = extra[extra.length - 3]
    const color = rankNumToColor[rankToNumber[rankName]]
    const _gang = gang ? gang + ' ' : ''
    const _rep = repNumber ? `●${repNumber}` : ''
    const _title = title ? ' §8[§7' + title + '§8]' : ''
    const _staffRank = realRankIfStaff ? makeRankStr(rankName) + ' ' : ''
    const _realRank = makeRankStr(realRankIfStaff || rankName)
    // https://media.discordapp.net/attachments/714643353068896357/1014336287706198107/IMG_1396.png
    return `{"text":"", "extra": [{"hoverEvent": ${JSON.stringify(hoverEvent)}, "text":"${_gang}${_staffRank}${_realRank}§r§${color}${_rep}${_title}${rankToNumber[rankName] === 0 ? '' : ' '}§${color}${username}§f: "},${JSON.stringify(extra[extra.length - 1])}]}`
  }
}

function boldStaffsChat (component) {
  for (const extras of (component?.extra ?? [])) {
    extras.bold = true
  }
  component.bold = true
}
