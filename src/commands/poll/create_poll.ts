import * as path from "path";

import {
	ActionRowBuilder,
	AttachmentBuilder,
	ButtonStyle,
	CacheType,
	ChatInputCommandInteraction,
	EmbedBuilder,
	SlashCommandBuilder,
} from "discord.js";
import { ButtonKit, CommandOptions, SlashCommandProps } from "commandkit";

import polls, { IPoll } from "../../schema/polls";
import pollOptions, { IOption } from "../../schema/options";

import findOrCreateUser from "../../utilities/findOrCreateUser";
import findOrCreateGuild from "../../utilities/findOrCreateGuild";

import logger from "../../utilities/logger";

import { addPollJob } from "../../events/ready/loadPolls";

import generatePollEmbed from "../../utilities/generatePollEmbed";

const calculateDate = (
	days: number | null,
	hours: number | null,
	minutes: number | null
) => {
	if (days === null && hours === null && minutes === null) {
		return null;
	}
	let date = new Date();
	if (days) {
		date.setDate(date.getDate() + days);
	}
	if (hours) {
		date.setHours(date.getHours() + hours);
	}
	if (minutes) {
		date.setMinutes(date.getMinutes() + minutes);
	}
	return date;
};

const generateButtons = async (poll: IPoll, options: IOption[]) => {
	let buttons: ButtonKit[] = [];
	for (let i = 0; i < options.length; i++) {
		const id = `pollbutton_${poll.poll_id}_b${i}`;
		options[i].button_id = id;
		options[i].option_poll = poll._id;
		const b = new ButtonKit()
			.setLabel(options[i].option_text)
			.setStyle(ButtonStyle.Primary)
			.setCustomId(id);
		buttons.push(b);
	}
	const promises = options.map(option => option.save());
	await Promise.all(promises)
		.then(() => {
			logger.docs(
				`➕ added button ids for poll ${poll.poll_id}`,
				"polloptionsbuttonadd-ok"
			);
		})
		.catch(e => {
			logger.error(
				`❌ failed to add button ids for poll ${poll.poll_id}: ${e}`,
				"polloptionsbuttonadd-fail"
			);
		});
	return buttons;
};

const generateRow = (buttons: ButtonKit[]) => {
	const row = new ActionRowBuilder<ButtonKit>();
	row.addComponents(buttons);
	return row;
};

const sendPoll = async (
	interaction: ChatInputCommandInteraction<CacheType>,
	row: ActionRowBuilder<ButtonKit>,
	embed: EmbedBuilder
) => {
	const authorIcon = new AttachmentBuilder(
		path.join(
			__dirname,
			"..",
			"..",
			"..",
			"assets",
			"authoricon",
			"poll.png"
		)
	);

	const thumbnail = new AttachmentBuilder(
		path.join(
			__dirname,
			"..",
			"..",
			"..",
			"assets",
			"thumbnails",
			"vote.png"
		)
	);

	await interaction.editReply({
		embeds: [embed],
		components: [row],
		files: [authorIcon, thumbnail],
	});
	const sentPoll = await interaction.fetchReply();
	return sentPoll.id;
};

export const data = new SlashCommandBuilder()
	.setName("create_poll")
	.setDescription("create polls")
	.setDMPermission(false)
	.setDMPermission(false)
	.addSubcommand(command =>
		command
			.setName("yesno")
			.setDescription("yes / no question")
			.addStringOption(option =>
				option
					.setName("question")
					.setDescription("the question you want to ask")
					.setRequired(true)
					.setMinLength(1)
			)
			.addBooleanOption(option =>
				option
					.setName("anonymous")
					.setDescription("make the poll results anonymous")
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("minutes")
					.setDescription(
						"how many minutes should the poll remain open?"
					)
					.setMinValue(1)
					.setMaxValue(59)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("hours")
					.setDescription(
						"how many hours should the poll remain open?"
					)
					.setMinValue(1)
					.setMaxValue(23)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("days")
					.setDescription(
						"how many days should the poll remain open?"
					)
					.setMinValue(1)
					.setRequired(false)
			)
	)
	.addSubcommand(command =>
		command
			.setName("multiple_choices")
			.setDescription("multiple choice question")
			.addStringOption(option =>
				option
					.setName("question")
					.setDescription("the question you want to ask")
					.setRequired(true)
					.setMinLength(1)
			)
			.addStringOption(option =>
				option
					.setName("option_1")
					.setDescription("first option")
					.setRequired(true)
					.setMinLength(1)
			)
			.addStringOption(option =>
				option
					.setName("option_2")
					.setDescription("second option")
					.setRequired(true)
					.setMinLength(1)
			)
			.addStringOption(option =>
				option
					.setName("option_3")
					.setDescription("third option")
					.setRequired(false)
					.setMinLength(1)
			)
			.addStringOption(option =>
				option
					.setName("option_4")
					.setDescription("fourth option")
					.setRequired(false)
					.setMinLength(1)
			)
			.addStringOption(option =>
				option
					.setName("option_5")
					.setDescription("fifth option")
					.setRequired(false)
					.setMinLength(1)
			)
			.addBooleanOption(option =>
				option
					.setName("anonymous")
					.setDescription("make the poll results anonymous")
					.setRequired(false)
			)
			.addBooleanOption(option =>
				option
					.setName("mutlichoice")
					.setDescription(
						"let users select multiple choices at the same time"
					)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("minutes")
					.setDescription(
						"how many minutes should the poll remain open?"
					)
					.setMinValue(1)
					.setMaxValue(59)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("hours")
					.setDescription(
						"how many hours should the poll remain open?"
					)
					.setMinValue(1)
					.setMaxValue(23)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("days")
					.setDescription(
						"how many days should the poll remain open?"
					)
					.setMinValue(1)
					.setRequired(false)
			)
	)
	.addSubcommand(command =>
		command
			.setName("rsvp")
			.setDescription(
				"send an invitation to see how many people will sign up"
			)
			.addStringOption(option =>
				option
					.setName("invitation")
					.setDescription("the text for the invitation")
					.setRequired(true)
					.setMinLength(1)
			)
			.addIntegerOption(option =>
				option
					.setName("minutes")
					.setDescription(
						"how many minutes should the poll remain open?"
					)
					.setMinValue(1)
					.setMaxValue(59)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("hours")
					.setDescription(
						"how many hours should the poll remain open?"
					)
					.setMinValue(1)
					.setMaxValue(23)
					.setRequired(false)
			)
			.addIntegerOption(option =>
				option
					.setName("days")
					.setDescription(
						"how many days should the poll remain open?"
					)
					.setMinValue(1)
					.setRequired(false)
			)
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		if (!interaction.guild) {
			return;
		}

		await interaction.deferReply();

		const type = interaction.options.getSubcommand();

		if (!type) {
			return;
		}

		const { foundUser } = await findOrCreateUser(interaction.user);

		if (!foundUser) {
			return;
		}

		const { foundGuild } = await findOrCreateGuild(interaction.guild);

		if (!foundGuild) {
			return;
		}

		const question = interaction.options.getString("question");

		const invitation = interaction.options.getString("invitation");

		const option_1 = interaction.options.getString("option_1");
		const option_2 = interaction.options.getString("option_2");
		const option_3 = interaction.options.getString("option_3");
		const option_4 = interaction.options.getString("option_4");
		const option_5 = interaction.options.getString("option_5");

		const isAnonymous = interaction.options.getBoolean("anonymous");
		const isMultiChoice = interaction.options.getBoolean("mutlichoice");

		const minutes = interaction.options.getInteger("minutes");
		const hours = interaction.options.getInteger("hours");
		const days = interaction.options.getInteger("days");

		const closingDate = calculateDate(days, hours, minutes);

		if (type === "yesno" && !question) {
			return;
		}
		if (
			type === "multiple_choices" &&
			(!option_1 ||
				!option_2 ||
				(option_4 && !option_3) ||
				(option_5 && !option_4 && !option_3))
		) {
			return;
		}
		if (type === "rsvp" && !invitation) {
			return;
		}

		const newPoll = new polls();
		newPoll.poll_type = type;
		newPoll.poll_id = interaction.id;
		newPoll.poll_channel_id = interaction.channelId;
		newPoll.poll_creator = foundUser._id;
		newPoll.poll_guild = foundGuild._id;
		newPoll.is_anonymous = isAnonymous ? isAnonymous : false;
		newPoll.is_multichoice = isMultiChoice ? isMultiChoice : false;
		newPoll.poll_question =
			type === "rsvp" ? invitation || "" : question || "";
		if (closingDate) {
			newPoll.closing_date = closingDate;
		}

		await newPoll
			.save()
			.then(() => {
				logger.docs(
					`➕ created a new ${type} poll in guild ${foundGuild.id} by user ${foundUser.id}`,
					`poll${type}-ok`
				);
			})
			.catch(e => {
				logger.error(
					`❌ failed to create a new ${type} poll in guild ${foundGuild.id} by user ${foundUser.id} : ${e}`,
					`poll${type}-fail`
				);
				return;
			});

		let embed: EmbedBuilder;
		let buttons: ButtonKit[] = [];
		let row: ActionRowBuilder<ButtonKit>;

		let optionArr: IOption[] = [];

		if (type === "yesno") {
			const yesOption = new pollOptions();
			yesOption.option_id = `${interaction.id}_yes`;
			yesOption.option_text = "yes";
			const noOption = new pollOptions();
			noOption.option_id = `${interaction.id}_no`;
			noOption.option_text = "no";

			optionArr.push(yesOption, noOption);
		} else if (type === "multiple_choices") {
			const firstOption = new pollOptions();
			firstOption.option_id = `${interaction.id}_option1`;
			firstOption.option_text = option_1 || "";
			const secondOption = new pollOptions();
			secondOption.option_id = `${interaction.id}_option2`;
			secondOption.option_text = option_2 || "";

			optionArr.push(firstOption, secondOption);

			if (option_3) {
				const thirdOption = new pollOptions();
				thirdOption.option_id = `${interaction.id}_option3`;
				thirdOption.option_text = option_3;
				optionArr.push(thirdOption);
			}

			if (option_4) {
				const fourthOption = new pollOptions();
				fourthOption.option_id = `${interaction.id}_option4`;
				fourthOption.option_text = option_4;
				optionArr.push(fourthOption);
			}

			if (option_5) {
				const fifthOption = new pollOptions();
				fifthOption.option_id = `${interaction.id}_option5`;
				fifthOption.option_text = option_5;
				optionArr.push(fifthOption);
			}
		} else if (type === "rsvp") {
			const op = new pollOptions();
			op.option_id = `${interaction.id}_option1`;
			op.option_text = "I'm in!";
			optionArr.push(op);
		}

		const promisesArr = optionArr.map(option => option.save());

		await Promise.all(promisesArr)
			.then(() => {
				logger.docs(
					`➕ saved options for ${type} poll ${newPoll.poll_id}`,
					"polloptsave-ok"
				);
			})
			.catch(e => {
				logger.error(
					`❌ failed to save options for ${type} poll ${newPoll.poll_id} : ${e}`,
					"polloptsave-fail"
				);
				return;
			});

		newPoll.poll_options.push(...optionArr);

		await newPoll
			.save()
			.then(() => {
				logger.docs(
					`➕ added options to ${type} poll ${newPoll.poll_id}`,
					"polloptadd-ok"
				);
			})
			.catch(e => {
				logger.error(
					`❌ failed to add options to ${type} poll ${newPoll.poll_id} : ${e}`,
					"polloptadd-fail"
				);
				return;
			});

		buttons = await generateButtons(newPoll, optionArr);
		row = generateRow(buttons);
		embed = generatePollEmbed(newPoll, optionArr, false);

		try {
			const poll_message_id = await sendPoll(interaction, row, embed);
			newPoll.poll_message_id = poll_message_id;
			await newPoll.save();
			logger.docs(`✅ sent poll message for poll ${newPoll.poll_id}`);
			if (newPoll.closing_date) {
				addPollJob(client, newPoll);
			}
		} catch (error) {
			logger.error(
				`❌ failed to send poll message for poll ${newPoll.poll_id}: ${error}`,
				"pollmsg-fail"
			);
			const promisesArr = optionArr.map(option => option.deleteOne());
			await Promise.all([newPoll.deleteOne(), ...promisesArr]);
			interaction.editReply("couldn't create a new poll!");
		}
	} catch (error) {
		logger.error(
			`❌ using create_poll command failed : ${error}`,
			"cmdcreatepoll-fail"
		);
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	userPermissions: ["AddReactions"],
	deleted: false,
};
