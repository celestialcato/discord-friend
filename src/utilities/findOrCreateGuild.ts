import { Guild } from "discord.js";
import guildInfo from "../schema/guilds";
import addGuildToDb from "./addGuildToDb";

const findOrCreateGuild = async (g: Guild) => {
	let isNew = false;
	let foundGuild = await guildInfo.findOne({
		guild_id: g.id,
	});
	if (!foundGuild) {
		foundGuild = await addGuildToDb(g);
		isNew = true;
	}
	return { foundGuild, isNew };
};

export default findOrCreateGuild;
