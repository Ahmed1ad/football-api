const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// بيانات تجريبية
const matches = [
  {
    id: 1,
    home: "Al Ahly",
    away: "Zamalek",
    time: "2026-01-26T18:00",
    status: "soon",
    home_score: null,
    away_score: null
  },
  {
    id: 2,
    home: "Barcelona",
    away: "Real Madrid",
    time: "2026-01-26T21:00",
    status: "live",
    home_score: 1,
    away_score: 0
  }
];

// Health check
app.get("/", (req, res) => {
  res.json({ status: "Football API running 🚀" });
});

// كل المباريات
app.get("/matches", (req, res) => {
  res.json(matches);
});

// Live
app.get("/matches/live", (req, res) => {
  res.json(matches.filter(m => m.status === "live"));
});

// Soon
app.get("/matches/soon", (req, res) => {
  res.json(matches.filter(m => m.status === "soon"));
});

// Ended
app.get("/matches/ended", (req, res) => {
  res.json(matches.filter(m => m.status === "ended"));
});

app.listen(PORT, () => {
  console.log("API running on port " + PORT);
});