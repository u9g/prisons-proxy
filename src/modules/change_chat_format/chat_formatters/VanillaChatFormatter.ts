import { ChatComponent, ChatFormatter, ChatInformation } from './ChatFormatter'

export class VanillaChatFormatter extends ChatFormatter {
  formatChat (_originalMsgString: String, extra: ChatComponent[], vars: ChatInformation): string {
    noMoreColor(extra[extra.length - 1] as ChatComponent)
    return `{"text":"<${vars.username}> ", "extra": [${JSON.stringify(extra[extra.length - 1])}]}`
  }
}

function noMoreColor (component: ChatComponent): void {
  for (const extras of (component?.extra ?? [])) {
    extras.color = 'white'
  }
  component.color = 'white'
}
