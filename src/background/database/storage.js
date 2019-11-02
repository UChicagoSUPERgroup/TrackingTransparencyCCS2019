/** @module storage */

import tldjs from 'tldjs';

import {primaryDbPromise} from './setup';

/* DATA STORAGE */
/* ============ */

/**
 * stores new page visit
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.title - page's title
 * @param {string} info.domain - page's domain, which signifies unique website
 * @param {string} info.hostname - page's hostname, this is the part between // and /
 * @param {string} info.path - page's path
 * @param {string} info.protocol - page's protocol (e.g. http)
 */
export async function storePage (info) {
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');

  const page = pageItem.createRow({
    'id': info.pageId,
    'title': info.title,
    'domain': info.domain,
    'hostname': info.hostname,
    'path': info.path,
    'protocol': info.protocol
  });
  ttDb.insertOrReplace().into(pageItem).values([page]).exec();
}

/**
 * stores records of trackers for given page
 *
 * @param {Object} pageId - identifier for page that trackers come from
 * @param {Object[]} trackers - array of objects with information about each tracker
 */
export async function storeTrackerArray (pageId, trackers) {
  const ttDb = await primaryDbPromise;
  const trackerItem = ttDb.getSchema().table('Trackers');
  const rows = [];

  for (let tracker of trackers) {
    const row = trackerItem.createRow({
      'tracker': tracker,
      'pageId': pageId
    });
    rows.push(row);
  }
  // console.log(rows);
  ttDb.insertOrReplace().into(trackerItem).values(rows).exec();
}

/**
 * stores new inference
 *
 * @param {Object} info - info about the page
 * @param {Number} info.pageId - page's unique identifer
 * @param {string} info.inference - inference made
 * @param {string} info.inferenceCategory - unused
 * @param {Number} info.threshold - unused
 *
 */
export async function storeInference (info) {
  const ttDb = await primaryDbPromise;
  const inferenceItem = ttDb.getSchema().table('Inferences');

  const inference = inferenceItem.createRow({
    'inference': info.inference,
    'inferenceCategory': info.inferenceCategory,
    'threshold': info.threshold,
    'pageId': info.pageId
  });
  ttDb.insertOrReplace().into(inferenceItem).values([inference]).exec();
}

export async function importData (dataString) {
  const ttDb = await primaryDbPromise;
  const pageItem = ttDb.getSchema().table('Pages');
  const trackerItem = ttDb.getSchema().table('Trackers');
  const inferenceItem = ttDb.getSchema().table('Inferences');

  const data = JSON.parse(dataString);

  if (!data.pages || !data.trackers || !data.inferences) {
    // bad
    throw new Error('bad')
  }

  data.pages.forEach(page => {
    if (!page.hostname) {
      let domain = tldjs.getDomain(page.domain);
      domain = domain || page.domain; // in case above line returns null

      page.hostname = page.domain;
      page.domain = domain;
    }

    const pageData = pageItem.createRow({
      'id': page.id,
      'title': page.title,
      'domain': page.domain,
      'hostname': page.hostname,
      'path': page.path,
      'protocol': page.protocol
    });
    return ttDb.insertOrReplace().into(pageItem).values([pageData]).exec();
  })

  data.trackers.forEach(tracker => {
    const row = trackerItem.createRow({
      'tracker': tracker.tracker,
      'pageId': tracker.pageId
    });

    return ttDb.insertOrReplace().into(trackerItem).values([row]).exec();
  })

  data.inferences.forEach(inference => {
    const row = inferenceItem.createRow({
      'inference': inference.inference,
      'inferenceCategory': inference.inferenceCategory,
      'threshold': inference.threshold,
      'pageId': inference.pageId
    });

    return ttDb.insertOrReplace().into(inferenceItem).values([row]).exec();
  })
}
