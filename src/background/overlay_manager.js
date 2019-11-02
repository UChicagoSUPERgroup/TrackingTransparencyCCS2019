function generateInnerHTML (tabData) {
  let innerHTML
  let trackerWords = ''
  // let inferWords = ''

  if (tabData.trackers) {
    let len = tabData.trackers.length
    if (len <= 0) {
      trackerWords = '<p>There are no trackers on this page!</p>'
    } else if (len === 1) {
      trackerWords = `<p><strong>${tabData.trackers[0]}</strong> is tracking you on this page.</p>`
    } else {
      trackerWords = `<p><strong>${tabData.trackers[0]}</strong> and
        <span id="num-trackers">${(tabData.trackers.length - 1)}</span>
        others are tracking you on this page.</p>`
    }
  }

  // if (tabData.inference) {
  //   inferWords = `<p>We think this page is about <strong>${tabData.inference}</strong>.</p>`
  // }
  // innerHTML = trackerWords + inferWords
  innerHTML = trackerWords
  return innerHTML
}

function createOrUpdate (tabId, tabData) {
  let innerHTML = generateInnerHTML(tabData)

  if (innerHTML) {
    chrome.tabs.sendMessage(tabId, {
      type: 'create_or_update_overlay',
      innerHTML: innerHTML
    })
  }
}

export default {createOrUpdate}
