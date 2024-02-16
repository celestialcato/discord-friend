import * as path from "path";
import * as fs from "fs";

import { AttachmentBuilder, Message, Client } from "discord.js";
import { CommandKit } from "commandkit";
import logger from "../../utilities/logger";

const COOLDOWN_TIME = 24 * 60 * 60 * 1000;

const COOLDOWNS = new Set<string>();

const DIRECTORY = path.join(
	__dirname,
	"..",
	"..",
	"..",
	"assets",
	"media",
	"hii"
);

const getRandomFile = () => {
	try {
		const files = fs.readdirSync(DIRECTORY);
		if (files.length > 0) {
			const randomFile = files[Math.floor(Math.random() * files.length)];
			const filePath = path.join(DIRECTORY, randomFile);
			const extension = path.extname(randomFile);
			const file = new AttachmentBuilder(filePath).setName(
				`file.${extension}`
			);

			return file;
		} else {
			logger.debug(
				"⚠️ no media was found in media folder for hii event",
				"hiinomedia-warn"
			);
		}
	} catch (error) {
		logger.error(
			`❌ error attaching a file for hii event : ${error}`,
			"hiimedia-fail"
		);
	}
	return null;
};

const hii = async (
	message: Message<true>,
	client: Client<true>,
	handler: CommandKit
) => {
	if (COOLDOWNS.has(message.author.id)) {
		return;
	}
	if (message.author.bot) {
		return;
	}

	if (message.inGuild() && !!message.content.toLowerCase().match(/hii+/g)) {
		const file = getRandomFile();

		await message.reply({
			files: file ? [file] : [],
			content: "hiiiiiiiiii :3",
		});

		COOLDOWNS.add(message.author.id);
		setTimeout(() => {
			COOLDOWNS.delete(message.author.id);
		}, COOLDOWN_TIME);
	}
};

export default hii;
