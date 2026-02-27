import express from "express"
import cors from "cors"

const app = express()
app.use(cors())
app.use(express.json())

let users = {}

function getUser(id) {
  if (!users[id]) {
    users[id] = {
      coins: 0,
      level: 1,
      miningRate: 1,
      ref: null
    }
  }
  return users[id]
}

// получить профиль
app.post("/profile", (req, res) => {
  const { userId } = req.body
  const user = getUser(userId)
  res.json(user)
})

// клик
app.post("/click", (req, res) => {
  const { userId } = req.body
  const user = getUser(userId)
  user.coins += user.level
  res.json(user)
})

// авто майнинг
app.post("/mine", (req, res) => {
  const { userId } = req.body
  const user = getUser(userId)
  user.coins += user.miningRate
  res.json(user)
})

// апгрейд
app.post("/upgrade", (req, res) => {
  const { userId } = req.body
  const user = getUser(userId)

  const price = user.level * 50

  if (user.coins >= price) {
    user.coins -= price
    user.level += 1
    user.miningRate += 1
  }

  res.json(user)
})

// лидерборд
app.get("/leaderboard", (req, res) => {
  const sorted = Object.entries(users)
    .sort((a,b)=> b[1].coins - a[1].coins)
    .slice(0,10)

  res.json(sorted)
})

app.listen(3000, ()=> console.log("Server running on 3000"))
