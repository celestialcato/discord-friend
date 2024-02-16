import { CommandOptions, ContextMenuCommandProps } from "commandkit";
import {
	ApplicationCommandType,
	ContextMenuCommandBuilder,
	MessageContextMenuCommandInteraction,
} from "discord.js";

import polls from "../../schema/polls";

import closePoll from "../../utilities/closePoll";
import { removePollJob } from "../../events/ready/loadPolls";

import logger from "../../utilities/logger";

export const data = new ContextMenuCommandBuilder()
	.setName("close poll")
	.setDMPermission(false)
	.setType(ApplicationCommandType.Message);

export const run = async ({
	interaction,
	client,
	handler,
}: ContextMenuCommandProps) => {
	try {
		if (!interaction.isMessageContextMenuCommand()) {
			return;
		}

		await interaction.deferReply({ ephemeral: true });

		const mi = interaction as MessageContextMenuCommandInteraction;
		const foundPoll = await polls.findOne({
			poll_message_id: mi.targetMessage.id,
		});

		if (!foundPoll) {
			await interaction.editReply("this message isn't a poll!");
			return;
		}

		if (!foundPoll.is_active) {
			await interaction.editReply("this poll was already closed!");
			return;
		}

		if (foundPoll.closing_date) {
			removePollJob(foundPoll);
		}

		closePoll(client, foundPoll);

		await interaction.editReply("poll was closed!");
	} catch (error) {
		logger.error(
			`❌ failed to close poll using context menu commands : ${error}`,
			"pollclosecontextcmd-fail"
		);
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	userPermissions: ["AddReactions"],
	deleted: false,
};
