document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    const character = document.querySelector(".walking-character");
    let animationStarted = false;

    // -----------------------------
    // INITIAL STATE
    // -----------------------------
    if (character) {
        gsap.set(character, {
            x: 0,
            y: 0,
            rotation: 0,
            opacity: 1
        });
    }

    // Preload walk cycle frames for smooth scrubbing
    const totalFrames = 30; // 0000.png to 0015.png
    const preloadedImages = [];
    for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        const frameName = i.toString().padStart(4, '0');
        img.src = `Assets/hero_elements/char_walking/${frameName}.png`;
        preloadedImages.push(img);
    }


    if (character) {
        // -----------------------------
        // MASTER CHARACTER TIMELINE
        // -----------------------------
        // Created immediately on load to ensure perfect sync with hero zoom
        const characterTimeline = gsap.timeline({
            scrollTrigger: {
                trigger: ".deadline-hero",
                start: "top top",
                end: () => window.innerWidth <= 768 ? "+=1500" : "+=2500",
                scrub: 0.5, // Reduced from 0.7 for more responsive control
                snap: {
                    snapTo: [0, 0.7, 1], // Snap to start, landing, and end of fall
                    duration: { min: 0.2, max: 0.5 },
                    delay: 0.1,
                    ease: "power1.inOut"
                },
                invalidateOnRefresh: true
            }
        });

        // WALK
        const walkCycles = 3; // More cycles smooths out the stride over the scroll distance

        // Combine movement and frame scrubbing into one logic block via a proxy
        const frameProxy = { index: 0 };
        let lastFrame = -1;

        characterTimeline.to(frameProxy, {
            index: totalFrames * walkCycles,
            duration: 2, // Synchronized with horizontal movement duration for perfect sync
            ease: "none",
            onUpdate: () => {
                const currentFrame = Math.floor(frameProxy.index) % totalFrames;
                if (currentFrame === lastFrame) return;
                
                const paddedFrame = currentFrame.toString().padStart(4, '0');
                character.src = `Assets/hero_elements/char_walking/${paddedFrame}.png`;
                lastFrame = currentFrame;
            }
        }, 0);

        characterTimeline.to(character, {
            x: "10vw", 
            duration: 2,
            ease: "none"
        }, 0);


        // FALL
        characterTimeline.to(character, {
            y: "70vh",
            opacity: 0,
            ease: "power4.in",
            duration: 1.2
        });
    }


    // Placeholder for compatibility with hero.js if needed elsewhere
    window.startCharacterAnimation = function() {
        if(animationStarted) return;
        animationStarted = true;
        console.log("Character timeline initialized via ScrollTrigger");
    };


});