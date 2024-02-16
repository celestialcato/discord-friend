import * as path from "path";

import {
	AttachmentBuilder,
	Client,
	EmbedBuilder,
	TextChannel,
} from "discord.js";
import { CommandKit } from "commandkit";

import wiki from "wikijs";

import logger from "../../utilities/logger";
import guildInfo from "../../schema/guilds";

interface ISlur {
	"term": string;
	"locationOrOrigin": string;
	"targets": string;
	"meaning,OriginAndNotes": string;
	"references": string;
}

// const INTERVAL = 24 * 60 * 60 * 1000;

const INTERVAL = 2 * 60 * 60 * 1000;

// const INTERVAL = 30 * 60 * 1000;

// const INTERVAL = 30000;

const MAX_RETRIES = 3;

const CURRENT_CHANNELS = new Map();

export const addInterval = (client: Client<true>, channel_id: string) => {
	if (!CURRENT_CHANNELS.has(channel_id)) {
		logger.debug(
			`➕ daily slurs were added for channel ${channel_id}`,
			"dailyslur-add"
		);
		const newInterval = setInterval(() => {
			sendSlur(client, channel_id);
		}, INTERVAL);
		CURRENT_CHANNELS.set(channel_id, newInterval);
	}
};

export const removeInterval = (channel_id: string) => {
	if (CURRENT_CHANNELS.has(channel_id)) {
		logger.debug(
			`➖ daily slurs were removed for channel ${channel_id}`,
			"dailyslur-remove"
		);
		const channelInterval = CURRENT_CHANNELS.get(channel_id);
		clearInterval(channelInterval);
		CURRENT_CHANNELS.delete(channel_id);
	}
};

const sendSlur = async (
	client: Client<true>,
	channel_id: string,
	retried?: number
) => {
	const channel = client.channels.cache.get(channel_id) as TextChannel;

	const authorIcon = new AttachmentBuilder(
		path.join(
			__dirname,
			"..",
			"..",
			"..",
			"assets",
			"authoricon",
			"dictionary.png"
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
			"wordoftheday.png"
		)
	);

	await wiki()
		.page("List_of_ethnic_slurs")
		.then(page => page.tables())
		.then(
			(tables: Array<any>) =>
				tables[Math.floor(Math.random() * tables.length)]
		)
		.then(
			(table: Array<ISlur>) =>
				table[Math.floor(Math.random() * table.length)]
		)
		.then(async slur => {
			try {
				const embed = new EmbedBuilder().setAuthor({
					name: "racial slur of the day",
					iconURL: "attachment://dictionary.png",
				});

				embed.setTitle(`Today's racial slur is: ${slur.term}`);
				embed.addFields(
					{ name: "targeted ethnic group:", value: slur.targets },
					{ name: "origin:", value: slur.locationOrOrigin },
					{ name: "context:", value: slur["meaning,OriginAndNotes"] }
				);
				embed.setThumbnail("attachment://wordoftheday.png");
				embed.setColor(0x74cccf);
				await channel.send({
					embeds: [embed],
					files: [thumbnail, authorIcon],
				});
			} catch (error) {
				logger.error(
					`failed to send the racial slur of the day in channel ${channel_id} : ${error}`
				);
				if (!retried) {
					sendSlur(client, channel_id, 1);
				} else if (retried > MAX_RETRIES) {
					return;
				} else {
					sendSlur(client, channel_id, retried + 1);
				}
			}
		});
};

const prepareGuilds = async (client: Client<true>) => {
	const query = {
		daily_slur: true,
		daily_slur_channel: { $ne: null },
	};
	const guilds = await guildInfo.find(query);
	for (const guild of guilds) {
		guild.daily_slur_channel &&
			addInterval(client, guild.daily_slur_channel);
	}
};

const dailySlurs = async (
	c: Client<true>,
	client: Client<true>,
	handler: CommandKit
) => {
	prepareGuilds(client);
};

export default dailySlurs;
