async function getAdblockers () {
  const blockerNames = ['ublock', 'adblock', 'ghostery', 'disconnect', 'privacy badger', 'duckduckgo', '1blocker', 'adlock', 'adaway', 'adblocker']
  const exts = await browser.management.getAll()
  const res = exts.filter(ext => {
    for (let blocker of blockerNames) {
      if (ext.name.toLowerCase().includes(blocker)) {
        return ext.enabled
      }
    }
    return false
  })// .sort((a, b) => (a.id > b.id))
  return res
}

export async function hasTrackerBlocker () {
  const blockers = await getAdblockers()
  if (blockers.length > 0) {
    return true
  }
  if (browser.privacy.websites.trackingProtectionMode) {
    const t = await browser.privacy.websites.trackingProtectionMode.get({})
    if (t.value === 'always') {
      return true
    }
  }
  return false
}
function setExtEnabled (id, val) {
  return browser.management.setEnabled(id, val)
}

window.getAdblockers = getAdblockers
window.hasTrackerBlocker = hasTrackerBlocker
window.setExtEnabled = setExtEnabled
