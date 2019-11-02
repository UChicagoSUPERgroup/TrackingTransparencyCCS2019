// import { queryDatabase } from './worker_manager';
// import { hasTrackerBlocker } from './adblockChecking'
// import loggingDefault from '../options/loggingDefault'

/// ///////// -- first set the uuid and the usage flag if they are not set
async function setUserParams () {
  /*
  // check if the value is set
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'false',
    userId: 'no more tears',
    mturkcode: 'no more tears',
    startTS: 0
  });
  // this is the time when the user installed the app
  if (userParams.startTS == 0) {
    let startTS = Date.now()
    await browser.storage.local.set({startTS: startTS})
    userParams.startTS = startTS;
  }
  // if usageStatCondition is not set then set it and store
  // usageStatCondition should be set in options/loggingDefault.js
  // if (userParams.usageStatCondition=='no more tears'){
  //  loggingDefault.setLoggingDefault();
  // let x = await browser.storage.local.set({usageStatCondition: sendUsage})
  // }
  // console.log(userParams);

  // if no mturk code then don't log stuff.
  if (userParams.mturkcode == 'no more tears') {
    // if there is no mturkid then do not log anything
    let x = await browser.storage.local.set({usageStatCondition: 'false'})
    // return
  } else {
    // mturkcode is set, so set other parameters
    let uid = userParams.mturkcode;
    userParams.userId = uid;
    userParams.usageStatCondition = loggingDefault.setLoggingDefault();
    // let uid=Math.random().toString(36).substring(2)
    //        +(new Date()).getTime().toString(36);
    // console.log(uid)
    let salt = Math.random().toString(36).substring(2) +
            (new Date()).getTime().toString(36);
    await browser.storage.local.set({userId: uid})
    await browser.storage.local.set({salt: salt})

    // send a beacon that the user initialized app and created userparams
    const blocker = await hasTrackerBlocker()
    const activityType = 'intialize logging'
    const timestamp = Date.now()
    const userId = uid
    const startTS = Date.now()
    const activityData = {
      hasTrackerBlocker: blocker
    }
    logData(activityType, timestamp, userId, startTS, activityData);

  }
  // if userId is not set, set it and store

  /* if (userParams.userId==='no more tears'){
    //uid = utilize both the random generator and time of install
    let uid=Math.random().toString(36).substring(2)
            +(new Date()).getTime().toString(36);
    //console.log(uid)
    await browser.storage.local.set({userId: uid})
    let salt=Math.random().toString(36).substring(2)
            +(new Date()).getTime().toString(36);
    await browser.storage.local.set({salt: salt})
    //return
  } */

  /* Now log the starting of the extension */
  /* userParams = await browser.storage.local.get({
    usageStatCondition: 'no monster',
    userId: 'no monster',
    startTS: 0
  }); */
  // console.log("in send pop data")
  // console.log(activityData)
  return true
}

async function getUserParams () {
  /*
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'no more tears',
    userId: 'no more tears',
    startTS: 0
  });
  */
  // console.log('User parameters: ', userParams.usageStatCondition, userParams.userId, userParams.startTS)
}

async function sha256 (message) {
  // encode as UTF-8
  const msgBuffer = new TextEncoder('utf-8').encode(message);

  // hash the message
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);

  // convert ArrayBuffer to Array
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  // convert bytes to hex string
  const hashHex = hashArray.map(b => ('00' + b.toString(16)).slice(-2)).join('');
  return hashHex;
}

// currently hash just returns normal data
async function hashit (data) {
  // now not hashing the trackers and interests
  return data
  // const hash = await sha256(String(data));
  // return hash
}

async function hashit_salt (data) {
  /*
  let salt = await browser.storage.local.get({salt: 'salt'});
  const hash = await sha256(String(data) + String(salt.salt));
  return hash;
  */
}

// now write function to send database
async function sendDb () {
  /*
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'no monster',
    userId: 'no monster',
    startTS: 0
  });
    // if usage condition is null just return
  if (!JSON.parse(userParams.usageStatCondition)) { return true }
  var allData = await queryDatabase('getInferencesDomainsToSend', {});
  // var allData = await queryDatabase('getInferences', {});

  for (var i = 0; i < allData.length; i++) {
    allData[i]['Pages']['domain'] = await hashit_salt(allData[i]['Pages']['domain']);
    allData[i]['Inferences']['inference'] = hashit(allData[i]['Inferences']['inference']);
    allData[i]['Trackers']['tracker'] = hashit(allData[i]['Trackers']['tracker']);
  }
  // console.log(allData)
  // for(const row of alldata){
  //  console.log(row)
  // }
  // var xs = cookie
  // let allData=""
  var data = new FormData();
  data.append('userId', userParams.userId);
  data.append('dumpTS', Date.now());
  data.append('startTS', userParams.startTS);
  data.append('version', EXT.VERSION); // global variable set by webpack
  data.append('dbname', 'getInferences');
  data.append('lfdb', JSON.stringify(allData));

  // console.log(allData)
  // data.append('filename',xs.value+'.'+Date.now())
  var xhr = new XMLHttpRequest();
  // send asnchronus request
  xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/lfdb.php', true);
  // xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(data);
  // return true
  */
}

// now write fucntion to send activity data to server

function logData (activityType, timestamp, userId, startTS, activityData) {
  /*
  var data = new FormData();
  data.append('activityType', activityType);
  data.append('timestamp', timestamp);
  data.append('userId', userId)
  data.append('startTS', startTS);
  data.append('version', EXT.VERSION); // global variable set by webpack
  data.append('activityData', JSON.stringify(activityData));
  // console.log('in logdata');
  // console.log(activityData)
  var xhr = new XMLHttpRequest();
  // send asnchronus request
  // console.log('sending req, ', activityType);
  xhr.open('post', 'https://super.cs.uchicago.edu/trackingtransparency/activitylog.php', true);
  // xhr.setRequestHeader("Content-Type", "application/json")
  xhr.send(data);
  */
}

/// function to detect if the window/tabs are closed

async function logLeave (tabId, removeInfo) {
  /*
  // console.log('In the log leave page ', tabId, removeInfo);
  // logData('hehe', 0, 0, 0, {});
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'no monster',
    userId: 'no monster',
    startTS: 0
  });
  let x = 'clickData_tabId_' + String(tabId);
  let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain': '', 'tabId': -1, 'pageId': '', 'numTrackers': 0})});
  tabData = JSON.parse(tabData[x]);
  if (tabData.tabId == -1) return true
  // console.log('logLeave', JSON.stringify(tabData));
  if (JSON.parse(userParams.usageStatCondition)) { // get data when the user load the page.
    let activityType = 'close dashboard page';
    let timestamp = Date.now();
    let userId = userParams.userId;
    let startTS = userParams.startTS;
    let activityData = {
      'tabId': tabId,
      'parentTabId': tabData['tabId'],
      'parentDomain': tabData['domain'],
      'parentPageId': tabData['pageId'],
      'parentNumTrackers': tabData['numTrackers']
    }
    logData(activityType, timestamp, userId, startTS, activityData);
  }
  await browser.storage.local.remove([x]);
  */
}

async function firstInstall () {
  // code to set user params once during the installation
  // let sendUsage=true; //flag to send the usage data
  // the usage flag in the userstudy.js named as usageStatCondition
  // console.log('Now at first install');
  // await setUserParams();

  // just send the db once when installed, it would be mostly empty
  // await sendDb();
}

function setup () {
  /** *********** Detecting if tab or window is closed ************/
  // browser.tabs.onRemoved.addListener(logLeave)

  // for running in debugger and in external functions
  window.sendDb = sendDb;
  window.setUserParams = setUserParams;
  window.logData = logData;
  window.getUserParams = getUserParams;
}
window.hashit = hashit
window.hashit_salt = hashit_salt

export default {firstInstall, setup, hashit, hashit_salt, sendDb}
