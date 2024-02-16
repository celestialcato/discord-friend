import { Guild } from "discord.js";
import guilds from "../schema/guilds";
import logger from "./logger";

const addGuildToDb = async (guild: Guild) => {
	const newGuild = new guilds({
		guild_id: guild.id,
	});
	await newGuild
		.save()
		.then(() => {
			logger.debug(
				`➕ added guild ${guild.id} to database`,
				"addguild-ok"
			);
		})
		.catch(e => {
			logger.error(
				`❌ couldn't add guild ${guild.id} to database: ${e}`,
				"addguild-fail"
			);
			return null;
		});
	return newGuild;
};

export default addGuildToDb;
