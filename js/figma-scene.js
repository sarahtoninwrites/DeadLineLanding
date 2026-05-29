document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    let gameTl;

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
            end: "+=6000", // Increased to accommodate flip AND loading bar
            pin: true,
            scrub: 0.5,
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
        onUpdate: function() {
            if (this.progress() > 0.9 && !burstTriggered) {
                burstTriggered = true;
                triggerNotificationChaos();
            }
        }
    }, "+=0.5");

    function triggerNotificationChaos() {
        const overlay = document.querySelector('.notification-overlay');


        // Switch background: fade in figma-scene and fade out loading content
        gsap.to(".figma-scene", { opacity: 1, duration: 1.5, ease: "power2.inOut" });

        // Prevent character movement during the notification transition
        if (typeof gameTl !== 'undefined' && gameTl.scrollTrigger) gameTl.scrollTrigger.disable();


        const notifCount = 50;
        // Define the specific frame numbers you have in your Assets folder here
        const availableFrames = [2705, 2713, 2714, 2715, 2716, 2717, 2718, 2719, 2720, 2721, 2722, 2723, 2724, 2726, 2727,2728,2729];

        for (let i = 0; i < notifCount; i++) {
            setTimeout(() => {
                const img = document.createElement('img');
                
                // Randomly pick an index from the availableFrames array
                const frameIndex = availableFrames[Math.floor(Math.random() * availableFrames.length)];
                img.src = `Assets/figma_notifs/Frame ${frameIndex}.png`; 
                img.classList.add('figma-notif');
                overlay.appendChild(img);

                const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
                const startY = window.innerHeight + 100;

                gsap.fromTo(img, 
                    { x: startX, y: startY, scale: 0.4, opacity: 0},
                    { 
                        x: Math.random() * (window.innerWidth - 300), 
                        y: Math.random() * (window.innerHeight - 100), 
                        opacity: 1, 
                        scale: 1.5, 
                        duration: 1, 
                        ease: "back.out(1.5)" 
                    }
                );
            }, i * 40); // Staggered delay to make them "bubble up" progressively
        }

        // -----------------------------
        // FIGMA NARRATIVE DATA
        // -----------------------------
        const figmaMainText = document.querySelector(".figma-overlay .main-text");
        const figmaSubText = document.querySelector(".figma-overlay .sub-text");

        const figmaStory = [
            { main: "You thought the keyboard was bad.", sub: "" },
            { main: "This is a live Figma file. \nSomeone is in here with you. \nRun.", sub: "" },
            { main: "He's reviewing the file. He has a laser. You have an office chair.", sub: "He cannot see you — until he can." },
            { main: "The comments are physical here!", sub: "" },
            { main: "", sub: "" }
        ];

        function changeFigmaText(index) {
            const content = figmaStory[index];
            if (!content || !figmaMainText || !figmaSubText) return;

            gsap.to([figmaMainText, figmaSubText], {
                opacity: 0,
                y: 20,
                duration: 0.3,
                ease: "power2.out",
                onComplete: () => {
                    figmaMainText.textContent = content.main;
                    figmaSubText.textContent = content.sub;

                    gsap.fromTo([figmaMainText, figmaSubText], 
                        { opacity: 0, y: 20 },
                        { 
                            opacity: 1, 
                            y: 0, 
                            duration: 0.6, 
                            stagger: 0.05, 
                            ease: "power3.out" 
                        }
                    );
                }
            });
        }

        // Add Level Indicator
        const levelIndicator = document.createElement('p');
        levelIndicator.style.cssText = "position:absolute; top:40px; left:40px; font-family:'Manrope',sans-serif; font-size:18px; font-weight:800; color:white; z-index:1000; letter-spacing:0.2em; margin:0;";
        levelIndicator.textContent = 'LV 2';
        const figmaScene = document.querySelector('.figma-scene');
        if (figmaScene) figmaScene.appendChild(levelIndicator);

        // Create boss cursor element
        const bossCursor = document.createElement('div');
        bossCursor.classList.add('boss-cursor');
        bossCursor.innerHTML = `
            <img src="Assets/figma_scene/Aura.png" class="boss-aura">
            <img src="Assets/figma_scene/Boss.png" class="boss-icon">
        `;
        if (figmaScene) figmaScene.appendChild(bossCursor);

        // Initialize first text beat
        if (figmaMainText && figmaSubText) {
            figmaMainText.textContent = figmaStory[0].main;
            figmaSubText.textContent = figmaStory[0].sub;
        }

        // -----------------------------
        // SPRITE ANIMATION LOGIC
        // -----------------------------
        const charEl = document.querySelector(".game-character");
        let currentFrameTween;
        const idleFramesURLs = [];
        const walkFramesURLs = [];

        // Preload frames and store URLs
        function preloadFrames(pathPrefix, count, targetArray) {
            for (let i = 0; i < count; i++) {
                const frameNum = String(i).padStart(3, '0');
                const url = `${pathPrefix}/tile${frameNum}.png`;
                targetArray.push(url);
                // Optionally, create Image objects to ensure they are in browser cache
                const img = new Image();
                img.src = url;
            }
        }

        preloadFrames('Assets/figma_scene/idle_animation', 10, idleFramesURLs);
        preloadFrames('Assets/figma_scene/walk_animation', 16, walkFramesURLs);

        let timelineState = 'idle';
        let currentAnimationState = 'idle';
        let isScrolling = false;
        let figmaScrollTimeout;

        function setTimelineState(state) {
            timelineState = state;
            updateFigmaCharAnimation();
        }

        function updateFigmaCharAnimation() {
            let target = (timelineState === 'walk' && isScrolling) ? 'walk' : 'idle';
            if (target !== currentAnimationState) {
                currentAnimationState = target;
                setCharacterState(target);
            }
        }

        // Helper to switch sprite sheets
        function setCharacterState(state) {
            if (currentFrameTween) {
                currentFrameTween.kill(); // Stop previous animation
            }

            const proxy = { frame: 0 };
            let framesArray, durationPerFrame;

            if (state === 'walk') {
                framesArray = walkFramesURLs;
                durationPerFrame = 0.05; // Adjust for desired walk speed
            } else { // idle
                framesArray = idleFramesURLs;
                durationPerFrame = 0.1; // Adjust for desired idle speed
            }

            currentFrameTween = gsap.to(proxy, {
                frame: framesArray.length,
                duration: framesArray.length * durationPerFrame,
                ease: "none",
                repeat: -1,
                onUpdate: () => {
                    const index = Math.floor(proxy.frame) % framesArray.length;
                    charEl.style.backgroundImage = `url(${framesArray[index]})`;
                }
            });
        }

        // Initial State
        currentAnimationState = 'idle';
        setCharacterState('idle');

        // -----------------------------
        // JUMP PAD ANIMATION LOGIC
        // -----------------------------
        const jumpPadEl = document.querySelector(".jump-pad");
        const jumpPadFrames = [];
        
        for (let i = 0; i <= 50; i++) {
            const frameNum = String(i).padStart(2, '0');
            const url = `Assets/figma_scene/Jumppad/Jump Pad_${frameNum}.png`;
            jumpPadFrames.push(url);
            const img = new Image();
            img.src = url;
        }

        function playJumpPadAnimation() {
            if (!jumpPadEl) return;
            const proxy = { frame: 0 };
            gsap.to(proxy, {
                frame: jumpPadFrames.length,
                duration: 2,
                ease: "none",
                onUpdate: () => {
                    const index = Math.floor(proxy.frame) % jumpPadFrames.length;
                    jumpPadEl.src = jumpPadFrames[index];
                },
                repeat: -1 // Loop indefinitely
            });
        }

        // -----------------------------
        // 2D GAMEPLAY EXPLORATION
        // -----------------------------
    gameTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".figma-scene",
                start: "top top",
                end: "+=6000",
                scrub: 0.5, // Reduced for a tighter, more grounded feel
                pin: true,
                snap: {
                    snapTo: "labels",
                    duration: { min: 0.2, max: 0.6 },
                    delay: 0.05,
                    ease: "power1.inOut"
                },
                markers: false,
                onUpdate: (self) => {
                    const velocity = self.getVelocity();
                    
                    // Only flip if there is significant scroll velocity to prevent direction jitter
                    if (Math.abs(velocity) > 20) {
                        if (self.direction === -1) {
                            gsap.set(".game-character", { scaleX: -1 });
                        } else if (self.direction === 1) {
                            gsap.set(".game-character", { scaleX: 1 });
                        }
                    }

                    isScrolling = true;
                    updateFigmaCharAnimation();

                    window.clearTimeout(figmaScrollTimeout);
                    figmaScrollTimeout = setTimeout(() => {
                        isScrolling = false;
                        updateFigmaCharAnimation();
                    }, 150); // Increased timeout slightly to smooth out slow scrolls
                }
            }
        });

        // Character exploration sequence
        gameTl
            .addLabel("start")
            .call(changeFigmaText, [0], 0)
            .to({}, { duration: 0.5 }) // Initial buffer before first walk
            .addLabel("walk1Start")
            .call(() => setTimelineState('walk'), [], "walk1Start")
            // Walk across first platform
            .to(".game-character", { x: 500, ease: "none", duration: 2 })
            .addLabel("walk1End")
            .call(() => setTimelineState('idle'), [], "walk1End")

            // Jump to second platform (curved arc)
            .to(".game-character", { y: -160, x: 600, duration: 0.4, ease: "power1.out" })
            .to(".game-character", { y: -80, x: 800, duration: 0.4, ease: "power1.in" })
            .addLabel("platform2")
            .call(() => setTimelineState('idle'), [], "platform2") // Ensure idle after landing
            .call(changeFigmaText, [1], "+=0.2")

            .addLabel("walk2Start")
            .call(() => setTimelineState('walk'), [], "walk2Start")
            // Walk across second platform while world pans (P2 is at 900-1500)
            .to(".game-character", { x: 1230, ease: "none", duration: 2 }, "pan+=0.5")
            .to(".game-world", { x: "-=1000", ease: "none", duration: 2.5 }, "pan")
            .addLabel("walk2End")
            .call(() => setTimelineState('idle'), [], "walk2End")
            
            // Jump down to third platform (curved arc)
            .to(".game-character", { y: -40, x: 1650, duration: 0.4, ease: "power1.out" })
            .to(".game-character", { y: 20, x: 1850, duration: 0.4, ease: "power1.in" })
            .addLabel("platform3")
            .call(() => setTimelineState('idle'), [], "platform3") // Ensure idle after landing
            .call(changeFigmaText, [2], "+=0.2")
            .to(".boss-cursor", { bottom: "10%", right: "10%", opacity: 1, duration: 0.8 }, "<")

            .addLabel("walk3Start")
            .call(() => setTimelineState('walk'), [], "walk3Start")
            // Walk across third platform (P3 is at 1800-2400)
            .to(".game-character", { x: 2280, ease: "none", duration: 2 }, "pan2+=0.5")
            .to(".game-world", { x: "-=1000", ease: "none", duration: 2.5 }, "pan2")
            .addLabel("walk3End")
            .call(() => setTimelineState('idle'), [], "walk3End")

            // Jump up to fourth platform (curved arc)
            .to(".game-character", { y: -120, x: 2450, duration: 0.3, ease: "power1.out" })
            .to(".boss-cursor", { bottom: "-300px", right: "-300px", opacity: 0, duration: 0.8 }, "<")
            .to(".game-character", { y: -30, x: 2850, duration: 0.3, ease: "power1.in" })
            .addLabel("platform4")
            .call(() => setTimelineState('idle'), [], "platform4") // Ensure idle after final landing
            .call(changeFigmaText, [3], "+=0.2")

            // Final world pan with character frozen
            .to(".game-world", { x: "-=800", ease: "none", duration: 2 }, "final+=0.5")
            .addLabel("final_pan")
            .call(() => setTimelineState('idle'), [], "final_pan") // Ensure idle during final pan
            
            // Show export UI and animate loader after panning is complete
            .call(changeFigmaText, [4])
            .to(".exporting-images", { opacity: 1, duration: 0.5 })
            .to(".exporting-images .loading-bar-progress", { width: "100%", duration: 2, ease: "none" })
            .addLabel("end");

        // Calculate total time (stagger + duration) and add a small pause before fading
        const fadeDelay = (notifCount * 40 / 1000) + 1.5;

        gsap.to([overlay, ".notification-overlay"], {
            opacity: 0,
            duration: 1.5,
            delay: fadeDelay,
            ease: "power2.inOut",
            onComplete: () => {
                overlay.innerHTML = ''; // Clean up DOM
                // Re-enable gameplay scroll now that the transition is complete
                if (gameTl && gameTl.scrollTrigger) {
                    gameTl.scrollTrigger.enable();
                    ScrollTrigger.refresh();
                }
            }
        });

        // Start jump pad animation on load
        playJumpPadAnimation();
    }

    // -----------------------------
    // FINAL SECTION ANIMATION
    // -----------------------------
    const finalTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".final-section",
            start: "top 70%", // Trigger slightly earlier for better visibility
            toggleActions: "play none none none"
        }
    });

    finalTl.from(".final-text", {
        opacity: 0,
        y: 100,
        scale: 0.8,
        duration: 1.5,
        ease: "power4.out"
    })
    .to(".final-text", { 
        opacity: 0, 
        y: -40, 
        duration: 2, 
        ease: "power2.inOut" 
    }, "+=3") // Wait 2.5 seconds before starting the fade out
    .to(".final-cta", { 
        opacity: 1, 
        visibility: "visible", 
        duration: 1.5, 
        ease: "power2.inOut" 
    }, "-=0.5");

});
