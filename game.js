
var fs = require('fs');

var timeshift = require('./timeshift');

var game = exports;

var over = false;

game.prompt = (callback) => {
    callback(
`  Enter help for more information: `
    );
};

game.helpPrompt = (callback) => {
    callback(
`
  You have retained some amount of self. What that means in this state is
  uncertain, to be sure. Exploration will be necessary. Here are the known
  commands available to you:`
    );
};

game.publishedTrees = (callback) => {
    fs.readFile('assets/timetrees.txt', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        callback(data.split('\n').filter((tree) => tree !== ''));
    });
};

var createTrees = (callback) => {
    game.publishedTrees((trees) => {
        var count = 0;
        trees.forEach((tree) => {
            timeshift.createTree(tree, () => {
                count += 1;
                if (count === trees.length) {
                    callback();
                }
            });
        });
    });
};

var currentTree;

var saveTree = (callback) => {
    fs.writeFile('saveState/currentTree.txt', `${currentTree}\n`, (err) => {
        if (err) {
            throw err;
        }
        callback();
    });
};
var getCurrentTree = (callback) => {
    if (currentTree) {
        callback(currentTree);
        return;
    }
    fs.readFile('saveState/currentTree.txt', 'utf-8', (err, data) => {
        if (!err) {
            currentTree = data.trim();
            callback(currentTree);
            return;
        }
        game.publishedTrees((trees) => {
            createTrees(()=> {
                currentTree = trees[0];
                saveTree(() => {
                    callback(currentTree);
                });
            });
        });
    });
};

game.history = (callback) => {
    getCurrentTree((tree) => {
        timeshift.history(tree, callback);
    });
};

game.moments = (callback) => {
    getCurrentTree((tree) => {
        timeshift.moments(tree, callback);
    });
};

game.warp = (target, callback) => {
    getCurrentTree((tree) => {
        timeshift.warp(tree, target, callback);
    });
};

game.merge = (target, callback) => {
    getCurrentTree((tree) => {
        timeshift.merge(tree, target, callback);
    });
};

game.quit = (callback) => {
    over = true;
    callback('  Quitting....');
};

game.over = () => {
    return over;
};

var nextLevel = (callback) => {
    game.publishedTrees((trees) => {
        getCurrentTree((tree) => {
            var index = trees.indexOf(tree) + 1;
            if (index === trees.length) {
                game.quit(() => {
                    callback('  Game won!');
                });
                return;
            }
            currentTree = trees[index];
            saveTree(callback);
        });
    });
};

game.update = (callback) => {
    // Check win condition
    getCurrentTree((tree) => {
        timeshift.checkWin(tree, (winning) => {
            if (winning) {
                nextLevel((output) => {
                    if (!output) {
                        output = `  Level beat, going to next level.`;
                    }
                    callback(output);
                });
                return;
            }
            callback();
        });
    });
};

