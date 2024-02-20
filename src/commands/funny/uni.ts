import * as fs from "fs";
import * as path from "path";

import { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { AttachmentBuilder } from "discord.js";

import logger from "../../utilities/logger";

const DIRECTORY = path.join(
	__dirname,
	"..",
	"..",
	"..",
	"assets",
	"media",
	"uni"
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
			logger.warning(
				"⚠️ no media was found in media folder for uni command",
				"unimedia-warn"
			);
		}
	} catch (error) {
		logger.error(
			`❌ error attaching a file for hii event : ${error}`,
			"unimedia-fail"
		);
	}
	return null;
};

export const data: CommandData = {
	name: "uni",
	description: "sends a picture of uni :3",
};

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({});

		const file = getRandomFile();

		if (file) {
			await interaction.editReply({ files: [file] });
		} else {
			await interaction.editReply(
				"I don't have any pictures of uni yet -w-"
			);
		}
	} catch (error) {
		logger.error(`❌ using uni command failed : ${error}`, "cmduni-fail");
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	deleted: false,
};
