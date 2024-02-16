import "dotenv/config";

import { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder } from "discord.js";

import findOrCreateUser from "../../utilities/findOrCreateUser";

import logger from "../../utilities/logger";
import moment = require("moment");

export const data = new SlashCommandBuilder()
	.setName("check_time")
	.setDescription("find out what time it is for another member")
	.setDMPermission(false)
	.addUserOption(option =>
		option
			.setName("user")
			.setDescription("the user you want check the time for")
			.setRequired(true)
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({});

		const pickedUser = interaction.options.getUser("user");

		if (!pickedUser) {
			return;
		}

		if (pickedUser.bot) {
			await interaction.deleteReply();
			return;
		}

		const { foundUser } = await findOrCreateUser(pickedUser);

		if (!foundUser) {
			return;
		}

		if (!foundUser.user_timezone) {
			interaction.editReply(
				`user ${foundUser.user_username} hasn't set their timezone yet`
			);
			return;
		}

		const time = moment.tz(foundUser.user_timezone);

		await interaction.editReply(
			`it's currently ${time.format("HH:mm")} ${time.format(
				"YYYY-MM-DD"
			)} for the user ${foundUser.user_username}`
		);
	} catch (error) {
		logger.error(
			`❌ using set timezone command failed : ${error}`,
			"cmdsettz-fail"
		);
	}
};

export const options: CommandOptions = {
	deleted: false,
};
