import { User } from "discord.js";
import user from "../schema/users";
import addUserToDb from "./addUserToDb";

const findOrCreateUser = async (u: User) => {
	let isNew = false;
	let foundUser = await user.findOne({
		user_id: u.id,
	});
	if (!foundUser) {
		foundUser = await addUserToDb(u);
		isNew = true;
	}
	return { foundUser, isNew };
};

export default findOrCreateUser;
