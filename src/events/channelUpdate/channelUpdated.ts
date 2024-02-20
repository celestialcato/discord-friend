import { CommandKit } from "commandkit";
import { ChannelType, Client, GuildChannel } from "discord.js";
import findOrCreateChannel from "../../utilities/findOrCreateChannel";
import logger from "../../utilities/logger";

const channelUpdated = async (
	old_c: GuildChannel,
	new_c: GuildChannel,
	client: Client<true>,
	handler: CommandKit
) => {
	if (new_c.type === ChannelType.GuildCategory) {
		return;
	}

	const { foundChannel, isNew } = await findOrCreateChannel(new_c);
	if (!foundChannel || isNew) {
		return;
	}

	foundChannel.channel_name = new_c.name;
	foundChannel.type = String(new_c.type);

	foundChannel
		.save()
		.then(() => {
			logger.docs(
				`🖊️ updated channel ${new_c.id} / ${new_c.name} in guild ${new_c.guild.id} / ${new_c.guild.name}`,
				"updatechannel-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't update channel ${new_c.id} / ${new_c.name} in guild ${new_c.guild.id} / ${new_c.guild.name} : ${error}`,
				"updatechannel-fail"
			);
			return;
		});
};

export default channelUpdated;
