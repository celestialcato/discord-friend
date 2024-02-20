import * as path from "path";

import {
	AttachmentBuilder,
	Client,
	EmbedBuilder,
	TextChannel,
} from "discord.js";
import { CommandKit } from "commandkit";

import wiki from "wikipedia";

import logger from "../../utilities/logger";
import guilds, { GuildPaths } from "../../schema/guilds";
import { IChannel } from "../../schema/channels";

interface ISlur {
	"term": string;
	"locationOrOrigin": string;
	"targets": string;
	"meaning,OriginAndNotes": string;
	"references": string;
}

const MAX_RETRIES = 3;

const CURRENT_CHANNELS = new Map();

export const addInterval = (
	client: Client<true>,
	channel: IChannel,
	interval: number
) => {
	if (!CURRENT_CHANNELS.has(channel.channel_id)) {
		logger.docs(
			`➕ daily slurs were added for channel ${channel.channel_id}`,
			"dailyslur-add"
		);
		const newInterval = setInterval(() => {
			sendSlur(client, channel);
		}, interval * 60 * 60 * 1000);
		CURRENT_CHANNELS.set(channel.channel_id, newInterval);
	}
};

export const removeInterval = (channel: IChannel) => {
	if (CURRENT_CHANNELS.has(channel.channel_id)) {
		logger.docs(
			`➖ daily slurs were removed for channel ${channel.channel_id}`,
			"dailyslur-remove"
		);
		const channelInterval = CURRENT_CHANNELS.get(channel.channel_id);
		clearInterval(channelInterval);
		CURRENT_CHANNELS.delete(channel.channel_id);
	}
};

const sendSlur = async (
	client: Client<true>,
	ch: IChannel,
	retried?: number
) => {
	const channel = client.channels.cache.get(ch.channel_id) as TextChannel;

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

	await wiki
		.page("List_of_ethnic_slurs")
		.then(async page => {
			const tables = await page.tables();
			return tables;
		})
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
					`failed to send the racial slur of the day in channel ${ch.channel_id} : ${error}`
				);
				if (!retried) {
					sendSlur(client, ch, 1);
				} else if (retried > MAX_RETRIES) {
					return;
				} else {
					sendSlur(client, ch, retried + 1);
				}
			}
		});
};

const prepareGuilds = async (client: Client<true>) => {
	const foundGuilds = await guilds.find({
		slurs_active: true,
		slurs_channel: { $ne: null },
	});
	for (const guild of foundGuilds) {
		if (!guild.slurs_channel) {
			continue;
		}
		await guild.populate({ path: GuildPaths.slurs_channel });
		addInterval(
			client,
			guild.slurs_channel as IChannel,
			guild.slurs_interval
		);
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
