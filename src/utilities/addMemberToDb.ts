import { Guild } from "discord.js";

import { IUser } from "../schema/users";
import findOrCreateGuild from "./findOrCreateGuild";

import logger from "./logger";
import { IGuild } from "../schema/guilds";
import members from "../schema/members";

const addMemberToDb = async (u: IUser, g: IGuild) => {
	const newMember = new members();
	newMember.user = u._id;
	newMember.guild = g._id;

	await newMember
		.save()
		.then(() => {
			logger.debug(
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
