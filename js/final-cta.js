
document.addEventListener("DOMContentLoaded", () => {
    // -----------------------------
    // FINAL SECTION ANIMATION
    // -----------------------------
    window.finalTl = gsap.timeline({
        scrollTrigger: {
            trigger: ".final-section",
            start: "top 70%", // Trigger slightly earlier for better visibility
            toggleActions: "play none none none",
            once: true
        }
    });

    // Disable the trigger initially so it doesn't fire until the Figma export is done
    if (window.finalTl.scrollTrigger) window.finalTl.scrollTrigger.disable();

    finalTl.from(".final-text", {
        opacity: 0,
        y: 100,
        scale: 0.8,
        duration: 5,
        ease: "power4.out"
    })
    .to(".final-text", { 
        opacity: 0, 
        y: -40, 
        duration: 3, 
        ease: "power2.inOut" 
    }, "+=3") // Wait 2.5 seconds before starting the fade out
    .to(".final-cta", { 
        opacity: 1, 
        visibility: "visible", 
        duration: 5, 
        ease: "power2.inOut" 
    }, "-=0.5");

  });