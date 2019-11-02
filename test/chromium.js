/*
 * script to help with manual testing
 *
 * loads chromium using puppeteer
 * then navigates to a few pages
 * and ends at the dashboard
 *
 */

const puppeteer = require('puppeteer')
const fs = require('fs')

const CRX_PATH = './extension/'

console.log('opening data file…')
fs.readFile('./test/data/tt_export.json', 'utf8', (err, jsondata) => {
  console.log('converting timestamps…')
  const data = changeTimestamps(JSON.parse(jsondata))
  console.log('starting chromium…')
  startChromium(JSON.stringify(data))
})

async function startChromium (data) {
  // set up puppeteer
  const browser = await puppeteer.launch({
    headless: false, // extensions only supported in full chrome.
    args: [
      `--disable-extensions-except=${CRX_PATH}`,
      `--load-extension=${CRX_PATH}`,
      '--user-agent=PuppeteerAgent',
      '--enable-md-extensions --false'
    ]
  })
  await sleep(1000)

  const id = await getExtensionId(browser)

  // naviagte to dashboard page
  const dashboard = await browser.newPage()
  await dashboard.goto('chrome-extension://' + id + '/dist/dashboard.html#/debug')
  await dashboard.evaluate(async (data) => {
    const background = await browser.runtime.getBackgroundPage()
    background.importData(data)
  }, data)
  await sleep(1000)
  await dashboard.close()

  const debug = await browser.newPage()
  await debug.goto('chrome://extensions')
}

function sleep (ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function getExtensionId (browser) {
  // a hack to get id of current extension by loading options page and finding where it is displayed in text
  const page = await browser.newPage()
  await page.goto('chrome://system')
  await page.click('#extensions-value-btn')
  const idHandle = await page.$('#extensions-value')
  let extensions = await page.evaluate(body => body.textContent, idHandle)
  await page.close()
  let id = extensions.match(/[a-z]*(?= : Tracking Transparency)/)[0]
  id = id.trim()
  return id
}

function getTimeArray () {
  // ### time from May 23 to May 31
  const baseTimeArray = [1527080400000, 1527084000000, 1527087600000, 1527091200000, 1527094800000, 1527098400000, 1527102000000, 1527105600000, 1527109200000, 1527112800000, 1527116400000, 1527120000000, 1527166800000, 1527170400000, 1527174000000, 1527177600000, 1527181200000, 1527184800000, 1527188400000, 1527192000000, 1527195600000, 1527199200000, 1527202800000, 1527206400000, 1527253200000, 1527256800000, 1527260400000, 1527264000000, 1527267600000, 1527271200000, 1527274800000, 1527278400000, 1527282000000, 1527285600000, 1527289200000, 1527292800000, 1527339600000, 1527343200000, 1527346800000, 1527350400000, 1527354000000, 1527357600000, 1527361200000, 1527364800000, 1527368400000, 1527372000000, 1527375600000, 1527379200000, 1527426000000, 1527429600000, 1527433200000, 1527436800000, 1527440400000, 1527444000000, 1527447600000, 1527451200000, 1527454800000, 1527458400000, 1527462000000, 1527465600000, 1527512400000, 1527516000000, 1527519600000, 1527523200000, 1527526800000, 1527530400000, 1527534000000, 1527537600000, 1527541200000, 1527544800000, 1527548400000, 1527552000000, 1527598800000, 1527602400000, 1527606000000, 1527609600000, 1527613200000, 1527616800000, 1527620400000, 1527624000000, 1527627600000, 1527631200000, 1527634800000, 1527638400000, 1527685200000, 1527688800000, 1527692400000, 1527696000000, 1527699600000, 1527703200000, 1527706800000, 1527710400000, 1527714000000, 1527717600000, 1527721200000, 1527724800000]

  // adjust it relative to 8pm of current day
  let now = new Date()
  now.setHours(20)
  const diff = now.getTime() - 1527724800000
  // ## create new timearray
  return baseTimeArray.map(b => b + diff)
}

function changeTimestamps (st) {
  const newTimeArray = getTimeArray()
  let pageTSMap = {}
  for (let p of st.pages) {
    const rand1 = newTimeArray[Math.floor(Math.random() * newTimeArray.length)]
    const rand2 = Math.floor(Math.random() * (3600000 - 1 - 10) + 10)
    const pageId = rand1 + rand2
    pageTSMap[p.id] = pageId
  }

  for (let i = 0; i < st.pages.length; i++) {
    st['pages'][i]['id'] = pageTSMap[st['pages'][i]['id']]
  }

  for (let i = 0; i < st.inferences.length; i++) {
    st['inferences'][i]['pageId'] = pageTSMap[st['inferences'][i]['pageId']]
  }

  for (let i = 0; i < st.trackers.length; i++) {
    st['trackers'][i]['pageId'] = pageTSMap[st['trackers'][i]['pageId']]
  }
  return st
}
