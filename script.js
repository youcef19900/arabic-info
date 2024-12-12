document.addEventListener("DOMContentLoaded", function () {
    const rssUrls = [
        'https://www.skynewsarabia.com/rss',
        'https://www.aljazeera.net/aljazeerarss/a7c186be-1baa-4bd4-9d80-a84db769f779/73d0e1b4-532f-45ef-b135-bfdff8b8cab9',
        'https://arabic.rt.com/rss/',
        'http://feeds.aps.dz/aps-algerie'
    ];

    const notificationBar = document.getElementById('notification-bar');
    const rssContainer = document.getElementById('rss-container');

    // Référence pour la fenêtre modale
    const modal = document.getElementById('article-modal');
    const closeModal = document.getElementById('close-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const modalLink = document.getElementById('modal-link');
    const modalImage = document.getElementById('modal-image');

    // Fonction pour afficher une notification
    function showNotification(message) {
        const notificationMessage = document.getElementById('notification-message');
        notificationMessage.textContent = message;
        notificationBar.style.display = 'block';

        setTimeout(() => {
            notificationBar.style.display = 'none';
        }, 5000);
    }

    // Fonction pour créer une carte d'actualité
    function createCard(article, siteName) {
        const card = document.createElement('div');
        card.classList.add('card');

        // Si l'article a une image haute résolution, utilisez-la
        const image = document.createElement('img');
        image.src = article.image || 'https://via.placeholder.com/150'; // Placeholder si l'image n'est pas disponible
        image.alt = 'Image';

        const cardContent = document.createElement('div');
        cardContent.classList.add('card-content');

        const title = document.createElement('h3');
        title.textContent = article.title;

        const description = document.createElement('p');
        description.textContent = article.description || "Pas de description";

        const siteLabel = document.createElement('span');
        siteLabel.classList.add('site-name');
        siteLabel.textContent = siteName;

        cardContent.appendChild(siteLabel);
        cardContent.appendChild(title);
        cardContent.appendChild(description);
        card.appendChild(image);
        card.appendChild(cardContent);

        // Ajout d'un événement de clic sur la carte pour ouvrir la modale
        card.addEventListener('click', () => {
            openModal(article);
        });

        rssContainer.appendChild(card);
    }

    // Fonction pour analyser un flux RSS et récupérer les articles
    async function parseRSS(url, siteName) {
        try {
            // Utilisation d'un proxy pour contourner les restrictions CORS
            const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
            const fullUrl = proxyUrl + url;

            const response = await fetch(fullUrl);
            if (!response.ok) {
                throw new Error('Erreur de récupération du flux RSS');
            }

            const data = await response.text();
            const parser = new DOMParser();
            const xmlDoc = parser.parseFromString(data, "text/xml");

            // Récupérer les éléments d'articles du flux RSS
            const items = xmlDoc.querySelectorAll('item');
            let count = 0;

            items.forEach(item => {
                if (count < 5) { // Afficher 5 articles maximum par site
                    const title = item.querySelector('title').textContent;
                    const description = item.querySelector('description') ? item.querySelector('description').textContent : "Pas de description";
                    const link = item.querySelector('link').textContent;

                    // Récupérer l'image de l'article
                    const image = item.querySelector('media\\:content, content') ? item.querySelector('media\\:content').getAttribute('url') :
                                  item.querySelector('enclosure') ? item.querySelector('enclosure').getAttribute('url') :
                                  null;

                    // Créer et ajouter la carte de l'article
                    createCard({
                        title,
                        description,
                        link,
                        image
                    }, siteName);

                    count++;
                }
            });

            showNotification(`${siteName} : ${count} nouveaux articles chargés.`);

        } catch (error) {
            console.error('Erreur lors de l\'analyse du flux RSS:', error);
            showNotification('Impossible de charger les actualités.');
        }
    }

    // Fonction pour ouvrir la fenêtre modale et afficher l'article complet
    function openModal(article) {
        modalTitle.textContent = article.title;
        modalDescription.textContent = article.description; // Afficher la description complète
        modalLink.href = article.link;
        modalLink.textContent = 'Lire l\'article complet';

        // Si l'article a une image, l'afficher dans la modale
        modalImage.src = article.image || 'https://via.placeholder.com/150';

        // Afficher la modale
        modal.style.display = 'block';
    }

    // Fonction pour fermer la fenêtre modale
    closeModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Charger les flux RSS
    rssUrls.forEach((url, index) => {
        const siteNames = [
            'سكاي نيوز عربية',  // Sky News Arabia en arabe
            'الجزيرة',           // Al Jazeera en arabe
            'آر تي العربية',      // RT Arabic en arabe
            'أ.ب.إ الجزائر'       // APS Algérie en arabe
        ];
        parseRSS(url, siteNames[index]);
    });
});