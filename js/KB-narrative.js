document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    const mainText = document.querySelector(".main-text");

    const subText = document.querySelector(".sub-text");

    if(!mainText || !subText) return;

    // Add Level Indicator
    const levelIndicator = document.createElement('p');
    levelIndicator.style.cssText = "position:absolute; top:40px; left:40px; font-family:'Manrope',sans-serif; font-size:18px; font-weight:800; color:white; z-index:1000; letter-spacing:0.2em; margin:0;";
    levelIndicator.textContent = 'LV 1';
    const keyboardScene = document.querySelector('.keyboard-scene');
    if (keyboardScene) keyboardScene.appendChild(levelIndicator);


    // -----------------------------
    // STORY DATA
    // -----------------------------

    const story = [

        {

            main: "You've been shrunk to the size of a pixel and dropped on your own keyboard.",

            sub: "Start here. Reach ESC"

        },

        {

            main: "47 keys stand between you and freedom.",

            sub: ""

        },

        {

            main: "Fall between them and you restart. No second chances.",

            sub: ""

        },

        {

            main: "Some keys don’t want you to make it.",

            sub: ""

        }

    ];


    // -----------------------------
    // TEXT UPDATE FUNCTION
    // -----------------------------

    let currentIndex = -1;

    function changeText(index) {
        if (index === currentIndex) return;
        currentIndex = index;

        const content = story[index];
        if(!content) return;

        // Prevent overlapping animations if the user scrolls quickly
        gsap.killTweensOf([mainText, subText]);

        gsap.to(
            [mainText, subText],

            {

                opacity: 0,

                y: 40,

                duration: 0.5,

                ease: "power2.out",

                onComplete: () => {

                    mainText.textContent = content.main;

                    subText.textContent = content.sub;


                    gsap.fromTo(

                        [mainText, subText],

                        {

                            opacity: 0,

                            y: 40

                        },

                        {

                            opacity: 1,

                            y: 0,

                            duration: 0.6,

                            stagger: 0.05,

                            ease: "power3.out"

                        }

                    );

                }

            }

        );

    }


    // -----------------------------
    // INITIAL TEXT
    // -----------------------------

    mainText.textContent = "";

    subText.textContent = "";


    // -----------------------------
    // MASTER TIMELINE
    // -----------------------------

    const tl = gsap.timeline({

        scrollTrigger: {

            trigger: ".keyboard-scene",
            start: "top top",
            end: () => window.innerWidth <= 768 ? "+=2500" : "+=4500",
            scrub: 0.3,
            invalidateOnRefresh: true,

            pin: true

        }

    });


    // -----------------------------
    // STORY BEATS
    // -----------------------------

    // Add an empty duration at the start so the scene settles before text appears
    tl.to({}, { duration: 1.5 }) 
      .call(() => changeText(0), null, 1.5)
      .call(() => changeText(1), null, 2.5)
      .call(() => changeText(2), null, 3.5)
      .call(() => changeText(3), null, 4.5)
      .to({}, { duration: 1.5 }); // Hold the final text before transitioning
});