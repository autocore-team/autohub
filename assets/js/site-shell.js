(function () {
  'use strict';

  const supportedLanguages = ['en', 'es', 'fr', 'de'];
  const shellTranslations = {
    en: {
      menu: 'Menu',
      navHome: 'Home',
      navTire: 'Tire Calculator',
      navPcd: 'PCD Database',
      navFuel: 'Fuel Cost',
      navDiagnostics: 'Diagnostics',
      navEngines: 'Engine Database',
      navGuides: 'Guides',
      footerOil: 'Oil Guide',
      footerWheel: 'Wheel Fitment Basics',
      footerAbout: 'About',
      footerContact: 'Contact',
      footerPrivacy: 'Privacy Policy',
      footerAffiliate: 'Affiliate Disclosure',
      footerTagline: 'Practical automotive tools, technical databases and clear safety notes.'
    },
    es: {
      menu: 'Menú',
      navHome: 'Inicio',
      navTire: 'Calculadora de neumáticos',
      navPcd: 'Base de datos PCD',
      navFuel: 'Coste de combustible',
      navDiagnostics: 'Diagnóstico',
      navEngines: 'Base de motores',
      navGuides: 'Guías',
      footerOil: 'Guía de aceite',
      footerWheel: 'Conceptos de ajuste de llantas',
      footerAbout: 'Acerca de',
      footerContact: 'Contacto',
      footerPrivacy: 'Privacidad',
      footerAffiliate: 'Divulgación de afiliados',
      footerTagline: 'Herramientas prácticas, bases técnicas y avisos claros de seguridad para automóviles.'
    },
    fr: {
      menu: 'Menu',
      navHome: 'Accueil',
      navTire: 'Calculateur de pneus',
      navPcd: 'Base PCD',
      navFuel: 'Coût du carburant',
      navDiagnostics: 'Diagnostic',
      navEngines: 'Base moteurs',
      navGuides: 'Guides',
      footerOil: 'Guide des huiles',
      footerWheel: 'Bases de compatibilité des roues',
      footerAbout: 'À propos',
      footerContact: 'Contact',
      footerPrivacy: 'Confidentialité',
      footerAffiliate: 'Liens affiliés',
      footerTagline: 'Outils automobiles pratiques, bases techniques et consignes de sécurité claires.'
    },
    de: {
      menu: 'Menü',
      navHome: 'Startseite',
      navTire: 'Reifenrechner',
      navPcd: 'Lochkreis-Datenbank',
      navFuel: 'Kraftstoffkosten',
      navDiagnostics: 'Diagnose',
      navEngines: 'Motordatenbank',
      navGuides: 'Ratgeber',
      footerOil: 'Öl-Ratgeber',
      footerWheel: 'Grundlagen der Radpassung',
      footerAbout: 'Über uns',
      footerContact: 'Kontakt',
      footerPrivacy: 'Datenschutz',
      footerAffiliate: 'Affiliate-Hinweis',
      footerTagline: 'Praktische Fahrzeugwerkzeuge, technische Datenbanken und klare Sicherheitshinweise.'
    }
  };

  function languageFromUrl() {
    const requested = new URL(window.location.href).searchParams.get('lang');
    return supportedLanguages.includes(requested) ? requested : 'en';
  }

  function isEnglishOnlyPcdPage(url) {
    return /\/pcd\/(?:bmw|opel|volvo|vw|bolt-pattern)\//.test(url.pathname);
  }

  function updateInternalLanguageLinks(language) {
    if (!supportedLanguages.includes(language)) return;

    document.querySelectorAll('a[href]').forEach((link) => {
      const rawHref = link.getAttribute('href');
      if (
        !rawHref ||
        link.hasAttribute('data-no-lang') ||
        rawHref.startsWith('#') ||
        /^(?:mailto:|tel:|javascript:)/i.test(rawHref)
      ) return;

      let resolved;
      try {
        resolved = new URL(rawHref, window.location.href);
      } catch (error) {
        return;
      }

      if (
        resolved.origin !== window.location.origin ||
        !resolved.pathname.endsWith('.html') ||
        isEnglishOnlyPcdPage(resolved)
      ) return;

      const hashIndex = rawHref.indexOf('#');
      const hash = hashIndex >= 0 ? rawHref.slice(hashIndex) : '';
      const beforeHash = hashIndex >= 0 ? rawHref.slice(0, hashIndex) : rawHref;
      const queryIndex = beforeHash.indexOf('?');
      const path = queryIndex >= 0 ? beforeHash.slice(0, queryIndex) : beforeHash;
      const query = queryIndex >= 0 ? beforeHash.slice(queryIndex + 1) : '';
      const params = new URLSearchParams(query);
      params.set('lang', language);
      link.setAttribute('href', `${path}?${params.toString()}${hash}`);
    });
  }

  function translateShell(language) {
    const dictionary = shellTranslations[language] || shellTranslations.en;
    document.querySelectorAll('[data-shell-i18n]').forEach((node) => {
      const value = dictionary[node.dataset.shellI18n] || shellTranslations.en[node.dataset.shellI18n];
      if (value) node.textContent = value;
    });
    document.querySelectorAll('[data-lang]').forEach((button) => {
      button.classList.toggle('selected', button.dataset.lang === language);
    });
    updateInternalLanguageLinks(language);
  }

  document.documentElement.classList.add('site-shell-ready');

  const menu = document.getElementById('site-menu');
  const toggle = document.querySelector('.site-menu-toggle');

  function closeMenu(returnFocus) {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }

  if (menu && toggle) {
    toggle.addEventListener('click', () => {
      const willOpen = !menu.classList.contains('is-open');
      menu.classList.toggle('is-open', willOpen);
      toggle.setAttribute('aria-expanded', String(willOpen));
    });

    menu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => closeMenu(false));
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menu.classList.contains('is-open')) {
        closeMenu(true);
      }
    });
  }

  document.querySelectorAll('[data-lang]').forEach((button) => {
    button.addEventListener('click', () => translateShell(button.dataset.lang));
  });

  translateShell(languageFromUrl());
})();
