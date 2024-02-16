import "dotenv/config";

import mongoose from "mongoose";

import logger from "../../utilities/logger";

const connectToDb = async () => {
	try {
		mongoose.set("strictQuery", false);
		await mongoose.connect(`${process.env.MONGO_DB_CONNECTION_STRING}`, {});
		logger.debug("🍃 connection to database established", "dbcon-ok");
	} catch (error) {
		logger.debug(
			"❌ connecting to database failed : ${error}",
			"dbcon-fail"
		);
	}
};

export default connectToDb;
