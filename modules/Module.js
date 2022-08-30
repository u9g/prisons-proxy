module.exports = class Module {
  onArmorPieceSent (item, nbt, armorType, toClient, toServer, config, state) {}
  onPlayerSendsChatMessageToServerReturnTrueToCancel (msg, toClient, toServer, config, state) {}
  handleItem (item, nbt, toClient, toServer, config, state) {}
  messageReceivedFromServerReturnTrueToCancel (msgString, packet, toClient, toServer, config, state) {}
  beforeSendPacketToClient (data, meta, toClient, toServer, config, state) {}
  afterSendPacketToClient (data, meta, toClient, toServer, config, state) {}
  proxyStart (config, state) {}
  proxyEnd (config, state) {}
  setSlot (item, slotNum, toClient, toServer, config, state) {}
  openWindow (windowTitle, toClient, toServer, config, state) {}
  closeWindow (toClient, toServer, config, state) {}
  playerSendPacketToServerReturnTrueToCancel (data, meta, toClient, toServer, config, state) {}
}
