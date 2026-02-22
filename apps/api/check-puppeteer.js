const puppeteer = require('puppeteer');

(async () => {
  try {
    console.log('Attempting to launch Puppeteer...');
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'] // Often needed in server environments
    });
    const version = await browser.version();
    console.log(`Success! Puppeteer is working. Browser version: ${version}`);
    await browser.close();
  } catch (error) {
    console.error('Error: Puppeteer failed to launch.');
    console.error(error);
    process.exit(1);
  }
})();
