const cron = require("node-cron");
const { apiKey, webHookUrl, threadId } = require("../config.json");
const { default: axios } = require("axios");
const { setTimeout: sleep } = require("node:timers/promises");
const getGraph = require("./graph");
const FormData = require("form-data");

if (!apiKey || !webHookUrl || !threadId) {
	throw new Error("Invalid config.json");
}


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
			result = await reportCurrency(i);
			console.log(`success! (attempt #${i})`);
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
			result = await reportCurrency(i);
			console.log(`success! (attempt #${i})`);
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
			result = await reportCurrency(i);
			console.log(`success! (attempt #${i})`);
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


async function reportCurrency(i) {
	const [exchangeData, graph] = await Promise.all([
		axios({
			url: `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=USD&to_currency=JPY&apikey=${apiKey}`,
			method: "get",
			headers: { "User-Agent": "request" },
			responseType: "json",
		}),
		getGraph(),
	]);

	const utcTime = exchangeData.data["Realtime Currency Exchange Rate"]["6. Last Refreshed"];
	const jstTime = new Date(utcTime + "Z").toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
	const rate = parseFloat(exchangeData.data["Realtime Currency Exchange Rate"]["9. Ask Price"]).toFixed(3);

	const formData = new FormData();
	formData.append("file", graph, "chart.png");
	formData.append("payload_json", JSON.stringify({
		content: `# $1 = ￥${rate} \n_ _\n\`${jstTime}\` 現在${(i > 0) ? `(attempt #${i})` : ""}`,
	}));

	await axios({
		url: webHookUrl + `?thread_id=${threadId}`,
		method: "post",
		headers: {
			"Accept": "application/json",
			"Content-type": "multipart/form-data",
		},
		data: formData,
	});
	console.log(`${jstTime}: success!`);
	return true;
}

async function errorMessage() {
	await axios({
		url: webHookUrl + `?thread_id=${threadId}`,
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
