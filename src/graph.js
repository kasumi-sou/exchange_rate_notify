const puppeteer = require("puppeteer");

module.exports = async function getGraph() {
	const browser = await puppeteer.launch({ headless: true });
	const page = await browser.newPage();
	await page.goto("https://finance.yahoo.co.jp/quote/USDJPY=FX?styl=cndl&scl=stndrd&frm=60mntly&trm=60m&ovrIndctr=sma%2Cmma%2Clma&addIndctr=&compare=");

	const size = JSON.parse(await page.evaluate(() => {
		return JSON.stringify(document.querySelector("section:has(#chart)").getBoundingClientRect());
	}));

	const screenShot = await page.screenshot({ clip: { x: size.x, y: size.y, width: size.width, height: size.height, encoding: "binary" } });

	await browser.close();

	const buffer = Buffer.from(screenShot);
	return buffer;
};