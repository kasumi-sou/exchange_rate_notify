const cron = require("node-cron");
const { apiKey } = require("../config.json");
const { webHookUrl } = require("../config.json");
const { default: axios } = require("axios");

/*
cron.schedule("0 39 18 * * *", async () => {
	test();
});
*/

cron.schedule("0 0 0,12,16,20 * * 1-5", async () => {
	reportCurrency();
});


async function reportCurrency() {
	const exchangeData = await axios({
		url: `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${apiKey}`,
		method: "get",
		headers: { "User-Agent": "request" },
		responseType: "json",
	});
	const utcTime = exchangeData.data["Realtime Currency Exchange Rate"]["6. Last Refreshed"];
	const jstTime = new Date(utcTime + "Z").toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
	const rate = parseFloat(exchangeData.data["Realtime Currency Exchange Rate"]["9. Ask Price"]).toFixed(3);
	await axios({
		url: webHookUrl,
		method: "post",
		headers: {
			"Accept": "application/json",
			"Content-type": "application/json",
		},
		data: {
			content: `ドル/円為替レート:\n# ${rate} 円\n\n\`${jstTime}\` 現在`,
		},
	});
}
