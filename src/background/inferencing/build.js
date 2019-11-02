import tt from '../../helpers';

/*
 * Build tree from given JSON file listing nodes with keywords.
 */

class Category {
  constructor (name, keywords = [], children = []) {
    this.name = name;
    this.keywords = keywords;
    this.children = children;
  }
}

/*
  Find given category in given tree and add a child to the
  found node. Assumes category exists and is unique.
*/

function findAndAddChild (name, child, tree) {
  if (tree === undefined) {

  } else if (tree.name === name) {
    tree.children.push(child);
  } else {
    for (let i = 0; i < tree.children.length; i++) {
      findAndAddChild(name, child, tree.children[i]);
    }
  }
}

export default async function (in_file, word2IndexFile, cutOneFile) {
  var file = await tt.readTextFile(in_file);
  var obj = tt.deserialize(file);

  // initalize tree with just the root
  var tree = new Category('Root');

  for (let i = 0; i < obj.length; i++) {
    let raw_name = obj[i].category.trim();
    let cats = raw_name.split('>');
    let cat;
    let child;

    if (cats.length === 1) {
      cat = 'Root';
    } else {
      cat = cats[cats.length - 2];
    }

    child = new Category(cats[cats.length - 1], obj[i].keywords);

    findAndAddChild(cat, child, tree);
  }

  var word2idx_raw = await tt.readTextFile(word2IndexFile);
  var word2idx = JSON.parse(word2idx_raw);
  var allExistWords = new Set(Object.keys(word2idx));

  var cut_one_raw = await tt.readTextFile(cutOneFile);
  var cut_one_dict = JSON.parse(cut_one_raw);

  return [tree, word2idx, allExistWords, cut_one_dict];
}
