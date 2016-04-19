'use strict';

var fs = require('fs');
var path = require('path');

var git = require('./git');

var timeshift = exports;

var readState = (path, callback) => {
    fs.readFile(`${path}/state.json`, 'utf-8', (err, data) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, JSON.parse(data));
    });
};

var commitChildren = (parentBranch, treePath, callback) => {
    var parent = path.basename(parentBranch);

    return () => {
        fs.readdir(parentBranch, (err, dirs) => {
            if (err) {
                return;
            }
            dirs.forEach((dir) => {
                callback = (() => {
                    var nest = callback;
                    return () => {
                        commitBranch(
                            `${parentBranch}/${dir}`,
                            treePath,
                            () => {
                                git.checkout(treePath, parent, nest);
                            }
                        );
                    };
                })();
            });
            callback();
        });
    };
};

var addItem = (treePath, item, state, callback) => {
    fs.writeFile(`${treePath}/${item}`, state, (err) => {
        if (err) {
            throw err;
        }

        git.add(treePath, item, callback);
    });
};

var commitBranch = (branchPath, treePath, callback) => {
    git.init(treePath, () => {
        readState(branchPath, (err, state) => {
            var item, count, name, commit;

            if (err) {
                if (callback) {
                    callback();
                }
                return;
            }

            name = path.basename(branchPath);

            commit = () => {
                git.commit(
                    treePath,
                    path.resolve(`${branchPath}/log.txt`),
                    commitChildren(branchPath, treePath, callback)
                );
            };


            count = 0;
            for (item in state) {
                if (!state.hasOwnProperty(item)) {
                    continue;
                }
                count += 1;
            }
            for (item in state) {
                if (!state.hasOwnProperty(item)) {
                    continue;
                }
                addItem(treePath, item, state[item], () => {
                    count -= 1;

                    if (count !== 0) {
                        return;
                    }

                    if (name !== 'child') {
                        git.checkout(treePath, `-b ${name}`, commit);
                    } else {
                        commit();
                    }
                });
            }
        });
    });
};

timeshift.createTree = (tree, callback) => {
    var assetPath = `assets/${tree}`;
    var treePath = `saveState/${tree}`;

    commitBranch(`${assetPath}/start`, treePath, callback);
};

var treeDir = (tree) => {
    return `saveState/${tree}`;
};

timeshift.history = (tree, callback) => {
    // TODO: function that constructs directory
    var dir = treeDir(tree);

    git.log(dir, callback);
};

timeshift.moments = (tree, callback) => {
    var dir = treeDir(tree);

    git.branch(dir, '', callback);
};

timeshift.warp = (tree, target, callback) => {
    var dir = treeDir(tree);

    git.checkout(dir, target, callback);
};

timeshift.merge = (tree, target, callback) => {
    var dir = treeDir(tree);

    git.merge(dir, target, callback);
};

var assetDir = (tree) => {
    return `assets/${tree}`;
};

var getState = (tree, callback) => {
    var dir = treeDir(tree);

    fs.readdir(dir, (err, files) => {
        var count = 0;
        var state = {};
        if (err) {
            throw err;
        }
        files.forEach((file) => {
            fs.readFile(`${dir}/${file}`, 'utf-8', (err, data) => {
                if (!err) {
                    state[file] = data.trim();
                }
                count += 1;

                if (count === files.length) {
                    callback(state);
                }
            });
        });
    });
};

timeshift.checkWin = (tree, callback) => {
    var dir = assetDir(tree);

    fs.readFile(`${dir}/winCondition.json`, 'utf-8', (err, data) => {
        var winningState;
        if (err) {
            throw err;
        }
        winningState = JSON.parse(data);

        getState(tree, (state) => {
            var item;
            for (item in winningState) {
                if (winningState.hasOwnProperty(item)) {
                    if (winningState[item] !== state[item]) {
                        callback(false);
                        return
                    }
                }
            }
            callback(true);
        });
    });
};

