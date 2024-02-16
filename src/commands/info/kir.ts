import * as path from "path";
import axios from "axios";
import { SlashCommandProps, CommandOptions } from "commandkit";
import {
	EmbedBuilder,
	AttachmentBuilder,
	SlashCommandBuilder,
} from "discord.js";
import {
	coinApiAddress,
	dollarApiAddress,
	euroApiAddress,
} from "../../constants/apiEndpoints";
import logger from "../../utilities/logger";

interface ICurrency {
	"p": string;
	"h": string;
	"l": string;
	"d": string;
	"dp": string;
	"dt": string;
	"t": string;
	"t_en": string;
	"t-g": string;
	"ts": string;
}

export const data = new SlashCommandBuilder()
	.setName("kir")
	.setDescription("fetches the latest exchange rate for Iranian Rial")
	.addBooleanOption(option =>
		option
			.setName("toman")
			.setDescription("set to true if you want the value in toman")
			.setRequired(false)
	);

const fetchDollar = async () => {
	const response = await axios.get(dollarApiAddress);
	return response.data;
};

const fetchEuro = async () => {
	const response = await axios.get(euroApiAddress);
	return response.data;
};

const fetchCoin = async () => {
	const response = await axios.get(coinApiAddress);
	return response.data;
};

export const run = async ({
	interaction,
	client,
	handler,
}: SlashCommandProps) => {
	try {
		await interaction.deferReply();

		let isToman = false;

		const option = interaction.options.getBoolean("toman");

		if (option && option === true) {
			isToman = true;
		}

		try {
			Promise.all([fetchDollar(), fetchEuro(), fetchCoin()]).then(
				(values: ICurrency[]) => {
					const authorIcon = new AttachmentBuilder(
						path.join(
							__dirname,
							"..",
							"..",
							"..",
							"assets",
							"authoricon",
							"kir.png"
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
							"rial.png"
						)
					);

					const last_update = new Date(values[0]["ts"]);

					let dollar_val = Number(values[0]["h"].replaceAll(",", ""));
					let euro_val = Number(values[1]["h"].replaceAll(",", ""));
					let coin_val = Number(values[2]["h"].replaceAll(",", ""));

					if (isToman) {
						dollar_val /= 10;
						euro_val /= 10;
						coin_val /= 10;
					}

					const embed = new EmbedBuilder()
						.setAuthor({
							name: "currency exchange rate",
							iconURL: "attachment://kir.png",
						})
						.setColor(0xc56528)
						.setDescription(
							`last updated on:\n${last_update.toLocaleString(
								"en-CA"
							)}\n${last_update.toLocaleString("fa-IR")}`
						)
						.setThumbnail("attachment://rial.png")
						.addFields(
							{
								name: "💵 US Dollar",
								value: `💩 ${dollar_val.toLocaleString(
									"en-US"
								)} ${isToman ? "Toman" : "Riāl"}`,
								inline: true,
							},
							{
								name: "💶 Euros",
								value: `💩 ${euro_val.toLocaleString(
									"en-US"
								)} ${isToman ? "Toman" : "Riāl"}`,
								inline: true,
							},
							{
								name: "🪙 Emāmi Coin",
								value: `💩 ${coin_val.toLocaleString(
									"en-US"
								)} ${isToman ? "Toman" : "Riāl"}`,
								inline: true,
							}
						);

					interaction.editReply({
						embeds: [embed],
						files: [authorIcon, thumbnail],
					});
				}
			);
		} catch (error) {
			interaction.editReply(
				"couldn't fetch currency data from API endpoints"
			);
			logger.error(
				`❌ fetching currency data failed : ${error}`,
				"currency-fail"
			);
		}
	} catch (error) {
		logger.error(`❌ using kir command failed : ${error}`, "cmdkir-fail");
	}
};

export const options: CommandOptions = {
	botPermissions: ["AddReactions"],
	deleted: false,
};
