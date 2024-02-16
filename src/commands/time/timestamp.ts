import { SlashCommandBuilder } from "discord.js";
import { SlashCommandProps, CommandOptions } from "commandkit";

import moment = require("moment-timezone");

import findOrCreateUser from "../../utilities/findOrCreateUser";

import logger from "../../utilities/logger";

export const data = new SlashCommandBuilder()
	.setName("timestamp")
	.setDescription("send timestamps using this command")
	.addIntegerOption(option =>
		option
			.setName("hour")
			.setDescription("what hour should the timestamp point to?")
			.setMinValue(0)
			.setMaxValue(23)
			.setRequired(true)
	)
	.addIntegerOption(option =>
		option
			.setName("minute")
			.setDescription("what minute should the timestamp point to?")
			.setMinValue(0)
			.setMaxValue(59)
			.setRequired(true)
	)
	.addStringOption(option =>
		option
			.setName("style")
			.setDescription("the style of the timestamp")
			.setRequired(false)
			.addChoices(
				{ name: "short date time", value: "f" },
				{ name: "long date time", value: "F" },
				{ name: "short date", value: "d" },
				{ name: "long date", value: "D" },
				{ name: "short time", value: "t" },
				{ name: "long time", value: "T" },
				{ name: "relative time", value: "R" }
			)
	)
	.addIntegerOption(option =>
		option
			.setName("day")
			.setDescription("the day you want the timestamp to point to")
			.setRequired(false)
			.setMinValue(1)
			.setMaxValue(31)
	)
	.addIntegerOption(option =>
		option
			.setName("month")
			.setDescription("the month you want the timestamp to point to")
			.setRequired(false)
			.addChoices(
				{
					name: "January",
					value: 1,
				},
				{
					name: "February",
					value: 2,
				},
				{
					name: "March",
					value: 3,
				},
				{
					name: "April",
					value: 4,
				},
				{
					name: "May",
					value: 5,
				},
				{
					name: "June",
					value: 6,
				},
				{
					name: "July",
					value: 7,
				},
				{
					name: "August",
					value: 8,
				},
				{
					name: "September",
					value: 9,
				},
				{
					name: "October",
					value: 10,
				},
				{
					name: "November",
					value: 11,
				},
				{
					name: "December",
					value: 12,
				}
			)
	)
	.addIntegerOption(option =>
		option
			.setName("year")
			.setDescription("the year you want the timestamp to point to")
			.setRequired(false)
			.setMinValue(1970)
	);

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply();
		const { foundUser } = await findOrCreateUser(interaction.user);

		if (!foundUser) {
			return;
		}

		if (!foundUser.user_timezone) {
			interaction.editReply("you haven't set your timezone yet!");
		}

		const hour = interaction.options.getInteger("hour");
		const minute = interaction.options.getInteger("minute");

		if (hour === null || minute === null) {
			return;
		}

		const day = interaction.options.getInteger("day");
		const month = interaction.options.getInteger("month");
		const year = interaction.options.getInteger("year");

		if (
			(day && (!month || !year)) ||
			(month && (!day || !year)) ||
			(year && (!day || !month))
		) {
			interaction.editReply("insufficient data provided for date");
			return;
		}

		const style = interaction.options.getString("style") || "f";

		try {
			let date: moment.Moment;
			if (day && month && year) {
				date = moment.tz(
					{
						year: year,
						month: month - 1,
						day: day,
						hour: hour,
						minute: minute,
					},
					foundUser.user_timezone
				);
				console.log(month);
			} else {
				date = moment.tz({ hour, minute }, foundUser.user_timezone);
			}
			const timestamp = date.unix();
			await interaction.editReply(`<t:${timestamp}:${style}>`);
		} catch (error) {
			await interaction.editReply("invalid data!");
		}
	} catch (error) {
		logger.error(
			`❌ using timestamp command failed : ${error}`,
			"cmdtimestamp-fail"
		);
	}
};

export const options: CommandOptions = {
	deleted: false,
};
