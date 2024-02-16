import { Client } from "discord.js";
import { CommandKit } from "commandkit";
import logger from "../../utilities/logger";

const startup = (
	c: Client<true>,
	client: Client<true>,
	handler: CommandKit
) => {
	logger.info(
		`🚀 ${client?.user?.tag} successfully established connection to discord.`,
		"con-ok"
	);
};

export default startup;
