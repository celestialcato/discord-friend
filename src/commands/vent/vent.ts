import * as path from "path";

import {
	APIEmbedField,
	ActionRowBuilder,
	AttachmentBuilder,
	EmbedBuilder,
	Events,
	ModalBuilder,
	TextChannel,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { CommandData, SlashCommandProps, CommandOptions } from "commandkit";

import findOrCreateGuild from "../../utilities/findOrCreateGuild";

import logger from "../../utilities/logger";
import { GuildPaths } from "../../schema/guilds";
import { IChannel } from "../../schema/channels";

const HOTLINE_TRIGGER_WORDS = ["suicide", "kill", "harm", "dead", "death"];

const HOTLINE_NUMBERS = [
	{
		flag: "🇺🇸",
		number: "988",
	},
	{
		flag: "🇦🇲",
		number: "538194",
	},
	{
		flag: "🇦🇺",
		number: "131114",
	},
	{
		flag: "🇫🇷",
		number: "0145394000",
	},
	{
		flag: "🇩🇪",
		number: "08001110111",
	},
	{
		flag: "🇭🇺",
		number: "116124",
	},
	{
		flag: "🇮🇳",
		number: "8888817666",
	},
	{
		flag: "🇮🇷",
		number: "1480",
	},
	{
		flag: "🇮🇹",
		number: "800860022",
	},
	{
		flag: "🇵🇰",
		number: "115",
	},
	{
		flag: "🇵🇱",
		number: "5270000",
	},
	{
		flag: "🇵🇭",
		number: "028969191",
	},
	{
		flag: "🇷🇴",
		number: "0800801200",
	},
	{
		flag: "🇸🇬",
		number: "18002214444",
	},
	{
		flag: "🇹🇷",
		number: "112",
	},
	{
		flag: "🇧🇾",
		number: "112",
	},
	{
		flag: "🇺🇦",
		number: "7333",
	},
	{
		flag: "🇻🇳",
		number: "19006186",
	},
	{
		flag: "🇲🇩",
		number: "080088008",
	},
	{
		flag: "🇨🇦",
		number: " 988",
	},
];

export const data: CommandData = {
	name: "vent",
	description: "vent anonymously in the venting channel",
	dm_permission: false,
};

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		if (!interaction.guild) {
			return;
		}

		const { foundGuild } = await findOrCreateGuild(interaction.guild);

		if (!foundGuild) {
			return;
		}

		if (!foundGuild.vent_active) {
			interaction.reply({
				ephemeral: true,
				content: "anonymous venting was turned off for this server",
			});
			return;
		}

		if (!foundGuild.vent_channel) {
			interaction.reply({
				ephemeral: true,
				content: "no vent channel was designated for this server",
			});
			return;
		}

		await foundGuild.populate({ path: GuildPaths.vent_channel });
		const vent_channel = foundGuild.vent_channel as IChannel;
		console.log(vent_channel);

		const channel = client.channels.cache.get(
			vent_channel.channel_id
		) as TextChannel;

		const text = new TextInputBuilder()
			.setCustomId("text")
			.setLabel("your message")
			.setStyle(TextInputStyle.Paragraph)
			.setPlaceholder("type your message here")
			.setMaxLength(4000)
			.setMinLength(1);

		const row = new ActionRowBuilder<TextInputBuilder>().addComponents(
			text
		);

		const modal = new ModalBuilder()
			.setCustomId(`anonvent_${interaction.id}`)
			.setTitle("vent anonymously")
			.addComponents(row);

		await interaction.showModal(modal);

		client.on(Events.InteractionCreate, async int => {
			if (!int.isModalSubmit()) {
				return;
			}
			if (int.customId === `anonvent_${interaction.id}`) {
				await int.deferReply({ ephemeral: true });
				const msg = int.fields.getTextInputValue("text");
				const authorIcon = new AttachmentBuilder(
					path.join(
						__dirname,
						"..",
						"..",
						"..",
						"assets",
						"authoricon",
						"vent.png"
					)
				);
				try {
					const embed = new EmbedBuilder()
						.setAuthor({
							name: "anonymous vent",
							iconURL: "attachment://vent.png",
						})
						.setDescription(msg)
						.setColor(0x379c6f);

					if (
						HOTLINE_TRIGGER_WORDS.some(word =>
							msg.toLowerCase().includes(word)
						)
					) {
						let hotlinefields: APIEmbedField[] = [];
						for (const item of HOTLINE_NUMBERS) {
							hotlinefields.push({
								name: item.flag,
								value: item.number,
								inline: true,
							});
						}
						embed.addFields([
							{
								name: "You're not alone. You can always reach out for help.",
								value: "❤️🩷🧡💛💚💙🩵💜🤎🖤🩶🤍",
							},
							...hotlinefields,
						]);
					}
					await int.editReply({
						content: "Your submission was received successfully!",
					});
					await channel.send({
						embeds: [embed],
						files: [authorIcon],
					});
				} catch (error) {
					logger.error(
						`❌ couldn't send anonymous vent message in channel ${channel.id} : ${error}`,
						"anonvent-fail"
					);
				}
			}
		});
	} catch (error) {
		logger.error(
			`❌ using anon_vent command failed : ${error}`,
			"cmdanonvent-fail"
		);
	}
};

export const options: CommandOptions = {
	deleted: false,
};
