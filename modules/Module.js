module.exports = class Module {
  onArmorPieceSent (item, nbt, armorType, toClient, toServer, config) {}
  onPlayerSendsChatMessageToServerReturnFalseToNotSend (msg, toClient, toServer, config) {}
  handleItem (item, nbt, toClient, toServer, config) {}
}
