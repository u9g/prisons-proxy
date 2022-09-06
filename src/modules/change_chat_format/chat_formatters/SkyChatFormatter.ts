import { skyChat } from '../../../constants'
import { ChatComponent, ChatFormatter, ChatInformation } from './ChatFormatter'
const { rankNumToColor, rankToNumber, rankNumToRankName } = skyChat

export class SkyChatFormatter extends ChatFormatter {
  formatChat (_originalMsgString: String, extra: ChatComponent[], vars: ChatInformation): string {
    const makeRankStr = (rank: keyof typeof rankToNumber): string => {
      const rankNum = rankToNumber[rank]
      const color = rankNumToColor[rankNum] ?? ''
      const rankStr = rankNumToRankName[rankNum] ?? ''
      return `§${color}§l${rankStr}`
    }
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    if (vars.rankName === 'Helper' || vars.rankName === 'Admin') boldStaffsChat(extra[extra.length - 1]!)
    const { hoverEvent } = extra[extra.length - 3] as ChatComponent
    if (vars.rankName == null) throw Error('rankName is null?')
    const rankNumber = rankToNumber[vars.rankName ?? 'Trainee']
    const color = rankNumToColor[rankNumber] as string
    const _gang = (vars.gang != null) ? (vars.gang) + ' ' : ''
    const _rep = (vars.repNumber != null) ? `●${vars.repNumber}` : ''
    const _title = (vars.title != null) ? ' §8[§7' + (vars.title) + '§8]' : ''
    const _staffRank = (vars.realRankIfStaff != null) ? makeRankStr(vars.rankName) + ' ' : ''
    const _realRank = makeRankStr(vars.realRankIfStaff ?? vars.rankName)
    // https://media.discordapp.net/attachments/714643353068896357/1014336287706198107/IMG_1396.png
    return `{"text":"", "extra": [{"hoverEvent": ${JSON.stringify(hoverEvent)}, "text":"${_gang}${_staffRank}${_realRank}§r§${color}${_rep}${_title}${rankToNumber[vars.rankName] === 0 ? '' : ' '}§${color}${vars.username}§f: "},${JSON.stringify(extra[extra.length - 1])}]}`
  }
}

function boldStaffsChat (component: ChatComponent): void {
  for (const extras of (component?.extra ?? [])) {
    extras.bold = true
  }
  component.bold = true
}
