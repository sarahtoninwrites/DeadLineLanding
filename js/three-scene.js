document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById('three-keyboard-container');
    const charContainer = document.getElementById('three-character-container');
    if (!container || !charContainer || !window.THREE || !THREE.GLTFLoader || !THREE.OrbitControls) return;

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

    // --- CHARACTER SCENE SETUP ---
    const charScene = new THREE.Scene();
    const charCamera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    charCamera.position.set(0, 1, 3);
    charCamera.lookAt(0, 0, 0);

    const charRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    charRenderer.setSize(300, 300); // Should match CSS dimensions
    charRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    charContainer.appendChild(charRenderer.domElement);

    // Character Lighting
    const charAmbient = new THREE.AmbientLight(0xffffff, 1.0);
    charScene.add(charAmbient);
    const charDirLight = new THREE.DirectionalLight(0xffffff, 1.0);
    charDirLight.position.set(5, 5, 5);
    charScene.add(charDirLight);

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

    // Load Character
    loader.load('Assets/3D_Models/3DCharacter.glb', (gltf) => {
        const character = gltf.scene;
        charScene.add(character);

        // --- ANIMATION SETUP ---
        if (gltf.animations && gltf.animations.length > 0) {
            const characterMixer = new THREE.AnimationMixer(character);
            characterMixer.timeScale = 0; 
            gltf.animations.forEach((clip) => {
                const action = characterMixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat);
                action.play();
            });
            mixers.push(characterMixer);
        }

        // --- MANUAL POSITIONING ---
        character.position.set(0, 0, 0); // Adjust to center vertically in corner box
        character.rotation.set(0, 0, 0);
        character.scale.set(1000, 1000, 1000);

        // Auto-frame character within its small corner scene
        const box = new THREE.Box3().setFromObject(character);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = charCamera.fov * (Math.PI / 180);
        let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));
        charCamera.position.set(center.x, center.y + (maxDim * 0.1), center.z + cameraZ * 1.5);
        charCamera.lookAt(center);

        console.log("Character loaded successfully");
    }, undefined, (error) => {
        console.error('Error loading 3D character:', error);
    });

    // --- SCROLL ANIMATION TRIGGER ---
    let targetSpeed = 0;
    let currentSpeed = 0;
    let scrollTimeout;
    window.addEventListener('scroll', () => {
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
        charRenderer.render(charScene, charCamera);
    }
    animate();

    // --- WINDOW RESIZE ---
    window.addEventListener('resize', () => {
        // Keyboard resize
        activeCamera.aspect = window.innerWidth / window.innerHeight;
        activeCamera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);

        // Character resize (maintains square ratio for corner box)
        charCamera.updateProjectionMatrix();
    });
});