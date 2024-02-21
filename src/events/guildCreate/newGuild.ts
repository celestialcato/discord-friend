import { CommandKit } from "commandkit";
import { ChannelType, Client, Guild, GuildChannel } from "discord.js";
import findOrCreateGuild from "../../utilities/findOrCreateGuild";
import { findOrCreateMemberM } from "../../utilities/findOrCreateMember";
import findOrCreateChannel from "../../utilities/findOrCreateChannel";
import findOrCreateRole from "../../utilities/findOrCreateRole";

const newGuild = async (
	g: Guild,
	client: Client<true>,
	handler: CommandKit
) => {
	await findOrCreateGuild(g);
	await g.members.fetch();
	await g.channels.fetch();
	await g.roles.fetch();
	const membersCollection = g.members.cache;
	const members = [...membersCollection.values()];
	for (const member of members) {
		if (member.user.bot) {
			continue;
		}
		await findOrCreateMemberM(member);
	}
	const channelsCollection = g.channels.cache;
	const channels = [...channelsCollection.values()];
	for (const channel of channels) {
		if (channel.type === ChannelType.GuildCategory) {
			continue;
		}
		await findOrCreateChannel(channel as GuildChannel);
	}
	const rolesCollection = g.roles.cache;
	const roles = [...rolesCollection.values()];
	for (const role of roles) {
		await findOrCreateRole(role);
	}
};

export default newGuild;
