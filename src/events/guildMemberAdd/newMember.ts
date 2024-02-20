import { CommandKit } from "commandkit";
import { Client, GuildMember } from "discord.js";
import { findOrCreateMemberM } from "../../utilities/findOrCreateMember";

const newMember = async (
	m: GuildMember,
	client: Client<true>,
	handler: CommandKit
) => {
	if (m.user.bot) {
		return;
	}
	await findOrCreateMemberM(m);
};

export default newMember;
