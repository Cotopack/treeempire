const tg = window.Telegram.WebApp;
tg.expand();

let userId = tg.initDataUnsafe?.user?.id || Math.floor(Math.random()*999999);
let username = tg.initDataUnsafe?.user?.username || "Player";

let coins = 0;
let perSecond = 1;
let level = 1;

// Login
async function login() {
    let urlParams = new URLSearchParams(window.location.search);
    let ref = urlParams.get("ref");
    let res = await fetch("/login", {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:userId, username, ref})
    });
    let data = await res.json();
    coins = data.coins;
    perSecond = data.perSecond;
    level = data.level;
    updateUI();
}

function updateUI(){
    document.getElementById("coins").innerText = Math.floor(coins);
    document.getElementById("persec").innerText = perSecond;
}

setInterval(()=>{
    coins += perSecond;
    updateUI();
},1000);

setInterval(()=>{
    fetch("/update",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body:JSON.stringify({id:userId,coins,perSecond,level})
    });
},5000);

// Buttons
document.getElementById("upgrade").onclick = ()=>{
    if(coins>=100){
        coins-=100;
        perSecond+=1;
        level++;
        group.scale.set(1+level*0.05,1+level*0.05,1+level*0.05);
    }
};

document.getElementById("leaders").onclick = async ()=>{
    let res = await fetch("/leaderboard");
    let data = await res.json();
    let box=document.getElementById("leaderboard");
    box.style.display="block";
    box.innerHTML="<h3>🏆 Top Players</h3>";
    data.forEach(p=>{
        box.innerHTML+=`<div>${p.username} - ${Math.floor(p.coins)}</div>`;
    });
};

document.getElementById("invite").onclick = ()=>{
    const refLink = `https://t.me/YOUR_BOT?start=${userId}`;
    tg.openTelegramLink(
        `https://t.me/share/url?url=${encodeURIComponent(refLink)}&text=🌳 Join TREE COIN and grow your Web3 forest!`
    );
};

/* ===== 3D TREE ===== */
let scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x0f2027,5,25);

let camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1,1000);
let renderer = new THREE.WebGLRenderer({canvas:document.getElementById("game"), alpha:true, antialias:true});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0,2,6);

let light = new THREE.DirectionalLight(0xffffff,1.2);
light.position.set(5,10,7);
scene.add(light);

let ambient = new THREE.AmbientLight(0x88ffcc,0.5);
scene.add(ambient);

let group = new THREE.Group();
scene.add(group);

let trunkGeo = new THREE.CylinderGeometry(0.4,0.6,3,12);
let trunkMat = new THREE.MeshStandardMaterial({color:0x8b5a2b});
let trunk = new THREE.Mesh(trunkGeo,trunkMat);
trunk.position.y=1.5;
group.add(trunk);

let leaves = [];
for(let i=0;i<10;i++){
    let geo = new THREE.SphereGeometry(1.2,16,16);
    let mat = new THREE.MeshStandardMaterial({color:0x2ecc71});
    let leaf = new THREE.Mesh(geo,mat);
    leaf.position.set(Math.random()*2-1,3+Math.random(),Math.random()*2-1);
    leaf.userData.baseY = leaf.position.y;
    group.add(leaf);
    leaves.push(leaf);
}

function animate(){
    requestAnimationFrame(animate);
    group.rotation.y+=0.002;
    leaves.forEach(l=>{
        l.position.y = l.userData.baseY + Math.sin(Date.now()*0.002)*0.05;
    });
    renderer.render(scene,camera);
}
animate();

/* ===== TON CONNECT ===== */
const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
    manifestUrl: 'tonconnect-manifest.json',
    buttonRootId: 'ton-connect'
});

login();
