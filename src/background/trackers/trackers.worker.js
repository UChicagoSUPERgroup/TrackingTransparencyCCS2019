/** @module trackers_worker */

import tldjs from 'tldjs';

import domainEntityMap from '../../data/trackers/domainEntityMap.json';

// console.log("trackers worker running");
let databaseWorkerPort;

let trackersByPageId = {};

/**
 * determines if a web request was for a tracker
 *
 * @param  {Object} details - request object
 * @param {string} firstPartyHost - domain of page that originated request
 * @returns {string} domain of tracker, if request is known tracker domain
 */
function trackerMatch (details, firstPartyHost) {
  const urlObj = new URL(details.url);
  const requestDomain = urlObj.hostname;
  const requestDomain2 = tldjs.getDomain(urlObj.hostname);
  const firstPartyEntity = domainEntityMap[firstPartyHost];
  const trackerEntity = domainEntityMap[requestDomain];
  const trackerEntity2 = domainEntityMap[requestDomain2];

  if (!trackerEntity && !trackerEntity2) {
    // not a tracker at all
    return null;
  }

  if (firstPartyEntity &&
      ((requestDomain === firstPartyHost) ||
       (requestDomain2 === firstPartyHost) ||
       (trackerEntity === firstPartyEntity) ||
       (trackerEntity2 === firstPartyEntity))
  ) {
    // tracker is from the same first party as domain
    return null;
  }

  // we got a match on non-tldjs domain
  if (trackerEntity) {
    return {
      domain: requestDomain,
      name: trackerEntity
    }
  }

  // we got a match on tldjs domain
  if (trackerEntity2) {
    return {
      domain: requestDomain2,
      name: trackerEntity2
    }
  }
}

/**
 * called when page is changed, recieves tabData from background script, processes webrequests to find trackers and sends to database
 *
 * @param  {number} oldPageId
 * @param  {string[]} trackers
 */
async function onPageChanged (oldPageId, trackers) {
  databaseWorkerPort.postMessage({
    type: 'store_tracker_array',
    pageId: oldPageId,
    trackers: trackers
  });
}

function processWebRequests (pageId, firstPartyHost, webRequests) {
  if (!trackersByPageId[pageId]) {
    trackersByPageId[pageId] = new Set();
  }

  for (;;) {
    const req = webRequests.pop();
    if (!req) break;

    const match = trackerMatch(req, firstPartyHost);
    if (match) {
      trackersByPageId[pageId].add(match.name);
    }
  }

  return Array.from(trackersByPageId[pageId]);
}

/**
 * function to run when message is received from background script
 *
 * @param {Object} m - web worker message object
 * @param {Object} m.data - data passed in by sender
 */
onmessage = function (m) {
  let trackers = [];

  switch (m.data.type) {
    case 'database_worker_port':
      databaseWorkerPort = m.data.port;
      break;

    case 'page_changed':
      trackers = processWebRequests(m.data.oldPageId, m.data.firstPartyHost, m.data.webRequests);
      onPageChanged(m.data.oldPageId, trackers);
      break;

    case 'push_webrequests':
      trackers = processWebRequests(m.data.pageId, m.data.firstPartyHost, m.data.webRequests);
      self.postMessage({
        id: m.data.id,
        type: 'trackers',
        pageId: m.data.pageId,
        trackers: trackers
      });
      break;
  }
};
