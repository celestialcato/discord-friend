import { APIEmbedField, EmbedBuilder } from "discord.js";

import { ProgressBar } from "@yetnt/progressbar";

import { IOption } from "../schema/options";
import { IPoll } from "../schema/polls";
import { IUser } from "../schema/users";

import { PROGRESS_BAR_SIZE } from "../constants/sizes";

const getPrecentage = (p: IPoll, o: IOption) => {
	if (p.total_votes === 0) {
		return 0;
	}
	return (o.option_votes / p.total_votes) * 100;
};

const getProgressBar = (n: number) => {
	const progressBar = new ProgressBar(n, PROGRESS_BAR_SIZE, "▢", "▧");
	return progressBar.bar.toString();
};

const truncateString = (inp: string, maxSize: number) => {
	if (inp === "\u200b") {
		return inp;
	}
	if (inp.length > maxSize) {
		return inp.substring(0, 1021) + "...";
	} else {
		return inp.substring(0, inp.length - 2);
	}
};

const generatePollEmbed = (
	poll: IPoll,
	options: IOption[],
	update: boolean
) => {
	const embed = new EmbedBuilder()
		.setAuthor({ name: "poll", iconURL: "attachment://poll.png" })
		.setTitle(poll.poll_question)
		.setColor(0x9547e9)
		.setThumbnail("attachment://vote.png");
	if (poll.poll_type === "rsvp") {
		let participantsString = "📝 Participants: \n";
		if (update) {
			const participants = options[0].option_participants as IUser[];
			for (const u of participants) {
				participantsString += `${u.user_username}, `;
			}
		}
		embed.setDescription(truncateString(participantsString, 4096));
	} else if (
		poll.poll_type === "multiple_choices" ||
		poll.poll_type === "yesno"
	) {
		const fields: APIEmbedField[] = [];
		for (let i = 0; i < options.length; i++) {
			const p = getPrecentage(poll, options[i]);
			fields.push({
				name: `${options[i].option_text} : ${p}%`,
				value: getProgressBar(p),
			});
			if (!poll.is_anonymous) {
				let participantsString = "";
				if (update) {
					const participants = options[i]
						.option_participants as IUser[];
					if (participants.length === 0) {
						participantsString = "\u200b";
					} else {
						for (const u of participants) {
							participantsString += `${u.user_username}, `;
						}
					}
				} else {
					participantsString = "\u200b";
				}
				fields.push({
					name: "📝 Participants: ",
					value: truncateString(participantsString, 1024),
				});
			}
		}
		embed.addFields(...fields);
	}

	return embed;
};

export default generatePollEmbed;
