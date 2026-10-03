document.querySelectorAll('.site-sticky-header').forEach((header) => {
    const toggle = header.querySelector('.site-menu-toggle');
    const menu = header.querySelector('.site-mobile-menu');
    const desktop = window.matchMedia('(min-width: 1024px)');
    if (!toggle || !menu) return;

    const setOpen = (open) => {
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        menu.hidden = !open;
    };

    toggle.addEventListener('click', () => {
        setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    menu.querySelectorAll('a').forEach((link) => {
        link.addEventListener('click', () => setOpen(false));
    });

    document.addEventListener('click', (event) => {
        if (!header.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
            setOpen(false);
            toggle.focus();
        }
    });

    header.addEventListener('focusout', (event) => {
        if (!header.contains(event.relatedTarget)) setOpen(false);
    });

    desktop.addEventListener('change', () => {
        if (desktop.matches) setOpen(false);
    });
});
