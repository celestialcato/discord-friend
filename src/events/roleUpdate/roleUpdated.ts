import { Client, Role } from "discord.js";
import { CommandKit } from "commandkit";

import findOrCreateRole from "../../utilities/findOrCreateRole";

import logger from "../../utilities/logger";

const roleUpdated = async (
	old_r: Role,
	new_r: Role,
	client: Client<true>,
	handler: CommandKit
) => {
	const { foundRole } = await findOrCreateRole(old_r);
	if (!foundRole) {
		return;
	}

	foundRole.role_color = new_r.hexColor;
	foundRole.role_name = new_r.name;

	await foundRole
		.save()
		.then(() => {
			logger.docs(
				`➖ updated role ${foundRole.role_id} / ${foundRole.role_name}`,
				"updaterole-ok"
			);
		})
		.catch(error => {
			logger.error(
				`❌ couldn't update role ${foundRole.role_id} / ${foundRole.role_name} : ${error}`,
				"updateroll-fail"
			);
			return;
		});
};

export default roleUpdated;
