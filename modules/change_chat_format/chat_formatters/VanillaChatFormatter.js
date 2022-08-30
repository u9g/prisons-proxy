const ChatFormatter = require('./ChatFormatter')

module.exports = class VanillaChatFormatter extends ChatFormatter {
  formatChat (originalMsgString, extra, { prestige, gang, rankPrefix, rankName, repNumber, rankSuffix, username, title, message }) {
    noMoreColor(extra[extra.length - 1])
    return `{"text":"<${username}> ", "extra": [${JSON.stringify(extra[extra.length - 1])}]}`
  }
}

function noMoreColor (component) {
  for (const extras of (component?.extra ?? [])) {
    extras.color = 'white'
  }
  component.color = 'white'
}
