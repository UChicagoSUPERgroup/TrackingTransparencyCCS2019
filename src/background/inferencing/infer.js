/*
 * Infer ad interest category given the webpage a user visits.
 */
import tt from '../../helpers';

function score_help (w, keywords, l, set_keywords) {
  if (set_keywords.has(w)) {
    var k = keywords.indexOf(w);
    k = (k + 1) / l;
    return 1 / k;
  } else {
    return 0;
  }
}

function scoreCategory (category, words, totalLength) {
  var keywords = category.keywords;
  var keywords_length = keywords.length;
  var match_set = new Set(keywords);

  var sum = 0;
  for (var i = 0; i < keywords_length; i++) {
    var score = score_help(words[i], keywords, keywords_length, match_set);
    sum += score;
  }
  return sum / totalLength;
}

/* find child category with highest score and return it with its score
 * if it has a higher score than the parent. If not, return null.
 */
function findBestChild (category, words, parentScore, totalLength) {
  var highestScore = 0;
  var bestChild, curScore, child;

  for (let i = 0; i < category.children.length; i++) {
    curScore = scoreCategory(category.children[i], words, totalLength);
    if (curScore > highestScore) {
      highestScore = curScore;
      bestChild = category.children[i];
    }

    // console.log("trying",category.children[i].name , "score", curScore);
  }

  if (highestScore >= parentScore + 0.0001) {
    return [bestChild, highestScore];
  } else {
    return null;
  }
}

/* recursively find best category given an array of words from given
 * Category tree.
 */
function findBestCategory (root, words, rootScore, totalLength) {
  var result, bestChild, bestChildScore;

  if (!root) {

  } else if (root.children === []) {
    return [root, rootScore];
  } else { // root exists and has children
    result = findBestChild(root, words, rootScore, totalLength);

    // if result is null, then that means parent has better score
    // than children
    if (!result) {
      return [root, rootScore];
    }
    bestChild = result[0];
    bestChildScore = result[1];
    // console.log("going with", bestChild.name, "score", bestChildScore);
    return findBestCategory(bestChild, words, bestChildScore, totalLength);
  }
}

export default function (text, tree, totalLength) {
  var tokens;
  tokens = text;
  const cat = (findBestCategory(tree, tokens, 0, totalLength));
  // console.log(cat);
  return cat;
}
