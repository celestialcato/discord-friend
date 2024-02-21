import { Schema, model } from "mongoose";
import { IGuild } from "./guilds";
import { IUser } from "./users";
import { IRole } from "./roles";

export const MemberPaths = {
	guild: "guild",
	user: "user",
	member_roles: "member_roles",
};

export interface IMember extends Document {
	guild: IGuild["_id"];
	user: IUser["_id"];
	n_word_count: number;
	date_joined: Date;
	nickname: string;
	guild_profile_picture: string;
	member_roles: IRole["_id"][];
}

export const membersSchema = new Schema<IMember>({
	guild: {
		type: Schema.Types.ObjectId,
		ref: "guilds",
		required: true,
	},
	user: {
		type: Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	n_word_count: {
		type: Number,
		default: 0,
	},
	date_joined: {
		type: Date,
		default: Date.now,
	},
	nickname: {
		type: String,
	},
	guild_profile_picture: {
		type: String,
	},
	member_roles: [
		{
			type: Schema.Types.ObjectId,
			ref: "roles",
		},
	],
});

export default model<IMember>("members", membersSchema);
