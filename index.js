const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

/* ================= DATA ================= */

const leagues = [
  { id: 1, name: "Premier League", logo: "https://i.postimg.cc/dVcD8QfJ/الدوري_الانجليزي.png" },
  { id: 2, name: "La Liga", logo: "https://i.postimg.cc/qvj5HqyL/الدوري_الاسباني.png" }
];

const teams = [
  { id: 1, name: "Al Ahly", logo: "https://i.postimg.cc/3rnW3pJx/Al_Ahly_SC.png" },
  { id: 2, name: "Zamalek", logo: "https://i.postimg.cc/133cJVW4/الزمالك.png" },
  { id: 3, name: "Barcelona", logo: "https://i.postimg.cc/FFyGMVDc/برشلونة.png" },
  { id: 4, name: "Real Madrid", logo: "https://i.postimg.cc/SNswGPfV/ريال_مدريد.png" }
];

let matches = [
  { id: 1, league_id: 1, home_team: 1, away_team: 2, match_time: "2026-01-27T21:00:00Z" },
  { id: 2, league_id: 2, home_team: 3, away_team: 4, match_time: "2026-01-27T23:00:00Z" }
];

/* ================= HELPERS ================= */

function statusInfo(time) {
  const now = new Date();
  const start = new Date(time);
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000);

  if (now < start) return { status: "soon", minute: null };
  if (now >= start && now <= end) {
    const min = Math.floor((now - start) / 60000);
    return { status: "live", minute: min };
  }
  return { status: "ended", minute: 90 };
}

// fake scores
function fakeScore(min) {
  if (!min) return { home: null, away: null };
  return {
    home: Math.floor(min / 30),
    away: Math.floor(min / 40)
  };
}

function formatMatch(m) {
  const league = leagues.find(l => l.id === m.league_id);
  const home = teams.find(t => t.id === m.home_team);
  const away = teams.find(t => t.id === m.away_team);

  const info = statusInfo(m.match_time);
  const score = fakeScore(info.minute);

  return {
    id: m.id,
    league,
    home,
    away,
    match_time: m.match_time,
    status: info.status,
    minute: info.minute,
    score
  };
}

/* ================= ROUTES ================= */

app.get("/", (req,res)=>{
  res.json({status:"Football API Running 🚀"});
});

/* -------- Matches (pagination) ---------- */

app.get("/matches", (req,res)=>{
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 5);

  const start = (page-1)*limit;
  const end = start + limit;

  const data = matches.map(formatMatch);

  res.json({
    page,
    total: data.length,
    results: data.slice(start,end)
  });
});

/* -------- Live / Soon / Ended -------- */

app.get("/matches/:type", (req,res)=>{
  const type = req.params.type;
  const data = matches.map(formatMatch).filter(m=>m.status===type);
  res.json(data);
});

/* -------- By League -------- */

app.get("/league/:id", (req,res)=>{
  const id = parseInt(req.params.id);
  res.json(matches.filter(m=>m.league_id===id).map(formatMatch));
});

/* -------- Search Teams -------- */

app.get("/teams/search", (req,res)=>{
  const q = (req.query.q || "").toLowerCase();
  res.json(teams.filter(t=>t.name.toLowerCase().includes(q)));
});

/* -------- Admin Add Match -------- */

app.post("/admin/match", (req,res)=>{
  const {league_id, home_team, away_team, match_time} = req.body;

  const id = matches.length + 1;

  matches.push({
    id,
    league_id,
    home_team,
    away_team,
    match_time
  });

  res.json({success:true,id});
});

/* ================= START ================= */

app.listen(PORT, ()=>{
  console.log("API running on "+PORT);
});