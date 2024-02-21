import { CommandKit } from "commandkit";
import { Client, GuildMember } from "discord.js";
import { findOrCreateMemberM } from "../../utilities/findOrCreateMember";
import logger from "../../utilities/logger";
import findOrCreateRole from "../../utilities/findOrCreateRole";

const memberUpdated = async (
	old_m: GuildMember,
	new_m: GuildMember,
	client: Client<true>,
	handler: CommandKit
) => {
	if (new_m.user.bot) {
		return;
	}

	const { foundMember, foundUser, isNew } = await findOrCreateMemberM(new_m);
	if (!foundMember || isNew) {
		return;
	}

	foundMember.nickname = new_m.displayName;
	foundMember.guild_profile_picture = new_m.displayAvatarURL();

	foundUser.user_display_name = new_m.user.displayName;
	foundUser.user_username = new_m.user.username;
	foundUser.user_profile_picture = new_m.user.displayAvatarURL();

	const rolesCollection = new_m.roles.cache;
	const roles = [...rolesCollection.values()];

	foundMember.member_roles = [];

	for (const role of roles) {
		const { foundRole } = await findOrCreateRole(role);
		if (!foundRole) {
			continue;
		}
		foundMember.member_roles.push(foundRole._id);
	}

	await Promise.all([foundUser.save(), foundMember.save()])
		.then(() => {
			logger.docs(
				`🖊️ updated member ${new_m.user.id} / ${new_m.user.username} in guild ${new_m.guild.id} / ${new_m.guild.name}`,
				"updatemember-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't update member ${new_m.user.id} / ${new_m.user.username} in guild ${new_m.guild.id} / ${new_m.guild.name} : ${error}`,
				"updatemember-fail"
			);
			return;
		});
};

export default memberUpdated;
