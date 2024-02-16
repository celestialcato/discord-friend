import * as fs from "fs";
import * as path from "path";
import * as rl from "readline";

import { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder } from "discord.js";
import logger from "../../utilities/logger";

const DIRECTORY = path.join(__dirname, "..", "..", "..", "logs");

const fetchLogs = async (fileName: string, n: number) => {
	const filePath = path.join(DIRECTORY, fileName);
	const fileStream = fs.createReadStream(filePath);
	const readLine = rl.createInterface({
		input: fileStream,
		crlfDelay: Infinity,
	});

	const lines: string[] = [];
	for await (const line of readLine) {
		lines.push(line);
		if (lines.length > n) {
			lines.shift();
		}
	}

	return lines.join("\n");
};

export const data = new SlashCommandBuilder()
	.setName("show_logs")
	.setDescription("shows bot's logs")
	.addStringOption(option =>
		option
			.setRequired(true)
			.setName("type")
			.setDescription("type of the logs you want to see")
			.addChoices(
				{ name: "error", value: "error" },
				{ name: "debug", value: "debug" }
			)
	)
	.addIntegerOption(option =>
		option
			.setName("lines")
			.setRequired(true)
			.setMinValue(5)
			.setMaxValue(50)
			.setDescription("how many lines of the log file should I send?")
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({ ephemeral: true });

		const type = interaction.options.getString("type");
		const lines = interaction.options.getInteger("lines");

		if (!type || !lines) {
			return;
		}

		let logString: string;

		if (type === "error") {
			logString = await fetchLogs("error.log", lines);
		} else if (type === "debug") {
			logString = await fetchLogs("debug.log", lines);
		} else {
			return;
		}

		if (logString.length > 2000) {
			await interaction.editReply("too long!");
			return;
		}

		await interaction.editReply("```\n" + logString + "```");
	} catch (error) {
		logger.error(
			`❌ using show_logs command failed : ${error}`,
			"cmdshowlogs-fail"
		);
	}
};

export const options: CommandOptions = {
	deleted: false,
};
