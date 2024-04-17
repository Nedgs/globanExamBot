const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
    const browser = await chromium.launch({ headless: false }); // Ouvrir le navigateur en mode non headless
    const context = await browser.newContext();

    // Créer une nouvelle page dans le contexte
    const page = await context.newPage();

    try {
        // Naviguer vers la page de connexion
        await page.goto('https://auth.global-exam.com/login');

        // Remplir les champs de connexion
        await page.fill('input[name="email"]', process.env.EMAIL);
        await page.fill('input[name="password"]', process.env.PASSWORD);
        await page.click('button[class="button-solid-primary-big mb-6"]');

        // Attendre un délai aléatoire court
        await page.waitForTimeout(randomDelay(1000, 3000));

        // Faire défiler la page de 500 pixels
        await page.evaluate(() => {
            window.scrollBy(0, 500);
        });

        // Cliquer sur le premier lien <a> dans la div avec la classe 'grid-cols-1'
        await page.click('div.grid-cols-1 a');

        // Attendre un délai aléatoire court
        await page.waitForTimeout(randomDelay(5000, 6000));

        // Cliquer sur le bouton de consentement (supposons qu'il ait l'ID 'axeptio_btn_acceptAll')
        await page.click('#axeptio_btn_acceptAll');

        // Récupérer et traiter les éléments div parent et enfant désirés
        const bigParentDiv = await page.$('.container.lg\\:mt-6');
        const parentDiv = await bigParentDiv.$('div');
        const childDivs = await parentDiv.$$('div');

        // Parcourir chaque div dans childDivs
        for (const div of childDivs) {
            const buttons = await div.$$('button');

            for (const button of buttons) {
                // Intercepter les réponses avant de cliquer sur le bouton
                page.on('response', async (response) => {
                    const url = response.url();
                    console.log('url', url);
                    const regex = /\/activity\/\d+\/content\/14465/;
                    if (regex.test(url)) {
                        console.log('Requête interceptée:', url);
                        const responseBody = await response.text();
                        console.log('Contenu de la réponse:', responseBody);
                        // Effectuer d'autres opérations avec le contenu de la réponse si nécessaire
                    }
                });

                await button.click(); // Cliquer sur chaque bouton à l'intérieur de la div
                console.log('Cliqué sur un bouton à l\'intérieur de la div');
                await page.waitForTimeout(randomDelay(3000, 5000)); // Attendre un court délai après chaque clic
            }
        }

        // Attendre un délai aléatoire court
        await page.waitForTimeout(randomDelay(1000, 2000));
    } catch (error) {
        console.error('Une erreur s\'est produite:', error);
    } finally {
        // Fermer le navigateur une fois toutes les opérations terminées
        await browser.close();
    }
})();

// Fonction pour générer un délai aléatoire entre minDelay et maxDelay (en millisecondes)
function randomDelay(minDelay, maxDelay) {
    return Math.floor(Math.random() * (maxDelay - minDelay + 1)) + minDelay;
}
