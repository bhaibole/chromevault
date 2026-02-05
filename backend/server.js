const express = require("express");
const body = require("body-parser");
const { users, tabs } = require("./db");
const { createToken } = require("./auth");
const { auth, adminOnly } = require("./middleware");

const app = express();
app.use(body.json());
app.use(express.static("public"));

/* ---------- AUTH ---------- */

// register
app.post("/api/register", (req, res) => {
  const id = Date.now();

  const user = {
    id,
    email: req.body.email,
    password: req.body.password,
    role: "user",
    plan: "FREE"
  };

  users.push(user);
  res.json({ token: createToken(user) });
});

// login
app.post("/api/login", (req, res) => {
  const user = users.find(
    u => u.email === req.body.email && u.password === req.body.password
  );
  if (!user) return res.sendStatus(401);

  res.json({ token: createToken(user) });
});

/* ---------- USER TABS ---------- */

// get my tabs
app.get("/api/my-tabs", auth, (req, res) => {
  res.json(tabs.filter(t => t.userId === req.user.id));
});

// add tab
app.post("/api/add-tab", auth, (req, res) => {
  const id = Date.now();

  tabs.push({
    id,
    url: req.body.url,
    userId: req.user.id,
    status: "RUNNING"
  });

  res.json({
    id,
    termux_command: `node connect.js --tab=${id} --token=YOUR_TOKEN`
  });
});

// delete my tab
app.delete("/api/tab/:id", auth, (req, res) => {
  const index = tabs.findIndex(
    t => t.id == req.params.id && t.userId === req.user.id
  );
  if (index === -1) return res.sendStatus(404);

  tabs.splice(index, 1);
  res.sendStatus(200);
});

/* ---------- ADMIN ---------- */

// all users
app.get("/api/admin/users", auth, adminOnly, (req, res) => {
  res.json(users);
});

// all tabs
app.get("/api/admin/tabs", auth, adminOnly, (req, res) => {
  res.json(tabs);
});

// delete any user
app.delete("/api/admin/user/:id", auth, adminOnly, (req, res) => {
  const i = users.findIndex(u => u.id == req.params.id);
  if (i === -1) return res.sendStatus(404);

  users.splice(i, 1);
  res.sendStatus(200);
});

app.listen(3000, () => console.log("🚀 ChromeVault running"));
