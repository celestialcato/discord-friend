import * as fs from "fs";
import * as path from "path";
import logger from "./logger";

const logDirectory = path.join(__dirname, "../../logs");
const errorLog = path.join(logDirectory, "error.log");
const debugLog = path.join(logDirectory, "debug.log");

const logFilesCheck = () => {
	let created = false;

	if (!fs.existsSync(logDirectory)) {
		fs.mkdirSync(logDirectory);
		created = true;
	}

	if (!fs.existsSync(errorLog)) {
		fs.writeFileSync(errorLog, "");
		created = true;
	}

	if (!fs.existsSync(debugLog)) {
		fs.writeFileSync(debugLog, "");
		created = true;
	}

	if (created) {
		logger.info("🗃️  created log files successfully");
	}
};

export default logFilesCheck;
