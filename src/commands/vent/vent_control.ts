import { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder, ChannelType, GuildChannel } from "discord.js";

import findOrCreateGuild from "../../utilities/findOrCreateGuild";

import logger from "../../utilities/logger";
import findOrCreateChannel from "../../utilities/findOrCreateChannel";

export const data = new SlashCommandBuilder()
	.setName("vent_control")
	.setDescription("settings for anonymous venting functionality")
	.setDMPermission(false)
	.addBooleanOption(option =>
		option
			.setRequired(true)
			.setName("active")
			.setDescription("set anonymous venting on or off")
	)
	.addChannelOption(option =>
		option
			.setRequired(false)
			.setName("channel")
			.setDescription(
				"the channel you want the anonymous vents to be sent in, must be set if hasn't been set before"
			)
			.addChannelTypes(ChannelType.GuildText)
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.deferReply({ ephemeral: true });

		const status = interaction.options.getBoolean("active");
		const pickedChannel = interaction.options.getChannel("channel");

		const { foundGuild } = await findOrCreateGuild(interaction.guild);

		if (!foundGuild) {
			return;
		}

		let foundChannel = null;

		if (pickedChannel) {
			foundChannel = (
				await findOrCreateChannel(pickedChannel as GuildChannel)
			).foundChannel;

			if (!foundChannel) {
				return;
			}
		}

		if (status) {
			if (
				pickedChannel &&
				foundChannel &&
				foundGuild.vent_channel &&
				String(foundGuild.vent_channel) === String(foundChannel._id) &&
				foundGuild.vent_active === true
			) {
				interaction.editReply(
					"anonymous venting was already activated on the mentioned channel!"
				);
				return;
			}
			if (pickedChannel === null && foundGuild.vent_active === true) {
				interaction.editReply(
					"anonymous venting was already turned on!"
				);
				return;
			}
			if (!foundGuild.vent_channel && pickedChannel === null) {
				interaction.editReply(
					"you forgot to specify which channel you want the anonymous vents to be sent in!"
				);
				return;
			} else if (pickedChannel && foundChannel) {
				foundGuild.vent_channel = foundChannel._id;
			}
			foundGuild.vent_active = true;
			await foundGuild.save().catch(e => {
				logger.error(
					`❌ couldn't update guildInfo ${foundGuild.guild_id}: ${e}`,
					"anonvent-fail"
				);
			});
			interaction.editReply("anonymous venting was turned on!");
			return;
		} else {
			if (!foundGuild.vent_active) {
				interaction.editReply("anonymous venting was already off!");
				return;
			}
			foundGuild.vent_active = false;
			await foundGuild.save().catch(e => {
				logger.error(
					`❌ couldn't update guildInfo ${foundGuild.guild_id}: ${e}`,
					"anonvent-fail"
				);
			});
			interaction.editReply("anonymous venting was turned off!");
		}
	} catch (error) {
		logger.error(
			`❌ using anon_vent_control command failed : ${error}`,
			"cmdanonventcontrol-fail"
		);
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	userPermissions: ["Administrator"],
	deleted: false,
};
