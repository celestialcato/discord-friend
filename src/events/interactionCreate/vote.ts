import { CommandKit } from "commandkit";
import { ButtonInteraction, Client, Interaction } from "discord.js";

import options from "../../schema/options";
import { IPoll } from "../../schema/polls";

import findOrCreateUser from "../../utilities/findOrCreateUser";
import logger from "../../utilities/logger";
import { IUser } from "../../schema/users";
import updatePolls from "../../utilities/updatePolls";

const vote = async (
	interaction: Interaction,
	client: Client<true>,
	handler: CommandKit
) => {
	if (!interaction.isButton()) {
		return;
	}

	const bi = interaction as ButtonInteraction;

	if (!bi.customId.includes("pollbutton_")) {
		return;
	}

	const pollMsg = bi.message;

	try {
		const pollOption = await options
			.findOne({
				button_id: bi.customId,
			})
			.populate({
				path: "option_poll",
			})
			.populate({
				path: "option_participants",
			});

		if (!pollOption) {
			return;
		}

		const foundPoll = pollOption.option_poll as IPoll;

		if (!foundPoll) {
			return;
		}

		if (!foundPoll.is_active) {
			await bi.reply({
				ephemeral: true,
				content: "the poll was closed!",
			});
			return;
		}

		const { foundUser } = await findOrCreateUser(bi.user);

		if (!foundUser) {
			return;
		}

		const participantsInTheOption =
			pollOption.option_participants as IUser[];

		const votedForThisBefore = participantsInTheOption.find(
			participant => participant.user_id === foundUser.user_id
		);

		const otherVoted = await options.find({
			_id: { $ne: pollOption._id },
			option_poll: foundPoll._id,
			option_participants: { $in: [foundUser._id] },
		});

		if (votedForThisBefore) {
			if (
				!foundPoll.is_multichoice ||
				(otherVoted && otherVoted.length === 0)
			) {
				foundPoll.total_votes -= 1;
			}
			pollOption.option_votes -= 1;
			pollOption.option_participants =
				pollOption.option_participants.filter(
					participant => participant.user_id !== foundUser.user_id
				);

			await Promise.all([foundPoll.save(), pollOption.save()])
				.then(() => {
					logger.debug(
						`➕ removed vote from user ${foundUser.user_id} for poll ${foundPoll.poll_id}`,
						"voteremove-ok"
					);
				})
				.catch(error => {
					logger.debug(
						`❌ couldn't remove vote from user ${foundUser.user_id} for poll ${foundPoll.poll_id} : ${error}`,
						"voteremove-fail"
					);
				});

			await bi.reply({ ephemeral: true, content: "vote removed" });
			await updatePolls(pollMsg, foundPoll);

			return;
		}

		if (
			otherVoted &&
			otherVoted.length > 0 &&
			!foundPoll.is_multichoice &&
			foundPoll.poll_type !== "yesno" &&
			foundPoll.poll_type !== "rsvp"
		) {
			await bi.reply({
				ephemeral: true,
				content: "you can't vote for more than one option!",
			});
			return;
		}

		if (
			otherVoted &&
			otherVoted.length > 0 &&
			foundPoll.poll_type === "yesno"
		) {
			const otherOption = otherVoted[0];
			otherOption.option_votes -= 1;
			otherOption.option_participants =
				pollOption.option_participants.filter(
					participant => participant.user_id !== foundUser.user_id
				);

			await Promise.all([foundPoll.save(), otherOption.save()])
				.then(() => {
					logger.debug(
						`➕ removed vote from user ${foundUser.user_id} for poll ${foundPoll.poll_id}`,
						"voteremove-ok"
					);
				})
				.catch(error => {
					logger.debug(
						`❌ couldn't remove vote from user ${foundUser.user_id} for poll ${foundPoll.poll_id} : ${error}`,
						"voteremove-fail"
					);
				});
		}

		if (!otherVoted || otherVoted.length === 0) {
			foundPoll.total_votes += 1;
		}

		pollOption.option_votes += 1;
		pollOption.option_participants.push(foundUser._id);

		await Promise.all([foundPoll.save(), pollOption.save()])
			.then(() => {
				logger.debug(
					`➕ registered vote from user ${foundUser.user_id} for poll ${foundPoll.poll_id}`,
					"voteadd-ok"
				);
			})
			.catch(error => {
				logger.debug(
					`❌ couldn't register vote from user ${foundUser.user_id} for poll ${foundPoll.poll_id} : ${error}`,
					"voteadd-fail"
				);
			});

		await bi.reply({ ephemeral: true, content: "vote registered!" });

		await updatePolls(pollMsg, foundPoll);
	} catch (error) {
		logger.error(
			`❌ failed to handle a vote event : ${error}`,
			"voteevnt-fail"
		);
	}
};

export default vote;
