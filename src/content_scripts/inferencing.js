
/* INFERENCING */

export default function makeInference () {
  // extract text from page (see below)
  const text = extractTextFromNode(document.body);
  // console.log(text);

  if (!text || text.length === 0) {
    console.warn('unable to extract text from page');
    return;
  }

  // send page text back to background script
  browser.runtime.sendMessage({ type: 'parsed_page', article: text });
}

function extractTextFromNode (node) {
  // node.tagName is in ALL CAPS
  if (node.tagName === 'FOOTER' || node.tagName === 'SCRIPT') {
    return '';
  }

  let res = node.innerText;
  for (let child of node.children) {
    res += (' ' + extractTextFromNode(child));
  }
  return res;
}
