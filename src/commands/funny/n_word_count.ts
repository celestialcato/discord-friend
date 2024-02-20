import * as path from "path";

import { SlashCommandProps, CommandOptions } from "commandkit";
import {
	EmbedBuilder,
	AttachmentBuilder,
	SlashCommandBuilder,
} from "discord.js";

import { findOrCreateMemberUG } from "../../utilities/findOrCreateMember";

import { MemberPaths } from "../../schema/members";
import { IUser } from "../../schema/users";

import logger from "../../utilities/logger";

export const data = new SlashCommandBuilder()
	.setName("n_word_count")
	.setDescription("find out how many times a user has said the n word")
	.setDMPermission(false)
	.addUserOption(option =>
		option
			.setName("user")
			.setDescription(
				"the user you want to find out about, leave empty to see yours"
			)
			.setRequired(false)
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({});

		const pickedUser = interaction.options.getUser("user");

		if (pickedUser && pickedUser.bot) {
			await interaction.deleteReply();
			return;
		}

		if (!interaction.guild) {
			return;
		}

		const { foundMember } = await findOrCreateMemberUG(
			pickedUser ? pickedUser : interaction.user,
			interaction.guild
		);

		if (!foundMember) {
			return;
		}

		await foundMember.populate({ path: MemberPaths.user });

		const foundUser = foundMember.user as IUser;

		const authorIcon = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"..",
				"assets",
				"authoricon",
				"racism.png"
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
				"black_man.png"
			)
		);

		const embed = new EmbedBuilder()
			.setAuthor({
				name: "n word counter",
				iconURL: "attachment://racism.png",
			})
			.setColor(0xa37b57)
			.setThumbnail("attachment://black_man.png")
			.setTitle(
				`user ${foundUser.user_username} has said the n word ${
					foundMember.n_word_count
				} times since ${foundUser.date_created.toLocaleDateString(
					"en-CA"
				)}`
			);

		interaction.editReply({
			embeds: [embed],
			files: [authorIcon, thumbnail],
		});
	} catch (error) {
		logger.error(
			`❌ using n_word_count command failed : ${error}`,
			"cmdnwordcount-fail"
		);
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	deleted: false,
};
