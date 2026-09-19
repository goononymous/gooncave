window.redgifsLifecycle = {
    refresh: function (selector) {
        const frames = document.querySelectorAll(selector);
        frames.forEach(frame => {
            if (frame.dataset.redgifsObserved === "true") return;

            const source = frame.getAttribute("src");
            if (!source) return;

            frame.dataset.redgifsSrc = source;
            frame.dataset.redgifsObserved = "true";

            const observer = new IntersectionObserver(entries => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        if (!frame.getAttribute("src")) {
                            frame.setAttribute("src", frame.dataset.redgifsSrc);
                        }
                    } else {
                        frame.removeAttribute("src");
                    }
                }
            }, { rootMargin: "300px 0px", threshold: 0 });

            frame._redgifsLifecycleObserver = observer;
            observer.observe(frame);
        });
    }
};
