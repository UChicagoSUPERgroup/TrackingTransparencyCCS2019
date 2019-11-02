import overlayStyles from './overlay_styles'

function createOrUpdate (innerHTML) {
  const existing = document.getElementById('trackingtransparency_overlay')
  if (existing) {
    existing.contentDocument.getElementById('tt_overlay_content').innerHTML = innerHTML
  } else {
    injectOverlay(innerHTML)
  }
}

function remove () {
  const iframe = document.getElementById('trackingtransparency_overlay')
  iframe.parentElement.removeChild(iframe)
}

function injectOverlay (innerHTML) {
  // create div
  let iframe = document.createElement('iframe')
  iframe.id = 'trackingtransparency_overlay'
  iframe.srcdoc = '<div id="tt_closebutton">&#10005;</div><div id="tt_overlay_content"></div>'
  iframe.style = overlayStyles.outer

  // add to page
  document.documentElement.appendChild(iframe)
  iframe.onclick = () => {
    iframe.parentElement.removeChild(iframe)
  }

  iframe.onload = () => {
    const style = document.createElement('style')
    style.textContent = overlayStyles.inner
    iframe.contentDocument.head.appendChild(style)

    iframe.contentDocument.getElementById('tt_overlay_content').innerHTML = innerHTML
    iframe.contentDocument.getElementById('tt_closebutton').onclick = () => {
      iframe.parentElement.removeChild(iframe)
    }
  }

  // dismiss overlay after 5 seconds
  setTimeout(() => {
    iframe.parentElement.removeChild(iframe)
  }, 5000)
}

export default { createOrUpdate, remove }
