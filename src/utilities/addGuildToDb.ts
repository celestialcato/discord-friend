import { Guild } from "discord.js";
import guilds from "../schema/guilds";
import logger from "./logger";

const addGuildToDb = async (guild: Guild) => {
	const newGuild = new guilds({
		guild_id: guild.id,
		guild_name: guild.name,
		joining_date: new Date(),
		guild_icon: guild.iconURL(),
	});
	await newGuild
		.save()
		.then(() => {
			logger.docs(
				`➕ added guild ${guild.id} / ${guild.name} to database`,
				"addguild-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't add guild ${guild.id} / ${guild.name} to database: ${error}`,
				"addguild-fail"
			);
			return null;
		});
	return newGuild;
};

export default addGuildToDb;
