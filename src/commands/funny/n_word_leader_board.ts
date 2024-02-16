import * as path from "path";
import { SlashCommandProps, CommandOptions, ButtonKit } from "commandkit";
import {
	EmbedBuilder,
	AttachmentBuilder,
	SlashCommandBuilder,
	ButtonStyle,
	ActionRowBuilder,
	ButtonInteraction,
	Guild,
} from "discord.js";

import logger from "../../utilities/logger";
import { getUserCount } from "../../utilities/getUserCount";
import members, { MemberPaths } from "../../schema/members";

const MAX_USERS_PER_PAGE = 5;

const getRandomCircle = () => {
	const emojis = ["🔴", "🟠", "🟡", "🟢", "🔵", "🟣", "🟤", "⚫", "⚪"];
	const randomIndex = Math.floor(Math.random() * emojis.length);
	return emojis[randomIndex];
};

const fetchPageString = async (g: Guild, pageNumber: number = 1) => {
	let pageString: string = "";
	try {
		const memberships = await members
			.find()
			.populate({
				path: MemberPaths.guild,
				match: {
					guild_id: g.id,
				},
			})
			.populate({
				path: MemberPaths.user,
			})
			.sort({ n_word_count: -1 })
			.skip((pageNumber - 1) * MAX_USERS_PER_PAGE)
			.limit(MAX_USERS_PER_PAGE);

		for (const m of memberships) {
			pageString += `${getRandomCircle()} **${
				m.user.user_username
			} :** \n🗿 ${m.n_word_count} times\n\n`;
		}
	} catch (error) {
		logger.error(
			`❌ couldn't retrieve page ${pageNumber} of user data`,
			"userdatapage-fail"
		);
	}
	return pageString.replace(/\n$/, "");
};

const generateButtons = async (pageNumber: number, totalPages: number) => {
	const previousButton = new ButtonKit();
	const nextButton = new ButtonKit();

	nextButton
		.setStyle(ButtonStyle.Success)
		.setCustomId("next")
		.setDisabled(totalPages <= 1 || pageNumber === totalPages)
		.setLabel("     →     ");
	previousButton
		.setStyle(ButtonStyle.Success)
		.setCustomId("previous")
		.setDisabled(pageNumber === 1)
		.setLabel("     ←     ");

	return { previousButton, nextButton };
};

const generateRow = async (
	previousButton: ButtonKit,
	nextButton: ButtonKit
) => {
	const row = new ActionRowBuilder<ButtonKit>().addComponents([
		previousButton,
		nextButton,
	]);

	return row;
};

const generateEmbed = async (
	g: Guild,
	pageNumber: number,
	totalPages: number
) => {
	const pageString = await fetchPageString(g, pageNumber);
	const embed = new EmbedBuilder()
		.setAuthor({
			name: "n word counter",
			iconURL: "attachment://racism.png",
		})
		.setColor(0xa37b57)
		.setThumbnail("attachment://black_man.png")
		.setTitle(`🏆 n word leaderboard`)
		.setDescription(`📃 page ${pageNumber} of ${totalPages}`)
		.addFields({
			name: "👤 users :\n\n",
			value: "-------------\n" + pageString + "-------------\n",
		});
	return embed;
};

export const data = new SlashCommandBuilder()
	.setName("n_word_leaderboard")
	.setDescription("n word leader board")
	.setDMPermission(false);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		const msg = await interaction.deferReply({ fetchReply: true });

		const guild = interaction?.guild;
		if (!guild) {
			return;
		}

		const userCount = await getUserCount(guild);

		if (userCount === 0) {
			interaction.editReply("no records found");
			return;
		}

		const totalPages = Math.ceil(userCount / MAX_USERS_PER_PAGE);

		let currentPage = 1;

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

		const embed = await generateEmbed(guild, currentPage, totalPages);
		const { previousButton, nextButton } = await generateButtons(
			currentPage,
			totalPages
		);
		const row = await generateRow(previousButton, nextButton);

		await interaction.editReply({
			embeds: [embed],
			files: [authorIcon, thumbnail],
			components: [row],
		});

		nextButton.onClick(
			async (int: ButtonInteraction) => {
				currentPage++;
				const newEmbed = await generateEmbed(
					guild,
					currentPage,
					totalPages
				);
				const {
					previousButton: newPreviousButton,
					nextButton: newNextButton,
				} = await generateButtons(currentPage, totalPages);

				const newRow = await generateRow(
					newPreviousButton,
					newNextButton
				);

				await int.update({ embeds: [newEmbed], components: [newRow] });
			},
			{
				time: 1800000,
				autoReset: false,
				message: msg,
			}
		);

		previousButton.onClick(
			async (int: ButtonInteraction) => {
				currentPage--;
				const newEmbed = await generateEmbed(
					guild,
					currentPage,
					totalPages
				);
				const {
					previousButton: newPreviousButton,
					nextButton: newNextButton,
				} = await generateButtons(currentPage, totalPages);

				const newRow = await generateRow(
					newPreviousButton,
					newNextButton
				);

				await int.update({ embeds: [newEmbed], components: [newRow] });
			},
			{
				time: 1800000,
				autoReset: false,
				message: msg,
			}
		);
	} catch (error) {
		logger.error(
			`❌ using n_word_leader_board command failed : ${error}`,
			"cmdnwordleaderboard-fail"
		);
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	deleted: false,
};
