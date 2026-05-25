document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    const character = document.querySelector(".walking-character");
    const keyboardVideo = document.querySelector(".keyboard-char");
    let animationStarted = false;

    if(!character) return;


    // -----------------------------
    // INITIAL STATE
    // -----------------------------

    gsap.set(character, {

        x: 0,
        y: 0,
        rotation: 0,
        opacity: 1

    });

    // Helper to handle play promises and avoid AbortError
    const safePlay = () => {
        const playPromise = character.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Ignore the interruption error safely
            });
        }
    };

    const safePause = () => {
        if (!character.paused) {
            character.pause();
        }
    };

    safePause();


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
    const videoDuration = (character.duration && !isNaN(character.duration)) ? character.duration : 2;
    const walkCycles = 4; // Increased cycles to help the stride feel more fluid over the distance

    // Combine movement and frame scrubbing into one logic block via a proxy
    const videoProxy = { time: 0 };
    characterTimeline.to(videoProxy, {
        time: videoDuration * walkCycles,
        duration: 2, // Synchronized with horizontal movement duration for perfect sync
        ease: "none",
        onUpdate: () => {
            // Use modulo to loop the video frames smoothly
            character.currentTime = videoProxy.time % videoDuration;
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


    // Placeholder for compatibility with hero.js if needed elsewhere
    window.startCharacterAnimation = function() {
        if(animationStarted) return;
        animationStarted = true;
        console.log("Character timeline initialized via ScrollTrigger");
    };

    // -----------------------------
    // KEYBOARD & SECOND CHARACTER ENTRANCE
    // -----------------------------
    gsap.to(["#three-keyboard-container", ".keyboard-char"], {
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