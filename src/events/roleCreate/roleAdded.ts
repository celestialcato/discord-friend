import { CommandKit } from "commandkit";
import { Client, Role } from "discord.js";
import findOrCreateRole from "../../utilities/findOrCreateRole";

const roleAdded = async (
	r: Role,
	client: Client<true>,
	handler: CommandKit
) => {
	await findOrCreateRole(r);
};

export default roleAdded;
