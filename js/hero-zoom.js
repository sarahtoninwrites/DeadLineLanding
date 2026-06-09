document.addEventListener("DOMContentLoaded", () => {

    gsap.registerPlugin(ScrollTrigger);

    // HERO ZOOM

    gsap.to(".hero-zoom-wrapper", {

        scale: 2.3,
        x: () => window.innerWidth <= 768 ? "8vw" : "11vw",

        ease: "none",

        scrollTrigger: {

            trigger: ".deadline-hero",

            start: "top top",

            end: () => window.innerWidth <= 768 ? "+=1200" : "+=2000",

            scrub: true,
            pin: true,
            invalidateOnRefresh: true
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