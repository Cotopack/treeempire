const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

let players = {};

app.use(express.static(path.join(__dirname, "../public")));

app.post("/login", (req, res) => {
    const { id, username, ref } = req.body;

    if (!players[id]) {
        players[id] = {
            id,
            username,
            coins: 0,
            perSecond: 1,
            level: 1,
            refBy: ref || null
        };

        // Реферальный бонус
        if (ref && players[ref]) {
            players[ref].coins += 50;
        }
    }

    res.json(players[id]);
});

app.post("/update", (req, res) => {
    const { id, coins, perSecond, level } = req.body;

    if (players[id]) {
        players[id].coins = coins;
        players[id].perSecond = perSecond;
        players[id].level = level;
    }

    res.json({ success: true });
});

app.get("/leaderboard", (req, res) => {
    const sorted = Object.values(players)
        .sort((a, b) => b.coins - a.coins)
        .slice(0, 10);
    res.json(sorted);
});

app.listen(3000, () => {
    console.log("🌳 TREE COIN running on http://localhost:3000");
});
