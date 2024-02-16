import { Schema, model } from "mongoose";
import { IGuild } from "./guilds";
import { IUser } from "./users";

export const MemberPaths = {
	guild: "guild",
	user: "user",
};

export interface IMember extends Document {
	guild: IGuild["_id"];
	user: IUser["_id"];
	n_word_count: number;
	date_joined: Date;
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
});

export default model<IMember>("members", membersSchema);
