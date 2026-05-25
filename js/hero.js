document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    // HERO ZOOM

    gsap.to(".hero-zoom-wrapper", {

        scale: 2.12,
        x: 300,

        ease: "none",

        scrollTrigger: {

            trigger: ".deadline-hero",

            start: "top top",

            end: "+=2000", // Increased to match the character timeline and slow down the zoom

            scrub: true,
            pin: true
        }

    });


    // SCROLL INDICATOR

    window.addEventListener("scroll", () => {

        const indicator = document.querySelector(".scroll-indicator");

        if(!indicator) return;


        if(window.scrollY > 50) {

            indicator.style.opacity = "0";

            indicator.style.pointerEvents = "none";

        }

        else {

            indicator.style.opacity = "1";

        }

    });

});