import { Schema, model, Document } from "mongoose";
import { IGuild } from "./guilds";

export const ChannelPaths = {
	guild: "guild",
};

export interface IChannel extends Document {
	channel_id: string;
	channel_name: String;
	date_added: Date;
	guild: IGuild["_id"];
	type: string;
}

export const channelsSchema = new Schema<IChannel>({
	channel_id: {
		type: String,
		required: true,
	},
	channel_name: {
		type: String,
		required: true,
	},
	date_added: {
		type: Date,
		default: Date.now,
	},
	guild: {
		type: Schema.Types.ObjectId,
		ref: "guilds",
		required: true,
	},
	type: {
		type: String,
		required: true,
	},
});

export default model<IChannel>("channels", channelsSchema);
