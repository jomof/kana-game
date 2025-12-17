// logger.js
(function () {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    function sendLog(level, args) {
        // Convert args to string
        const message = args.map(arg => {
            if (typeof arg === 'object') {
                try {
                    return JSON.stringify(arg);
                } catch (e) {
                    return String(arg);
                }
            }
            return String(arg);
        }).join(' ');

        // Send to backend
        // Use sendBeacon for more reliable delivery on unload, but fetch is fine for general use
        // We use fetch here to match existing API usage patterns
        fetch('/api', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                jsonrpc: '2.0',
                method: 'log',
                params: {
                    user: 'jomof', // Hardcoded for this task as requested context implies jomof
                    level: level,
                    message: message
                },
                id: Date.now()
            })
        }).catch(err => {
            // Avoid infinite loop if logging fails
            originalError.call(console, 'Failed to send log to backend:', err);
        });
    }

    console.log = function (...args) {
        originalLog.apply(console, args);
        sendLog('INFO', args);
    };

    console.warn = function (...args) {
        originalWarn.apply(console, args);
        sendLog('WARN', args);
    };

    console.error = function (...args) {
        originalError.apply(console, args);
        sendLog('ERROR', args);
    };

    console.log('Logger initialized and proxying console methods.');
})();
