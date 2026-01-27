const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// 🔐 Neon connection (from Render Environment Variables)
const NEON_URL = process.env.DATABASE_URL;

if (!NEON_URL) {
  console.error("DATABASE_URL is not set");
  process.exit(1);

const pool = new Pool({
  connectionString: NEON_URL,
  ssl: { rejectUnauthorized: false }
});

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

/* ================= ROUTES ================= */

app.get("/", (req,res)=>{
  res.json({status:"Football API Running 🚀"});
});

/* -------- Leagues -------- */

app.get("/leagues", async (req,res)=>{
  const { rows } = await pool.query("SELECT * FROM leagues ORDER BY id");
  res.json(rows);
});

app.post("/admin/league", async (req,res)=>{
  const { name, logo, link } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO leagues(name,logo,link) VALUES($1,$2,$3) RETURNING id",
    [name, logo, link]
  );
  res.json({ success:true, id: rows[0].id });
});

/* -------- Teams -------- */

app.get("/teams", async (req,res)=>{
  const { rows } = await pool.query("SELECT * FROM teams ORDER BY id");
  res.json(rows);
});

app.post("/admin/team", async (req,res)=>{
  const { name, logo, link } = req.body;
  const { rows } = await pool.query(
    "INSERT INTO teams(name,logo,link) VALUES($1,$2,$3) RETURNING id",
    [name, logo, link]
  );
  res.json({ success:true, id: rows[0].id });
});

app.get("/teams/search", async (req,res)=>{
  const q = `%${(req.query.q||"").toLowerCase()}%`;
  const { rows } = await pool.query(
    "SELECT * FROM teams WHERE LOWER(name) LIKE $1",
    [q]
  );
  res.json(rows);
});

/* -------- Matches -------- */

app.get("/matches", async (req,res)=>{
  const page = parseInt(req.query.page || 1);
  const limit = parseInt(req.query.limit || 10);
  const offset = (page-1)*limit;

  const { rows } = await pool.query(`
    SELECT m.*, 
      l.id as league_id2, l.name as league_name, l.logo as league_logo, l.link as league_link,
      th.id as home_id, th.name as home_name, th.logo as home_logo,
      ta.id as away_id, ta.name as away_name, ta.logo as away_logo
    FROM matches m
    LEFT JOIN leagues l ON m.league_id = l.id
    LEFT JOIN teams th ON m.home_team = th.id
    LEFT JOIN teams ta ON m.away_team = ta.id
    ORDER BY m.match_time
    LIMIT $1 OFFSET $2
  `,[limit, offset]);

  const results = rows.map(r=>{
    const info = statusInfo(r.match_time);
    return {
      id: r.id,
      league: { id:r.league_id2, name:r.league_name, logo:r.league_logo, link:r.league_link },
      home: { id:r.home_id, name:r.home_name, logo:r.home_logo },
      away: { id:r.away_id, name:r.away_name, logo:r.away_logo },
      match_time: r.match_time,
      status: info.status,
      minute: info.minute,
      score: { home: r.home_score, away: r.away_score },
      stream: r.stream || ""
    };
  });

  res.json({ page, total: results.length, results });
});

app.get("/matches/:type(live|soon|ended)", async (req,res)=>{
  const all = (await pool.query("SELECT match_time, id FROM matches")).rows;
  const ids = all.filter(m=>statusInfo(m.match_time).status===req.params.type).map(x=>x.id);
  if(!ids.length) return res.json([]);
  const { rows } = await pool.query("SELECT * FROM matches WHERE id = ANY($1)", [ids]);
  res.json(rows);
});

app.get("/league/:id", async (req,res)=>{
  const { rows } = await pool.query("SELECT * FROM matches WHERE league_id=$1 ORDER BY match_time",[req.params.id]);
  res.json(rows);
});

app.post("/admin/match", async (req,res)=>{
  const { league_id, home_team, away_team, match_time, score, stream } = req.body;

  const { rows } = await pool.query(
    `INSERT INTO matches(league_id,home_team,away_team,match_time,home_score,away_score,stream)
     VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
    [
      league_id, home_team, away_team, match_time,
      score?.home ?? null, score?.away ?? null, stream || ""
    ]
  );

  res.json({ success:true, id: rows[0].id });
});

app.put("/admin/match/:id", async (req,res)=>{
  const { match_time, home_score, away_score, stream } = req.body;

  await pool.query(
    `UPDATE matches SET 
      match_time = COALESCE($1, match_time),
      home_score = COALESCE($2, home_score),
      away_score = COALESCE($3, away_score),
      stream = COALESCE($4, stream)
     WHERE id=$5`,
    [match_time, home_score, away_score, stream, req.params.id]
  );

  res.json({ success:true });
});

app.listen(PORT, ()=> console.log("API running on "+PORT));
