module.exports = class Module {
  onArmorPieceSent (item, nbt, armorType, toClient, toServer, config) {}
  onPlayerSendsChatMessageToServerReturnTrueToNotSend (msg, toClient, toServer, config) {}
  handleItem (item, nbt, toClient, toServer, config) {}
  messageReceivedFromServer (msgString, packet, toClient, toServer, config) {}
}
