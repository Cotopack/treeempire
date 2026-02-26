let state = {
coins: 0,
perClick: 1,
passive: 0,
boost: 1,
refs: 0,
lastUpdate: Date.now()
};
let tg = window.Telegram.WebApp;

if(tg){
    tg.expand(); // раскрывает на весь экран

    const user = tg.initDataUnsafe?.user;

    if(user){
        console.log("Telegram ID:", user.id);
        console.log("Имя:", user.first_name);
    }
}

const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const treeEl = document.getElementById("tree");
const refsEl = document.getElementById("refs");

function save(){
localStorage.setItem("treeEmpire", JSON.stringify(state));
}

function load(){
let data = JSON.parse(localStorage.getItem("treeEmpire"));
if(data) state = data;
}
load();

function format(n){
return Intl.NumberFormat().format(Math.floor(n));
}

function updateUI(){
balanceEl.textContent = format(state.coins) + " Tree Coin";
incomeEl.textContent = "Доход: " + format(state.passive * state.boost) + " / сек";
refsEl.textContent = state.refs;
}

treeEl.onclick = () => {
state.coins += state.perClick * state.boost;
updateUI();
};

document.getElementById("upgradeBtn").onclick = () => {
if(state.coins >= 1000){
state.coins -= 1000;
state.passive += 1;
updateUI();
}
};

document.getElementById("boostBtn").onclick = () => {
state.boost = 3;
setTimeout(() => state.boost = 1, 300000);
alert("Буст активирован!");
};

document.getElementById("refBtn").onclick = () => {
let uid = getUID();
let link = window.location.origin + "?ref=" + uid;
navigator.clipboard.writeText(link);
alert("Ссылка скопирована!");
};

function getUID(){
if(!localStorage.getItem("uid")){
localStorage.setItem("uid", Math.random().toString(36).substring(2));
}
return localStorage.getItem("uid");
}

function checkReferral(){
const params = new URLSearchParams(window.location.search);
const ref = params.get("ref");
if(ref && ref !== getUID()){
state.coins += 100000;
state.refs += 1;
updateUI();
}
}
checkReferral();

function gameLoop(){
let now = Date.now();
let diff = (now - state.lastUpdate) / 1000;
state.lastUpdate = now;
state.coins += state.passive * state.boost * diff;
updateUI();
save();
requestAnimationFrame(gameLoop);
}
updateUI();
gameLoop();
const buildings = {
sawmill: {
name: "Лесопилка",
baseCost: 10000,
baseIncome: 1,
level: 0
}
};

function getCost(building){
return Math.floor(building.baseCost * Math.pow(1.15, building.level));
}

function buyBuilding(type){
let b = buildings[type];
let cost = getCost(b);

if(state.coins >= cost){
state.coins -= cost;
b.level++;
}
}
const MAX_CLICKS_PER_SEC = 15;

app.post("/click", (req,res)=>{
const {uid} = req.body;

let user = users[uid];
let now = Date.now();

if(!user.lastClick) user.lastClick = now;
if(!user.clicks) user.clicks = 0;

if(now - user.lastClick < 10000){
user.clicks++;
if(user.clicks > MAX_CLICKS_PER_SEC){
return res.json({error:"cheat detected"});
}
}else{
user.clicks = 1;
user.lastClick = now;
}

user.coins += user.perClick;
res.json({coins:user.coins});
});
app.get("/leaderboard",(req,res)=>{
let top = Object.values(users)
.sort((a,b)=>b.coins-a.coins)
.slice(0,20);

res.json(top);
});
async function loadLeaderboard(){
let res = await fetch("/leaderboard");
let data = await res.json();
console.log(data);
}
function getTelegramUser(){
    if (window.Telegram && window.Telegram.WebApp) {
        return window.Telegram.WebApp.initDataUnsafe?.user || null;
    }
    return null;
}
// Привязка кнопки
document.getElementById("refBtn").onclick = shareRef;

// Новая функция для Telegram share
function shareRef() {
    const uid = getUID(); // уникальный ID игрока

    // Если игра внутри Telegram WebApp
    if (window.Telegram && window.Telegram.WebApp) {
        const botUsername = "TreeEmpireBot"; // <-- сюда свой username бота без @
        const refLink = `https://t.me/${botUsername}?start=${uid}`;
        window.Telegram.WebApp.openTelegramLink(refLink);

    } else {
        // Для обычного браузера (мобильные телефоны / ПК)
        const currentUrl = window.location.origin + "?ref=" + uid;
        const shareText = encodeURIComponent("🌳 Играй в Tree Empire и получи бонус!");
        const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(currentUrl)}&text=${shareText}`;
        window.open(shareUrl, "_blank");
    }
}
// Флаг, чтобы реклама была доступна только один раз
let adWatched = localStorage.getItem("adWatched") === "true";

// Ссылка на кнопку
const boostBtn = document.getElementById("boostBtn");
const adContainer = document.getElementById("adContainer");

// Если уже смотрел — делаем кнопку неактивной
if(adWatched){
    boostBtn.disabled = true;
    boostBtn.textContent = "Рекламу просмотрено";
}

// Привязываем обработчик
boostBtn.onclick = function watchAd() {

    if(adWatched){
        alert("Рекламу можно смотреть только один раз!");
        return;
    }

    // Показываем контейнер с видео
    adContainer.style.display = "block";
    adContainer.innerHTML = `
        <iframe id="ytAd" width="320" height="180"
        src="https://www.youtube.com/watch?v=dDgZfNWGj5s"
        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
        <button id="closeAd" style="margin-top:5px; width:100%;">Закрыть рекламу</button>
    `;

    // Кнопка закрытия начисляет бонус
    document.getElementById("closeAd").onclick = () => {
        // Активируем буст x3 на 5 минут
        state.boost = 3;
        setTimeout(() => { state.boost = 1 }, 300000);

        // Скрываем контейнер
        adContainer.style.display = "none";
        adContainer.innerHTML = "";

        alert("Буст активирован! x3 на 5 минут!");

        // Ставим флаг, чтобы больше нельзя было смотреть рекламу
        adWatched = true;
        localStorage.setItem("adWatched", "true");

        // Делаем кнопку неактивной
        boostBtn.disabled = true;
        boostBtn.textContent = "Рекламу просмотрено";
    };
};
document.getElementById("buyTreeBtn").onclick = buyTreeCoin;

document.getElementById("buyTreeBtn").onclick = async () => {
    const user = window.Telegram.WebApp.initDataUnsafe.user;
    const telegramId = user.id;

    const amountTree = 300000; // Tree Coin
    const costTON = 1;     // TON для покупки

    if(!window.TonKeeper) {
        alert("Откройте игру в Tonkeeper или подключите TON Wallet!");
        return;
    }

    try {
        // Отправка 1 TON на кошелёк проекта
        const transaction = await window.TonKeeper.sendTransaction({
            to: "UQDF8Fy5rmx_Wj8XyePLsSmjYiiu05W0CmzLxsAW56uIPkbW", // твой кошелёк TON
            value: costTON * 1e9,         // TON в нанотонах
            data: "Покупка 3 Tree Coin"
        });

        console.log("TX ID:", transaction.transactionHash);

        // Отправляем серверу, чтобы начислить Tree Coin
        const res = await fetch("/confirmPurchase", {
            method:"POST",
            headers:{"Content-Type":"application/json"},
            body: JSON.stringify({
                telegramId,
                txHash: transaction.transactionHash,
                amountTree
            })
        });

        const data = await res.json();

        if(data.success){
            state.coins += amountTree;
            updateUI();
            alert(`Вы купили ${amountTree} Tree Coin за ${costTON} TON!`);
        } else {
            alert("Ошибка: " + data.error);
        }

    } catch(e){
        console.error(e);
        alert("Транзакция отменена или произошла ошибка");
    }
    const tonAPI = require("tonapi"); // или другой TON SDK

app.post("/confirmPurchase", async (req,res) => {
    const { telegramId, txHash, amountTree } = req.body;

    try {
        // Получаем данные транзакции
        const tx = await tonAPI.getTransaction(txHash);

        // Проверяем:
        // 1. Транзакция подтверждена
        // 2. Кошелёк получателя = твой PROJECT_WALLET_ADDRESS
        // 3. Сумма = 1 TON (в нанотонах)
        if(tx.status === "confirmed" && tx.to === "UQDF8Fy5rmx_Wj8XyePLsSmjYiiu05W0CmzLxsAW56uIPkbW" && tx.value == 1e9){
            // Начисляем Tree Coin игроку
            if(!users[telegramId]) users[telegramId] = { coins:0, refs:0 };
            users[telegramId].coins += amountTree;

            return res.json({ success:true });
        } else {
            return res.json({ success:false, error:"Транзакция не подтверждена или сумма неверна"});
        }

    } catch(e){
        console.error(e);
        return res.json({ success:false, error:"Ошибка проверки транзакции"});
    }
});
};
const tgUser = getTelegramUser();
const botUsername = "TreeEmpireBot";