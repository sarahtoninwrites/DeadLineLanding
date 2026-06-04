document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('three-keyboard-container');
    if (!container || !window.THREE || !THREE.GLTFLoader || !THREE.OrbitControls) return;

    // --- SCENE SETUP ---
    const scene = new THREE.Scene();
    
    let activeCamera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 10000);
    activeCamera.position.set(0, 10, 20); 
    activeCamera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // --- ORBIT CONTROLS ---
    const controls = new THREE.OrbitControls(activeCamera, renderer.domElement);
    controls.enableDamping = true; // Smooth camera movement

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.1);
    directionalLight.position.set(10, 20, 15);
    scene.add(directionalLight);

    // --- LOADING MODELS ---
    const loader = new THREE.GLTFLoader();
    let mixers = [];

    // Load Keyboard
    loader.load('Assets/3D_Models/keyboard.glb', (gltf) => {
        const keyboard = gltf.scene;
        scene.add(keyboard);

        // --- ANIMATION SETUP ---
        if (gltf.animations && gltf.animations.length > 0) {
            const keyboardMixer = new THREE.AnimationMixer(keyboard);
            keyboardMixer.timeScale = 1; 
            keyboardMixer.isKeyboardMixer = true; 
            gltf.animations.forEach((clip) => {
                const action = keyboardMixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat);
                action.play();
            });
            mixers.push(keyboardMixer);
        }

        // --- MANUAL POSITIONING ---
        keyboard.position.set(0, 0, 0);   // Adjust X, Y, Z
        keyboard.rotation.set(0, 0, 0);   // Adjust Rotation (Radians)
        keyboard.scale.set(1, 1, 1);      // Adjust Scale

        // --- CAMERA LOGIC ---
        if (gltf.cameras && gltf.cameras.length > 0) {
            // Use the camera from the GLB model if it exists
            activeCamera = gltf.cameras[0];
            activeCamera.aspect = window.innerWidth / window.innerHeight;
            activeCamera.updateProjectionMatrix();
            console.log("Using camera from GLB model");
        } else {
            // Auto-frame if no model camera is found
            const box = new THREE.Box3().setFromObject(keyboard);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = activeCamera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

            // CUSTOMIZE ZOOM: Change 1.2 to a lower number (like 0.8) to get closer
            cameraZ *= 1.2; 
            
            activeCamera.position.set(center.x, center.y + (maxDim * 0.2), center.z + cameraZ);
            activeCamera.lookAt(center);
            console.log("Auto-framed camera (No GLB camera found)");
        }

    }, undefined, (error) => {
        console.error('Error loading keyboard:', error);
    });

    // --- SCROLL ANIMATION TRIGGER ---
    let targetSpeed = 0;
    let currentSpeed = 0;
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        // Ignore scroll detection if the transition is locked
        if (window.isTransitionLocked) return;

        targetSpeed = 1;
        window.clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            targetSpeed = 0;
        }, 100); 
    });

    // --- ANIMATION LOOP ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);
        const delta = clock.getDelta();
        controls.update(); // Required for damping to work
        
        // Smoothly interpolate animation speed
        currentSpeed = THREE.MathUtils.lerp(currentSpeed, targetSpeed, 0.1);
        mixers.forEach(mixer => {
            if (mixer.isKeyboardMixer) {
                mixer.timeScale = Math.max(0.5, currentSpeed * 1.2); // Keyboard always loops at least at 0.5 speed
            } else {
                mixer.timeScale = currentSpeed * 1.2; // Other mixers (character) only animate when scrolling
            }
            mixer.update(delta);
        });
        
        // Render both scenes
        renderer.render(scene, activeCamera);
    }
    animate();

    // --- WINDOW RESIZE ---
    window.addEventListener('resize', () => {
        // Keyboard resize
        activeCamera.aspect = window.innerWidth / window.innerHeight;
        activeCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
});