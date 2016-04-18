
var fs = require('fs');
var path = require('path');

var git = require('./git');

var timeshift = exports;

var publishedTrees = (callback) => {
    fs.readFile('assets/timetrees.txt', 'utf-8', (err, data) => {
        if (err) {
            throw err;
        }
        callback(data.split('\n').filter((tree) => tree !== ''));
    });
};

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

timeshift.createTree = (tree) => {
    var assetPath = `assets/${tree}`;
    var treePath = `saveState/${tree}`;

    commitBranch(`${assetPath}/start`, treePath);
};

timeshift.createTrees = () => {
    publishedTrees((trees) => {
        trees.forEach((tree) => {
            timeshift.createTree(tree);
        });
    });
};

if (require.main === module) {
    timeshift.createTrees();
}

