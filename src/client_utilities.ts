import { ServerClient } from 'minecraft-protocol'

export function sendChat (toClient: ServerClient, jsonMsg: string): void {
  toClient.write('chat', { message: jsonMsg, position: 0 })
}
export function sendBigTitle (toClient: ServerClient, jsonMsg: string): void {
  toClient.write('title', { action: 0, text: jsonMsg })
}
export function sendManyChat (toClient: ServerClient, jsonMsg: string): void {
  for (let i = 0; i < 5; i++) sendChat(toClient, jsonMsg)
}
export function sendBigTitleAndManyChat (toClient: ServerClient, jsonMsg: string): void {
  sendBigTitle(toClient, jsonMsg)
  sendManyChat(toClient, jsonMsg)
}
