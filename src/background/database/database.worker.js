/** @module database_worker */

import { primaryDbPromise, primarySchemaBuilder } from './setup';
import makeQuery from './queries';
import * as store from './storage';

let trackersWorkerPort;
let inferencingWorkerPort;

onmessage = onMessage; // web worker

/* WEB WORKER MESSAGES */
/* =================== */
/**
 * message listener from another background script or another worker
 *
 * @param  {Object} m - message
 * @param {Object} m.data - content of message
 * @param {string} m.data.type - type of message (set by sender)
 */
async function onMessage (m) {
  // console.log(m);
  switch (m.data.type) {
    case 'ping':
    // console.log('database worker recieved ping');
      break;

    case 'database_query':
      handleQuery(m.data);
      break;

    case 'trackers_worker_port':
      trackersWorkerPort = m.data.port;
      trackersWorkerPort.onmessage = onMessage;
      break;
    case 'inferencing_worker_port':
      inferencingWorkerPort = m.data.port;
      inferencingWorkerPort.onmessage = onMessage;
      break;

    // STORAGE

    case 'store_page':
      store.storePage(m.data.info);
      break;
    case 'store_tracker_array':
      store.storeTrackerArray(m.data.pageId, m.data.trackers);
      break;
    case 'store_inference':
      store.storeInference(m.data.info);
      break;

    case 'import_data':
      store.importData(m.data.data);
      break;

    case 'empty_db':
      emptyDB();
      break;

    default:
      console.log('database worker recieved bad message');
  }
}
/**
 * makes sent query and sends reponse
 *
 * @param {Object} data - arguments from message pased in
 * @param  {Number} data.id  - query id (set by sender)
 * @param  {string} data.dst - query destination
 * @param  {string} data.query - query name
 * @param  {Object} data.args - query arguments
 */
async function handleQuery (data) {
  try {
    // console.log('database worker making query', data.query)
    const res = await makeQuery(data.query, data.args);
    // console.log('database worker query result', res)
    self.postMessage({
      type: 'database_query_response',
      id: data.id,
      response: res
    });
  } catch (error) {
    // console.log('database worker query error', error);
    self.postMessage({
      type: 'database_query_response',
      id: data.id,
      error: error.message
    });
  }
}

/**
 * erases all entries in database
 */
async function emptyDB () {
  const ttDb = await primaryDbPromise;
  const Inferences = primarySchemaBuilder.getSchema().table('Inferences');
  const Trackers = primarySchemaBuilder.getSchema().table('Trackers');
  const Pages = primarySchemaBuilder.getSchema().table('Pages');

  let emptyInferences = ttDb.delete().from(Inferences).exec();
  let emptyTrackers = ttDb.delete().from(Trackers).exec();
  let emptyPages = ttDb.delete().from(Pages).exec();
  await Promise.all([emptyInferences, emptyTrackers, emptyPages]);
}
