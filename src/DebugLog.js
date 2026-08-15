function debugLog(...args) {
    const stack = new Error().stack;
    const line = stack.split('\n')[2];

    const match = line.match(/\((.*):(\d+):(\d+)\)/) ||
                  line.match(/at (.*):(\d+):(\d+)/);

    if (match) {
        const file = match[1].split(/[\\/]/).pop();
        const lineNumber = match[2];

        console.log(`[\x1b[36m${file}:${lineNumber}\x1b[0m]`, ...args);
    } else {
        console.log(...args);
    }
}

//'\x1b[36m Saved stockOption found\x1b[0m,'
module.exports = {debugLog}