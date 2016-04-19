'use strict';

var exec = require('child_process').exec;

var call = require('./call');

var git;
if (exports) {
    git = exports;
} else {
    git = {};
}

git.init = (dir, callback) => {
    exec(`git init ${dir}`, (err) => {
        call(callback);
    });
};

git.add = (dir, add, callback) => {
    exec(`git add ${add}`, {cwd: dir}, (err) => {
        call(callback);
    });
};

git.commit = (dir, commitFile, callback) => {
    exec(`git commit --file ${commitFile}`, {cwd: dir}, (err) => {
        call(callback);
    });
};

// TODO: no named branch to just get list of branches
git.branch = (dir, name, callback) => {
    exec(`git branch ${name}`, {cwd: dir}, (err, stdout) => {
        call(callback, stdout);
    });
};

git.checkout = (dir, name, callback) => {
    exec(`git checkout ${name}`, {cwd: dir}, (err) => {
        call(callback);
    });
};

git.merge = (dir, name, callback) => {
    exec(`git merge ${name}`, {cwd: dir}, (err) => {
        call(callback);
    });
};

git.log = (dir, callback) => {
    exec(`git log`, {cwd: dir}, (err, stdout) => {
        call(callback, stdout);
    });
};

