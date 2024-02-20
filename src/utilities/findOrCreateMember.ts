import { Guild, GuildMember, User } from "discord.js";
import findOrCreateUser from "./findOrCreateUser";
import findOrCreateGuild from "./findOrCreateGuild";
import { IGuild } from "../schema/guilds";
import addMember from "./addMemberToDb";
import members from "../schema/members";
import addMemberToDb from "./addMemberToDb";

export const findOrCreateMemberUG = async (
	u: User,
	g: Guild,
	dontadd?: boolean
) => {
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

export const findOrCreateMemberM = async (
	m: GuildMember,
	dontadd?: boolean
) => {
	const { foundUser, isNew: isUserNew } = await findOrCreateUser(m.user);
	const { foundGuild, isNew: isGuildNew } = await findOrCreateGuild(m.guild);

	let isNew = false;
	let exists = true;

	let foundMember = await members.findOne({
		guild: foundGuild._id,
		user: foundUser._id,
	});

	if (!foundMember && !dontadd) {
		foundMember = await addMemberToDb(
			foundUser,
			foundGuild,
			m.displayName,
			m.displayAvatarURL()
		);
		isNew = true;
	} else if (!foundMember && dontadd) {
		exists = false;
	}

	return { foundMember, isNew, exists };
};
