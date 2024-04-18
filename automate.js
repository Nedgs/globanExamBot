const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
    const browser = await chromium.launch({
        headless: false,
        args: ["--start-maximized"]
    });

    const context = await browser.newContext({
        viewport: null
    });

    const page = await context.newPage();

    try {
        let responseBody = {};
        // Intercept responses before anything else
        page.on('response', async (response) => {
            const url = response.url();
            const regex = /\/activity\/\d+\/content\/\d+/;
            if (regex.test(url)) {
                console.log('Intercepted request:', url);
                responseBody = await response.json();
                console.log('Response content:', responseBody.props.examQuestions.data);
            }
        });

        // Navigate to login page
        await page.goto('https://auth.global-exam.com/login');

        // Fill in login fields
        await page.fill('input[name="email"]', process.env.EMAIL);
        await page.fill('input[name="password"]', process.env.PASSWORD);
        await page.click('button[class="button-solid-primary-big mb-6"]');

        // Wait for a short random delay
        await page.waitForTimeout(randomDelay(1000, 3000));

        // Scroll the page by 500 pixels
        await page.evaluate(() => {
            window.scrollBy(0, 500);
        });

        // Click the first <a> link inside div with class 'grid-cols-1'
        await page.click('div.grid-cols-1 a');

        await page.waitForTimeout(randomDelay(1000, 2000));

        // Click the consent button (assuming it has ID 'axeptio_btn_acceptAll')
        await page.click('#axeptio_btn_acceptAll');

        await page.selectOption('select', 'A2'); // Select an option in a <select> element

        await page.waitForTimeout(randomDelay(1000, 2000));

        // Retrieve and process desired parent and child div elements
        const bigParentDiv = await page.$('.container.lg\\:mt-6');
        const parentDiv = await bigParentDiv.$('div');
        const childDivs = await parentDiv.$$('div');

        for (const div of childDivs) {
            const buttons = await div.$$('button');

            for (const button of buttons) {
                await button.click();
                console.log('Clicked a button inside the div');
                await page.waitForTimeout(randomDelay(3000, 5000));
                responseBody.props.examQuestions.data.sort((a, b) => a.order - b.order);

                // Retrieve all input fields in the DOM
                const inputFields = await page.$$('input[type="text"]');

                // Fill each input field with a different value
                for (let i = 0; i < inputFields.length; i++) {
                    const question = responseBody.props.examQuestions.data[i];
                    const input = inputFields[i];
                    await input.fill(question.exam_answers[0].name);
                    await page.waitForTimeout(randomDelay(1000, 1200));
                }
            }
        }

        console.log('here 1');

        await page.waitForTimeout(randomDelay(2000, 3000));

        // Click the form submission button with class 'button-solid-primary-large'
        await page.click('.button-solid-primary-large');

        console.log('here 2');

        await page.waitForTimeout(randomDelay(3000, 4000));

        console.log('here 3');
    } catch (error) {
        console.error('An error occurred:', error);
    } finally {
        // Close the browser once all operations are completed
        await browser.close();
    }
})();

// Function to generate a random delay between minDelay and maxDelay (in milliseconds)
function randomDelay(minDelay, maxDelay) {
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}
