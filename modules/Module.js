module.exports = class Module {
  onArmorPieceSent (item, nbt, armorType, toClient, toServer, config, state) {}
  onPlayerSendsChatMessageToServerReturnTrueToNotSend (msg, toClient, toServer, config, state) {}
  handleItem (item, nbt, toClient, toServer, config, state) {}
  messageReceivedFromServer (msgString, packet, toClient, toServer, config, state) {}
  afterSendPacketToClient (data, meta, toClient, toServer, config, state) {}
  proxyStart (config, state) {}
  proxyEnd (config, state) {}
  setSlot (item, slotNum, toClient, toServer, config, state) {}
  openWindow (windowTitle, toClient, toServer, config, state) {}
}
