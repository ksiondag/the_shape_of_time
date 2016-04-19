'use strict';

var readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
    // TODO: completer (for tab completion)
});

var controls = require('./controls');
var game = require('./game');

var main = () => {
    if (game.over()) {
        readline.close();
        return;
    }
    game.prompt((prompt) => {
        readline.question(prompt, (result) => {
            controls.parse(result, (output) => {
                if (output) {
                    console.log(output);
                }
                game.update((output) => {
                    if (output) {
                        console.log(output);
                    }
                    setTimeout(main, 10);
                });
            });
        });
    });
};

if (require.main === module) {
    main();
}

