import { createLogger, transports, format } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import path from "path";
import fs from "fs";

// Use a more robust way to get the environment, defaulting to 'development'
const environment = process.env.NODE_ENV || "development";

// Set the log directory and ensure it exists
const logDirectory = process.env.LOG_DIR || path.resolve(process.cwd(), "logs");

if (!fs.existsSync(logDirectory)) {
    fs.mkdirSync(logDirectory, { recursive: true });
}

const logLevel = environment === "development" ? "debug" : "warn";

// Define options for transports to avoid repetition
const fileTransportOptions = {
    filename: path.join(logDirectory, "%DATE%-results.log"),
    datePattern: "YYYY-MM-DD",
    zippedArchive: true,
    maxSize: "20m",
    maxFiles: "14d",
};

const logger = createLogger({
    // Set the default minimum log level.
    // Logs with a level lower than this will not be processed.
    level: logLevel,

    // Use a format that will be shared by all transports
    format: format.combine(
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.errors({ stack: true }), // <-- Log stack traces
        format.splat(),
        format.json()
    ),

    transports: [
        // Console transport for development
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.printf(info => `${info.timestamp} ${info.level}: ${info.message}`)
            )
        }),
        // Daily rotating file transport
        new DailyRotateFile({
            ...fileTransportOptions,
            level: logLevel, // Log level for this specific transport
        })
    ],

    // Handlers for uncaught exceptions and unhandled rejections
    exceptionHandlers: [
        new DailyRotateFile({
            ...fileTransportOptions,
            filename: path.join(logDirectory, "%DATE%-exceptions.log"),
        })
    ],
    rejectionHandlers: [
        new DailyRotateFile({
            ...fileTransportOptions,
            filename: path.join(logDirectory, "%DATE%-rejections.log"),
        })
    ],

    exitOnError: false, // Do not exit on handled exceptions
});

// A simple stream interface for use with morgan, etc.
(logger as any).stream = {
    write: (message: string) => {
        logger.info(message.trim());
    },
};

export default logger;