const Module = require('./Module')
const { CAULDRON_OVER_MESSAGE, CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION, CAULDRON_ACTIVE_MESSAGE } = require('../constants')
const clientUtils = require('../client_utilities')

// let cauldronActive = false

module.exports = class CauldronOver extends Module {
  messageReceivedFromServer (msgString, packet, toClient, toServer, config) {
    if (msgString.startsWith(CAULDRON_OVER_MESSAGE)) {
      //   cauldronActive = false

      if (config.cauldron_off_notification) {
        clientUtils.sendBigTitleAndManyChat(toClient, CAULDRON_OVER_MESSAGE_PLAYER_NOTIFICATION)
      }
    } else if (msgString === CAULDRON_ACTIVE_MESSAGE) {
      //   cauldronActive = true
    }
  }
}
