
var call = (callback) => {
    if (typeof(callback) === 'function') {
        callback.apply(null, Array.prototype.slice(arguments, 1));
    }
};

module.exports = call;

