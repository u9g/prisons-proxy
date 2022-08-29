const { once } = require('events')
const Module = require('./Module')
const { UNHOLIED_MESSAGES, NO_GODLY_XP_BOTTLE_NOTIFICATION, DONT_HAVE_SYNTHETICS_MESSAGES } = require('../constants')
const clientUtils = require('../client_utilities')
const mcdata = require('minecraft-data')('1.8.9')

module.exports = class EnterExecInventoryCheck extends Module {
  messageReceivedFromServer (msgString, packet, toClient, toServer, config) {
    if (msgString === '(!) Welcome to the Executive Mine.') {
      onEnterExec(toClient, toServer, config)
    }
  }
}

async function onEnterExec (toClient, toServer, config) {
  if (!config.exec_reminders) return
  await once(toServer, 'window_items')
  const [{ items }] = await once(toServer, 'window_items')
  let hasNaturalXP = false
  const synthetics = {}
  for (let i = 5; i <= 8; i++) { // iterate armor
    if (items[i]?.nbtData?.value?.chargable?.value && items[i]?.nbtData?.value?.chargable?.value?.holyWhiteScroll?.value !== 1) {
      toClient.write('chat', { position: 0, message: UNHOLIED_MESSAGES[i - 5] })
    }
  }
  for (const item of items) {
    if (item.blockId !== -1) {
      const mcdItem = mcdata.items[item.blockId]
      if (mcdItem.name.endsWith('_pickaxe') && item.nbtData?.value?.chargable?.value?.whiteScroll?.value !== 1) {
        clientUtils.sendChat(toClient, JSON.stringify({ bold: true, extra: [{ text: item?.nbtData?.value?.display?.value?.Name?.value ?? mcdItem.displayName, extra: [{ color: 'red', text: ' << UNWHITESCROLLED' }] }], text: 'YOU LEFT YOUR PICKAXE CALLED >> ' }))
      } else if (item?.nbtData?.value?._x?.value === 'miningxp' && !item?.nbtData?.value?.['joe-miningXP-extractor']) {
        hasNaturalXP = true
      } else if (item?.nbtData?.value?._x?.value === 'synthetic') {
        synthetics[item.nbtData.value.__type.value] = true
      }
    }
  }

  if (!hasNaturalXP) clientUtils.sendManyChat(toClient, NO_GODLY_XP_BOTTLE_NOTIFICATION)

  Object.entries(DONT_HAVE_SYNTHETICS_MESSAGES)
    .filter(([syntheticName]) => !synthetics[syntheticName])
    .forEach(([, msg]) => clientUtils.sendChat(toClient, msg))
}
