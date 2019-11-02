const test = require('tape')
const puppeteer = require('puppeteer')

const CRX_PATH = './extension/'

run()

async function run () {
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

  // get browser extension's id
  const id = await getExtensionId(browser)

  await asyncTest('welcome page', async t => {
    // await t.plan(1)
    const initialPages = await browser.pages()
    const initialUrls = await Promise.all(initialPages.map(x => x.url()))
    const welcomeUrl = 'chrome-extension://' + id + '/dist/welcome.html'
    await t.ok(initialUrls.includes(welcomeUrl), 'extension welcome page opens')
    t.end()
  })

  await asyncTest('backend integration', async t => {
    // visit some pages
    const page = await browser.newPage()
    const pages = [
      'https://super.cs.uchicago.edu',
      'https://cs.uchicago.edu',
      'https://www.nytimes.com',
      'https://www.google.com/maps/place/Department+of+Computer+Science,+1100+E+58th+St,+Chicago,+IL+60637/@41.7943177,-87.5937424,13z/data=!4m2!3m1!1s0x880e29162042b8f1:0x1e9e400ccfae3c4d',
      'https://js.org/',
      'https://stats.js.org/'
    ]
    for (let p of pages) {
      await page.goto(p)
    }
    await page.close()

    // naviagte to dashboard page
    const dashboard = await browser.newPage()
    await dashboard.goto('chrome-extension://' + id + '/dist/dashboard.html')
    dashboard.on('console', msg => console.log('PAGE LOG:', msg.text()))

    // allow us to access testing functions from page context
    await dashboard.exposeFunction('equal', t.equal)
    await dashboard.exposeFunction('ok', t.ok)
    await dashboard.exposeFunction('test', t.test)
    await dashboard.exposeFunction('sleep', sleep)

    // switch to page context and run tests
    await dashboard.evaluate(async (pages) => {
      const background = await browser.runtime.getBackgroundPage()

      let ping = background.ping()
      await equal(ping, 'ping', 'ping test')

      let query

      query = await background.queryDatabase('getAllData', {})
      await ok(query.pages.length >= pages.length, 'pages were stored in database')
      await ok(query.inferences.length >= pages.length, 'inferences were stored in database')

      // check to make domains are stored properly
      const domains = query.pages.map(x => x.domain)
      await ok(domains.indexOf('google.com') !== -1, 'google maps is stored as google.com')
      await ok(domains.indexOf('41.7943177,-87.5937424,13z') === -1, 'there are not gps-coordinate domains')

      // some edge cases for tldjs libary
      await ok(domains.indexOf('js.org') !== -1, 'homepage of a public suffix is stored properly')
      await ok(domains.indexOf('stats.js.org') !== -1, 'unique subdomain is stored properly')

      // make sure we have some trackers stored
      query = await background.queryDatabase('getTrackersByDomain', {domain: 'nytimes.com'})
      await equal(query.length >= 0, true, 'there are trackers on nytimes in database')

      // LAST TEST
      // try wiping database
      background.resetAllData()
      await sleep(5000)
      query = await background.queryDatabase('getAllData', {})
      await ok(query.pages.length === 0, 'after emptying database no pages exist')
    }, pages)

    await t.end()
  })

  await browser.close()
}

function asyncTest (name, cb) {
  return new Promise(resolve => {
    test(name, async t => {
      await cb(t)
      resolve()
    })
  })
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
