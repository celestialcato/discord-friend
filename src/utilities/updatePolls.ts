import { Message } from "discord.js";
import { IPoll, PollPaths } from "../schema/polls";
import { IOption, OptionPaths } from "../schema/options";
import logger from "./logger";
import generatePollEmbed from "./generatePollEmbed";

const updatePolls = async (msg: Message, poll: IPoll) => {
	try {
		await poll.populate([
			{ path: PollPaths.poll_options },
			{
				path: PollPaths.poll_options,
				populate: { path: OptionPaths.option_participants },
			},
		]);

		const options = poll.poll_options as IOption[];

		const embed = generatePollEmbed(poll, options, true);

		await msg.edit({ embeds: [embed] });

		logger.debug(
			`🔃 updated poll results for poll ${poll.poll_id}`,
			"pollupdate-ok"
		);
	} catch (error) {
		logger.error(
			`❌ couldn't update poll results for poll ${poll.poll_id} : ${error}`,
			"pollupdate-fail"
		);
	}
};

export default updatePolls;
