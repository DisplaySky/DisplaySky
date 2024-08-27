

// Setup scene, camera, and renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);

// Add ambient light
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

// Add directional light to simulate sunlight
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7).normalize();
scene.add(directionalLight);

// Add fog
scene.fog = new THREE.FogExp2(0xaaaaaa, 0.02);
renderer.setClearColor(0x87CEEB); // Background color similar to the fog color

// Create car with orientation as per requirement
const carGroup = new THREE.Group();

// Body of the car (nằm dọc)
const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1); // Chiều dài lớn hơn chiều rộng
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
carGroup.add(body);

// Roof of the car (nằm dọc)
const roofGeometry = new THREE.BoxGeometry(2, 0.25, 1); // Đặt kích thước mái xe tương tự như thân xe
const roofMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const roof = new THREE.Mesh(roofGeometry, roofMaterial);
roof.position.set(0, 0.5, 0); // Positioned on top of the body
carGroup.add(roof);

// Wheels of the car
const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });

const wheelPositions = [
    [-0.75, -0.25, 0.5], // Adjusted positions
    [0.75, -0.25, 0.5],
    [-0.75, -0.25, -0.5],
    [0.75, -0.25, -0.5]
];

wheelPositions.forEach(pos => {
    const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
    wheel.rotation.z = Math.PI / 2; // Rotate the wheel to be horizontal
    wheel.position.set(pos[0], pos[1], pos[2]);
    carGroup.add(wheel);
});

scene.add(carGroup);

// Create road (sàn)
const roadGeometry = new THREE.PlaneGeometry(100, 100);
const roadMaterial = new THREE.MeshStandardMaterial({ color: 0x555555, side: THREE.DoubleSide });
const road = new THREE.Mesh(roadGeometry, roadMaterial);
road.rotation.x = -Math.PI / 2;
road.position.y = -0.5; // Make sure road is placed at the correct height
scene.add(road);

// Add skybox
const loader = new THREE.TextureLoader();
const skyboxTexture = loader.load('https://threejs.org/examples/textures/skybox/px.jpg'); // Use a texture for the skybox
const skyboxGeometry = new THREE.BoxGeometry(100, 100, 100);
const skyboxMaterial = new THREE.MeshBasicMaterial({ map: skyboxTexture, side: THREE.BackSide });
const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterial);
scene.add(skybox);

// Create rain
const rainGeometry = new THREE.CylinderGeometry(0.05, 0.05, 1, 6); // Increased size for visibility
const rainMaterial = new THREE.MeshBasicMaterial({ color: 0xaaaaaa, transparent: true, opacity: 0.5 });
const rainCount = 500; // Reduced count for testing
const rain = new THREE.Group();
scene.add(rain);

for (let i = 0; i < rainCount; i++) {
    const drop = new THREE.Mesh(rainGeometry, rainMaterial);
    drop.position.set(
        Math.random() * 200 - 100,
        Math.random() * 200,
        Math.random() * 200 - 100
    );
    drop.rotation.z = Math.random() * Math.PI;
    rain.add(drop);
}

function updateRain() {
    rain.children.forEach(drop => {
        drop.position.y -= 0.5;
        if (drop.position.y < -50) { // Adjust to ensure drops reappear
            drop.position.y = 200;
        }
    });
}

// Create snow
const snowGeometry = new THREE.SphereGeometry(0.1, 8, 8);
const snowMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.8 });
const snowCount = 500; // Reduced count for testing
const snow = new THREE.Group();
scene.add(snow);

for (let i = 0; i < snowCount; i++) {
    const flake = new THREE.Mesh(snowGeometry, snowMaterial);
    flake.position.set(
        Math.random() * 200 - 100,
        Math.random() * 200,
        Math.random() * 200 - 100
    );
    snow.add(flake);
}

function updateSnow() {
    snow.children.forEach(flake => {
        flake.position.y -= 0.1;
        if (flake.position.y < -50) { // Adjust to ensure flakes reappear
            flake.position.y = 200;
        }
    });
}

// Create walls (tường)
const wallGeometry = new THREE.BoxGeometry(10, 10, 1); // Dimensions of the walls
const wallMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const walls = new THREE.Group();
scene.add(walls);

// Create boundaries (bức tường) at the edges of the room
const wallPositions = [
    [-50, 5, 0], // Left wall
    [50, 5, 0], // Right wall
    [0, 5, -50], // Front wall
    [0, 5, 50] // Back wall
];

wallPositions.forEach(pos => {
    const wall = new THREE.Mesh(wallGeometry, wallMaterial);
    wall.position.set(pos[0], pos[1], pos[2]);
    walls.add(wall);
});

// Add ceiling
const ceilingGeometry = new THREE.PlaneGeometry(100, 100);
const ceilingMaterial = new THREE.MeshStandardMaterial({ color: 0xaaaaaa, side: THREE.DoubleSide });
const ceiling = new THREE.Mesh(ceilingGeometry, ceilingMaterial);
ceiling.rotation.x = Math.PI / 2;
ceiling.position.y = 10; // Position the ceiling at the top of the room
scene.add(ceiling);

// Function to detect collision with walls
function detectCollision() {
    const carBox = new THREE.Box3().setFromObject(carGroup);
    
    for (const wall of walls.children) {
        const wallBox = new THREE.Box3().setFromObject(wall);
        if (carBox.intersectsBox(wallBox)) {
            return true; // Collision detected
        }
    }
    return false; // No collision
}

// Function to change the car skin
function changeCarSkin(color) {
    body.material.color.set(color);
    roof.material.color.set(color);
}

// Set up camera position
camera.position.z = 10;
camera.position.y = 5;
camera.lookAt(carGroup.position);

// Set up keyboard controls
const keys = {};
document.addEventListener('keydown', (event) => {
    keys[event.code] = true;
});
document.addEventListener('keyup', (event) => {
    keys[event.code] = false;
});

// Car movement variables
let carSpeed = 0.1; // Default car speed
const carTurnSpeed = 0.05;
let carDirection = new THREE.Vector3(0, 0, -1); // Default direction is forward

// Create UI for skin selection and settings
function createUI() {
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.top = '10px';
    uiContainer.style.left = '10px';
    uiContainer.style.zIndex = 1000;
    uiContainer.style.fontFamily = 'Arial, sans-serif';

    // Create a button to open the skin selector
    const openButton = document.createElement('button');
    openButton.textContent = 'Choose Car Skin';
    openButton.style.fontSize = '16px';
    openButton.style.padding = '10px';
    openButton.style.backgroundColor = '#444';
    openButton.style.color = '#fff';
    openButton.style.border = 'none';
    openButton.style.borderRadius = '5px';
    openButton.style.cursor = 'pointer';
    openButton.style.transition = 'background-color 0.3s ease'; // Smooth background color transition
    uiContainer.appendChild(openButton);

    // Create a container for skin options
    const skinContainer = document.createElement('div');
    skinContainer.style.display = 'none';
    skinContainer.style.position = 'absolute';
    skinContainer.style.top = '50px';
    skinContainer.style.left = '10px';
    skinContainer.style.backgroundColor = '#fff';
    skinContainer.style.border = '1px solid #ccc';
    skinContainer.style.padding = '10px';
    skinContainer.style.borderRadius = '5px';
    skinContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    skinContainer.style.transition = 'opacity 0.3s ease'; // Smooth opacity transition
    skinContainer.style.opacity = '0'; // Start hidden
    uiContainer.appendChild(skinContainer);

    // Skin options
    const skins = [
        { color: '#ff0000', name: 'Red' },
        { color: '#00ff00', name: 'Green' },
        { color: '#0000ff', name: 'Blue' }
    ];

    skins.forEach(skin => {
        const skinButton = document.createElement('button');
        skinButton.textContent = skin.name;
        skinButton.style.display = 'block';
        skinButton.style.margin = '5px 0';
        skinButton.style.padding = '5px';
        skinButton.style.backgroundColor = skin.color;
        skinButton.style.color = '#fff';
        skinButton.style.border = 'none';
        skinButton.style.borderRadius = '5px';
        skinButton.style.cursor = 'pointer';
        skinButton.style.transition = 'transform 0.1s'; // Smooth button press effect

        // Add press effect
        skinButton.addEventListener('mousedown', () => {
            skinButton.style.transform = 'scale(0.95)';
        });
        skinButton.addEventListener('mouseup', () => {
            skinButton.style.transform = 'scale(1)';
        });
        skinButton.addEventListener('mouseleave', () => {
            skinButton.style.transform = 'scale(1)';
        });

        skinButton.addEventListener('click', () => {
            changeCarSkin(skin.color);
            skinContainer.style.opacity = '0'; // Hide skin options after selection
            setTimeout(() => {
                skinContainer.style.display = 'none';
            }, 300); // Match with the opacity transition duration
        });
        skinContainer.appendChild(skinButton);
    });

    // Toggle skin selection
    openButton.addEventListener('click', () => {
        if (skinContainer.style.display === 'none') {
            skinContainer.style.display = 'block';
            setTimeout(() => {
                skinContainer.style.opacity = '1';
            }, 10); // Delay to apply opacity transition
        } else {
            skinContainer.style.opacity = '0';
            setTimeout(() => {
                skinContainer.style.display = 'none';
            }, 300); // Match with the opacity transition duration
        }
    });

    // Create settings button
    const settingsButton = document.createElement('button');
    settingsButton.textContent = 'Settings';
    settingsButton.style.fontSize = '16px';
    settingsButton.style.padding = '10px';
    settingsButton.style.backgroundColor = '#444';
    settingsButton.style.color = '#fff';
    settingsButton.style.border = 'none';
    settingsButton.style.borderRadius = '5px';
    settingsButton.style.cursor = 'pointer';
    settingsButton.style.transition = 'background-color 0.3s ease'; // Smooth background color transition
    settingsButton.style.marginTop = '10px'; // Space between skin button and settings button
    uiContainer.appendChild(settingsButton);

    // Create settings container
    const settingsContainer = document.createElement('div');
    settingsContainer.style.display = 'none';
    settingsContainer.style.position = 'absolute';
    settingsContainer.style.top = '100px';
    settingsContainer.style.left = '10px';
    settingsContainer.style.backgroundColor = '#fff';
    settingsContainer.style.border = '1px solid #ccc';
    settingsContainer.style.padding = '10px';
    settingsContainer.style.borderRadius = '5px';
    settingsContainer.style.boxShadow = '0 0 10px rgba(0,0,0,0.3)';
    settingsContainer.style.transition = 'opacity 0.3s ease'; // Smooth opacity transition
    settingsContainer.style.opacity = '0'; // Start hidden
    uiContainer.appendChild(settingsContainer);

    // Car speed slider
    const speedLabel = document.createElement('label');
    speedLabel.textContent = 'Car Speed: ';
    settingsContainer.appendChild(speedLabel);

    const speedInput = document.createElement('input');
    speedInput.type = 'range';
    speedInput.min = '0.1';
    speedInput.max = '2';
    speedInput.step = '0.1';
    speedInput.value = carSpeed;
    speedInput.style.width = '150px';
    speedInput.addEventListener('input', (event) => {
        carSpeed = parseFloat(event.target.value);
    });
    settingsContainer.appendChild(speedInput);

    // Discord icon link
    const discordLink = document.createElement('a');
    discordLink.href = 'https://discord.gg/ApAmMPnT';
    discordLink.target = '_blank'; // Open in new tab
    discordLink.style.display = 'block';
    discordLink.style.marginTop = '20px';

    const discordIcon = document.createElement('img');
    discordIcon.src = 'data:image/png;base64,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'; // Discord logo
    discordIcon.alt = 'Join us on Discord';
    discordIcon.style.width = '40px';
    discordIcon.style.height = '40px';
    discordIcon.style.cursor = 'pointer';
    discordIcon.style.transition = 'opacity 0.3s ease'; // Smooth opacity transition

    discordIcon.addEventListener('mouseover', () => {
        discordIcon.style.opacity = '0.7';
    });
    discordIcon.addEventListener('mouseout', () => {
        discordIcon.style.opacity = '1';
    });

    discordLink.appendChild(discordIcon);
    settingsContainer.appendChild(discordLink);

    // GitHub icon link
    const githubLink = document.createElement('a');
    githubLink.href = 'https://github.com/DisplaySky'; // Thay đổi URL thành trang GitHub của bạn
    githubLink.target = '_blank'; // Open in new tab
    githubLink.style.display = 'block';
    githubLink.style.marginTop = '20px';

    const githubIcon = document.createElement('img');
    githubIcon.src = 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'; // GitHub logo
    githubIcon.alt = 'Visit our GitHub';
    githubIcon.style.width = '40px';
    githubIcon.style.height = '40px';
    githubIcon.style.cursor = 'pointer';
    githubIcon.style.transition = 'opacity 0.3s ease'; // Smooth opacity transition

    githubIcon.addEventListener('mouseover', () => {
        githubIcon.style.opacity = '0.7';
    });
    githubIcon.addEventListener('mouseout', () => {
        githubIcon.style.opacity = '1';
    });

    githubLink.appendChild(githubIcon);
    settingsContainer.appendChild(githubLink);

    // Toggle settings
    settingsButton.addEventListener('click', () => {
        if (settingsContainer.style.display === 'none') {
            settingsContainer.style.display = 'block';
            setTimeout(() => {
                settingsContainer.style.opacity = '1';
            }, 10); // Delay to apply opacity transition
        } else {
            settingsContainer.style.opacity = '0';
            setTimeout(() => {
                settingsContainer.style.display = 'none';
            }, 300); // Match with the opacity transition duration
        }
    });

    document.body.appendChild(uiContainer);
}

// Create UI
createUI();

// Game loop
function animate() {
    requestAnimationFrame(animate);

    // Save previous position
    const previousPosition = carGroup.position.clone();

    // Car controls
    if (keys['ArrowUp']) {
        carGroup.position.addScaledVector(carDirection, carSpeed);
    }
    if (keys['ArrowDown']) {
        carGroup.position.addScaledVector(carDirection, -carSpeed);
    }
    if (keys['ArrowLeft']) {
        carGroup.rotation.y += carTurnSpeed;
        carDirection.applyAxisAngle(new THREE.Vector3(0, 1, 0), carTurnSpeed);
    }
    if (keys['ArrowRight']) {
        carGroup.rotation.y -= carTurnSpeed;
        carDirection.applyAxisAngle(new THREE.Vector3(0, -1, 0), carTurnSpeed);
    }

    // Check collision with walls
    if (detectCollision()) {
        carGroup.position.copy(previousPosition); // Revert to previous position
    }

    // Update camera position
    camera.position.set(
        carGroup.position.x + Math.sin(carGroup.rotation.y) * 10,
        camera.position.y,
        carGroup.position.z + Math.cos(carGroup.rotation.y) * 10
    );
    camera.lookAt(carGroup.position);

    // Update rain and snow
    updateRain();
    updateSnow();

    // Render scene
    renderer.render(scene, camera);
}

// Start animation loop
animate();

// Handle window resize
window.addEventListener('resize', () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
});
