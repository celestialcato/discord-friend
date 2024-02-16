import * as path from "path";

import {
	AttachmentBuilder,
	Client,
	EmbedBuilder,
	TextChannel,
} from "discord.js";

import { IPoll } from "../schema/polls";

import logger from "./logger";

const closePoll = async (c: Client, p: IPoll) => {
	try {
		p.is_active = false;
		p.save()
			.then(() => {
				logger.debug(`✔️ poll ${p.poll_id} was closed`, "pollclose-ok");
			})
			.catch(error => {
				throw error;
			});

		const now = new Date();

		const pollChannel = c.channels.cache.get(
			p.poll_channel_id
		) as TextChannel;
		const pollMessage = await pollChannel.messages.fetch(p.poll_message_id);

		const authorIcon = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"assets",
				"authoricon",
				"pollresults.png"
			)
		);

		const thumbnail = new AttachmentBuilder(
			path.join(
				__dirname,
				"..",
				"..",
				"assets",
				"thumbnails",
				"pollclosed.png"
			)
		);

		const embed = EmbedBuilder.from(pollMessage.embeds[0]);

		embed.setFooter({
			text: `poll was closed on ${now.toLocaleDateString(
				"en-CA"
			)} ${now.toTimeString()}`,
		});
		embed.setThumbnail("attachment://pollclosed.png");
		embed.setAuthor({
			name: "poll results",
			iconURL: "attachment://pollresults.png",
		});

		if (pollMessage) {
			await pollMessage.edit({
				components: [],
				embeds: [embed],
				files: [authorIcon, thumbnail],
			});
		}
	} catch (error) {
		logger.debug(
			`❌ couldn't close poll ${p.poll_id} : ${error}`,
			"pollclose-ok"
		);
	}
};

export default closePoll;
