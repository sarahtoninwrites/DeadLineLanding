const video = document.querySelector('.keyboard-video');

if (window.innerWidth <= 768) {
    video.src = 'Assets/kb_elements/character_vertical.mov';
    console.log('Playing MOBILE video:', video.src);
} else {
    video.src = 'Assets/kb_elements/character_horizontal.mov';
    console.log('Playing DESKTOP video:', video.src);
}
