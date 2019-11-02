import TrackersWorker from './trackers/trackers.worker.js'
import DatabaseWorker from './database/database.worker.js'
import InferencingWorker from './inferencing/inferencing.worker.js'

/* WORKER SETUP */
export const trackersWorker = new TrackersWorker();
export const databaseWorker = new DatabaseWorker();
export const inferencingWorker = new InferencingWorker();

/* connect database worker and trackers worker */
/* this involves creating a MessageChannel and passing a message with
 * the channel to each worker */
const trackerDatabaseChannel = new MessageChannel();
trackersWorker.postMessage({type: 'database_worker_port', port: trackerDatabaseChannel.port1}, [trackerDatabaseChannel.port1]);
databaseWorker.postMessage({type: 'trackers_worker_port', port: trackerDatabaseChannel.port2}, [trackerDatabaseChannel.port2]);

/* connect database worker and inferencing worker */
const inferencingDatabaseChannel = new MessageChannel();
inferencingWorker.postMessage({type: 'database_worker_port', port: inferencingDatabaseChannel.port1}, [inferencingDatabaseChannel.port1]);
databaseWorker.postMessage({type: 'inferencing_worker_port', port: inferencingDatabaseChannel.port2}, [inferencingDatabaseChannel.port2]);

/* DATABASE WORKER */
databaseWorker.onmessage = onDatabaseWorkerMessage;
window.queryDatabase = queryDatabase;
window.queryDatabaseRecursive = queryDatabaseRecursive;

/**
 * Run on message recieved from database worker.
 *
 * @param  {Object} m
 * @param  {Object} m.data - Content of the message
 */
function onDatabaseWorkerMessage (m) {
  // console.log('Message received from database worker', m);

  if (m.data.type === 'database_query_response') {
    let p;
    if (m.data.id) {
      p = pendingDatabaseQueries[m.data.id];
    }
    if (m.data.error) {
      // database gave us an error
      // so we reject query promise
      if (p) {
        p.reject(m.data.error);
      } else {
        throw new Error(m.data.error);
      }
      return;
    }

    if (!p) {
      throw new Error('Unable to resolve promise for database query response. Message was', m);
    }
    p.resolve(m.data);
  }
}

let queryId = 1; // if it is 0 then the first query fails
let pendingDatabaseQueries = {};

/**
 * Sends database query message to database worker, waits for response, returns result.
 *
 * @param  {string} query - name of query
 * @param  {Object} args - arguments object passed to database worker
 * @return {Object} database query response
 */
export async function queryDatabase (query, args) {
  let queryPromise = new Promise((resolve, reject) => {
    pendingDatabaseQueries[queryId] = {resolve: resolve, reject: reject};
  });

  databaseWorker.postMessage({
    type: 'database_query',
    id: queryId,
    query: query,
    args: args
  });
  queryId++;

  try {
    let res = await queryPromise;
    return res.response;
  } catch (e) {
    throw new Error(e);
  }
}

/**
 * Makes database query recusively for all children of given inference in category tree, concatenating result
 *
 * @param  {string} query - name of query
 * @param  {Object} args - arguments object passed to database worker
 * @param  {string} args.inference - inference
 * @return {Object} database query response
 */
export async function queryDatabaseRecursive (query, args) {
  if (!args.inference) {
    return queryDatabase(query, args);
  }
  if (!query.endsWith('byInference')) {
    console.warn('Making a recursive query with a query that is not inference-specific. There may be unexpected results.');
  }

  args.count = null; // if we limit count for individual queries things get messed up

  const categoryTree = (await import(/* webpackChunkName: "data/categoryTree" */'../data/categories_tree.json')).default
  const treeElem = findChildren(args.inference, categoryTree);
  console.log(treeElem);
  if (!treeElem) return false;
  let children = collapseChildren(treeElem);
  children.push(args.inference);
  console.log(children);

  let queries = [];
  for (let c of children) {
    let cargs = Object.assign({}, args);
    cargs.inference = c;
    const q = queryDatabase(query, cargs); // this is a PROMISE
    queries.push(q);
  }

  const results = await Promise.all(queries);

  let mergedRes;
  let tempObj;
  switch (query) {
    case 'getTrackersByInference':
      tempObj = {};
      for (let res of results) {
        for (let tracker of res) {
          const tn = tracker.name
          const tc = tracker.count
          if (tempObj[tn]) {
            tempObj[tn] += tc
          } else {
            tempObj[tn] = tc;
          }
        }
      }
      mergedRes = Object.keys(tempObj).map(key => ({name: key, count: tempObj[key]}));
      mergedRes.sort((a, b) => (b.count - a.count));
      break;
    case 'getDomainsByInference':
      tempObj = {};
      for (let res of results) {
        for (let domain of res) {
          const tn = domain.name
          const tc = domain.count
          if (tempObj[tn]) {
            tempObj[tn] += tc
          } else {
            tempObj[tn] = tc
          }
        }
      }
      mergedRes = Object.keys(tempObj).map(key => ({name: key, count: tempObj[key]}));
      mergedRes.sort((a, b) => (b.count - a.count));
      break;
    case 'getPagesByInference':
      mergedRes = Array.prototype.concat.apply([], results);
      break;
    default:
      console.warn('Not sure how to put together separate queries. Results may be unexpected.')
      mergedRes = Array.prototype.concat.apply([], results);
  }

  return mergedRes;
}

/**
 * given a category name in the Google ad-interest categories, and an object for the entire tree,
 * returns a list with all child subtrees
 *
 * helper for queryDatabaseRecursive
 *
 * @param  {string} cat
 * @param  {Object} root
 * @returns {Object[]} branches of tree for each child
 *
 */
function findChildren (cat, root) {
  for (let c of root.children) {
    if (c.name === cat) {
      return c.children ? c.children : [];
    } else if (c.children) {
      let rec = findChildren(cat, c);
      if (rec) {
        return rec;
      }
    }
  }
  return false;
}

/**
 * given a list of subtrees, returns a flattened list of node names
 *
 * helper for queryDatabaseRecursive
 *
 * @param  {Object[]} children - subtrees of category tree
 * @returns {string[]} - list of nodes in all subtrees input
 */
function collapseChildren (children) {
  let ret = [];
  for (let c of children) {
    ret.push(c.name);
    if (c.children) {
      ret = ret.concat(collapseChildren(c.children))
    }
  }
  return ret;
}
