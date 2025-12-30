/**
 * Custom Next.js server with access logging
 * Logs all HTTP requests to file for security inspection
 */

const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = parseInt(process.env.PORT || '3000', 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// Log directory setup
const logDir = path.join('/var/log/nextjs');
const logFilePath = path.join(logDir, 'access.log');

// Ensure log directory exists
if (!fs.existsSync(logDir)) {
  try {
    fs.mkdirSync(logDir, { recursive: true });
  } catch (err) {
    console.error('Failed to create log directory:', err);
  }
}

/**
 * Format log entry with timestamp and request details
 */
function formatLogEntry(req, res, duration) {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '-';
  const method = req.method || '-';
  const url = req.url || '-';
  const httpVersion = `HTTP/${req.httpVersion}`;
  const statusCode = res.statusCode || '-';
  const userAgent = req.headers['user-agent'] || '-';
  const referer = req.headers['referer'] || '-';
  
  // Combined Log Format with additional fields
  return `${ip} - - [${timestamp}] "${method} ${url} ${httpVersion}" ${statusCode} - "${referer}" "${userAgent}" ${duration}ms\n`;
}

/**
 * Write log entry to file
 */
function writeLog(logEntry) {
  try {
    fs.appendFileSync(logFilePath, logEntry, 'utf8');
  } catch (err) {
    console.error('Failed to write access log:', err);
  }
}

app.prepare().then(() => {
  createServer((req, res) => {
    const startTime = Date.now();
    const parsedUrl = parse(req.url, true);

    // Store original end function
    const originalEnd = res.end;
    
    // Override res.end to capture response timing
    res.end = function (...args) {
      const duration = Date.now() - startTime;
      const logEntry = formatLogEntry(req, res, duration);
      writeLog(logEntry);
      
      // Call original end function
      originalEnd.apply(res, args);
    };

    handle(req, res, parsedUrl);
  })
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? 'development' : process.env.NODE_ENV
        }`
      );
      console.log(`> Access logs: ${logFilePath}`);
    });
});
