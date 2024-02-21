import { Role } from "discord.js";
import findOrCreateGuild from "./findOrCreateGuild";
import roles from "../schema/roles";
import addRoleToDb from "./addRoleToDb";

const findOrCreateRole = async (r: Role, dontadd?: boolean) => {
	if (r.name === "@everyone") {
		return { foundRole: null, isNew: false };
	}
	const { foundGuild } = await findOrCreateGuild(r.guild);

	if (!foundGuild) {
		return { foundRole: null, isNew: false };
	}

	let isNew = false;

	let foundRole = await roles.findOne({
		role_guild: foundGuild._id,
		role_id: r.id,
	});

	if (!foundRole && !dontadd) {
		foundRole = await addRoleToDb(r, foundGuild);
		isNew = true;
	}

	return { foundRole, isNew };
};

export default findOrCreateRole;
