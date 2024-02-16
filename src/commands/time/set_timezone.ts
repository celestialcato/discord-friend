import "dotenv/config";

import {
	CommandData,
	SlashCommandProps,
	CommandOptions,
	ButtonKit,
} from "commandkit";
import { ActionRowBuilder, ButtonStyle } from "discord.js";

import findOrCreateUser from "../../utilities/findOrCreateUser";

import logger from "../../utilities/logger";

export const data: CommandData = {
	name: "set_timezone",
	description:
		"set your timezone so you can create timestamps and your friends can see your time",
};

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({ ephemeral: true });

		const { foundUser } = await findOrCreateUser(interaction.user);
		if (!foundUser) {
			return;
		}

		const objid = foundUser._id;

		const button = new ButtonKit()
			.setStyle(ButtonStyle.Link)
			.setLabel("Set my timezone")
			.setURL(process.env.WEB_FRIEND_URL! + `settimezone/${objid}`);

		const row = new ActionRowBuilder<ButtonKit>().setComponents([button]);

		await interaction.editReply({
			components: [row],
			content: "Click the button below in order to set your timezone:",
		});
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
