const { chromium } = require('playwright');
require('dotenv').config();

(async () => {
    const browser = await chromium.launch({
        headless: false, // Ouvrir le navigateur en mode non headless
    });

    const context = await browser.newContext({
        viewport: { width: 1920, height: 1080 } // Définir la taille du viewport pour correspondre à la résolution de votre écran
    });

    // Créer une nouvelle page dans le contexte
    const page = await context.newPage();



    try {
        let responseBody = {};
        // Intercepter les réponses avant toute autre chose
        page.on('response', async (response) => {
            const url = response.url();
            const regex = /\/activity\/\d+\/content\/\d+/;
            if (regex.test(url)) {
                console.log('Requête interceptée:', url);
                responseBody = await response.json();
                console.log('Contenu de la réponse:', responseBody.props.examQuestions.data);
                // Effectuer d'autres opérations avec le contenu de la réponse si nécessaire
            }
        });

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

        await page.selectOption('select', 'A2'); // Sélectionner une option dans un élément <select>

        // Attendre un délai aléatoire court
        await page.waitForTimeout(randomDelay(1000, 2000));

        // Récupérer et traiter les éléments div parent et enfant désirés
        const bigParentDiv = await page.$('.container.lg\\:mt-6');
        const parentDiv = await bigParentDiv.$('div');
        const childDivs = await parentDiv.$$('div');

        // Parcourir chaque div dans childDivs
        for (const div of childDivs) {
            const buttons = await div.$$('button');

            for (const button of buttons) {
                await button.click(); // Cliquer sur chaque bouton à l'intérieur de la div
                console.log('Cliqué sur un bouton à l\'intérieur de la div');
                await page.waitForTimeout(randomDelay(3000, 5000)); // Attendre un court délai après chaque clic

                responseBody.props.examQuestions.data.sort((a, b) => a.order - b.order);

                // Récupérer tous les champs d'entrée dans le DOM
                const inputFields = await page.$$('input[type="text"]');

                // Remplir chaque champ d'entrée avec une valeur différente
                for (let i = 0; i < inputFields.length; i++) {
                    const question = responseBody.props.examQuestions.data[i];
                    const input = inputFields[i];
                    await input.fill(question.exam_answers[0].name);
                }
            }
        }

        console.log('here 1');

        await page.waitForTimeout(randomDelay(2000, 3000));

        // Cliquer sur le bouton de soumission du formulaire qui a la classe 'button-solid-primary-large'
        await page.click('.button-solid-primary-large');

        console.log('here 2');


        await page.waitForTimeout(randomDelay(3000, 4000));

        console.log('here 3');

        // // Attendre un délai aléatoire court
        // await page.waitForTimeout(randomDelay(1000, 2000));

        // // Cliquer sur le bouton
        // await page.click('.button-solid-primary-large');
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
