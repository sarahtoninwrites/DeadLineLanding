document.addEventListener("DOMContentLoaded", () => {
    gsap.registerPlugin(ScrollTrigger);

    // -----------------------------
    // FIGMA LOADING BAR
    // -----------------------------
    let burstTriggered = false;

    gsap.to(".figma-loading .loading-bar-progress", {
        width: "100%",
        ease: "none",
        scrollTrigger: {
            trigger: ".figma-loading",
            start: "top top",
            end: "+=1000",
            scrub: true,
            pin: true,
            onUpdate: (self) => {
                // Trigger chaos as we approach 100%
                if (self.progress > 0.9 && !burstTriggered) {
                    burstTriggered = true;
                    triggerNotificationChaos();
                }
            }
        }
    });

    function triggerNotificationChaos() {
        const overlay = document.querySelector('.notification-overlay');
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
            { main: "The comments are physical here!", sub: "" }
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
                frame: framesArray.length - 1,
                duration: framesArray.length * durationPerFrame,
                ease: "steps(" + (framesArray.length - 1) + ")",
                repeat: -1,
                onUpdate: () => {
                    charEl.style.backgroundImage = `url(${framesArray[Math.round(proxy.frame)]})`;
                }
            });
        }

        // Initial State
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
                frame: jumpPadFrames.length - 1, // Animate to the last valid index
                duration: 3, // Adjust this duration for slower/faster loop
                ease: "steps(" + (jumpPadFrames.length - 1) + ")",
                onUpdate: () => {
                    jumpPadEl.src = jumpPadFrames[Math.round(proxy.frame)];
                },
                repeat: -1 // Loop indefinitely
            });
        }

        // -----------------------------
        // 2D GAMEPLAY EXPLORATION
        // -----------------------------
        const gameTl = gsap.timeline({
            scrollTrigger: {
                trigger: ".figma-scene",
                start: "top top",
                end: "+=6000",
                scrub: 1,
                pin: true,
                markers: false,
                onUpdate: (self) => {
                    if (self.direction === -1) {
                        gsap.set(".game-character", { scaleX: -1 });
                    } else {
                        gsap.set(".game-character", { scaleX: 1 });
                    }
                }
            }
        });

        // Character exploration sequence
        gameTl
            .call(changeFigmaText, [0], 0)
            // Walk across first platform
            .to(".game-character", { x: 580, ease: "none", onStart: () => setCharacterState('walk'), onReverseComplete: () => setCharacterState('idle'), duration: 1 })
            // Jump to second platform (curved arc)
            .to(".game-character", { y: -160, x: 750, duration: 0.4, ease: "power1.out" })
            .to(".game-character", { y: -80, x: 950, duration: 0.4, ease: "power1.in", onComplete: () => setCharacterState('idle'), onReverseComplete: () => setCharacterState('walk') })
            .call(changeFigmaText, [1], "+=0.2")
            // Walk across second platform while world pans (P2 is at 900-1500)
            .to(".game-character", { x: 1480, ease: "none", onStart: () => setCharacterState('walk'), onReverseComplete: () => setCharacterState('idle'), duration: 1 }, "pan")
            .to(".game-world", { x: "-=1000", ease: "none" }, "pan")
            // Jump down to third platform (curved arc)
            .to(".game-character", { y: -40, x: 1650, duration: 0.4, ease: "power1.out" })
            .to(".game-character", { y: 20, x: 1850, duration: 0.4, ease: "power1.in", onComplete: () => setCharacterState('idle'), onReverseComplete: () => setCharacterState('walk') })
            .call(changeFigmaText, [2], "+=0.2")

            // Walk across third platform (P3 is at 1800-2400)
            .to(".game-character", { x: 2380, ease: "none", onStart: () => setCharacterState('walk'), onReverseComplete: () => setCharacterState('idle'), duration: 1 }, "pan2")
            .to(".game-world", { x: "-=1000", ease: "none" }, "pan2")

            // Jump down to fourth platform (curved arc)
            .to(".game-character", { y: -10, x: 2550, duration: 0.4, ease: "power1.out" })
            .to(".game-character", { y: -80, x: 2850, duration: 0.4, ease: "power1.in", onComplete: () => {
                setCharacterState('idle');
            }, onReverseComplete: () => setCharacterState('walk') })
            .call(changeFigmaText, [3], "+=0.2")

            // Final world pan with character frozen
            .to(".game-world", { x: "-=800", ease: "none", duration: 2, onStart: () => setCharacterState('idle') }, "final")
            
            // Show export UI and animate loader after panning is complete
            .to(".exporting-images", { opacity: 1, duration: 0.5 })
            .to(".exporting-images .loading-bar-progress", { width: "100%", duration: 2, ease: "none" });

        // Calculate total time (stagger + duration) and add a small pause before fading
        const fadeDelay = (notifCount * 40 / 1000) + 1.5;

        gsap.to([overlay, ".notification-overlay"], {
            opacity: 0,
            duration: 1.5,
            delay: fadeDelay,
            ease: "power2.inOut",
            onComplete: () => {
                overlay.innerHTML = ''; // Clean up DOM
            }
        });

        // Start jump pad animation on load
        playJumpPadAnimation();
    }

    // -----------------------------
    // FINAL SECTION ANIMATION
    // -----------------------------
    let finalReplayTriggered = false;
    gsap.from(".final-text", {
        opacity: 0,
        y: 100,
        scale: 0.8,
        duration: 1.5,
        ease: "power4.out",
        scrollTrigger: {
            trigger: ".final-section",
            start: "top 80%",
            toggleActions: "play none none reverse",
            onEnter: () => {
                if (finalReplayTriggered) return;
                finalReplayTriggered = true;

                // Wait a few seconds, then transition to the replay screen
                gsap.delayedCall(4, () => {
                    const tl = gsap.timeline();
                    tl.to(".final-text", { opacity: 0, y: -40, duration: 2, ease: "power2.inOut" })
                      .to(".final-cta", { opacity: 1, visibility: "visible", duration: 1.5, ease: "power2.inOut" }, "-=0.5");
                });
            }
        }
    });
});