import { CommandKit } from "commandkit";
import { Client, Guild } from "discord.js";
import findOrCreateGuild from "../../utilities/findOrCreateGuild";
import logger from "../../utilities/logger";

const guildUpdated = async (
	old_g: Guild,
	new_g: Guild,
	client: Client<true>,
	handler: CommandKit
) => {
	const { foundGuild, isNew } = await findOrCreateGuild(new_g);
	if (!foundGuild || isNew) {
		return;
	}

	foundGuild.guild_name = new_g.name;
	foundGuild.guild_icon = new_g.iconURL();

	await foundGuild
		.save()
		.then(() => {
			logger.docs(
				`➕ updated guild ${new_g.id} / ${new_g.name}`,
				"updateguild-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't update guild ${new_g.id} / ${new_g.name}: ${error}`,
				"updateguild-fail"
			);
			return;
		});
};

export default guildUpdated;
