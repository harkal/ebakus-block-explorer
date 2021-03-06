const timeConverter = UNIX_timestamp => {
  var b = new Date(Date.now())
  var a = new Date(UNIX_timestamp * 1000)
  var months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ]
  var year = a.getFullYear()
  var month = months[a.getMonth()]
  var date = a.getDate()
  var hour = a.getHours()
  var min = a.getMinutes()
  if (parseInt(min) < 10) min = '0' + min
  var sec = a.getSeconds()
  if (parseInt(sec) < 10) sec = '0' + sec
  if (
    a.getFullYear() == b.getFullYear() &&
    a.getMonth() == b.getMonth() &&
    a.getDate() == b.getDate()
  ) {
    var time = 'Today ' + hour + ':' + min + ':' + sec
  } else
    var time =
      date + ' ' + month + ' ' + year + ' ' + hour + ':' + min + ':' + sec

  return time
}

const isZeroHash = hash => {
  return /^(0x)?0*$/.test(hash)
}

function asyncTimeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

const waitUntil = function(
  checkSuccess = () => false,
  checkError = () => false,
  time = 500
) {
  return new Promise((resolve, reject) => {
    const interval = setInterval(() => {
      if (checkSuccess()) {
        clearInterval(interval)
        resolve()
      } else if (checkError()) {
        clearInterval(interval)
        reject()
      }
    }, time)
  })
}

export { timeConverter, isZeroHash, waitUntil, asyncTimeout }
