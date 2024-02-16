import { Document, Schema, model } from "mongoose";

export interface IQuote extends Document {
	quote: string;
	tag: string;
}

export const quotesSchema = new Schema<IQuote>({
	quote: {
		type: String,
		required: true,
	},
	tag: {
		type: String,
		required: true,
	},
});

export default model<IQuote>("quotes", quotesSchema);
