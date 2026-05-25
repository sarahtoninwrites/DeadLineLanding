window.initCharacterModel = function(scene, mixers) {
    const loader = new THREE.GLTFLoader();

    loader.load('Assets/3D_Models/3DCharacter.glb', (gltf) => {
        const character = gltf.scene;
        scene.add(character);

        // Initial positioning to place it on top of the keyboard area
        character.position.set(0, 0.5, 0); 
        character.scale.set(1, 1, 1);

        // Setup animations if the GLB contains them
        if (gltf.animations && gltf.animations.length > 0) {
            const mixer = new THREE.AnimationMixer(character);
            mixer.timeScale = 0; // Start at 0, let the main loop drive speed
            gltf.animations.forEach((clip) => {
                const action = mixer.clipAction(clip);
                action.setLoop(THREE.LoopRepeat);
                action.play();
            });
            mixers.push(mixer);
        }
    }, undefined, (error) => {
        console.error('Error loading 3D character model:', error);
    });
};