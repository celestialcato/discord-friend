import * as path from "path";
import { EmbedBuilder, AttachmentBuilder, Message, Client } from "discord.js";
import { CommandKit } from "commandkit";

import logger from "../../utilities/logger";
import findOrCreateGuild from "../../utilities/findOrCreateGuild";

const COOLDOWN_TIME = 24 * 60 * 60 * 1000;

const HITLER_NAMES = ["adolf", "hitler"];

const COOLDOWNS = new Set<string>();

const hitler = async (
	message: Message<true>,
	client: Client<true>,
	handler: CommandKit
) => {
	if (COOLDOWNS.has(message.guild.id)) {
		return;
	}
	if (message.author.bot) {
		return;
	}
	if (
		message.inGuild() &&
		HITLER_NAMES.some(item => message.content.toLowerCase().includes(item))
	) {
		const { foundGuild, isNew } = await findOrCreateGuild(message.guild);

		if (!foundGuild) {
			return;
		}

		const now = new Date();

		const authorIcon = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"..",
				"assets",
				"authoricon",
				"hitler.png"
			)
		).setName("hitlerauthoricon.png");

		const thumbnail = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"..",
				"assets",
				"thumbnails",
				"hitler.png"
			)
		).setName("hitlerthumbnail.png");

		const embed = new EmbedBuilder()
			.setAuthor({
				name: "hitler was mentioned",
				iconURL: "attachment://hitlerauthoricon.png",
			})
			.setColor(0xde0000)
			.setThumbnail("attachment://hitlerthumbnail.png")
			.setTitle("Days since Hitler was mentioned in this server: 0");

		const last_mention = foundGuild.last_hitler_mention || now;

		const days_since_last_mention = last_mention
			? Math.floor(
					(now.getTime() - last_mention?.getTime()) /
						(1000 * 3600 * 24)
			  )
			: 0;

		foundGuild.last_hitler_mention = now;

		await foundGuild.save().catch(e => {
			logger.error(
				`❌ couldn't update last hitler mention in guild ${foundGuild.id} : ${e}`,
				"hitlermention-fail"
			);
		});

		if (!isNew) {
			embed.setDescription(
				`Last streak: ${days_since_last_mention} days`
			);
		}

		message.reply({
			embeds: [embed],
			files: [authorIcon, thumbnail],
		});

		COOLDOWNS.add(message.guild.id);
		setTimeout(() => {
			COOLDOWNS.delete(message.guild.id);
		}, COOLDOWN_TIME);
	}
};

export default hitler;
