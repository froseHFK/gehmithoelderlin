import './style.css';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import swanModelUrl from './swan.glb';
import loomModelUrl from './loom.glb';
import islandModelUrl from './fortress_island.glb';
import inkModelUrl from './ink_bottle_with_quill.glb';

// --- INITIALISIERUNG ---
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 250;
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);
const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
directionalLight.position.set(2, 5, 5);
scene.add(directionalLight);

// --- VARIABLEN ---
let points = null; let originalPositions = null; let randomPositions = null; let targetProgress = 0, currentProgress = 0; const clock = new THREE.Clock(); const startSize = 1.0, endSize = 2.3; const mouse = new THREE.Vector2(); const raycaster = new THREE.Raycaster(); const plane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0); const mouse3D = new THREE.Vector3(); const hoverRadius = 80, hoverStrength = 7.0; window.addEventListener('mousemove', (event) => { mouse.x = (event.clientX / window.innerWidth) * 2 - 1; mouse.y = -(event.clientY / window.innerHeight) * 2 + 1; }); const seasons = [ new THREE.Color('#3d2c3f'), new THREE.Color('#a8d8b9'), new THREE.Color('#f7d08a'), new THREE.Color('#c98a6d'), new THREE.Color('#4a4e69') ]; const currentBgColor = seasons[0].clone();

// --- JAVASCRIPT VON DEINEM KOLLEGEN ---
const versesPool = [ "Ich bin nur Bild und atme doch: ein Hauch aus Kreide, Licht und Zeit.", "Sprich mir vom Wind — ich höre Schritte im Gras der Jahre.", "Ein Blatt, das fällt, ist Gottes Silbe auf deinem Weg.", "Der Fluss vergisst nicht; er trägt die Namen heim ins Meer.", "Wohin du zeigst, dort öffnet sich die Welt wie eine Zeile.", "Das Ferne wohnt im Nahen, seit du es ans Licht sprichst." ];
const transitions = [ "Sag mir, was du siehst…", "Was trägt der Himmel heute?", "Ein Geräusch — und was es weckt?", "Noch ein Bild, und ich antworte." ];
let sessionNotes = []; let speaking = false;
function $(sel){ return document.querySelector(sel); }
function speak(text){ const out = $(".output"); typewriter(out, text); if ('speechSynthesis' in window) { const u = new SpeechSynthesisUtterance(text.replace(/\n/g, " ")); u.lang = 'de-DE'; u.rate = 0.95; u.pitch = 1.02; window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } }
function typewriter(el, text){ el.textContent = ""; let i = 0; const iv = setInterval(()=>{ el.textContent += text[i++] || ""; if(i >= text.length){ clearInterval(iv); } }, 14); }
function randomItem(a){ return a[Math.floor(Math.random()*a.length)] }
(function(){ const frame = $(".frame"); let rect = null; function handle(x,y){ if(!rect) rect = frame.getBoundingClientRect(); const dx = (x - (rect.left + rect.width/2)) / rect.width; const dy = (y - (rect.top + rect.height/2)) / rect.height; const rotX = dy * -6; const rotY = dx * 6; frame.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg)`; } window.addEventListener('mousemove', e=> handle(e.clientX, e.clientY)); window.addEventListener('touchmove', e=> { if(e.touches && e.touches[0]) handle(e.touches[0].clientX, e.touches[0].clientY); }, {passive:true}); })();
$(".frame").addEventListener("click", ()=>{ const v = randomItem(versesPool); sessionNotes.push(v); speak(v + "\n" + randomItem(transitions)); });
$("#verseBtn").addEventListener("click", (e)=>{ e.preventDefault(); speak(randomItem(versesPool)); });

let recognition; if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) { const SR = window.SpeechRecognition || window.webkitSpeechRecognition; recognition = new SR(); recognition.lang = 'de-DE'; recognition.interimResults = true; recognition.maxAlternatives = 1; recognition.onresult = (e)=>{ let finalText = ""; for(let i = e.resultIndex; i < e.results.length; i++){ const frag = e.results[i][0].transcript; if(e.results[i].isFinal) finalText += frag; $(".readout").textContent = frag; } if(finalText){ sessionNotes.push(finalText.trim()); const reply = craftReply(finalText); speak(reply); } }; recognition.onend = ()=>{ speaking = false; $("#micBtn").textContent = "🎤 Diktieren"; } }
function craftReply(userText){ const motifs = ["Licht", "Wind", "Fluss", "Weg", "Heimat"]; const motif = randomItem(motifs); const cleaned = userText.replace(/[\.\!\?]+$/,""); const line1 = `${cleaned}, sagst du — und ${motif.toLowerCase()} antwortet leise.`; const line2 = randomItem([ "Ein kurzer Schritt genügt, und die Welt wird Zeile.", "Ich höre darin den Tag, der sich erinnert.", "So spricht die Nähe, wenn das Ferne lauscht." ]); return line1 + "\n" + line2; }
$("#micBtn").addEventListener("click", ()=>{ if(!recognition){ alert("Sprachaufnahme wird von deinem Browser nicht unterstützt."); return; } if(!speaking){ speaking = true; $(".readout").textContent = "…höre zu"; recognition.start(); $("#micBtn").textContent = "■ Stop"; } else { recognition.stop(); } });
$("#poemBtn").addEventListener("click", ()=>{ const lines = buildPoem(sessionNotes).join("\n"); speak(lines); downloadText("hoelderlin_spaziergang.txt", lines); });
function buildPoem(notes){ const motifs = ["Fluss", "Licht", "Wind", "Weg", "Abend", "Heimat", "Regen", "Blatt", "Stille"]; const out = []; const n = Math.min(12, Math.max(8, notes.length + 4)); for(let i=0;i<n;i++){ const seed = (notes[i%notes.length] || "").split(/\s+/).slice(0,5).join(" "); const m = randomItem(motifs); const variants = [ `${seed} — und ${m.toLowerCase()} hält den Atem an.`, `Ich gehe; ${m.toLowerCase()} geht mit, leise und doch nah.`, `Was du gesagt hast, wird Zeile; ${m.toLowerCase()} liest sie vor.`, `Zwischen Schritt und Schritt ein Raum, den ${m.toLowerCase()} füllt.`, `Der Tag verneigt sich; ${m.toLowerCase()} bleibt und hört uns zu.` ]; out.push(randomItem(variants)); } out.push("— Ende des Spaziergangs —"); return out; }
function downloadText(filename, text){ const blob = new Blob([text], {type:"text/plain"}); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click(); URL.revokeObjectURL(a.href); a.remove(); }

// --- PARTIKEL- & MODELL-CODE ---
const textureLoader = new THREE.TextureLoader();
textureLoader.load('/hoelderlin.jpg', (texture) => { const image = texture.image; const canvas = document.createElement('canvas'); const context = canvas.getContext('2d', { willReadFrequently: true }); canvas.width = image.width; canvas.height = image.height; context.drawImage(image, 0, 0, image.width, image.height); const imageData = context.getImageData(0, 0, image.width, image.height).data; const particlesGeometry = new THREE.BufferGeometry(); const positions = [], colors = [], tempRandomPositions = []; const gap = 3, sphereRadius = 300; for (let y = 0; y < image.height; y += gap) { for (let x = 0; x < image.width; x += gap) { const index = (y * image.width + x) * 4; const a = imageData[index + 3] / 255; if (a > 0.5) { positions.push(x - image.width / 2, -(y - image.height / 2), 0); colors.push(imageData[index] / 255, imageData[index + 1] / 255, imageData[index + 2] / 255); const theta = Math.random() * 2 * Math.PI, phi = Math.acos(2 * Math.random() - 1), radius = Math.cbrt(Math.random()) * sphereRadius; tempRandomPositions.push(radius * Math.sin(phi) * Math.cos(theta), radius * Math.sin(phi) * Math.sin(theta), radius * Math.cos(phi)); } } } originalPositions = new Float32Array(positions); randomPositions = new Float32Array(tempRandomPositions); particlesGeometry.setAttribute('position', new THREE.Float32BufferAttribute(randomPositions.slice(), 3)); particlesGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3)); const particlesMaterial = new THREE.PointsMaterial({ size: startSize, vertexColors: true, blending: THREE.AdditiveBlending, transparent: true, depthWrite: false }); points = new THREE.Points(particlesGeometry, particlesMaterial); scene.add(points); });
const loader = new GLTFLoader(); const models = {}; const modelUrls = { 'scene-1': swanModelUrl, 'scene-2': loomModelUrl, 'scene-3': inkModelUrl, 'scene-4': islandModelUrl };
for (const sceneId in modelUrls) { loader.load(modelUrls[sceneId], (gltf) => { const model = gltf.scene; model.name = sceneId; model.visible = false; const box = new THREE.Box3().setFromObject(model); const size = box.getSize(new THREE.Vector3()); const scale = 150 / size.y; model.scale.set(scale, scale, scale); model.position.set(200, -50, -50); scene.add(model); models[sceneId] = model; if (sceneId === 'scene-1') { /* Models start hidden */ } }); }

// --- BURGER-MENÜ & BUTTON-LOGIK ---
const burgerMenu = document.querySelector('.burger-menu');
burgerMenu.addEventListener('click', () => { document.body.classList.toggle('nav-active'); });
const buttons = document.querySelectorAll('.poem-nav button');
const scenes = document.querySelectorAll('.scene');
const centerStage = $('#center-stage');
const contentArea = $('.content-area');

buttons.forEach((button, index) => {
    button.addEventListener('click', () => {
        targetProgress = index / (buttons.length - 1);
        buttons.forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        const targetId = button.dataset.target;
        
        if (targetId === 'scene-main') {
            centerStage.style.display = 'grid';
            contentArea.style.display = 'none';
        } else {
            centerStage.style.display = 'none';
            contentArea.style.display = 'grid';
        }

        scenes.forEach(scene => scene.classList.toggle('hidden', scene.id !== targetId));
        for (const modelId in models) {
            models[modelId].visible = (modelId === targetId);
        }
        
        document.body.classList.remove('nav-active');
    });
});

// --- ANIMATIONSLOOP ---
function animate() {
    requestAnimationFrame(animate);
    const elapsedTime = clock.getElapsedTime();
    currentProgress += (targetProgress - currentProgress) * 0.1;
    const seasonProgress = currentProgress * (seasons.length - 1);
    const fromIndex = Math.floor(seasonProgress); const toIndex = Math.min(fromIndex + 1, seasons.length - 1);
    const progressInSegment = seasonProgress - fromIndex;
    currentBgColor.copy(seasons[fromIndex]).lerp(seasons[toIndex], progressInSegment);
    document.body.style.backgroundColor = `#${currentBgColor.getHexString()}`;
    const r = Math.floor(currentBgColor.r * 255), g = Math.floor(currentBgColor.g * 255), b = Math.floor(currentBgColor.b * 255);
    document.documentElement.style.setProperty('--nav-bg-rgb', `${r}, ${g}, ${b}`);
    
    raycaster.setFromCamera(mouse, camera);
    raycaster.ray.intersectPlane(plane, mouse3D);

    if (points) {
        points.material.size = startSize + (endSize - startSize) * currentProgress;
        const currentPositions = points.geometry.attributes.position.array;
        const waveFactor = 1.0 - currentProgress;
        for (let i = 0; i < currentPositions.length; i += 3) {
            let targetX = randomPositions[i] + (originalPositions[i] - randomPositions[i]) * currentProgress;
            let targetY = randomPositions[i+1] + (originalPositions[i+1] - randomPositions[i+1]) * currentProgress;
            let targetZ = randomPositions[i+2] + (originalPositions[i+2] - randomPositions[i+2]) * currentProgress;
            const waveOffset = Math.sin(elapsedTime * 0.5 + originalPositions[i] * 0.01) * 2.0 * waveFactor;
            targetY += waveOffset;
            const dx = currentPositions[i] - mouse3D.x, dy = currentPositions[i + 1] - mouse3D.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < hoverRadius) {
                const force = (hoverRadius - distance) / hoverRadius;
                targetX += (dx / distance) * force * hoverStrength;
                targetY += (dy / distance) * force * hoverStrength;
            }
            currentPositions[i] += (targetX - currentPositions[i]) * 0.1;
            currentPositions[i + 1] += (targetY - currentPositions[i + 1]) * 0.1;
            currentPositions[i + 2] += (targetZ - currentPositions[i + 2]) * 0.1;
        }
        points.geometry.attributes.position.needsUpdate = true;
    }

    for (const modelId in models) {
        if (models[modelId].visible) {
            models[modelId].rotation.y += 0.005;
            models[modelId].rotation.x += (-mouse.y * 0.2 - models[modelId].rotation.x) * 0.05;
        }
    }

    renderer.render(scene, camera);
}
animate();

// --- RESIZE-HANDLER ---
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});