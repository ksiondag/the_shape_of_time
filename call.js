'use strict';

var call = function (callback) {
    if (typeof(callback) === 'function') {
        callback.apply(null, Array.prototype.slice.call(arguments, 1));
    }
};

module.exports = call;

