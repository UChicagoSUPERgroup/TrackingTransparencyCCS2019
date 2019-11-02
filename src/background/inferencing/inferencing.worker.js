import Snowball from 'snowball'

import buildCategoryTree from './build';
import infer_tfidf from './infer';
import tt from '../../helpers';

// the keywords file is bundled using webpack as keywordsjson
// it must NOT have .json as an extension in the bundle because then it goes over a file size limit with mozilla

import word2IndexFile from 'file-loader?name=data/words2idx_dictjson!../../data/inferencing/words2idx_dictjson';
import keywordsFile from 'file-loader?name=data/keywordsjson!../../data/inferencing/keywordsjson';
import cutOneFile from 'file-loader?name=data/cut_one_dictjson!../../data/inferencing/cut_one_dictjson';

let databaseWorkerPort;

onmessage = function (m) {
  switch (m.data.type) {
    case 'database_worker_port':
      databaseWorkerPort = m.data.port;
      break;

    case 'content_script_to_inferencing':
      inferencingMessageListener(m.data.article, m.data.mainFrameReqId, m.data.tabId);
      break;
  }
};

const tree = buildCategoryTree(keywordsFile, word2IndexFile, cutOneFile);

function stem (text, all_words, words2idx_dict) {
  var stemmer = new Snowball('English');
  var cur_word = null;
  let tokens = [];
  for (let i = 0; i < text.length; i++) {
    stemmer.setCurrent(text[i]);
    stemmer.stem();
    cur_word = stemmer.getCurrent();
    if (all_words.has(cur_word)) {
      tokens.push(words2idx_dict[cur_word]);
    }
  }
  return [tokens, text.length];
}

async function inferencingMessageListener (text, mainFrameReqId, tabId) {
  let result_category = null;
  let conf_score = 0;
  const tr_struc = await tree;
  const tr = tr_struc[0];
  const word2idx = tr_struc[1];
  const allExistWords = tr_struc[2];
  const cutOneDict = tr_struc[3];

  text = text.toLowerCase();
  let stemmed = stem(text.split(' '), allExistWords, word2idx);
  text = stemmed[0];
  let totalLength = stemmed[1];

  const category = await infer_tfidf(text, tr, totalLength);
  result_category = cutOneDict[category[0].name];
  conf_score = category[1];

  console.log('Inference:', result_category);

  let inferenceInfo = {
    inference: result_category,
    inferenceCategory: '',
    threshold: conf_score,
    pageId: mainFrameReqId,
    tabId: tabId
  };

  // console.log("sending inference to database");
  databaseWorkerPort.postMessage({
    type: 'store_inference',
    info: inferenceInfo
  });

  postMessage({
    type: 'page_inference',
    info: inferenceInfo
  });
  // storeInference(inferenceInfo);
}
