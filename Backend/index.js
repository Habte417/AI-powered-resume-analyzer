const express = require('express');
const cors = require('cors');
const app = express();
require('dotenv').config();
const multer = require("multer");
const fs = require("fs");
const OpenAI = require("openai"); // ✅ SDK v4 syntax
const pdfParse = require("pdf-parse");
const {Client}= require("pg");
const axios = require("axios"); 


app.use(cors());
app.use(express.json());

function cosineSimilarity(vecA, vecB) {
  const dot = vecA.reduce((acc, val, i) => acc + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((acc, val) => acc + val * val, 0));
  const magB = Math.sqrt(vecB.reduce((acc, val) => acc + val * val, 0));
  return dot / (magA * magB);
}


const db = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASS,
  port: process.env.DB_PORT,
});

db.connect()
  .then(() => console.log("✅ Connected to PostgreSQL"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err.stack));


const { Pool } = require("pg");
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Root route for test
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

// Set up OpenAI instance (v4 style)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Set up Multer for file uploads
const upload = multer({ dest: "uploads/" });

app.post("/analyze-resume", upload.single("resume"), async (req, res) => {
  try {
    const filePath = req.file.path;
    const fileMime = req.file.mimetype;

    let fileText = "";

    if (fileMime === "application/pdf") {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      fileText = pdfData.text;
    } else {
      fileText = fs.readFileSync(filePath, "utf-8");
    }

    const limitedText = fileText.slice(0, 2000);

    const prompt = `Extract key skills and experiences from this resume:\n\n${limitedText}`;

    const chatCompletion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    });

    const result = chatCompletion.choices[0].message.content;

    fs.unlinkSync(filePath);
    await db.query(
  "INSERT INTO resume_analysis (filename, analysis_result) VALUES ($1, $2)",
  [req.file.originalname, result]
);
    res.json({ analysis: result });
  } catch (error) {
    console.error("OpenAI error:", error.message);
    res.status(500).json({ error: "Failed to analyze resume. " + error.message });
  }
});
async function fetchRealJobs(keyword = "developer") {
  try {
    const response = await axios.get(
      `https://api.adzuna.com/v1/api/jobs/us/search/1`, // or 'www'
      {
        params: {
          app_id: process.env.ADZUNA_APP_ID,
          app_key: process.env.ADZUNA_APP_KEY,
          what: encodeURIComponent(keyword),
          where: "New York", // OR remove this line
          results_per_page: 5,
        },
        headers: {
          "User-Agent": "resume-analyzer-app"
        }
      }
    );

    return response.data.results.map((job) => ({
      title: job.title,
      description: job.description,
      location: job.location?.display_name || "Unknown",
      company: job.company?.display_name || "Unknown",
      url: job.redirect_url,
    }));
  } catch (error) {
    if (error.response?.data) {
      console.error("Adzuna fetch error (data):", error.response.data);
    } else {
      console.error("Adzuna fetch error (generic):", error.message);
    }
    throw new Error("Failed to fetch jobs from Adzuna.");
  }
}



app.post("/match-jobs", async (req, res) => {
  const { resume_summary } = req.body;

  try {
    const jobList = await fetchRealJobs(); // ⬅️ Real jobs now!

    const resumeEmbedding = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: resume_summary,
    });

    const resumeVector = resumeEmbedding.data[0].embedding;

    const scoredJobs = [];

    for (const job of jobList) {
      const jobEmbedding = await openai.embeddings.create({
        model: "text-embedding-ada-002",
        input: job.description,
      });

      const jobVector = jobEmbedding.data[0].embedding;
      const score = cosineSimilarity(resumeVector, jobVector);

      scoredJobs.push({ ...job, score });
    }

    scoredJobs.sort((a, b) => b.score - a.score);
    res.json(scoredJobs.slice(0, 3));
  } catch (error) {
    console.error("Job match error:", error.message);
    res.status(500).json({ error: "Failed to match jobs. " + error.message });
  }
});
app.post("/save-job", async (req, res) => {
  const { title, company, location, url, score } = req.body;

  try {
    await db.query(
      "INSERT INTO saved_jobs (title, company, location, url, match_score) VALUES ($1, $2, $3, $4, $5)",
      [title, company, location, url, score]
    );
    res.status(200).json({ message: "Job saved successfully!" });
  } catch (error) {
    console.error("Error saving job:", error.message);
    res.status(500).json({ error: "Failed to save job." });
  }
});

app.put("/update-job-status", async (req, res) => {
  const { id, status } = req.body;

  try {
    await db.query(
      "UPDATE saved_jobs SET status = $1 WHERE id = $2",
      [status, id]
    );
    res.status(200).json({ message: "Job status updated!" });
  } catch (error) {
    console.error("Status update error:", error.message);
    res.status(500).json({ error: "Failed to update status." });
  }
});

app.get("/get-saved-jobs", async (req, res) => {
  try {
    const result = await db.query("SELECT * FROM saved_jobs ORDER BY saved_at DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Error fetching saved jobs:", error.message);
    res.status(500).json({ error: "Failed to get saved jobs." });
  }
});


// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});