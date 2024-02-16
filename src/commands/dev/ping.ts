import { CommandData, SlashCommandProps, CommandOptions } from "commandkit";

import logger from "../../utilities/logger";

export const data: CommandData = {
	name: "ping",
	description: "pings the bot",
};

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply();
		const reply = await interaction.fetchReply();
		const ping = reply.createdTimestamp - interaction.createdTimestamp;
		interaction.editReply(
			`🏓 ***Pong!*** Client ${ping} ms | Websocket: ${client.ws.ping} ms`
		);
	} catch (error) {
		logger.error(`❌ using ping command failed : ${error}`, "cmdping-fail");
	}
};

export const options: CommandOptions = {
	devOnly: true,
	userPermissions: ["Administrator"],
	botPermissions: ["AddReactions"],
	deleted: false,
};
