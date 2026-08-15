function debugLog (...args) {
    const stack = new Error().stack ?.split("\n") || [];

    const caller = stack[2]?.replace(/^at\s+/, "at")
    .trim() || "unknown";

    console.log (`debugLog ${caller}`, ...args);
}

module.exports = {debugLog}