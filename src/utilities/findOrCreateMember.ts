import { Guild, User } from "discord.js";
import findOrCreateUser from "./findOrCreateUser";
import findOrCreateGuild from "./findOrCreateGuild";
import { IGuild } from "../schema/guilds";
import addMember from "./addMemberToDb";
import members from "../schema/members";
import addMemberToDb from "./addMemberToDb";

const findOrCreateMember = async (u: User, g: Guild, dontadd?: boolean) => {
	const { foundUser, isNew: isUserNew } = await findOrCreateUser(u);
	const { foundGuild, isNew: isGuildNew } = await findOrCreateGuild(g);

	let isNew = false;
	let exists = true;

	let foundMember = await members.findOne({
		guild: foundGuild._id,
		user: foundUser._id,
	});

	if (!foundMember && !dontadd) {
		foundMember = await addMemberToDb(foundUser, foundGuild);
		isNew = true;
	} else if (!foundMember && dontadd) {
		exists = false;
	}

	return { foundMember, isNew, exists };
};

export default findOrCreateMember;
