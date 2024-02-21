import { Schema, model, Document } from "mongoose";
import { IChannel } from "./channels";

export const GuildPaths = {
	slurs_channel: "slurs_channel",
	vent_channel: "vent_channel",
};

export interface IGuild extends Document {
	guild_id: string;
	guild_name: string;
	guild_icon: string | null;
	joining_date: Date;
	vent_active: boolean;
	vent_channel: IChannel["_id"];
	slurs_active: boolean;
	slurs_channel: IChannel["_id"];
	slurs_interval: number;
	last_hitler_mention: Date;
}

export const guildsSchema = new Schema<IGuild>({
	guild_id: {
		type: String,
		required: true,
	},
	guild_name: {
		type: String,
	},
	guild_icon: {
		type: String,
	},
	joining_date: {
		type: Date,
	},
	vent_active: {
		type: Boolean,
		default: false,
	},
	vent_channel: {
		type: Schema.Types.ObjectId,
		ref: "channels",
		required: false,
	},
	slurs_active: {
		type: Boolean,
		required: true,
		default: false,
	},
	slurs_channel: {
		type: Schema.Types.ObjectId,
		ref: "channels",
		required: false,
	},
	slurs_interval: {
		type: Number,
		default: 24,
	},
	last_hitler_mention: {
		type: Date,
	},
});

export const removed_guilds = model<IGuild>("removed_guilds", guildsSchema);

export default model<IGuild>("guilds", guildsSchema);
