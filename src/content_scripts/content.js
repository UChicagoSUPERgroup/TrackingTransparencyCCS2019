import makeInference from './inferencing'
import overlay from './overlay'

async function runtimeOnMessage (m) {
  if (browser.extension.inIncognitoContext) {
    return
  }

  switch (m.type) {
    case 'make_inference':
      makeInference()
      break
    case 'create_or_update_overlay':
      overlay.createOrUpdate(m.innerHTML)
      break
    case 'remove_overlay':
      overlay.remove()
      break
  }
  return true
}

// set listener for messages from background script
chrome.runtime.onMessage.addListener(runtimeOnMessage)
// this works better as chrome.runtime and not browser.runtime (bug in mozilla webextension-polyfill, may be fixed)
