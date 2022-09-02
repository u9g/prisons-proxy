const Module = require('./Module')
const clientUtils = require('../client_utilities')
const { BAH_OVER_IN_30S } = require('../constants')

module.exports = class BAHReminderBeforeOver extends Module {
  messageReceivedFromServerReturnTrueToCancel (msgString, packet, toClient, toServer, config, state) {
    if (!config.bah_reminder || !/\[\/bah\] (?:.+) has 60 seconds remaining!/.test(msgString)) return
    clientUtils.sendBigTitle(toClient, BAH_OVER_IN_30S)
  }
}
