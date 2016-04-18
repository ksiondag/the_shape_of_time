
var exec = require('child_process').exec;

var call = require('./call');

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

git.branch = (dir, name, callback) => {
    exec(`git branch ${name}`, {cwd: dir}, (err) => {
        call(callback);
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

