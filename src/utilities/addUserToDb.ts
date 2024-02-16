import { User } from "discord.js";

import user from "../schema/users";

import logger from "./logger";

const addUserToDb = async (u: User) => {
	const newUser = new user({
		user_id: u.id,
		user_username: u.username,
		user_profile_picture: u.displayAvatarURL(),
	});

	await newUser
		.save()
		.then(() => {
			logger.debug(`➕ added user ${u.id} to database`, "adduser-ok");
		})
		.catch(e => {
			logger.error(
				`❌ couldn't add user ${u.id} to database: ${e}`,
				"adduser-fail"
			);
			return null;
		});

	return newUser;
};

export default addUserToDb;
