import { Channel, GuildChannel } from "discord.js";
import channels from "../schema/channels";
import logger from "./logger";
import findOrCreateGuild from "./findOrCreateGuild";
import { IGuild } from "../schema/guilds";

const addChannelToDb = async (channel: GuildChannel, g: IGuild) => {
	const newChannel = new channels({
		channel_id: channel.id,
		channel_name: channel.name,
		type: channel.type,
		guild: g._id,
	});

	await newChannel
		.save()
		.then(() => {
			logger.docs(
				`➕ added channel ${channel.id} / ${channel.name} for guild ${g.guild_name} to database`,
				"addchannel-ok"
			);
		})
		.catch(e => {
			logger.error(
				`❌ couldn't add guild ${channel.id} / ${channel.name} for guild ${g.guild_name} to database: ${e}`,
				"addguild-fail"
			);
			return null;
		});
	return newChannel;
};

export default addChannelToDb;
