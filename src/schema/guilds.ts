import { Schema, model, Document } from "mongoose";

export interface IGuild extends Document {
	guild_id: string;
	last_hitler_mention: Date;
	daily_slur: boolean;
	daily_slur_channel: string;
	anon_vent: boolean;
	vent_channel: string;
}

export const guildsSchema = new Schema<IGuild>({
	guild_id: {
		type: String,
		required: true,
	},
	last_hitler_mention: {
		type: Date,
	},
	daily_slur: {
		type: Boolean,
		required: true,
		default: false,
	},
	daily_slur_channel: {
		type: String,
		required: false,
	},
	anon_vent: {
		type: Boolean,
		default: false,
	},
	vent_channel: {
		type: String,
		required: false,
	},
});

export default model<IGuild>("guilds", guildsSchema);
