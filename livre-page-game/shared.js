/* ============================================================
   Script partagé : effets de brûlure + verrouillage des boutons
   Utilisé par TOUTES les pages du jeu.
   ============================================================ */

/* Verrouillage : une fois un bouton cliqué, plus rien d'autre n'est cliquable */
let transitionEnCours = false;

function verrouillerBoutons() {
    transitionEnCours = true;
    document.querySelectorAll('.burn-btn, button, a').forEach(function (el) {
        el.style.pointerEvents = 'none';
        el.style.cursor = 'default';
    });
}

/* Braises + flammèches qui jaillissent le long de la ligne de feu */
function creerEtincelles(element) {
    const rect = element.getBoundingClientRect();
    const frag = document.createDocumentFragment();

    // Braises (petites boules incandescentes)
    for (let i = 0; i < 30; i++) {
        const braise = document.createElement('span');
        braise.className = 'ember';
        braise.style.left = (rect.left + Math.random() * rect.width) + 'px';
        braise.style.top  = (rect.top  + Math.random() * rect.height) + 'px';
        braise.style.width = braise.style.height = (3 + Math.random() * 6).toFixed(1) + 'px';
        braise.style.setProperty('--dx', ((Math.random() - 0.5) * 50).toFixed(0) + 'px');
        braise.style.setProperty('--dy', (-35 - Math.random() * 75).toFixed(0) + 'px');
        braise.style.setProperty('--duree', (0.6 + Math.random() * 0.7).toFixed(2) + 's');
        braise.style.animationDelay = (Math.random() * 1.15).toFixed(2) + 's';
        frag.appendChild(braise);
    }

    // Flammèches (petites flammes sur le front de brûlure)
    const flammes = ['🔥', '🔥', '🔥', '💥'];
    for (let i = 0; i < 14; i++) {
        const flamme = document.createElement('span');
        flamme.className = 'spark';
        flamme.textContent = flammes[i % flammes.length];
        flamme.style.left = (rect.left + Math.random() * rect.width) + 'px';
        flamme.style.top  = (rect.top  + Math.random() * rect.height) + 'px';
        flamme.style.fontSize = (14 + Math.random() * 14).toFixed(0) + 'px';
        flamme.style.setProperty('--duree', (0.5 + Math.random() * 0.5).toFixed(2) + 's');
        flamme.style.animationDelay = (Math.random() * 1.15).toFixed(2) + 's';
        frag.appendChild(flamme);
    }

    document.body.appendChild(frag);

    // Nettoyage des particules après la brûlure
    setTimeout(function () {
        document.querySelectorAll('.ember, .spark').forEach(function (n) { n.remove(); });
    }, 2400);
}

/* Brûle un bouton puis transition : noir -> couleur demandée -> page suivante */
function brulerEtAller(element, destination, couleurFinale) {
    if (transitionEnCours) return;
    verrouillerBoutons();

    element.classList.add('burning');
    creerEtincelles(element);

    const transition = document.getElementById('screenTransition');
    const boutonDesactive = element.tagName === 'BUTTON' || element.hasAttribute('disabled');
    if (boutonDesactive && element.tagName === 'BUTTON') element.disabled = true;

    // Le bouton finit de brûler...
    setTimeout(function () {
        transition.classList.add('active', 'black');
        // ...puis l'écran passe à la couleur finale
        setTimeout(function () {
            transition.classList.remove('black');
            transition.classList.add(couleurFinale);
            setTimeout(function () {
                window.location.href = destination;
            }, 950);
        }, 550);
    }, 1500);
}

/* ============================================================
   SCÈNE DE MORT AVEC SANG (partagée)
   Utilisée via data-scene="mort-sang" sur un bouton .burn-btn
   ============================================================ */

function initialiserSceneMortSang() {
    // Créer les éléments DOM s'ils n'existent pas
    if (!document.getElementById('sangMasse')) {
        const elementsHTML = `
            <div id="sangMasse"></div>
            <div id="bordSang"></div>
            <div id="cercleMort">
                <div class="contenu">
                    <span id="craneMort"></span>
                </div>
            </div>
            <div id="texteMort">VOUS ÊTES MORT</div>
            <div id="fonduMort"></div>
        `;
        document.body.insertAdjacentHTML('beforeend', elementsHTML);
    }

    const sangMasse  = document.getElementById('sangMasse');
    const bordSang   = document.getElementById('bordSang');
    const cercleMort = document.getElementById('cercleMort');
    const craneMort  = document.getElementById('craneMort');
    const texteMort  = document.getElementById('texteMort');
    const fonduMort  = document.getElementById('fonduMort');

    // Crâne SVG
    craneMort.innerHTML = `
        <svg viewBox="0 0 100 100" fill="none">
            <path d="M50 15 C30 15 15 30 15 50 C15 68 25 82 38 90 C42 92 46 92 50 90 C62 82 72 68 72 50 C72 30 57 15 50 15 Z" stroke="#fff" stroke-width="3"/>
            <ellipse cx="35" cy="42" rx="8" ry="10" fill="#fff"/>
            <ellipse cx="65" cy="42" rx="8" ry="10" fill="#fff"/>
            <path d="M35 62 Q50 72 65 62" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/>
        </svg>
    `;

    // Handler pour l'événement lancer-scene
    document.addEventListener('lancer-scene', function (e) {
        if (e.detail.nom !== 'mort-sang') return;

        const bouton = e.detail.bouton;
        const destination = bouton.getAttribute('data-dest');
        if (!destination) return;

        // 1. Sang qui monte
        sangMasse.style.transition = 'height 0.7s cubic-bezier(0.4,0,0.6,1), opacity 0.3s';
        sangMasse.style.height = '100%';
        sangMasse.style.opacity = '1';

        // 2. Bordure sanglante ondulée
        bordSang.style.opacity = '1';
        bordSang.innerHTML = `
            <svg viewBox="0 0 1600 300" preserveAspectRatio="none">
                <path d="M0,300 Q400,0 800,300 T1600,300" fill="#8b0000" opacity="0.9"/>
                <path d="M0,300 Q400,100 800,280 T1600,300" fill="#b3121b" opacity="0.7"/>
            </svg>
        `;

        // 3. Bulles de sang
        for (let i = 0; i < 18; i++) {
            setTimeout(() => {
                const b = document.createElement('div');
                b.className = 'bulle';
                const taille = 10 + Math.random() * 22;
                b.style.width = b.style.height = taille + 'px';
                b.style.left = (10 + Math.random() * 80) + '%';
                b.style.bottom = '0px';
                b.style.animationDuration = (1 + Math.random() * 1.2) + 's';
                b.style.setProperty('--duree', b.style.animationDuration);
                document.body.appendChild(b);
                setTimeout(() => b.remove(), 2500);
            }, i * 60);
        }

        // 4. Éclaboussures
        for (let i = 0; i < 14; i++) {
            setTimeout(() => {
                const e = document.createElement('div');
                e.className = 'eclaboussure';
                const taille = 6 + Math.random() * 18;
                e.style.width = e.style.height = taille + 'px';
                e.style.left = (20 + Math.random() * 60) + '%';
                e.style.top = (30 + Math.random() * 40) + '%';
                const jx = (Math.random() - 0.5) * 300;
                const jy = -100 - Math.random() * 200;
                e.style.setProperty('--jx', jx + 'px');
                e.style.setProperty('--jy', jy + 'px');
                document.body.appendChild(e);
                setTimeout(() => e.remove(), 1200);
            }, i * 50);
        }

        // 5. Cercle + crâne qui tombent
        setTimeout(() => {
            cercleMort.classList.add('tombe');
        }, 500);

        // 6. Texte "VOUS ÊTES MORT"
        setTimeout(() => {
            texteMort.classList.add('apparait');
        }, 1200);

        // 7. Fondu au noir puis redirection
        setTimeout(() => {
            fonduMort.classList.add('noir');
            setTimeout(() => {
                window.location.href = destination;
            }, 900);
        }, 2800);
    });
}

// Initialiser au chargement
document.addEventListener('DOMContentLoaded', initialiserSceneMortSang);

/* ============================================================
   BRANCHEMENT AUTOMATIQUE SUR TOUS LES BOUTONS .burn-btn
   ============================================================ */
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.burn-btn').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            if (transitionEnCours) return;

            const scene = this.getAttribute('data-scene');
            if (scene) {
                verrouillerBoutons();
                this.classList.add('burning');
                if (this.tagName === 'BUTTON') this.disabled = true;
                creerEtincelles(this);
                document.dispatchEvent(new CustomEvent('lancer-scene', {
                    detail: { nom: scene, bouton: this }
                }));
                return;
            }

            const destination = this.getAttribute('data-dest') || this.getAttribute('href');
            const couleur = this.getAttribute('data-couleur') || 'blue';

            if (!destination) {
                this.classList.add('burning');
                if (this.tagName === 'BUTTON') this.disabled = true;
                creerEtincelles(this);
                return;
            }

            brulerEtAller(this, destination, couleur);
        });
    });
});
