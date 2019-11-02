/*
 * process category list to create special tree json
 *
 * TODO: port this over to python and add to interests.ipynb
 */
var fs = require('fs');
fs.readFile('./categories_2017-08-28.txt', function (err, data) {
  if (err) {
    throw err;
  }

  let tree = {
    name: 'Categories',
    children: []
  }

  const categories = data.toString().split('\n');

  for (cat of categories) {
    const arr = cat.split('>');

    let latestChild = tree;

    arr.reverse();
    while (elem = arr.pop()) {
      latestChild = childrenInsert(latestChild, elem);
    }
  }

  fs.writeFile('../src/data/categories_tree.json', JSON.stringify(tree, null, '\t'), function (err) {
    if (err) {
      return console.log(err);
    }

    console.log('Tree file was saved!');
  })
});

function childrenInsert (root, newChild) {
  // we have to push all categories to the leaves of the tree
  // this creates duplicates but that's ok
  if (!root.children) {
    // root.children = [{
    //     name: root.name
    //     // children: []
    // }];
    root.children = [];
  }

  const find = root.children.find(elem => {
    return (elem.name === newChild);
  });
  if (find) return find;

  root.children.push({
    name: newChild
    // children: [],
    // size: 1000
  });

  return root.children[root.children.length - 1];
}
