document.addEventListener("DOMContentLoaded", () => {
  // Initially hide the figma scene to facilitate a background transition during chaos
    gsap.set(".figma-scene", { opacity: 0 });

    // -----------------------------
    // TRANSITION SECTION LOCK
    // -----------------------------
    window.isTransitionLocked = false;

    // Block native scroll events to prevent "scroll buffering" during the lock
    const blockScroll = (e) => {
        if (window.isTransitionLocked) e.preventDefault();
    };
    window.addEventListener('wheel', blockScroll, { passive: false });
    window.addEventListener('touchmove', blockScroll, { passive: false });
    window.addEventListener('keydown', (e) => {
        if (window.isTransitionLocked && ["Space", "ArrowUp", "ArrowDown", "PageUp", "PageDown"].includes(e.code)) {
            e.preventDefault();
        }
    }, { passive: false });

    // -----------------------------
    // TRANSITION SECTION CARD FLIP
    // -----------------------------
    const transSection = document.querySelector(".transition-section");
    const loadingSection = document.querySelector(".figma-loading");
    
    // Move the loading section inside the transition container so they pin together
    if (transSection && loadingSection) {
        transSection.appendChild(loadingSection);
    }

    let burstTriggered = false;

    gsap.set(".transition-section", { perspective: 2000 });
    gsap.set(".transition-content", { transformStyle: "preserve-3d", backfaceVisibility: "hidden" });
    gsap.set(".figma-loading", { 
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        transformStyle: "preserve-3d", 
        backfaceVisibility: "hidden",
        rotationY: 180,
        autoAlpha: 0,
        zIndex: 5
    });

    const transitionTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".transition-section",
            start: "top top",
            end: () => window.innerWidth <= 768 ? "+=3500" : "+=6000",
            pin: true,
            scrub: 0.5,
            invalidateOnRefresh: true,
            onEnter: () => {
                if (!window.isTransitionLocked) {
                    window.isTransitionLocked = true;
                    if (window.lenis) window.lenis.stop();
                    
                    gsap.delayedCall(2, () => {
                        window.isTransitionLocked = false;
                        if (window.lenis) window.lenis.start();
                        gsap.to(".transition-scroll", { autoAlpha: 1, duration: 1 });
                    });
                }
            }
        }
    });

    // Flip the current section out and pull the next section in
    transitionTl.to(".transition-content", {
        rotationY: -180,
        autoAlpha: 0,
        duration: 1.5,
        ease: "power2.inOut"
    }, 0.5)
    .to(".figma-loading", {
        rotationY: 0,
        autoAlpha: 1,
        duration: 1.5,
        ease: "power2.inOut"
    }, 0.5)
    // Animate the loading bar progress in the same timeline sequence
    .to(".figma-loading .loading-bar-progress", {
        width: "100%",
        duration: 4,
        ease: "none",
        onComplete: function() {
            if (!burstTriggered) {
                burstTriggered = true;
                window.triggerNotificationChaos(); // Call the global function
            }
        }
    }, "+=0.5");

});