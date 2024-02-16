import * as path from "path";

import { CommandData, SlashCommandProps, CommandOptions } from "commandkit";
import { EmbedBuilder, AttachmentBuilder } from "discord.js";

import quotes from "../../schema/quotes";

import logger from "../../utilities/logger";

export const data: CommandData = {
	name: "sex",
	description: "QwQ",
};

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({});

		const count = await quotes.countDocuments({
			tag: "sex",
		});
		const random = Math.floor(Math.random() * count);
		const quote = await quotes.findOne({ tag: "sex" }).skip(random);

		const fetchedQuote = quote?.quote || "go to horny jail!";

		const authorIcon = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"..",
				"assets",
				"authoricon",
				"sex.png"
			)
		);

		const thumbnail = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"..",
				"assets",
				"thumbnails",
				"bonk.png"
			)
		);

		const embed = new EmbedBuilder()
			.setAuthor({
				name: "go to horny jail!",
				iconURL: "attachment://sex.png",
			})
			.setColor(0xc02c91)
			.setThumbnail("attachment://bonk.png")
			.setDescription(fetchedQuote);
		await interaction.editReply({
			embeds: [embed],
			files: [authorIcon, thumbnail],
		});
	} catch (error) {
		logger.error(`❌ using sex command failed : ${error}`, "cmdsex-fail");
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	deleted: false,
};
