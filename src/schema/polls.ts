import { Document, Schema, model } from "mongoose";

import { IGuild } from "./guilds";
import { IUser } from "./users";
import { IOption } from "./options";

export const PollPaths = {
	poll_guild: "poll_guild",
	poll_creator: "poll_creator",
	poll_options: "poll_options",
};

export interface IPoll extends Document {
	poll_id: string;
	poll_message_id: string;
	poll_question: string;
	poll_type: string;
	is_active: boolean;
	poll_channel_id: string;
	poll_guild: IGuild["_id"];
	poll_creator: IUser["_id"];
	creation_date: Date;
	closing_date: Date;
	total_votes: number;
	is_anonymous: boolean;
	is_multichoice: boolean;
	poll_options: IOption["_id"][];
}

export const pollsSchema = new Schema<IPoll>({
	poll_id: {
		type: String,
		required: true,
	},
	poll_message_id: {
		type: String,
		required: false,
	},
	poll_question: {
		type: String,
		required: true,
	},
	poll_type: {
		type: String,
		required: true,
	},
	is_active: {
		type: Boolean,
		default: true,
		required: true,
	},
	poll_channel_id: {
		type: String,
		required: true,
	},
	poll_guild: {
		type: Schema.Types.ObjectId,
		ref: "guilds",
		required: true,
	},
	poll_creator: {
		type: Schema.Types.ObjectId,
		ref: "users",
		required: true,
	},
	creation_date: {
		type: Date,
		default: Date.now,
	},
	closing_date: {
		type: Date,
	},
	total_votes: {
		type: Number,
		default: 0,
	},
	is_anonymous: {
		type: Boolean,
		default: false,
	},
	is_multichoice: {
		type: Boolean,
		default: false,
	},
	poll_options: [
		{
			type: Schema.Types.ObjectId,
			ref: "options",
			required: true,
		},
	],
});

export default model<IPoll>("polls", pollsSchema);
