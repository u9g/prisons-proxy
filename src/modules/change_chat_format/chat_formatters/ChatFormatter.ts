import { ChatComponent } from '../../../packet_types'
import { skyChat } from '../../../constants'

export interface ChatInformation {
  prestige?: string
  gang?: string
  rankPrefix?: string
  rankName: keyof typeof skyChat.rankToNumber
  repNumber?: string
  rankSuffix?: string
  username: string
  title?: string
  message: string
  realRankIfStaff?: keyof typeof skyChat.rankToNumber
}

export abstract class ChatFormatter {
  abstract formatChat (originalMsgString: string, extra: ChatComponent[], vars: ChatInformation): string
}

export { ChatComponent } from '../../../packet_types'
