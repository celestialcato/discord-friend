import { Schema, model, Document } from "mongoose";
import { IGuild } from "./guilds";

export const RolePaths = {
	role_guild: "role_guild",
};

export interface IRole extends Document {
	role_id: string;
	role_name: string;
	role_color: string;
	role_guild: IGuild["_id"];
}

export const rolesSchema = new Schema<IRole>({
	role_id: {
		required: true,
		type: String,
	},
	role_name: {
		required: true,
		type: String,
	},
	role_color: {
		required: true,
		type: String,
	},
	role_guild: {
		type: Schema.Types.ObjectId,
		ref: "guilds",
		required: true,
	},
});

export default model<IRole>("roles", rolesSchema);
