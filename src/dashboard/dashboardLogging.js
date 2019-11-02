async function logLoad (activityType, sendDict) {
  // console.log('In the log load page')
  const background = await browser.runtime.getBackgroundPage();
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  let parentTabId = tabs[0].openerTabId;
  let tabId = tabs[0].id;
  let x = 'clickData_tabId_' + String(tabId);
  let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain': '', 'tabId': tabId, 'pageId': '', 'numTrackers': 0})});
  tabData = JSON.parse(tabData[x]);

  // console.log('About page', tabId, tabData);
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'false',
    userId: 'no monster',
    startTS: 0
  });

  if (JSON.parse(userParams.usageStatCondition)) { // get data when the user load the page.
    // let activityType='load dashboard about page';
    let timestamp = Date.now();
    let userId = userParams.userId;
    let startTS = userParams.startTS;
    let activityData = {
      'tabId': tabId,
      'parentTabId': parentTabId,
      'parentDomain': tabData.domain,
      'parentPageId': tabData.pageId,
      'parentNumTrackers': tabData.numTrackers
    }
    for (let key in sendDict) {
      if (key == 'tracker_clicked') {
        sendDict[key] = await background.hashit(sendDict[key])
      }
      activityData[key] = sendDict[key]
    }
    background.logData(activityType, timestamp, userId, startTS, activityData);
  }
}

async function logSunburstSelect (select, value) {
  const background = await browser.runtime.getBackgroundPage();
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'false',
    userId: 'no monster',
    startTS: 0
  });
  if (!JSON.parse(userParams.usageStatCondition)) return true;

  let activityType = ''
  let extraData = {}
  if (select) {
    // console.log('SUNBURST LOGSELECT 1', select, value);
    activityType = 'select sunburst chart area'
    if (value) {
      let selectedSunburstTopic = await background.hashit(value);
      extraData = {'selectedSunburstTopic': selectedSunburstTopic};
    }
  } else {
    // console.log('SUNBURST LOGSELECT 2', select, value);
    activityType = 'unselect sunburst chart area'
    if (value) {
      let selectedSunburstTopic = await background.hashit(value);
      extraData = {'unselectedSunburstTopic': selectedSunburstTopic};
    }
  }
  if (activityType != '') {
    const tabs = await browser.tabs.query({active: true, currentWindow: true});
    let parentTabId = tabs[0].openerTabId;
    let tabId = tabs[0].id;

    let x = 'clickData_tabId_' + String(tabId);
    let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain': '', 'tabId': tabId, 'pageId': '', 'numTrackers': 0})});
    // console.log('logLeave', tabData);
    tabData = JSON.parse(tabData[x]);

    let timestamp = Date.now();
    let userId = userParams.userId;
    let startTS = userParams.startTS;
    let activityData = {
      'tabId': tabId,
      'parentTabId': parentTabId,
      'parentDomain': tabData.domain,
      'parentPageId': tabData.pageId,
      'parentNumTrackers': tabData.numTrackers,
      'extraData': JSON.stringify(extraData)
    }
    // console.log('SUNBURST LOGSELECT tosend', select, value);
    background.logData(activityType, timestamp, userId, startTS, activityData);
  }
}

async function logPopupActions (activityType, clickedElem) {
  // console.log('I am here 1');
  const background = await browser.runtime.getBackgroundPage();
  background.sendDb();
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  let tabId = tabs[0].id;
  const tabData = await background.getTabData(tabId);
  // console.log(tabData);
  let domain = '';
  let pageId = '';
  let numTrackers = 0;
  if (tabData) {
    // console.log('Here I am monster popup', tabData.pageId, tabData.domain, tabData.trackers.length);
    domain = await background.hashit_salt(tabData.domain);
    pageId = tabData.pageId;
    numTrackers = tabData.trackers.length;
  }
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'false',
    userId: 'no monster',
    startTS: 0
  });

  if (JSON.parse(userParams.usageStatCondition)) { // get data when the user click on the button.
    let timestamp = Date.now()
    let userId = userParams.userId
    let startTS = userParams.startTS
    let activityData = {
      'clickedElem': clickedElem,
      'domain': domain,
      'tabId': tabId,
      'pageId': pageId,
      'numTrackers': numTrackers
    }
    background.logData(activityType, timestamp, userId, startTS, activityData)
  }
}

async function logStartDashboardPage () {
  // console.log('In the log load page')
  const background = await browser.runtime.getBackgroundPage();
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'false',
    userId: 'no monster',
    startTS: 0
  });
  const tabs = await browser.tabs.query({active: true, currentWindow: true});
  // console.log(tabs[0]);
  let parentTabId = tabs[0].openerTabId;
  let tabId = tabs[0].id;
  const tabData_1 = await background.getTabData(parentTabId);
  let domain = '';
  let pageId = '';
  let numTrackers = 0;
  if (tabData_1) {
    // console.log('I am in dashboard ', tabData, tabData.pageId);
    // console.log('Here I am monster', tabData.pageId, tabData.domain);
    domain = await background.hashit_salt(tabData_1.domain);
    pageId = tabData_1.pageId;
    numTrackers = tabData_1.trackers.length;
  }
  let tabData = {
    'domain': domain,
    'tabId': parentTabId,
    'pageId': pageId,
    'numTrackers': numTrackers
  }
  let x = 'clickData_tabId_' + String(parentTabId);
  let y = 'clickData_tabId_' + String(tabId);
  await browser.storage.local.set({[y]: JSON.stringify(tabData)});
  // console.log('In the log load page ', tabId);
  // let tabData = await browser.storage.local.get({[x]: JSON.stringify({'domain':'','tabId':tabId,'pageId':'','numTrackers':0})});
  // await browser.storage.local.set({[y]: JSON.stringify(tabData[x])});
  await browser.storage.local.remove([x]);
  // tabData = JSON.parse(tabData[x]);
  // this.setState({tabId: tabId});
  // this.setState({parentTabId: parentTabId});

  if (JSON.parse(userParams.usageStatCondition)) { // get data when the user load the page.
    let activityType = 'load dashboard home page';
    let timestamp = Date.now();
    let userId = userParams.userId;
    let startTS = userParams.startTS;
    let activityData = {
      'tabId': tabId,
      'parentTabId': parentTabId,
      'parentDomain': tabData.domain,
      'parentPageId': tabData.pageId,
      'parentNumTrackers': tabData.numTrackers
    }
    background.logData(activityType, timestamp, userId, startTS, activityData);
  }
}

async function logDashboardClick (e) {
  // console.log(e);
  const background = await browser.runtime.getBackgroundPage();
  let userParams = await browser.storage.local.get({
    usageStatCondition: 'false',
    userId: 'no monster',
    startTS: 0
  });
  if (!JSON.parse(userParams.usageStatCondition)) return true;

  let activityType = ''
  let extraData = {}
  /** ****** navbar click ********/
  // log navbar toggle activity
  if (e.target.localName == 'button' && e.target.className.includes('navbar-toggle')) {
    activityType = 'click on navbar toggle button'
  }
  // log navbar click activity
  if (e.target.localName == 'a' && e.target.parentNode.className.includes('navbarTolog')) {
    activityType = 'click on navbar link'
    extraData = {'navbarTolog_Clicked_text': e.target.text, 'navbarTolog_Clicked_element': e.target.hash}
  }
  /** ****** trackers section click ********/

  // log click on trackers page links
  if (e.target.localName == 'a' && e.target.className.includes('trackerTableLinkTrackersPage')) {
    activityType = 'click on tracker link on Trackers dashboard page'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit(linkClicked);
    extraData = {'trackerTableLinkTrackersPage_Clicked': linkClicked}
  }
  // log click on domains table for a particular tracker
  if (e.target.localName == 'a' && e.target.className.includes('domainTableLinkTrackersPage')) {
    activityType = 'click on domain link for a tracker on Trackers dashboard page'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit_salt(linkClicked);
    extraData = {'domainTableLinkTrackersPage_Clicked': linkClicked}
  }
  // log click on inferences table for a particular tracker
  if (e.target.localName == 'a' && e.target.className.includes('inferenceTableLinkTrackersPage')) {
    activityType = 'click on inference link for a tracker on Trackers dashboard page'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit(linkClicked);
    extraData = {'inferenceTableLinkTrackersPage_Clicked': linkClicked}
  }

  /** ****** Inferences section click ********/

  // log click on domains table for a particular inference
  if (e.target.localName == 'a' && e.target.className.includes('inferencePageTopTextInferenceLink')) {
    activityType = 'click on Interest link on Interests dashboard page top text'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit(linkClicked);
    extraData = {'inferencePageTopTextInferenceLink_Clicked': linkClicked}
  }

  if (e.target.localName == 'label' && e.target.className.includes('inferencePageDateChoose')) {
    activityType = 'click on date picker button on Interests dashboard page'
    let linkClicked = e.target.innerText;
    // linkClicked = await background.hashit(linkClicked);
    extraData = {'inferencePageDateChoose_Chosen': linkClicked}
  }

  if (e.target.localName == 'label' && e.target.className.includes('inferencePageSensitivityChoose')) {
    activityType = 'click on sensitivity picker button on Interests dashboard paget'
    let linkClicked = e.target.innerText;
    // linkClicked = await background.hashit(linkClicked);
    extraData = {'inferencePageSensitivityChoose_Chosen': linkClicked}
  }

  if (e.target.localName == 'a' && e.target.className.includes('inferencePageSelected-Inference')) {
    activityType = 'click on inference link for selected Interests on Interests dashboard page '
    let linkClicked = e.target.text;
    linkClicked = await background.hashit(linkClicked);
    extraData = {'inferencePageSelected-Inference_Clicked': linkClicked}
  }

  if (e.target.localName == 'a' && e.target.className.includes('domainTableLinkInferencesPage')) {
    activityType = 'click on domain link for an interest on Interests dashboard page'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit_salt(linkClicked);
    extraData = {'domainTableLinkInferencesPage_Clicked': linkClicked}
  }

  if (e.target.localName == 'label' && e.target.className.includes('pagesTimeChart-grouping-selector')) {
    activityType = 'select time groups for grouping selector on pagesTimeChart'
    let linkClicked = e.target.innerText;
    // linkClicked = await background.hashit_salt(linkClicked);
    extraData = {'pagesTimeChart-grouping-selector_chosen': linkClicked}
  }

  // log click on trackers table for a particular inference
  if (e.target.localName == 'a' && e.target.className.includes('trackerTableLinkInferencesPage')) {
    activityType = 'click on tracker link for an Interest on Interests dashboard page'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit(linkClicked);
    extraData = {'trackerTableLinkInferencesPage_Clicked': linkClicked}
  }

  /** ****** domains section click ********/

  // log click on domains table in the domains (Sites) section of the dashbord page
  if (e.target.localName == 'a' && e.target.className.includes('domainsTableLinkDomainsPage')) {
    activityType = 'click on domain link from the list of domains on Domains dashboard page'
    let linkClicked = e.target.text;
    linkClicked = await background.hashit_salt(linkClicked);
    extraData = {'domainsTableLinkDomainsPage_Clicked': linkClicked}
  }

  if (activityType) {
    let sendDict = {'extraData': JSON.stringify(extraData)}
    logLoad(activityType, sendDict)
  }
}

// define functions to be exported here
export default {
  logLoad: logLoad,
  logSunburstSelect: logSunburstSelect,
  logPopupActions: logPopupActions,
  logStartDashboardPage: logStartDashboardPage,
  logDashboardClick: logDashboardClick
}
