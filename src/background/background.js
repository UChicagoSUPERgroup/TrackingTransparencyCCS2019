/** @module background */

import tldjs from 'tldjs';

import {trackersWorker, databaseWorker, inferencingWorker, queryDatabase} from './worker_manager';
import overlayManager from './overlay_manager';
// import instrumentation from './instrumentation';
// import adblockChecking from './adblockChecking'
import { getOption } from '../helpers';
// import loggingDefault from '../options/loggingDefault'

let tabData = {};

let pendingTrackerMessages = {};
let trackerMessageId = 0;

async function onInstall (details) {
  // also runs on update
  if (details.reason === 'install') {
    const welcomePageData = {
      active: true,
      url: '../dist/welcome.html'
    }

    await browser.tabs.create(welcomePageData)
  }
}
browser.runtime.onInstalled.addListener(onInstall)

// set up default for logging, currently it is true.

// console.log('Here I am');
// loggingDefault.setLoggingDefault();

// set up instrumentation
// instrumentation.setup()

// async function hashit(data){return instrumentation.hashit(data)}
// async function hashit_salt(data){return instrumentation.hashit_salt(data)}

/* WEB REQUEST/TAB LISTENERS */
/* ========================= */

/**
 * ping function, used as sanity check for automated tests
 * @returns {string} 'ping'
 */
function ping () {
  return 'ping'
}
window.ping = ping;

/* listener for all outgoing web requests */
browser.webRequest.onBeforeRequest.addListener(
  logRequest,
  {urls: ['<all_urls>']}
);

/* listeners for page navigation (moving to a new page) */
browser.webNavigation.onBeforeNavigate.addListener(onBeforeNavigate)
browser.webNavigation.onDOMContentLoaded.addListener(onDOMContentLoaded)
browser.webNavigation.onHistoryStateUpdated.addListener(onHistoryStateUpdated)

/* listener for tab close */
browser.tabs.onRemoved.addListener(clearTabData);

/* listeners to signal content scripts */
browser.webNavigation.onCompleted.addListener(onPageLoadFinish);
browser.webNavigation.onHistoryStateUpdated.addListener(onPageLoadFinish); // for pages that do fancy javascript to change urls

/** Sends a message with information about each outgoing
 * web request to trackers worker.
 *
 * @param  {Object} details - object from onBeforeRequest listener
 * @param  {string} details.type - type of request (i.e. "main_frame")
 * @param  {string} details.tabId - tab request originated from
 */
async function logRequest (details) {
  if (details.type === 'main_frame') {
    // for main frame page loads, ignore
    return
  }

  if (tabData[details.tabId]) {
    tabData[details.tabId].webRequests.push(details)
  }
}

function isMainFramePage (details) {
  const { tabId, frameId, url } = details
  return (frameId === 0 &&
    tabId !== -1 &&
    tabId !== browser.tabs.TAB_ID_NONE &&
    url.startsWith('http') &&
    !url.includes('_/chrome/newtab')) &&
    !browser.extension.inIncognitoContext
}

function onBeforeNavigate (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  /* if we have data from a previous load, send it to trackers
   * worker and clear out tabData here */
  if (tabData[details.tabId]) {
    clearTabData(details.tabId)
  }

  const pageId = Date.now()
  let urlObj = new URL(url)

  const domain = tldjs.getDomain(urlObj.hostname) || urlObj.hostname

  // store info about the tab in memory
  tabData[tabId] = {
    pageId: pageId,
    domain: domain,
    hostname: urlObj.hostname,
    path: urlObj.pathname,
    protocol: urlObj.protocol,
    url: url,
    webRequests: [],
    trackers: []
  }
}

async function onDOMContentLoaded (details) {
  const { tabId } = details
  if (!isMainFramePage(details)) return

  // we now have title
  // so we can add that to tabdata and push it to database
  const tab = await browser.tabs.get(details.tabId)
  if (tab.incognito) {
    // we don't want to store private browsing data
    tabData[tabId] = null
    return
  }
  tabData[tabId]['title'] = tab.title

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })
  // now fetch and store the favicon database
  // fetchSetGetFavicon(url, faviconUrl)
}

async function onHistoryStateUpdated (details) {
  const { tabId, url } = details
  if (!isMainFramePage(details)) return

  // check if url is changed
  // a lot of pages (yahoo, duckduckgo) do extra redirects
  // that call this function but really aren't a page change
  if (tabData[tabId].hostname) {
    const u = new URL(url)
    const h1 = u.hostname.split('www.').pop()
    const h2 = tabData[tabId].hostname.split('www.').pop()
    const p1 = u.pathname
    const p2 = tabData[tabId].path
    if (h1 === h2 && p1 === p2) return
  }

  // simulate a new page load
  onBeforeNavigate(details)

  const tab = await browser.tabs.get(details.tabId)
  tabData[tabId]['title'] = tab.title

  // add new entry to database "Pages" table with into about the page
  databaseWorker.postMessage({
    type: 'store_page',
    info: tabData[tabId]
  })
}

/* check if the site's favicon is already cahced in local storage and
if the cache is recent (same favicon url or not)
if the data is not cahched or the cached data is stale
fetch the favicon data and store it in base 64 format and return that data
*/
/*
async function fetchSetGetFavicon(url, faviconurl){
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    //already stored favicon
    //and the favicon is same as before
    if(checkFav[x]['faviconurl']==faviconurl){
      return checkFav[x]['favicondata'];
    }
  }
  if(faviconurl==''){
    //no favicon for this tab
    await browser.storage.local.set(
      {[x]: {
        'url':url,
        'faviconurl':faviconurl,
        'favicondata':''}
      }
    );
    return '';
  }
  var favicon = new XMLHttpRequest();
  favicon.responseType = 'blob';
  favicon.open('get', faviconurl);
  favicon.onload = function() {
    var fileReader = new FileReader();
    fileReader.onloadend = async function() {
      // fileReader.result is a data-URL (string) in base 64 format
      x = 'favicon_'+url
      await browser.storage.local.set(
        {
          [x]: {
            'url':url,
            'faviconurl':faviconurl,
            'favicondata':fileReader.result
          }
        });
    };
    // favicon.response is a Blob object
    fileReader.readAsDataURL(favicon.response);
  };
  favicon.send();
  checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  return checkFav[x]['favicondata'];
}
window.fetchSetGetFavicon=fetchSetGetFavicon;
*/

/*
getFavicon: A simple function to retrieve favicon data from local storage
given a url.

Usage: <img src="THE BASE64 STRING GIVEN BY THIS FUNCTION." />
Always check if the returned base64 url is empty.

*/
/*
async function getFavicon(url) {
  let x = 'favicon_'+url
  let checkFav = await browser.storage.local.get({[x]: 'no favicon'});
  if(checkFav[x]!='no favicon'){
    return checkFav[x]['favicondata'];
  }
  return ''
}
window.getFavicon=getFavicon;
*/

/**
 * Clears tabData info for a tab,
 * pushing queued web requests to the trackers worker
 * (which will then store to database)
 * Called when page changed/reloaded or tab closed.
 *
 * @param  {number} tabId - tab's id
 */
function clearTabData (tabId) {
  if (!tabData[tabId]) {
    return;
  }

  trackersWorker.postMessage({
    type: 'page_changed',
    oldPageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests
  });

  tabData[tabId] = null;
}

/**
 * forces update of tab data
 * web requests are queued in tabData, and then when this function is called
 * they are pushed to the trackers worker, which evaluates whether they are trackers
 * and if so stores them in the database
 *
 * this function also sends the updated data to the in-page overlay
 *
 * @param  {number} tabId - tab's id
 */
async function updateTrackers (tabId) {
  if (typeof tabData[tabId] === 'undefined') {
    return;
  }

  let messagePromise = new Promise((resolve) => {
    pendingTrackerMessages[trackerMessageId] = resolve;
  });

  trackersWorker.postMessage({
    id: trackerMessageId,
    type: 'push_webrequests',
    pageId: tabData[tabId].pageId,
    firstPartyHost: tabData[tabId].domain,
    webRequests: tabData[tabId].webRequests
  });
  trackerMessageId++;
  tabData[tabId].webRequests = [];

  let trackers = await messagePromise;
  tabData[tabId].trackers = trackers;
}

async function onPageLoadFinish (details) {
  // signal content script to make an inference
  if (details.frameId === 0) {
    // not an iframe
    const tabId = details.tabId
    try {
      chrome.tabs.sendMessage(tabId, {
        type: 'make_inference'
      })
    } catch (e) {
      console.log(e)
    }

    // extra stuff for overlay (ghostery condition)
    const data = await getTabData(tabId)
    const showOverlay = await getOption('showOverlay')
    if (showOverlay === true) {
      overlayManager.createOrUpdate(tabId, data)
    }
  }
}

/* INTRA-EXTENSION MESSAGE LISTENERS */
/* ================================= */

// note that we are using the CHROME api and not the BROWSER api
// because the webextension polyfill does NOT work with sending a response because of reasons
chrome.runtime.onMessage.addListener(runtimeOnMessage);

trackersWorker.onmessage = onTrackersWorkerMessage;
inferencingWorker.onmessage = onInferencingWorkerMessage;

/**
 * Gets tabData for given tab id, updating the trackers worker as necessary.
 *
 * @param  {number} tabId
 * @return {Object} tabData object
 */
async function getTabData (tabId) {
  if (typeof tabData[tabId] === 'undefined') {
    return null;
  } else {
    let data = tabData[tabId];

    await updateTrackers(tabId);

    return data;
  }
}
window.getTabData = getTabData; // exposes function to other extension components

/**
 * facilitates bulk import of data
 * takes in JSON of data to import, passes to database
 *
 * @param  {Object} dataString - JSON with data to import
 */
async function importData (dataString) {
  databaseWorker.postMessage({
    type: 'import_data',
    data: dataString
  })
}
window.importData = importData;

/**
 * resets all data
 * sends message to database worker to empty database
 */
function resetAllData () {
  databaseWorker.postMessage({
    type: 'empty_db'
  })

  // TODO: send message to server to wipe all data
}
window.resetAllData = resetAllData;

/**
 * Run on message recieved from trackers worker.
 *
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 * @param  {Object} m.data.type - Message type, set by sender
 * @param  {Object} m.data.id - Message id, set by sender
 * @param  {Object} m.data.trackers - Array of trackers, given by sender
 */
function onTrackersWorkerMessage (m) {
  if (m.data.type === 'trackers') {
    pendingTrackerMessages[m.data.id](m.data.trackers);
  }
}

async function onInferencingWorkerMessage (m) {
  const tabId = m.data.info.tabId;
  if (m.data.type === 'page_inference') {
    tabData[tabId].inference = m.data.info.inference;
  }
  const showOverlay = await getOption('showOverlay')
  if (showOverlay === true) {
    overlayManager.createOrUpdate(tabId, tabData[tabId])
  }
}

/**
 * listener function for messages from content script
 *
 * @param  {Object} message
 * @param {string} message.type - message type
 * @param  {Object} sender
 * @param  {Object} sendResponse - callback to send a response to caller
 * @returns {boolean} true
 *
 */
function runtimeOnMessage (message, sender, sendResponse) {
  let pageId;
  let query, tabDataRes;
  // sendResponse('swhooo');
  switch (message.type) {
    case 'parsed_page':

      if (!sender.tab || !sender.url || sender.frameId !== 0) {
      // message didn't come from a tab, so we ignore
        break;
      }
      if (!tabData[sender.tab.id]) break;
      pageId = tabData[sender.tab.id].pageId;

      // send page text off to inferencing web worker
      inferencingWorker.postMessage({
        type: 'content_script_to_inferencing',
        article: message.article,
        mainFrameReqId: pageId,
        tabId: sender.tab.id
      });
      break;

    case 'queryDatabase':
      query = queryDatabase(message.query, message.args);
      query.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously

    case 'getTabData':
      tabDataRes = getTabData(sender.tab.id);
      tabDataRes.then(res => sendResponse(res));
      return true; // must do since calling sendResponse asynchronously
  }
}

// async function maybeDashboardNudge () {
//   const store = await browser.storage.local.get(['startTS', 'lastNudgeShown'])
//   const startTS = store.startTS || undefined
//   const lastNudgeShown = store.lastNudgeShown || 0
//   if (!startTS) {
//     return
//   }
//   const now = Date.now()
//   const day = 24 * 60 * 60 * 1000
//   // const day = 20000
//   if (now > startTS + 4 * day && now < startTS + 5 * day) {
//     // day 4
//     if (lastNudgeShown < 4) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 4})
//     }
//   } else if (now > startTS + 5 * day && now < startTS + 6 * day) {
//     // day 5
//     if (lastNudgeShown < 5) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 5})
//     }
//   } else if (now > startTS + 6 * day && now < startTS + 7 * day) {
//     // day 6
//     if (lastNudgeShown < 6) {
//       await dashboardNudgeNotification()
//       browser.browserAction.setBadgeText({text: '*'})
//       browser.storage.local.set({'lastNudgeShown': 6})
//     }
//   }
// }

// async function dashboardNudgeNotification () {
//   await browser.notifications.create({
//     type: 'basic',
//     title: EXT.NAME,
//     message: 'Click to learn more about your web browsing!',
//     iconUrl: '/icons/logo.svg'
//   })
// }

async function openDashboard () {
  const dashboardData = {
    active: true,
    url: browser.runtime.getURL('dist/dashboard.html')
  }
  await browser.tabs.create(dashboardData)
}

// browser.notifications.onClicked.addListener(openDashboard)

// browser.alarms.create('lfDb', {delayInMinutes: 10, periodInMinutes: 60})
// browser.alarms.create('dashboard-nudge', {delayInMinutes: 1, periodInMinutes: 10})

// browser.alarms.onAlarm.addListener(async (alarm) => {
//   if (alarm.name === 'lfdb') {
//     await instrumentation.sendDb();
//   } else if (alarm.name === 'dashboard-nudge') {
//     maybeDashboardNudge()
//   }
// })
