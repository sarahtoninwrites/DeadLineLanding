document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);
    
    // Disable default browser scroll restoration to prevent jumps to the top during ScrollTrigger refreshes
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

    let gameTl; // Declared here, but assigned later

    // Make triggerNotificationChaos globally accessible
    window.triggerNotificationChaos = function() {
        const overlay = document.querySelector('.notification-overlay');
        const slowNotificationsCount = 3; // Number of notifications to pop slowly
        const slowStaggerDelay = 200; // ms delay between slow pops
        const slowPopDuration = 1.5; // seconds for slow pop animation
        const slowHoldDuration = 2; // seconds for how long slow notifs are visible before fading
        let lastSlowNotifPopInFinishTime = 0; // Tracks when the last slow notification finishes its pop-in


        // Set the overlay background color to hide underlying scenes completely
        gsap.set(overlay, { backgroundColor: '#0F0404' });

        // Switch background: fade in figma-scene and fade out loading content
        gsap.to(".figma-scene", { opacity: 1, duration: 1, ease: "power2.inOut" });
        
        // Immediately lock the scroll and disable Lenis when chaos starts
        window.isTransitionLocked = true;
        if (window.lenis) window.lenis.stop();

        const notifCount = 50;
        // Define the specific frame numbers you have in your Assets folder here
        const availableFrames = [2705, 2713, 2714, 2715, 2716, 2717, 2718, 2719, 2720, 2721, 2722, 2723, 2724, 2726, 2727,2728,2729];
        
        let totalNotificationAnimationEndTime = 0;
        const isMobile = window.innerWidth <= 768;

        for (let i = 0; i < notifCount; i++) {
            let currentNotificationDelay;
            let currentPopDuration = 1;

            if (i < slowNotificationsCount) {
                currentNotificationDelay = i * slowStaggerDelay;
                currentPopDuration = slowPopDuration;
                lastSlowNotifPopInFinishTime = Math.max(lastSlowNotifPopInFinishTime, currentNotificationDelay + currentPopDuration * 1000);
            } else {
                // Start chaos notifications after the last slow one has popped in and held
                currentNotificationDelay = lastSlowNotifPopInFinishTime + (slowHoldDuration * 1000) + (i - slowNotificationsCount) * 40;
            }

            setTimeout(() => {
                const img = document.createElement('img');
                
                // Randomly pick an index from the availableFrames array
                const frameIndex = availableFrames[Math.floor(Math.random() * availableFrames.length)];
                img.src = `Assets/figma_notifs/Frame ${frameIndex}.png`; 
                img.classList.add('figma-notif');
                overlay.appendChild(img);

                const startX = window.innerWidth / 2 + (Math.random() - 0.5) * 200;
                const startY = window.innerHeight + 100;

                // Calculate safe bounds to keep notifications within viewport after scaling (1.5x)
                // baseWidth matches the CSS widths (300px desktop, ~160-200px mobile)
                const baseWidth = isMobile ? (window.innerWidth <= 480 ? 208 : 160) : 300;
                const scale = 1.5;
                const scaledWidth = baseWidth * scale;
                const padding = 10; // Margin from screen edges

                // Offset created by the scale expansion from the center
                const expansionOffset = (scaledWidth - baseWidth) / 2;

                // Final safe ranges for the 'x' and 'y' translation
                const minX = expansionOffset + padding;
                const maxX = window.innerWidth - baseWidth - expansionOffset - padding;
                const minY = expansionOffset + padding; // Assuming height is similar or smaller
                const maxY = window.innerHeight - 120 - expansionOffset - padding; // 120 approx height

                gsap.fromTo(img, 
                    { x: startX, y: startY, scale: 0.4, opacity: 0},
                    { 
                        x: gsap.utils.random(minX, maxX),
                        y: gsap.utils.random(minY, maxY),
                        opacity: 1, 
                        scale: 1.5,
                        duration: currentPopDuration,
                        ease: "back.out(1.5)",
                        onComplete: () => {
                            if (i < slowNotificationsCount) {
                                // Fade out slow notifications individually after a hold
                                gsap.to(img, { opacity: 0, duration: 0.5, delay: slowHoldDuration });
                            }
                        }
                    }
                );
            }, currentNotificationDelay);

            totalNotificationAnimationEndTime = Math.max(totalNotificationAnimationEndTime, currentNotificationDelay + currentPopDuration * 1000);
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
            if (timelineState === state) return;
            console.log(`[Sprite] Timeline Logic State: ${state}`);
            timelineState = state;
            updateFigmaCharAnimation();
        }

        function updateFigmaCharAnimation() {
            const target = (timelineState === 'walk' && isScrolling) ? 'walk' : 'idle';
            
            if (target !== currentAnimationState) {
                console.log(`[Sprite] Switching Animation: ${currentAnimationState} -> ${target} (isScrolling: ${isScrolling})`);
                currentAnimationState = target;
                setCharacterState(target);
            }
        }

        // Helper to switch sprite sheets
        function setCharacterState(state) {
            // Kill previous tween to prevent multiple animations running on the same proxy
            if (currentFrameTween) currentFrameTween.kill();

            const proxy = { frame: 0 };
            let framesArray, durationPerFrame;

            if (state === 'walk') {
                framesArray = walkFramesURLs;
                durationPerFrame = 0.08; // Slower leg movement (was 0.05)
            } else { // idle
                framesArray = idleFramesURLs;
                durationPerFrame = 0.1; // Adjust for desired idle speed
            }

            let lastIndex = -1;
            currentFrameTween = gsap.to(proxy, {
                frame: framesArray.length,
                duration: framesArray.length * durationPerFrame,
                ease: "none",
                repeat: -1,
                onUpdate: () => {
                    const index = Math.floor(proxy.frame) % framesArray.length;
                    if (index === lastIndex) return;
                    
                    charEl.style.backgroundImage = `url(${framesArray[index]})`;
                    lastIndex = index;
                }
            });
        }

        // Initial State
        currentAnimationState = 'idle';
        setCharacterState('idle');

        // // -----------------------------
        // // JUMP PAD ANIMATION LOGIC
        // // -----------------------------
        
        // Deterministic Coordinates System
        const P = {
            A: { x: 500,  y: 0 },
            B: { x: 750,  y: -80 },
            C: { x: 1850, y: 20 },
            D: { x: 2850, y: -30 }
        };

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
            onUpdate: function() {
                // This fires every frame the animation updates (including scrub/snap)
                isScrolling = true;
                updateFigmaCharAnimation();

                // Camera tracking for mobile: keep character centered
                if (isMobile) {
                    const charX = gsap.getProperty(".game-character", "x") || 0;
                    // Character visual center: transform x + initial left (200) + half width (75)
                    const targetX = (window.innerWidth / 2) - (charX + 275);
                    gsap.set(".game-world", { x: targetX });
                }

                // Clear the timeout - if this doesn't fire for 100ms, the character is still
                window.clearTimeout(figmaScrollTimeout);
                figmaScrollTimeout = setTimeout(() => {
                    isScrolling = false;
                    updateFigmaCharAnimation();
                }, 100); 
            },
            scrollTrigger: {
                trigger: ".figma-scene",
                start: "top top",
                end: () => window.innerWidth <= 768 ? "+=4000" : "+=9000", // Reduced scroll distance for mobile
                scrub: 0.5,
                pin: true,
                invalidateOnRefresh: true,
                // snap: {
                //     snapTo: "labels",
                //     duration: { min: 0.1, max: 0.4 },
                //     delay: 0, // Instant snap ensures no mid-air pauses
                //     ease: "power1.inOut"
                // },
               // markers: true,
                onUpdate: (self) => {
                    const velocity = self.getVelocity();
                    
                    // Directional flipping logic
                    if (velocity < -10) {
                        gsap.set(".game-character", { scaleX: -1 });
                    } else if (velocity > 10) {
                        gsap.set(".game-character", { scaleX: 1 });
                    }
                }
            }
        });

        // Ensure the game doesn't capture scroll progress during the transition/chaos
        if (gameTl.scrollTrigger) gameTl.scrollTrigger.disable();

        // Character exploration sequence
        gameTl
            .addLabel("start")
            .call(changeFigmaText, [0], 0)
            .to({}, { duration: 0.5 }) // Initial buffer before first walk
            
            // --- PLATFORM A ---
            .addLabel("walk1Start")
            .call(() => setTimelineState('walk'), [], "walk1Start")
            .to(".game-character", { x: P.A.x, y: P.A.y, ease: "none", duration: 3 })
            .addLabel("walk1End")
            .call(() => setTimelineState('idle'), [], "walk1End")

            // --- JUMP A -> B ---
            .to(".game-character", { y: -160, x: 650, duration: 0.8, ease: "power1.out" })
            .to(".game-character", { y: P.B.y, x: P.B.x, duration: 0.8, ease: "power1.in" })
            .addLabel("platform2")
            .call(() => setTimelineState('idle'), [], "platform2")
            .call(changeFigmaText, [1], "+=0.2");

            // --- PLATFORM B ---
        gameTl.addLabel("walk2Start", "+=0.1")
            .call(() => setTimelineState('walk'), [], "walk2Start")
            .to(".game-character", { x: 1230, y: P.B.y, ease: "none", duration: 3 }, "pan+=0.5");
        
        if (!isMobile) {
            gameTl.to(".game-world", { x: "-=1000", ease: "none", duration: 2.5 }, "pan");
        }

        gameTl.addLabel("walk2End")
            .call(() => setTimelineState('idle'), [], "walk2End")
            
            // --- JUMP B -> C ---
            .to(".game-character", { y: -40, x: 1550, duration: 0.8, ease: "power1.out" })
            .to(".game-character", { y: P.C.y, x: P.C.x, duration: 0.8, ease: "power1.in" })
            .addLabel("platform3")
            .call(() => setTimelineState('idle'), [], "platform3")
            .call(changeFigmaText, [2], "+=0.2")
            .to(".boss-cursor", { bottom: "10%", right: "10%", opacity: 1, duration: 0.8 }, "<");

            // --- PLATFORM C ---
        gameTl.addLabel("walk3Start", "+=0.1")
            .call(() => setTimelineState('walk'), [], "walk3Start")
            .to(".game-character", { x: 2280, y: P.C.y, ease: "none", duration: 3 }, "pan2+=0.5");

        if (!isMobile) {
            gameTl.to(".game-world", { x: "-=1000", ease: "none", duration: 2.5 }, "pan2");
        }

        gameTl.addLabel("walk3End")
            .call(() => setTimelineState('idle'), [], "walk3End")

            // --- JUMP C -> D ---
            .to(".game-character", { y: -120, x: 2550, duration: 0.6, ease: "power1.out" })
            .to(".boss-cursor", { bottom: "-300px", right: "-300px", opacity: 0, duration: 0.8 }, "<")
            .to(".game-character", { y: P.D.y, x: P.D.x, duration: 0.6, ease: "power1.in" })
            .addLabel("platform4")
            .call(() => setTimelineState('idle'), [], "platform4")
            .call(changeFigmaText, [3], "+=0.2");

        // Final world pan
        if (!isMobile) {
            gameTl.to(".game-world", { x: "-=800", ease: "none", duration: 3 }, "final+=0.5");
        }

        gameTl.addLabel("final_pan")
            .call(() => setTimelineState('idle'), [], "final_pan") // Ensure idle during final pan
            
            // Show export UI and animate loader after panning is complete
            .call(changeFigmaText, [4])
            .to(".exporting-images", { opacity: 1, duration: 0.5 })
            .to(".exporting-images .loading-bar-progress", {
                width: "100%", 
                duration: 5, 
                ease: "none",
                onComplete: () => {
                    // Enable the final CTA trigger once loading is finished
                    if (window.finalTl && window.finalTl.scrollTrigger) {
                        window.finalTl.scrollTrigger.enable();
                    }
                }
            })
            .addLabel("end");

        // Calculate total time (stagger + duration) and add a small pause before fading
        const fadeDelay = (totalNotificationAnimationEndTime / 1000) + 1.5;

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
                }

                // Refresh all ScrollTriggers while the screen is still technically "locked" 
                // so recalculations don't cause visible jumps or interaction glitches.
                ScrollTrigger.refresh();

                // Release the scroll lock and restart Lenis
                window.isTransitionLocked = false;
                if (window.lenis) {
                    window.lenis.start();
                    
                    // Force the scroll position to the start of the figma scene. 
                    // Using the trigger's calculated 'start' point is more precise than a CSS selector.
                    const targetScroll = (gameTl && gameTl.scrollTrigger) ? gameTl.scrollTrigger.start : '.figma-scene';
                    window.lenis.scrollTo(targetScroll, { 
                        immediate: true,
                        force: true
                    });
                }
            }
        });

        // Start jump pad animation on load
        playJumpPadAnimation(); // This can be called here or later, depending on when you want the jump pad to animate
    }

});