(function () {
    let tooltipEl = null;

    function getOrCreateTooltip() {
        if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.className = 'app-floating-tooltip';
            document.body.appendChild(tooltipEl);
        }
        return tooltipEl;
    }

    function showTooltip(target) {
        const text = target.getAttribute('data-tooltip') || target.getAttribute('title');
        if (!text) return;

        // Transfer title to data-tooltip to suppress the browser default tooltip
        if (target.hasAttribute('title')) {
            target.setAttribute('data-tooltip', text);
            target.removeAttribute('title');
        }

        const el = getOrCreateTooltip();
        el.textContent = text;
        el.classList.add('visible');

        const rect = target.getBoundingClientRect();
        const tooltipRect = el.getBoundingClientRect();

        let top, left;

        // If target is inside the bottom bar (or near the bottom of viewport)
        if (target.closest('.bottom-sidebar, .bottom-nav-bar') || rect.bottom > window.innerHeight - 70) {
            // Position above the item
            top = rect.top - tooltipRect.height - 10;
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        } else if (rect.right < 240) {
            // Position to the right
            left = rect.right + 12;
            top = rect.top + (rect.height / 2) - (tooltipRect.height / 2);
        } else {
            // Position below the icon
            top = rect.bottom + 8;
            left = rect.left + (rect.width / 2) - (tooltipRect.width / 2);
        }

        // Clamp within viewport
        const padding = 12;
        if (left < padding) left = padding;
        if (left + tooltipRect.width > window.innerWidth - padding) {
            left = window.innerWidth - padding - tooltipRect.width;
        }

        if (top < padding) top = padding;
        if (top + tooltipRect.height > window.innerHeight - padding) {
            top = window.innerHeight - padding - tooltipRect.height;
        }

        el.style.left = `${Math.round(left)}px`;
        el.style.top = `${Math.round(top)}px`;
    }

    function hideTooltip() {
        if (tooltipEl) {
            tooltipEl.classList.remove('visible');
        }
    }

    document.addEventListener('pointerover', function (e) {
        const target = e.target.closest('.info-icon-wrap, .nav-info-icon, [data-info-tooltip], [data-tooltip], .feed-glass-btn[title]');
        if (target) {
            showTooltip(target);
        }
    });

    document.addEventListener('pointerout', function (e) {
        const target = e.target.closest('.info-icon-wrap, .nav-info-icon, [data-info-tooltip], [data-tooltip], .feed-glass-btn[title]');
        if (target && !target.contains(e.relatedTarget)) {
            hideTooltip();
        }
    });

    document.addEventListener('pointerdown', hideTooltip);
    window.addEventListener('blur', hideTooltip);

    window.addEventListener('scroll', hideTooltip, true);
})();
