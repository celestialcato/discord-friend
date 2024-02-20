import { GuildChannel } from "discord.js";
import addChannelToDb from "./addChannelToDb";
import channels from "../schema/channels";
import findOrCreateGuild from "./findOrCreateGuild";

const findOrCreateChannel = async (c: GuildChannel) => {
	const { foundGuild } = await findOrCreateGuild(c.guild);

	let isNew = false;
	let foundChannel = await channels.findOne({
		channel_id: c.id,
	});
	if (!foundChannel) {
		foundChannel = await addChannelToDb(c, foundGuild);
		isNew = true;
	}
	return { foundChannel, isNew };
};

export default findOrCreateChannel;
