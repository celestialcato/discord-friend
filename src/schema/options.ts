import { Document, Schema, model } from "mongoose";
import { IUser } from "./users";
import { IPoll } from "./polls";

export const OptionPaths = {
	option_poll: "option_poll",
	option_participants: "option_participants",
};

export interface IOption extends Document {
	option_id: string;
	option_poll: IPoll["_id"];
	option_votes: number;
	option_text: string;
	button_id: string;
	option_participants: IUser["_id"][];
}

export const optionsSchema = new Schema<IOption>({
	option_id: {
		type: String,
		required: true,
	},
	option_poll: {
		type: Schema.Types.ObjectId,
		ref: "polls",
	},
	option_votes: {
		type: Number,
		default: 0,
	},
	option_text: {
		type: String,
		required: false,
	},
	button_id: {
		type: String,
	},
	option_participants: [
		{
			type: Schema.Types.ObjectId,
			ref: "users",
		},
	],
});

export default model<IOption>("options", optionsSchema);
