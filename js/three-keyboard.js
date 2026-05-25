window.initKeyboardModel = function(scene, camera, controls, mixers) {
    const loader = new THREE.GLTFLoader();

    loader.load('Assets/3D_Models/keyboard.glb', (gltf) => {
        const keyboard = gltf.scene;
        scene.add(keyboard);

// --- MANUAL POSITIONING ---
        keyboard.position.set(0, 0, 0);   // Adjust X, Y, Z
        keyboard.rotation.set(0, 0, 0);   // Adjust Rotation (Radians)
        keyboard.scale.set(1, 1, 1);      // Adjust Scale

        // --- ANIMATION SETUP ---
        if (gltf.animations && gltf.animations.length > 0) {
            const keyboardMixer = new THREE.AnimationMixer(keyboard);
            keyboardMixer.timeScale = 0.3; // Base speed for continuous looping
            keyboardMixer.isKeyboardMixer = true; // Identify this mixer
            gltf.animations.forEach((clip) => {
                const action = keyboardMixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat);
                action.play(); // Play immediately, but speed 0 makes it appear paused
            });
            mixers.push(keyboardMixer);
        }

        // --- CAMERA LOGIC ---
        if (gltf.cameras && gltf.cameras.length > 0) {
            // Use the camera from the GLB model if it exists
            const glbCamera = gltf.cameras[0];
            
            // Use world matrix for better accuracy if the camera is nested
            glbCamera.updateMatrixWorld();
            camera.position.setFromMatrixPosition(glbCamera.matrixWorld);
            camera.quaternion.setFromMatrixQuaternion(glbCamera.matrixWorld);
            
            camera.fov = glbCamera.fov;
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            controls.object = camera; // Sync controls
            console.log("Using camera from GLB model");
        } else {
            // Auto-frame if no model camera is found
            const box = new THREE.Box3().setFromObject(keyboard);
            const center = box.getCenter(new THREE.Vector3());
            const size = box.getSize(new THREE.Vector3());

            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 / Math.tan(fov / 2));

            // CUSTOMIZE ZOOM: Change 1.2 to a lower number (like 0.8) to get closer
            cameraZ *= 1.2; 
            
            camera.position.set(center.x, center.y + (maxDim * 0.5), center.z + cameraZ);
            camera.lookAt(center.x, center.y, center.z);
            console.log("Auto-framed camera (No GLB camera found)");
        }
        controls.update();

    }, undefined, (error) => {
        console.error('Error loading keyboard:', error);
    });
};
