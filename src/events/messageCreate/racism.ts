import * as path from "path";
import { EmbedBuilder, AttachmentBuilder, Message, Client } from "discord.js";
import { CommandKit } from "commandkit";

import { findOrCreateMemberUG } from "../../utilities/findOrCreateMember";

import logger from "../../utilities/logger";
import { MemberPaths } from "../../schema/members";

const COOLDOWN_TIME = 6 * 60 * 60 * 1000;

const MAX_DISPLAY_TIME = 5;
const N_WORDS = ["nigger", "nigga", "negro", "négro"];

const COOLDOWNS = new Set<string>();
const THREASHOLDS = new Map();

const racism = async (
	message: Message<true>,
	client: Client<true>,
	handler: CommandKit
) => {
	if (message.author.bot) {
		return;
	}
	if (
		message.inGuild() &&
		N_WORDS.some(item => message.content.toLowerCase().includes(item))
	) {
		const displayedTimes =
			THREASHOLDS.get(`${message.author.id}-${message.guild.id}`) || 0;

		const { foundMember } = await findOrCreateMemberUG(
			message.author,
			message.guild
		);

		if (!foundMember) {
			return;
		}

		(await foundMember.populate({ path: MemberPaths.user })).populate({
			path: MemberPaths.guild,
		});

		let goldenNumber: number;
		let creationDate: Date;

		foundMember.n_word_count += 1;
		goldenNumber = foundMember.n_word_count;
		creationDate = foundMember.date_joined;

		await foundMember.save().catch(async error => {
			logger.error(
				`❌ couldn't update n word count for user ${foundMember.user.user_id} in guild ${foundMember.guild.guild_id} : ${error}`,
				"nwordcount-fail"
			);
		});

		if (COOLDOWNS.has(`${message.author.id}-${message.guild.id}`)) {
			return;
		}

		THREASHOLDS.set(
			`${message.author.id}-${message.guild.id}`,
			displayedTimes + 1
		);

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
				`user ${
					message.author.displayName
				} has said the n word ${goldenNumber} times since ${creationDate.toLocaleDateString(
					"en-CA"
				)}`
			);

		message.reply({
			embeds: [embed],
			files: [authorIcon, thumbnail],
		});

		if (displayedTimes + 1 >= MAX_DISPLAY_TIME) {
			THREASHOLDS.delete(`${message.author.id}-${message.guild.id}`);
			COOLDOWNS.add(`${message.author.id}-${message.guild.id}`);
			setTimeout(() => {
				COOLDOWNS.delete(`${message.author.id}-${message.guild.id}`);
			}, COOLDOWN_TIME);
		}
	}
};

export default racism;
