import { Guild } from "discord.js";

import findOrCreateGuild from "./findOrCreateGuild";
import members from "../schema/members";

export const getUserCount = async (g: Guild) => {
	const { foundGuild } = await findOrCreateGuild(g);
	if (!foundGuild) {
		return 0;
	}

	const userCount = await members.countDocuments({ guild: foundGuild._id });

	return userCount;
};
