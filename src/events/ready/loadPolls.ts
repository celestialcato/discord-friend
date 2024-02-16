import { Client } from "discord.js";
import { CommandKit } from "commandkit";

import { Job, scheduleJob } from "node-schedule";

import polls, { IPoll } from "../../schema/polls";

import logger from "../../utilities/logger";
import closePoll from "../../utilities/closePoll";

const ACTIVE_TASKS = new Map<string, Job>();

export const addPollJob = (c: Client, poll: IPoll) => {
	try {
		const job = scheduleJob(poll.closing_date, () => {
			closePoll(c, poll);
		});
		ACTIVE_TASKS.set(poll.poll_id, job);
		logger.debug(
			`⌛ added closing task for poll ${poll.poll_id}`,
			"polltask-ok"
		);
	} catch (error) {
		logger.error(
			`❌ couldn't add the closing task for poll ${poll.poll_id} : ${error}`,
			"polltask-fail"
		);
	}
};

export const removePollJob = (poll: IPoll) => {
	try {
		const job = ACTIVE_TASKS.get(poll.poll_id);
		if (job) {
			job.cancel();
			ACTIVE_TASKS.delete(poll.poll_id);
			logger.debug(
				`🗑️ removed closing task for poll ${poll.poll_id}`,
				"polltaskremove-ok"
			);
		}
	} catch (error) {
		logger.error(
			`❌ couldn't remove the closing task for poll ${poll.poll_id} : ${error}`,
			"polltask-fail"
		);
	}
};

const loadPolls = async (
	c: Client<true>,
	client: Client<true>,
	handler: CommandKit
) => {
	const activePollsWithTimer = await polls.find({
		is_active: true,
		closing_date: { $ne: null },
	});

	const now = new Date();

	for (const poll of activePollsWithTimer) {
		if (poll.closing_date > now) {
			addPollJob(c, poll);
		} else {
			closePoll(client, poll);
		}
	}
};

export default loadPolls;
