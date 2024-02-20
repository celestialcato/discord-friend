import { CommandKit } from "commandkit";
import { ChannelType, Client, GuildChannel } from "discord.js";
import findOrCreateChannel from "../../utilities/findOrCreateChannel";
import { ChannelPaths } from "../../schema/channels";
import { IGuild } from "../../schema/guilds";
import logger from "../../utilities/logger";

const channelRemoved = async (
	c: GuildChannel,
	client: Client<true>,
	handler: CommandKit
) => {
	if (c.type === ChannelType.GuildCategory) {
		return;
	}
	const { foundChannel } = await findOrCreateChannel(c);
	if (!foundChannel) {
		return;
	}

	await foundChannel.populate({ path: ChannelPaths.guild });
	const guild = foundChannel.guild as IGuild;

	let guildNeedsUpdate = false;

	if (String(guild.vent_channel) === String(foundChannel._id)) {
		guild.vent_active = false;
		guild.vent_channel = null;
		guildNeedsUpdate = true;
	}

	if (String(guild.slurs_channel) === String(foundChannel._id)) {
		guild.slurs_active = false;
		guild.slurs_channel = null;
		guildNeedsUpdate = true;
	}

	if (guildNeedsUpdate) {
		await guild
			.save()
			.then(() => {
				logger.docs(
					`➕ updated guild ${guild.guild_id} / ${guild.guild_name}`,
					"updateguild-ok"
				);
			})
			.catch(error => {
				logger.error(
					`❌ couldn't update guild ${guild.guild_id} / ${guild.guild_name}: ${error}`,
					"updateguild-fail"
				);
				return;
			});
	}

	await foundChannel
		.deleteOne()
		.then(() => {
			logger.docs(
				`➖ removed channel ${foundChannel.channel_id} / ${foundChannel.channel_name} from database`,
				"deletechannel-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't remove channel ${foundChannel.channel_id} / ${foundChannel.channel_name} from database: ${error}`,
				"deletechannel-fail"
			);
			return;
		});
};

export default channelRemoved;
