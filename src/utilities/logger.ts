import * as path from "path";
import Logger, { LoggerOptions } from "@ptkdev/logger";

const logDirectory = path.join(__dirname, "../../logs");
const errorLog = path.join(logDirectory, "error.log");
const debugLog = path.join(logDirectory, "debug.log");

const options: LoggerOptions = {
	language: "en",
	colors: true,
	debug: true,
	info: true,
	warning: true,
	error: true,
	sponsor: true,
	write: true,
	type: "log",
	rotate: {
		size: "10M",
		encoding: "utf8",
	},
	path: {
		debug_log: debugLog,
		error_log: errorLog,
	},
};

const logger = new Logger(options);

export default logger;
