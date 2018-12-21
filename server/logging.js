function logging(tag, enabled = true) {
    if (!enabled) {
        return () => {};
    }

    return (...varArgs) => console.log(`${new Date().toISOString()}: [${tag}]`, ...varArgs);
}

module.exports = logging;
