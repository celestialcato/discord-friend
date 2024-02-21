import { Client, Role } from "discord.js";
import { CommandKit } from "commandkit";

import findOrCreateRole from "../../utilities/findOrCreateRole";

import logger from "../../utilities/logger";

const roleRemoved = async (
	r: Role,
	client: Client<true>,
	handler: CommandKit
) => {
	const { foundRole } = await findOrCreateRole(r);
	if (!foundRole) {
		return;
	}

	await foundRole
		.deleteOne()
		.then(() => {
			logger.docs(
				`➖ removed role ${foundRole.role_id} / ${foundRole.role_name} from database`,
				"deleterole-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't remove role ${foundRole.role_id} / ${foundRole.role_name} from database: ${error}`,
				"deleterole-fail"
			);
			return;
		});
};

export default roleRemoved;
