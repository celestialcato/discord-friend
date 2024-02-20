import { Guild } from "discord.js";

import { IUser } from "../schema/users";
import findOrCreateGuild from "./findOrCreateGuild";

import logger from "./logger";
import { IGuild } from "../schema/guilds";
import members from "../schema/members";

const addMemberToDb = async (
	u: IUser,
	g: IGuild,
	nickname?: string | null,
	guild_avatar?: string
) => {
	const newMember = new members();
	newMember.user = u._id;
	newMember.guild = g._id;
	if (nickname) {
		newMember.nickname = nickname;
	}
	if (guild_avatar) {
		newMember.guild_profile_picture = guild_avatar;
	}

	await newMember
		.save()
		.then(() => {
			logger.docs(
				`👤 added membership in guild ${g.id} for user ${u.user_id}`,
				"memberadd-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't add membership in guild ${g.id} for user ${u.user_id} : ${error}`,
				"memberadd-fail"
			);
		});

	return newMember;
};

export default addMemberToDb;
