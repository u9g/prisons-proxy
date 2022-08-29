const Module = require('./Module')
const { HASTE_PET_OVER_MESSAGE, HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION, HASTE_PET_ACTIVE_REGEX } = require('../constants')
const clientUtils = require('../client_utilities')

// let hastePetActive = false

module.exports = class HastePetOver extends Module {
  messageReceivedFromServer (msgString, packet, toClient, toServer, config) {
    if (msgString.startsWith(HASTE_PET_OVER_MESSAGE)) {
      //   hastePetActive = false

      if (config.haste_pet_off_notification) {
        clientUtils.sendBigTitleAndManyChat(toClient, HASTE_PET_OVER_MESSAGE_PLAYER_NOTIFICATION)
      }
    } else if (HASTE_PET_ACTIVE_REGEX.test(msgString)) {
      //   hastePetActive = true
    }
  }
}
