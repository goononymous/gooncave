window.feedControls = (() => {
    let callback;
    const onKeyDown = event => {
        if (!callback || event.ctrlKey || event.metaKey || event.altKey ||
            ["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement?.tagName)) return;
        if (["w", "a", "s", "d", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(event.key)) {
            event.preventDefault();
            callback.invokeMethodAsync("HandleFeedKey", event.key);
        }
    };
    const onTimelineClick = event => {
        const timeline = event.target.closest(".feed-playback-bar");
        const video = document.querySelector(".feed-page-fullscreen video");
        if (!timeline || !video?.duration) return;
        const rect = timeline.getBoundingClientRect();
        video.currentTime = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width)) * video.duration;
    };
    return {
        register: ref => {
            callback = ref; document.addEventListener("keydown", onKeyDown); document.addEventListener("click", onTimelineClick);
            document.addEventListener("timeupdate", event => {
                const media = event.target;
                if (!(media instanceof HTMLVideoElement) || !media.duration) return;
                const bar = document.querySelector(".feed-playback-progress");
                if (bar) bar.style.width = ((media.currentTime / media.duration) * 100) + "%";
            }, true);
        },
        unregister: () => { document.removeEventListener("keydown", onKeyDown); document.removeEventListener("click", onTimelineClick); callback = null; },
        setBottomBarHidden: hidden => document.body.classList.toggle("feed-bottom-bar-hidden", hidden),
        toggleFullscreen: async element => {
            if (document.fullscreenElement) { await document.exitFullscreen(); return false; }
            await element.requestFullscreen(); return true;
        },
        preload: urls => {
            for (const url of urls || []) {
                if (!url) continue;
                if (/redgifs\.com/i.test(url)) continue;
                if (/\.(mp4|webm|mov)(\?|$)/i.test(url)) {
                    const video = document.createElement("video");
                    video.preload = "auto"; video.src = url;
                } else {
                    const image = new Image(); image.src = url;
                }
            }
        },
        setVolume: volume => {
            document.querySelectorAll(".feed-page-fullscreen video").forEach(video => {
                video.volume = Math.max(0, Math.min(1, volume));
            });
        },
        setRedgifsAudio: (enabled, volume) => {
            const deadline = Date.now() + 5000;
            const tryUnmute = () => {
                if (!enabled || Date.now() > deadline) return;
                // Works for any same-document Redgifs player implementation. Cross-origin
                // iframes are isolated by the browser; their sound=1 embed parameter handles those.
                document.querySelectorAll(".embeddedPlayer video, .Player video").forEach(video => {
                    video.muted = false;
                    video.volume = Math.max(0, Math.min(1, volume));
                    video.play?.().catch(() => {});
                });
                setTimeout(tryUnmute, 200);
            };
            tryUnmute();
        },
        toggleCurrentPlayback: () => {
            const redgifs = document.querySelector(".feed-redgifs-frame");
            if (redgifs?.contentWindow) {
                // Redgifs' embed accepts these player messages; its DOM is cross-origin and
                // cannot be accessed directly from GoonCave.
                redgifs.contentWindow.postMessage("pause", "https://www.redgifs.com");
                redgifs.contentWindow.postMessage("toggle", "https://www.redgifs.com");
                return;
            }
            const video = document.querySelector(".feed-page-fullscreen video");
            if (video) video.paused ? video.play().catch(() => {}) : video.pause();
        },
        syncRedgifsAudio: (enabled, volume) => {
            const send = () => {
                const frame = document.querySelector(".feed-redgifs-frame");
                if (!frame?.contentWindow) return;
                // Redgifs documents the simple soundOn/soundOff frame messages. Use "*"
                // because Redgifs may redirect the embed between www and v3 hostnames.
                frame.contentWindow.postMessage(enabled ? "soundOn" : "soundOff", "*");
                frame.contentWindow.postMessage({ command: enabled ? "soundOn" : "soundOff", volume }, "*");
            };
            send(); setTimeout(send, 100); setTimeout(send, 350); setTimeout(send, 900); setTimeout(send, 2000);
        }
    };
})();
