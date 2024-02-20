import { CommandKit } from "commandkit";
import { ChannelType, Client, GuildChannel } from "discord.js";
import findOrCreateChannel from "../../utilities/findOrCreateChannel";

const newChannel = async (
	c: GuildChannel,
	client: Client<true>,
	handler: CommandKit
) => {
	if (c.type === ChannelType.GuildCategory) {
		return;
	}
	await findOrCreateChannel(c);
};

export default newChannel;
