import { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder, ChannelType, GuildChannel } from "discord.js";

import logger from "../../utilities/logger";

import findOrCreateGuild from "../../utilities/findOrCreateGuild";

import { addInterval, removeInterval } from "../../events/ready/slurs";
import findOrCreateChannel from "../../utilities/findOrCreateChannel";
import { GuildPaths } from "../../schema/guilds";

export const data = new SlashCommandBuilder()
	.setName("slur_control")
	.setDescription("settings for slur functionality")
	.setDMPermission(false)
	.addBooleanOption(option =>
		option
			.setRequired(true)
			.setName("active")
			.setDescription("set the slur functionality on or off")
	)
	.addChannelOption(option =>
		option
			.setRequired(false)
			.setName("channel")
			.setDescription(
				"the channel you want the slurs to be sent in, must be set if hasn't been set before"
			)
			.addChannelTypes(ChannelType.GuildText)
	)
	.addIntegerOption(option =>
		option
			.setName("interval")
			.setDescription("the time between sending two consecutive slurs")
			.setMinValue(1)
			.setMaxValue(48)
			.setRequired(false)
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply({ ephemeral: true });

		const status = interaction.options.getBoolean("active");
		const pickedChannel = interaction.options.getChannel("channel");
		const interval = interaction.options.getInteger("interval");

		if (!interaction.guild) {
			return;
		}

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
				interval &&
				foundGuild.slurs_channel &&
				String(foundGuild.slurs_channel) === String(foundChannel._id) &&
				foundGuild.slurs_active === true &&
				foundGuild.slurs_interval === interval
			) {
				interaction.editReply(
					"slurs were already activated on the mentioned channel!"
				);
				return;
			}
			if (
				pickedChannel === null &&
				foundGuild.slurs_active === true &&
				interval &&
				foundGuild.slurs_interval === interval
			) {
				interaction.editReply("slurs were already turned on!");
				return;
			}
			if (!foundGuild.slurs_channel && pickedChannel === null) {
				interaction.editReply(
					"you forgot to specify which channel you want the daily slurs to be sent in!"
				);
				return;
			} else if (pickedChannel && foundChannel) {
				foundGuild.slurs_channel = foundChannel._id;
			}
			if (interval) {
				foundGuild.slurs_interval = interval;
			}
			foundGuild.slurs_active = true;
			await foundGuild.save().catch(e => {
				logger.error(
					`❌ couldn't update guildInfo ${foundGuild?.guild_id}: ${e}`,
					"dailyslurcommand-fail"
				);
			});
			await foundGuild.populate({ path: GuildPaths.slurs_channel });
			const slurs_channel = foundGuild.slurs_channel;
			addInterval(client, slurs_channel, foundGuild.slurs_interval);
			interaction.editReply("daily slurs were turned on!");
			return;
		} else {
			if (!foundGuild.slurs_active) {
				interaction.editReply("daily slurs were already off!");
				return;
			}
			foundGuild.slurs_active = false;
			foundGuild.slurs_channel &&
				removeInterval(foundGuild.slurs_channel);
			await foundGuild.save().catch(e => {
				logger.error(
					`❌ couldn't update guildInfo ${foundGuild?.guild_id}: ${e}`,
					"dailyslurcommand-fail"
				);
			});
			removeInterval(foundGuild.slurs_channel);
			interaction.editReply("daily slurs were turned off!");
		}
	} catch (error) {
		logger.error(
			`❌ using daily_slur_control command failed : ${error}`,
			"cmddailyslurcontrol-fail"
		);
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	userPermissions: ["Administrator"],
	deleted: false,
};
