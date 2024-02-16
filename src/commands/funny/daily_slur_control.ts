import { SlashCommandProps, CommandOptions } from "commandkit";
import { SlashCommandBuilder, ChannelType } from "discord.js";

import logger from "../../utilities/logger";

import findOrCreateGuild from "../../utilities/findOrCreateGuild";

import { addInterval, removeInterval } from "../../events/ready/dailySlurs";

export const data = new SlashCommandBuilder()
	.setName("daily_slur_control")
	.setDescription("settings for slur of the day functionality")
	.setDMPermission(false)
	.addBooleanOption(option =>
		option
			.setRequired(true)
			.setName("active")
			.setDescription("set daily slur functionality on or off")
	)
	.addChannelOption(option =>
		option
			.setRequired(false)
			.setName("channel")
			.setDescription(
				"the channel you want the daily slurs to be sent in, must be set if hasn't been set before"
			)
			.addChannelTypes(ChannelType.GuildText)
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

		if (!interaction.guild) {
			return;
		}

		let { foundGuild } = await findOrCreateGuild(interaction.guild);

		if (!foundGuild) {
			return;
		}

		if (status) {
			if (
				pickedChannel &&
				foundGuild.daily_slur_channel &&
				foundGuild.daily_slur_channel === pickedChannel.id &&
				foundGuild.daily_slur === true
			) {
				interaction.editReply(
					"daily slurs were already activated on the mentioned channel!"
				);
				return;
			}
			if (pickedChannel === null && foundGuild.daily_slur === true) {
				interaction.editReply("daily slurs were already turned on!");
				return;
			}
			if (!foundGuild.daily_slur_channel && pickedChannel === null) {
				interaction.editReply(
					"you forgot to specify which channel you want the daily slurs to be sent in!"
				);
				return;
			} else if (foundGuild.daily_slur_channel && pickedChannel) {
				foundGuild.daily_slur_channel = pickedChannel.id;
			} else if (!foundGuild.daily_slur_channel && pickedChannel) {
				foundGuild.daily_slur_channel = pickedChannel.id;
			}
			foundGuild.daily_slur = true;
			await foundGuild.save().catch(e => {
				logger.error(
					`❌ couldn't update guildInfo ${foundGuild?.guild_id}: ${e}`,
					"dailyslurcommand-fail"
				);
			});
			foundGuild.daily_slur_channel &&
				addInterval(client, foundGuild.daily_slur_channel);
			interaction.editReply("daily slurs were turned on!");
			return;
		} else {
			if (!foundGuild.daily_slur) {
				interaction.editReply("daily slurs were already off!");
				return;
			}
			foundGuild.daily_slur = false;
			foundGuild.daily_slur_channel &&
				removeInterval(foundGuild.daily_slur_channel);
			await foundGuild.save().catch(e => {
				logger.error(
					`❌ couldn't update guildInfo ${foundGuild?.guild_id}: ${e}`,
					"dailyslurcommand-fail"
				);
			});
			removeInterval(foundGuild.daily_slur_channel);
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
