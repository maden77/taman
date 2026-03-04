// ==================== DATA INITIAL ====================
let gardenData = {
    plants: [
        {
            id: "p1",
            name: "HTML",
            icon: "🏠",
            stage: "tree", // seed, sprout, tree, flower, fruit
            x: 200, y: 300,
            description: "Dasar semua web",
            strength: 0.9,
            createdAt: "2024-01-01",
            lastWatered: "2024-03-15",
            category: "frontend",
            connections: ["p2", "p3"]
        },
        {
            id: "p2",
            name: "CSS",
            icon: "🎨",
            stage: "tree",
            x: 350, y: 250,
            description: "Bikin cantik",
            strength: 0.85,
            createdAt: "2024-01-05",
            lastWatered: "2024-03-14",
            category: "frontend",
            connections: ["p1", "p3", "p4"]
        },
        {
            id: "p3",
            name: "JavaScript",
            icon: "⚡",
            stage: "flower",
            x: 300, y: 400,
            description: "Bikin interaktif",
            strength: 0.95,
            createdAt: "2024-01-10",
            lastWatered: "2024-03-15",
            category: "frontend",
            connections: ["p1", "p2", "p4", "p5"]
        },
        {
            id: "p4",
            name: "React",
            icon: "⚛️",
            stage: "flower",
            x: 450, y: 350,
            description: "Library frontend modern",
            strength: 0.8,
            createdAt: "2024-02-01",
            lastWatered: "2024-03-13",
            category: "frontend",
            connections: ["p3", "p5"]
        },
        {
            id: "p5",
            name: "Node.js",
            icon: "🖥️",
            stage: "sprout",
            x: 400, y: 500,
            description: "JavaScript di server",
            strength: 0.6,
            createdAt: "2024-02-15",
            lastWatered: "2024-03-12",
            category: "backend",
            connections: ["p3", "p4"]
        }
    ],
    
    connections: [
        { from: "p1", to: "p2", strength: 0.8, type: "hard", createdAt: "2024-01-01" },
        { from: "p1", to: "p3", strength: 0.7, type: "hard", createdAt: "2024-01-05" },
        { from: "p2", to: "p3", strength: 0.9, type: "hard", createdAt: "2024-01-10" },
        { from: "p2", to: "p4", strength: 0.5, type: "soft", createdAt: "2024-02-01" },
        { from: "p3", to: "p4", strength: 0.9, type: "hard", createdAt: "2024-02-05" },
        { from: "p3", to: "p5", strength: 0.7, type: "soft", createdAt: "2024-02-15" },
        { from: "p4", to: "p5", strength: 0.4, type: "inspiration", createdAt: "2024-02-20" }
    ],
    
    activity: [
        { time: "2m", text: "🌱 React bertunas baru", type: "growth" },
        { time: "15m", text: "🔗 Koneksi JavaScript → Node.js menguat", type: "connection" },
        { time: "1j", text: "💧 JavaScript disiram", type: "water" }
    ]
};

// ==================== GLOBAL VARIABLES ====================
let canvas, ctx;
let selectedPlant = null;
let currentView = "normal"; // cosmic, normal, micro
let currentTimeIndex = 12; // 0-12 (Jan-Dec)
let isDragging = false;
let dragOffset = { x: 0, y: 0 };
let camera = { x: 0, y: 0, zoom: 1 };
let hoveredPlant = null;
let animationFrame = null;
let rootsVisible = true;
let labelsVisible = true;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initCanvas();
    setupEventListeners();
    updateStats();
    startAnimation();
    renderGarden();
});

function initCanvas() {
    canvas = document.getElementById('gardenCanvas');
    ctx = canvas.getContext('2d');
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight;
    renderGarden();
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    // Canvas interactions
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel);
    canvas.addEventListener('click', handleCanvasClick);
    
    // View controls
    document.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-view').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.dataset.view;
            renderGarden();
        });
    });
    
    // Time slider
    const timeSlider = document.getElementById('timeSlider');
    const timeDisplay = document.getElementById('timeDisplay');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    timeSlider.addEventListener('input', (e) => {
        currentTimeIndex = parseInt(e.target.value);
        const month = months[currentTimeIndex % 12];
        const year = 2024 + Math.floor(currentTimeIndex / 12);
        timeDisplay.textContent = `${month} ${year}`;
        renderGarden(); // Re-render dengan data sesuai waktu
    });
    
    // Buttons
    document.getElementById('addIdeaBtn').addEventListener('click', showAddIdeaModal);
    document.getElementById('waterAllBtn').addEventListener('click', waterAllPlants);
    document.getElementById('findConnectionsBtn').addEventListener('click', findNewConnections);
    document.getElementById('mindStormBtn').addEventListener('click', triggerMindStorm);
    
    // Toggles
    document.getElementById('showRoots').addEventListener('change', (e) => {
        rootsVisible = e.target.checked;
        renderGarden();
    });
    
    document.getElementById('showLabels').addEventListener('change', (e) => {
        labelsVisible = e.target.checked;
        renderGarden();
    });
    
    // Close detail panel
    document.getElementById('closeDetail').addEventListener('click', () => {
        selectedPlant = null;
        document.getElementById('detailContent').innerHTML = '<p class="hint">Klik tanaman untuk lihat detail</p>';
        document.getElementById('detailActions').innerHTML = '';
        renderGarden();
    });
    
    // Modal
    document.querySelector('.close-modal').addEventListener('click', hideModal);
    document.getElementById('cancelModal').addEventListener('click', hideModal);
    document.getElementById('saveIdea').addEventListener('click', saveNewIdea);
}

// ==================== RENDERING ====================
function renderGarden() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Apply camera transform
    ctx.save();
    ctx.translate(camera.x, camera.y);
    ctx.scale(camera.zoom, camera.zoom);
    
    // Draw background grid (tanah)
    drawGrid();
    
    // Draw connections (akar) first
    if (rootsVisible) {
        drawAllConnections();
    }
    
    // Draw plants (tanaman)
    gardenData.plants.forEach(plant => {
        drawPlant(plant);
    });
    
    // Draw labels if enabled
    if (labelsVisible) {
        drawAllLabels();
    }
    
    ctx.restore();
    
    // Update tooltip if hovering
    if (hoveredPlant) {
        updateTooltip(hoveredPlant);
    }
}

function drawGrid() {
    const gridSize = 50 * camera.zoom;
    ctx.strokeStyle = 'rgba(100, 150, 100, 0.2)';
    ctx.lineWidth = 1;
    
    // Grid horizontal
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.strokeStyle = 'rgba(100, 150, 100, 0.1)';
        ctx.stroke();
    }
    
    // Grid vertikal
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
}

function drawPlant(plant) {
    const x = plant.x;
    const y = plant.y;
    const size = getPlantSize(plant);
    
    // Glow effect untuk tanaman yang dipilih
    if (selectedPlant && selectedPlant.id === plant.id) {
        ctx.shadowColor = '#4caf50';
        ctx.shadowBlur = 20;
    } else if (hoveredPlant && hoveredPlant.id === plant.id) {
        ctx.shadowColor = '#ffd700';
        ctx.shadowBlur = 15;
    }
    
    // Gambar berdasarkan stage
    ctx.font = `${size}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(plant.icon, x, y);
    
    // Reset shadow
    ctx.shadowBlur = 0;
    
    // Gambar "kesehatan" sebagai lingkaran di bawah
    if (plant.strength < 0.3) {
        // Layu - lingkaran merah
        ctx.beginPath();
        ctx.arc(x, y + size/2, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ff6b6b';
        ctx.fill();
    } else if (plant.strength > 0.8) {
        // Sehat - lingkaran hijau dengan efek berdenyut
        const pulse = Math.sin(Date.now() * 0.005) * 2;
        ctx.beginPath();
        ctx.arc(x, y + size/2, 5 + pulse, 0, Math.PI * 2);
        ctx.fillStyle = '#4caf50';
        ctx.fill();
    }
}

function getPlantSize(plant) {
    // Ukuran berdasarkan stage
    const sizes = {
        seed: 20,
        sprout: 30,
        tree: 40,
        flower: 45,
        fruit: 50
    };
    
    let size = sizes[plant.stage] || 30;
    
    // Tambah variasi berdasarkan strength
    size = size * (0.8 + (plant.strength * 0.4));
    
    return size;
}

function drawAllConnections() {
    gardenData.connections.forEach(conn => {
        const fromPlant = gardenData.plants.find(p => p.id === conn.from);
        const toPlant = gardenData.plants.find(p => p.id === conn.to);
        
        if (fromPlant && toPlant) {
            drawConnection(fromPlant, toPlant, conn);
        }
    });
}

function drawConnection(from, to, conn) {
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    
    // Curved line (akar melengkung)
    const midX = (from.x + to.x) / 2;
    const midY = (from.y + to.y) / 2 - 20; // Lengkung ke atas
    
    ctx.quadraticCurveTo(midX, midY, to.x, to.y);
    
    // Style berdasarkan tipe koneksi
    switch(conn.type) {
        case 'hard':
            ctx.strokeStyle = '#4caf50';
            ctx.lineWidth = conn.strength * 4;
            break;
        case 'soft':
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = conn.strength * 3;
            ctx.setLineDash([5, 5]);
            break;
        case 'inspiration':
            ctx.strokeStyle = '#ff9800';
            ctx.lineWidth = conn.strength * 2;
            ctx.setLineDash([2, 8]);
            break;
        default:
            ctx.strokeStyle = '#8bc34a';
            ctx.lineWidth = conn.strength * 2;
    }
    
    ctx.stroke();
    
    // Reset line dash
    ctx.setLineDash([]);
    
    // Gambar "nutrisi" mengalir di akar (efek hidup)
    if (conn.strength > 0.7) {
        const t = (Date.now() * 0.001) % 1;
        
        // Titik bergerak di sepanjang akar
        ctx.beginPath();
        ctx.arc(
            from.x + (to.x - from.x) * t,
            from.y + (to.y - from.y) * t - 20 * Math.sin(t * Math.PI),
            3,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = '#ffffff';
        ctx.fill();
    }
}

function drawAllLabels() {
    ctx.font = '12px Inter';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    
    gardenData.plants.forEach(plant => {
        ctx.fillText(plant.name, plant.x, plant.y - 30);
    });
    
    ctx.shadowBlur = 0;
}

// ==================== INTERACTIONS ====================
function handleMouseDown(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - camera.x) / camera.zoom;
    const mouseY = (e.clientY - rect.top - camera.y) / camera.zoom;
    
    // Check if clicked on a plant
    const clickedPlant = findPlantAt(mouseX, mouseY);
    
    if (clickedPlant) {
        selectedPlant = clickedPlant;
        showPlantDetail(clickedPlant);
        isDragging = true;
        dragOffset.x = mouseX - clickedPlant.x;
        dragOffset.y = mouseY - clickedPlant.y;
        canvas.style.cursor = 'grabbing';
    } else {
        isDragging = true;
        dragOffset.x = e.clientX - camera.x;
        dragOffset.y = e.clientY - camera.y;
        canvas.style.cursor = 'grabbing';
    }
    
    renderGarden();
}

function handleMouseMove(e) {
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - camera.x) / camera.zoom;
    const mouseY = (e.clientY - rect.top - camera.y) / camera.zoom;
    
    // Hover detection
    const plantUnderMouse = findPlantAt(mouseX, mouseY);
    if (plantUnderMouse !== hoveredPlant) {
        hoveredPlant = plantUnderMouse;
        renderGarden();
    }
    
    if (isDragging && selectedPlant) {
        // Move selected plant
        selectedPlant.x = mouseX - dragOffset.x;
        selectedPlant.y = mouseY - dragOffset.y;
        renderGarden();
    } else if (isDragging) {
        // Pan camera
        camera.x = e.clientX - dragOffset.x;
        camera.y = e.clientY - dragOffset.y;
        renderGarden();
    }
}

function handleMouseUp() {
    isDragging = false;
    canvas.style.cursor = 'grab';
    renderGarden();
}

function handleWheel(e) {
    e.preventDefault();
    
    const zoomFactor = 0.95;
    if (e.deltaY < 0) {
        // Zoom in
        camera.zoom *= 1.1;
    } else {
        // Zoom out
        camera.zoom *= 0.95;
    }
    
    // Limit zoom
    camera.zoom = Math.max(0.5, Math.min(2, camera.zoom));
    
    renderGarden();
}

function handleCanvasClick(e) {
    // Click handling untuk selection
    const rect = canvas.getBoundingClientRect();
    const mouseX = (e.clientX - rect.left - camera.x) / camera.zoom;
    const mouseY = (e.clientY - rect.top - camera.y) / camera.zoom;
    
    const clickedPlant = findPlantAt(mouseX, mouseY);
    
    if (clickedPlant) {
        showPlantDetail(clickedPlant);
    }
}

function findPlantAt(x, y) {
    return gardenData.plants.find(plant => {
        const size = getPlantSize(plant);
        const dist = Math.sqrt((x - plant.x) ** 2 + (y - plant.y) ** 2);
        return dist < size / 2;
    });
}

// ==================== DETAIL PANEL ====================
function showPlantDetail(plant) {
    selectedPlant = plant;
    
    const content = document.getElementById('detailContent');
    const actions = document.getElementById('detailActions');
    
    // Hitung stats
    const connectionCount = gardenData.connections.filter(
        c => c.from === plant.id || c.to === plant.id
    ).length;
    
    const ageInDays = Math.floor((new Date() - new Date(plant.createdAt)) / (1000 * 60 * 60 * 24));
    
    content.innerHTML = `
        <div class="plant-detail">
            <div class="detail-icon" style="font-size: 48px;">${plant.icon}</div>
            <h2>${plant.name}</h2>
            <p class="category">${plant.category}</p>
            <p class="description">${plant.description}</p>
            
            <div class="detail-stats">
                <div class="stat">
                    <span>Tahap:</span>
                    <strong>${getStageName(plant.stage)}</strong>
                </div>
                <div class="stat">
                    <span>Koneksi:</span>
                    <strong>${connectionCount}</strong>
                </div>
                <div class="stat">
                    <span>Kekuatan:</span>
                    <div class="progress-small">
                        <div class="progress-fill" style="width: ${plant.strength * 100}%">
                            ${Math.round(plant.strength * 100)}%
                        </div>
                    </div>
                </div>
                <div class="stat">
                    <span>Usia:</span>
                    <strong>${ageInDays} hari</strong>
                </div>
                <div class="stat">
                    <span>Terakhir disiram:</span>
                    <strong>${plant.lastWatered}</strong>
                </div>
            </div>
            
            <div class="connections-list">
                <h4>🔗 Koneksi:</h4>
                ${getConnectedPlants(plant).map(p => 
                    `<div class="connection-item">
                        <span>${p.icon} ${p.name}</span>
                        <span class="connection-strength">${getConnectionStrength(plant, p)}%</span>
                    </div>`
                ).join('')}
            </div>
        </div>
    `;
    
    actions.innerHTML = `
        <button class="btn-primary" onclick="waterPlant('${plant.id}')">
            <i class="fas fa-tint"></i> Siram
        </button>
        <button class="btn-secondary" onclick="prunePlant('${plant.id}')">
            <i class="fas fa-cut"></i> Pangkas
        </button>
        <button class="btn-accent" onclick="evolvePlant('${plant.id}')">
            <i class="fas fa-seedling"></i> Evolusi
        </button>
    `;
}

function getStageName(stage) {
    const names = {
        seed: '🌱 Bibit',
        sprout: '🌿 Tunas',
        tree: '🌳 Tumbuh',
        flower: '🌸 Berbunga',
        fruit: '🍎 Berbuah'
    };
    return names[stage] || stage;
}

function getConnectedPlants(plant) {
    const connections = gardenData.connections.filter(
        c => c.from === plant.id || c.to === plant.id
    );
    
    return connections.map(c => {
        const otherId = c.from === plant.id ? c.to : c.from;
        return gardenData.plants.find(p => p.id === otherId);
    }).filter(p => p);
}

function getConnectionStrength(plant1, plant2) {
    const conn = gardenData.connections.find(
        c => (c.from === plant1.id && c.to === plant2.id) ||
             (c.from === plant2.id && c.to === plant1.id)
    );
    return Math.round(conn.strength * 100);
}

// ==================== ACTIONS ====================
function waterPlant(plantId) {
    const plant = gardenData.plants.find(p => p.id === plantId);
    if (plant) {
        plant.strength = Math.min(1, plant.strength + 0.1);
        plant.lastWatered = new Date().toISOString().split('T')[0];
        
        // Add activity
        addActivity(`💧 ${plant.name} disiram`, 'water');
        
        // Perkuat koneksi
        gardenData.connections.forEach(c => {
            if (c.from === plantId || c.to === plantId) {
                c.strength = Math.min(1, c.strength + 0.05);
            }
        });
        
        renderGarden();
        showPlantDetail(plant);
        updateStats();
    }
}

function waterAllPlants() {
    gardenData.plants.forEach(plant => {
        plant.strength = Math.min(1, plant.strength + 0.05);
        plant.lastWatered = new Date().toISOString().split('T')[0];
    });
    
    gardenData.connections.forEach(c => {
        c.strength = Math.min(1, c.strength + 0.02);
    });
    
    addActivity('💧 Semua tanaman disiram', 'water');
    renderGarden();
    updateStats();
}

function prunePlant(plantId) {
    // Hapus tanaman
    gardenData.plants = gardenData.plants.filter(p => p.id !== plantId);
    gardenData.connections = gardenData.connections.filter(
        c => c.from !== plantId && c.to !== plantId
    );
    
    addActivity('✂️ Tanaman dipangkas', 'prune');
    selectedPlant = null;
    renderGarden();
    updateStats();
}

function evolvePlant(plantId) {
    const plant = gardenData.plants.find(p => p.id === plantId);
    const stages = ['seed', 'sprout', 'tree', 'flower', 'fruit'];
    const currentIndex = stages.indexOf(plant.stage);
    
    if (currentIndex < stages.length - 1) {
        plant.stage = stages[currentIndex + 1];
        addActivity(`✨ ${plant.name} berevolusi jadi ${getStageName(plant.stage)}`, 'evolve');
        renderGarden();
        showPlantDetail(plant);
    }
}

function findNewConnections() {
    // Simulasi AI mencari koneksi baru
    const newConnections = [];
    
    // Cari tanaman yang belum terkoneksi tapi related
    for (let i = 0; i < gardenData.plants.length; i++) {
        for (let j = i + 1; j < gardenData.plants.length; j++) {
            const p1 = gardenData.plants[i];
            const p2 = gardenData.plants[j];
            
            // Cek apakah sudah ada koneksi
            const existing = gardenData.connections.find(
                c => (c.from === p1.id && c.to === p2.id) ||
                     (c.from === p2.id && c.to === p1.id)
            );
            
            if (!existing && Math.random() > 0.7) {
                // Koneksi baru ditemukan!
                const strength = Math.random() * 0.5 + 0.3;
                gardenData.connections.push({
                    from: p1.id,
                    to: p2.id,
                    strength: strength,
                    type: Math.random() > 0.5 ? 'soft' : 'inspiration',
                    createdAt: new Date().toISOString().split('T')[0]
                });
                
                newConnections.push(`${p1.name} ↔ ${p2.name}`);
            }
        }
    }
    
    if (newConnections.length > 0) {
        addActivity(`🔗 ${newConnections.length} koneksi baru ditemukan!`, 'connection');
    } else {
        addActivity('🤔 Tidak ada koneksi baru', 'info');
    }
    
    renderGarden();
    updateStats();
}

function triggerMindStorm() {
    // Badai ide - koneksi random bermunculan
    addActivity('🌪️ MIND STORM TERJADI!', 'storm');
    
    // Efek visual getaran
    canvas.style.animation = 'shake 0.5s';
    setTimeout(() => {
        canvas.style.animation = '';
    }, 500);
    
    // Tambah koneksi random
    for (let i = 0; i < 5; i++) {
        const random1 = Math.floor(Math.random() * gardenData.plants.length);
        let random2 = Math.floor(Math.random() * gardenData.plants.length);
        while (random2 === random1) {
            random2 = Math.floor(Math.random() * gardenData.plants.length);
        }
        
        const p1 = gardenData.plants[random1];
        const p2 = gardenData.plants[random2];
        
        gardenData.connections.push({
            from: p1.id,
            to: p2.id,
            strength: Math.random() * 0.8 + 0.1,
            type: 'inspiration',
            createdAt: new Date().toISOString().split('T')[0]
        });
    }
    
    renderGarden();
}

// ==================== MODAL ====================
function showAddIdeaModal() {
    // Populate existing connections
    const container = document.getElementById('existingConnections');
    container.innerHTML = gardenData.plants.map(plant => `
        <label>
            <input type="checkbox" value="${plant.id}">
            ${plant.icon} ${plant.name}
        </label>
    `).join('');
    
    document.getElementById('ideaModal').classList.remove('hidden');
}

function hideModal() {
    document.getElementById('ideaModal').classList.add('hidden');
    document.getElementById('newIdeaForm').reset();
}

function saveNewIdea() {
    const name = document.getElementById('ideaName').value;
    const desc = document.getElementById('ideaDesc').value;
    const category = document.getElementById('ideaCategory').value;
    const stage = document.querySelector('input[name="stage"]:checked').value;
    
    // Get selected connections
    const connections = [];
    document.querySelectorAll('#existingConnections input:checked').forEach(cb => {
        connections.push(cb.value);
    });
    
    // Create new plant
    const newPlant = {
        id: 'p' + Date.now(),
        name: name,
        icon: getIconForCategory(category),
        stage: stage,
        x: Math.random() * (canvas.width - 100) + 50,
        y: Math.random() * (canvas.height - 100) + 50,
        description: desc,
        strength: 0.3,
        createdAt: new Date().toISOString().split('T')[0],
        lastWatered: new Date().toISOString().split('T')[0],
        category: category,
        connections: connections
    };
    
    gardenData.plants.push(newPlant);
    
    // Create connections
    connections.forEach(connId => {
        gardenData.connections.push({
            from: newPlant.id,
            to: connId,
            strength: 0.3,
            type: 'soft',
            createdAt: newPlant.createdAt
        });
    });
    
    addActivity(`🌱 Ide baru ditanam: ${name}`, 'new');
    
    hideModal();
    renderGarden();
    updateStats();
}

function getIconForCategory(category) {
    const icons = {
        frontend: '🎨',
        backend: '⚙️',
        database: '🗄️',
        devops: '🚀',
        mobile: '📱',
        other: '💡'
    };
    return icons[category] || '🌱';
}

// ==================== UTILITIES ====================
function addActivity(text, type) {
    const time = 'baru saja';
    gardenData.activity.unshift({ time, text, type });
    
    // Update UI
    const list = document.getElementById('activityList');
    const newItem = document.createElement('li');
    newItem.innerHTML = `<span class="time">${time}</span>${text}`;
    list.insertBefore(newItem, list.firstChild);
    
    // Batasi activity
    if (gardenData.activity.length > 10) {
        gardenData.activity.pop();
        list.removeChild(list.lastChild);
    }
}

function updateStats() {
    document.getElementById('totalPlants').textContent = gardenData.plants.length;
    document.getElementById('totalRoots').textContent = gardenData.connections.length;
    
    const strongConnections = gardenData.connections.filter(c => c.strength > 0.7).length;
    document.getElementById('strongConnections').textContent = strongConnections;
    
    const avgStrength = gardenData.connections.reduce((acc, c) => acc + c.strength, 0) / 
                        (gardenData.connections.length || 1);
    const health = Math.round(avgStrength * 100);
    document.getElementById('gardenHealth').style.width = health + '%';
    document.getElementById('gardenHealth').textContent = health + '%';
}

function updateTooltip(plant) {
    const tooltip = document.getElementById('tooltip');
    const rect = canvas.getBoundingClientRect();
    
    // Convert plant coordinates to screen coordinates
    const screenX = plant.x * camera.zoom + camera.x + rect.left;
    const screenY = plant.y * camera.zoom + camera.y + rect.top;
    
    tooltip.style.left = (screenX + 20) + 'px';
    tooltip.style.top = (screenY - 50) + 'px';
    
    document.getElementById('tooltipIcon').textContent = plant.icon;
    document.getElementById('tooltipTitle').textContent = plant.name;
    document.getElementById('tooltipDesc').textContent = plant.description;
    document.getElementById('tooltipStrength').textContent = Math.round(plant.strength * 100) + '%';
    
    const ageInDays = Math.floor((new Date() - new Date(plant.createdAt)) / (1000 * 60 * 60 * 24));
    document.getElementById('tooltipAge').textContent = ageInDays + ' hari';
    
    tooltip.classList.remove('hidden');
}

// ==================== ANIMATION LOOP ====================
function startAnimation() {
    function animate() {
        // Efek hidup: akar berdenyut, daun bergoyang
        if (rootsVisible) {
            // Redraw dengan efek animasi
            renderGarden();
        }
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    animate();
}

// ==================== EXPOSE GLOBALLY ====================
// Biar bisa dipanggil dari HTML
window.waterPlant = waterPlant;
window.prunePlant = prunePlant;
window.evolvePlant = evolvePlant;

// ==================== INITIAL RENDER ====================
// Panggil pertama kali
updateStats();