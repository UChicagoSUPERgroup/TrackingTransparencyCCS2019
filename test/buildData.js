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

fs.readFile('./test/data/majestic_1000.json', (err, data) => {
  const pages = JSON.parse(data)
  startChromium(pages)
})
const badSites = ['bp.blogspot.com', 'wixsite.com', 'ibm.com', 'free.fr']

async function startChromium (pages) {
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

  // visit some pages
  const page = await browser.newPage()
  for (let p of pages) {
    if (badSites.indexOf(p) !== -1) {
      continue
    }
    try {
      await page.goto('http://' + p)
    } catch (err) {
      console.log(err)
    }
    await sleep(500)
  }
  await page.close()

  // naviagte to dashboard page
  const dashboard = await browser.newPage()
  await dashboard.goto('chrome-extension://' + id + '/dist/dashboard.html#/debug')
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
