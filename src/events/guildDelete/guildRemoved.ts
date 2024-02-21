import { CommandKit } from "commandkit";
import { Client, Guild } from "discord.js";
import findOrCreateGuild from "../../utilities/findOrCreateGuild";
import logger from "../../utilities/logger";
import { removed_guilds } from "../../schema/guilds";

const guildRemoved = async (
	g: Guild,
	client: Client<true>,
	handler: CommandKit
) => {
	const { foundGuild } = await findOrCreateGuild(g);
	if (!foundGuild) {
		return;
	}

	try {
		await removed_guilds.create(foundGuild.toObject());
		await foundGuild.deleteOne();
		logger.docs(
			`➕ moved guild ${g.id} / ${g.name} to deleted guilds`,
			"deleteguild-ok"
		);
	} catch (error) {
		logger.error(
			`❌ couldn't move guild ${g.id} / ${g.name} to deleted guilds : ${error}`,
			"deleteguild-fail"
		);
	}
};

export default guildRemoved;
