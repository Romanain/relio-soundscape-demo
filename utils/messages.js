const moment = require('moment');

function formatMessage(username, text, type, closeness) {
  return {
    username,
    text,
    time: moment().format('h:mm a'),
    type,
    closeness
  };
}

module.exports = formatMessage;
