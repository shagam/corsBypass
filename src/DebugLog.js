function debugLog(...args) {
    const stack = new Error().stack;
    const line = stack.split('\n')[2];

    const match = line.match(/\((.*):(\d+):(\d+)\)/) ||
                  line.match(/at (.*):(\d+):(\d+)/);

    if (match) {
        const file = match[1].split(/[\\/]/).pop();
        const lineNumber = match[2];

        console.log(`\ndebugLog [${file}:${lineNumber}]`, ...args);
    } else {
        console.log(...args);
    }
}

module.exports = {debugLog}