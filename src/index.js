const cron = require("node-cron");
const { apiKey } = require("../config.json");
const { webHookUrl } = require("../config.json");
const { threadId } = require("../config.json");
const { default: axios } = require("axios");
const { setTimeout: sleep } = require("node:timers/promises");

/*
cron.schedule("0 39 18 * * *", async () => {
	test();
});
*/

// 月曜の処理
cron.schedule("0 0 12-22/2 * * 1", async () => {
	let result = null;
	for (i = 0; i < 3; i++) {
		try {
			result = reportCurrency();
			console.log(`success! (attempt #${i++})`);
			break;
		}
		catch (e) {
			console.error(e);
		}
		await sleep((2 ** i) * 1000);
	}
	if (!result) {
		errorMessage();
		return;
	};
});

// 火～金
cron.schedule("0 0 0,12-22/2 * * 2-5", async () => {
	let result = null;
	for (i = 0; i < 3; i++) {
		try {
			result = reportCurrency();
			console.log(`success! (attempt #${i++})`);
			break;
		}
		catch (e) {
			console.error(e);
		}
		await sleep((2 ** i) * 1000);
	}
	if (!result) {
		errorMessage();
		return;
	};
});

// 土曜
cron.schedule("0 0 0,1 * * 6", async () => {
	let result = null;
	for (i = 0; i < 3; i++) {
		try {
			result = reportCurrency();
			console.log(`success! (attempt #${i++})`);
			break;
		}
		catch (e) {
			console.error(e);
		}
		await sleep((2 ** i) * 1000);
	}
	if (!result) {
		errorMessage();
		return;
	};
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
		url: webHookUrl + `?thread_id=${threadId}`,
		method: "post",
		headers: {
			"Accept": "application/json",
			"Content-type": "application/json",
		},
		data: {
			content: `ドル/円為替レート:\n# ${rate} 円\n\n\`${jstTime}\` 現在 (attempt #${i++})`,
		},
	});
	console.log(`${jstTime}: success!`);
}

async function errorMessage() {
	await axios({
		url: webHookUrl,
		method: "post",
		headers: {
			"Accept": "application/json",
			"Content-type": "application/json",
		},
		data: {
			content: "処理に失敗しました！",
		},
	});
	console.error("failed");
}
