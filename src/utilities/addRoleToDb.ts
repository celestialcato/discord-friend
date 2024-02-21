import { Role } from "discord.js";

import roles from "../schema/roles";
import { IGuild } from "../schema/guilds";

import logger from "./logger";

const addRoleToDb = async (role: Role, guild: IGuild) => {
	const newRole = new roles({
		role_id: role.id,
		role_name: role.name,
		role_color: role.hexColor,
		role_guild: guild._id,
	});
	newRole
		.save()
		.then(() => {
			logger.docs(
				`➕ added add role ${role.id} / ${role.name} for ${guild.guild_id} / ${guild.guild_name} to database`,
				"addrole-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't add role ${role.id} / ${role.name} for ${guild.guild_id} / ${guild.guild_name} to database: ${error}`,
				"addrole-fail"
			);
			return null;
		});
	return newRole;
};

export default addRoleToDb;
