gsap.registerPlugin(ScrollTrigger);


// LENIS

window.lenis = new Lenis();

function raf(time) {

    window.lenis.raf(time);

    requestAnimationFrame(raf);

}

requestAnimationFrame(raf);