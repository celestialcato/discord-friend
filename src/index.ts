import "dotenv/config";
import * as path from "path";

import { Client } from "discord.js";
import { CommandKit } from "commandkit";

import logger from "./utilities/logger";
import logFilesCheck from "./utilities/logFilesCheck";

// check log files

logFilesCheck();

// define client object

const client = new Client({
	intents: [
		"Guilds",
		"GuildMessages",
		"GuildMembers",
		"MessageContent",
		"GuildPresences",
	],
});

new CommandKit({
	client,
	commandsPath: path.join(__dirname, "commands"),
	eventsPath: path.join(__dirname, "events"),
	validationsPath: path.join(__dirname, "validations"),
	// devGuildIds: [`${process.env.TEST_GUILD_ID}`],
	devUserIds: [`${process.env.DEVELOPER_ID}`],
	devRoleIds: [`${process.env.DEVELOPER_ROLE_ID}`],
	// skipBuiltInValidations: true,
	bulkRegister: true,
});

try {
	client.login(process.env.TOKEN);
	logger.info(`🔑 logged in successfully`, "login-ok");
} catch (error) {
	logger.error(`${error}`, "login-fail");
}

process.on("uncaughtException", error => {
	console.error(error);
	process.exit(1);
});
