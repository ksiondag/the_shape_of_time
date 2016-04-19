'use strict';

var game = require('./game');

var controls = exports;

var commands = {};

// TODO: slowly reveal available commands via game logic
var helpOrder = [
];

var commandConstructor = (name, helpText, func) => {
    func.help = helpText;
    commands[name] = func;
    helpOrder.push(name);
}


commandConstructor(
'help',
`Print this help message`,
(callback) => {
    game.helpPrompt((help) => {
        helpOrder.forEach((command) => {
            help += `\n    ${command}: ${commands[command].help}`;
        });
        callback(help);
    });
}
);

commandConstructor(
'history',
`Review the history from this point in time`,
(callback) => {
    game.history(callback);
}
);

commandConstructor(
'moments',
`Reveal the possible moments in this time tree`,
(callback) => {
    game.moments(callback);
}
);

commandConstructor(
'warp',
`Warp to given reality`,
(callback, words) => {
    var target;
    if (words.length === 0) {
        callback(`  Warp needs a target`);
        return;
    }
    if (words.length > 1) {
        callback(`  Warp can only have one target`);
        return;
    }
    target = words[0];
    game.warp(target, callback);
}
);

commandConstructor(
'merge',
`Merge with given reality`,
(callback, words) => {
    var target;
    if (words.length === 0) {
        callback(`  Merge needs a target`);
        return;
    }
    if (words.length > 1) {
        callback(`  Merge can only have one target`);
        return;
    }
    target = words[0];
    game.merge(target, callback);
}
);

commandConstructor(
'quit',
`Exit the game`,
(callback) => {
    game.quit(callback);
}
);

controls.parse = (input, callback) => {
    var words = input.split(' ');

    if (words.length === 0) {
        setTimeout(callback, 100);
        return;
    }

    if (commands.hasOwnProperty(words[0])) {
        commands[words[0]](callback, words.slice(1));
    } else {
        callback(`  ${words[0]} is not a recognized command.`);
    }
};

