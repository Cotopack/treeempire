const express = require("express");
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static("../public"));

let users = {};

app.post("/register", (req,res)=>{
const {uid, ref} = req.body;

if(!users[uid]){
users[uid] = {coins:0, refs:0};

if(ref && users[ref]){
users[ref].coins += 100000;
users[ref].refs += 1;
}
}

res.json({status:"ok"});
});

app.listen(PORT, ()=>console.log("Server running on "+PORT));