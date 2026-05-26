document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    const character = document.querySelector(".walking-character");
    const keyboardVideo = document.querySelector(".keyboard-char");
    let animationStarted = false;

    // Customizable parameters for keyboardVideo
    const KEYBOARD_VIDEO_INITIAL_X_OFFSET = 400;
    const KEYBOARD_VIDEO_INITIAL_Y_OFFSET = -1000;
    const KEYBOARD_VIDEO_INITIAL_ROTATION = -45;
    const KEYBOARD_VIDEO_INITIAL_SCALE = 2.0;
    const KEYBOARD_VIDEO_INITIAL_TOP_PERCENT = "60%";
    const KEYBOARD_VIDEO_INITIAL_LEFT_PERCENT = "75%";

    const KEYBOARD_VIDEO_LANDING_X_OFFSET = 0;
    const KEYBOARD_VIDEO_LANDING_Y_OFFSET = 50;
    const KEYBOARD_VIDEO_LANDING_ROTATION = 0;

    const KEYBOARD_VIDEO_WALK_FINAL_X_OFFSET = -600;
    const KEYBOARD_VIDEO_WALK_FINAL_Y_OFFSET = -100;
    const KEYBOARD_VIDEO_WALK_FINAL_SCALE = 1.2;



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

    if (keyboardVideo) {
        gsap.set(keyboardVideo, {
            opacity: 0,
            width: "18vw",
            top: KEYBOARD_VIDEO_INITIAL_TOP_PERCENT,
            left: KEYBOARD_VIDEO_INITIAL_LEFT_PERCENT,
            x: KEYBOARD_VIDEO_INITIAL_X_OFFSET,
            y: KEYBOARD_VIDEO_INITIAL_Y_OFFSET,
            rotation: KEYBOARD_VIDEO_INITIAL_ROTATION,
            scale: KEYBOARD_VIDEO_INITIAL_SCALE
        });
    }

    // Preload walk cycle frames for smooth scrubbing
    const totalFrames = 30; // 0000.png to 0015.png
    const preloadedImages = [];
    for (let i = 0; i < totalFrames; i++) {
        const img = new Image();
        const frameName = i.toString().padStart(4, '0');
        img.src = `Assets/char_walking/${frameName}.png`;
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
                end: "+=2000", // Increased to slow down the movement speed relative to scroll
                scrub: 0.7, // Higher scrub value smooths out jittery scroll inputs
                invalidateOnRefresh: true
            }
        });

        // WALK
        const walkCycles = 3; // More cycles smooths out the stride over the scroll distance

        // Combine movement and frame scrubbing into one logic block via a proxy
        const frameProxy = { index: 0 };
        characterTimeline.to(frameProxy, {
            index: totalFrames * walkCycles,
            duration: 2, // Synchronized with horizontal movement duration for perfect sync
            ease: "none",
            onUpdate: () => {
                const currentFrame = Math.floor(frameProxy.index) % totalFrames;
                const paddedFrame = currentFrame.toString().padStart(4, '0');
                character.src = `Assets/char_walking/${paddedFrame}.png`;
            }
        }, 0);

        characterTimeline.to(character, {
            x: 140, // Slightly adjusted for a more natural stride-to-distance ratio
            duration: 2,
            ease: "none"
        }, 0);


        // FALL
        characterTimeline.to(character, {
            y: 650,
            rotation: 32,
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

    // -----------------------------
    // KEYBOARD & SECOND CHARACTER ENTRANCE
    // -----------------------------
    gsap.to("#three-keyboard-container", {
        opacity: 1,
        y: 0,
        ease: "none",
        scrollTrigger: {
            trigger: ".keyboard-scene",
            start: "top top",
            end: "+=500",
            scrub: 1.5
        }
    });

    if (keyboardVideo) {
        // Fall animation to initial position on keyboard
        gsap.to(keyboardVideo, {
            opacity: 1,
            x: KEYBOARD_VIDEO_LANDING_X_OFFSET,
            y: KEYBOARD_VIDEO_LANDING_Y_OFFSET,
            rotation: KEYBOARD_VIDEO_LANDING_ROTATION,
            ease: "power2.out",
            scrollTrigger: {
                trigger: ".keyboard-scene",
                start: "top bottom", 
                end: "top top",
                scrub: 1.5
            }
        });

        // // Walk on keyboard (simulating z-axis forward movement)
        // gsap.to(keyboardVideo, {
        //     x: KEYBOARD_VIDEO_WALK_FINAL_X_OFFSET,
        //     y: KEYBOARD_VIDEO_WALK_FINAL_Y_OFFSET,
        //     scale: KEYBOARD_VIDEO_WALK_FINAL_SCALE,
        //     ease: "none",
        //     scrollTrigger: {
        //         trigger: ".keyboard-scene",
        //         start: "top top",
        //         end: "+=3000",
        //         scrub: true,
        //         invalidateOnRefresh: true
        //     }
        // });
    }

    // -----------------------------
    // KEYBOARD VIDEO TRIGGER
    // -----------------------------
    if (keyboardVideo) {
        ScrollTrigger.create({
            trigger: ".fall-trigger",
            start: "top top",
            onEnter: () => {
                gsap.delayedCall(1, () => {
                    keyboardVideo.currentTime = 0;
                    keyboardVideo.play();
                });
            }
        });
    }

});