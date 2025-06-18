import { useState, useEffect } from "react";
import SavedJobs from "./SavedJobs";
import Logo from './assets/Logo.png';

function App() {
  const [analysisResult, setAnalysisResult] = useState("");
  const [matchedJobs, setMatchedJobs] = useState([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("resume", file);

    try {
      const response = await fetch("http://localhost:3001/analyze-resume", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setAnalysisResult(data.analysis);
    } catch (error) {
      console.error("Error uploading resume:", error);
    }
  };

  const handleMatchJobs = async () => {
    if (!analysisResult) return alert("Please upload and analyze a resume first.");

    try {
      const response = await fetch("http://localhost:3001/match-jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resume_summary: analysisResult }),
      });
      const data = await response.json();
      setMatchedJobs(data);
    } catch (error) {
      console.error("Error matching jobs:", error);
    }
  };

  const handleSaveJob = async (job) => {
    try {
      const response = await fetch("http://localhost:3001/save-job", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: job.title,
          company: job.company,
          location: job.location,
          url: job.url,
          score: job.score,
        }),
      });
      const data = await response.json();
      alert(data.message || "Job saved!");
    } catch (error) {
      console.error("Error saving job:", error);
      alert("Failed to save job.");
    }
  };

  return (
    <div style={{ 
      fontFamily: "'Poppins', sans-serif", 
      backgroundColor: "#f8f9fa", 
      minHeight: "100vh", 
      display: "flex", 
      flexDirection: "column" 
    }}>

      {/* Header */}
      <header style={{ 
        backgroundColor: "#495057", 
        padding: "10px 40px", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "space-between", 
        color: "white", 
        position: "relative" 
      }}>
        <img src={Logo} alt="Resume Analyzer Logo" style={{ width: "80px", height: "80px", borderRadius: "10px" }} />
        <h1 style={{ 
          position: "absolute", 
          left: "50%", 
          transform: "translateX(-50%)", 
          margin: 0, 
          fontSize: "30px", 
          fontWeight: "600", 
          letterSpacing: "1px" 
        }}>
          Resume Analyzer & Job Matcher
        </h1>
      </header>

      {/* Centered Body Content */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {/* Welcome + Upload Section Side by Side */}
        <section style={{
          backgroundColor: "white",
          margin: "40px auto",
          maxWidth: "1300px",
          padding: "40px",
          borderRadius: "16px",
          display: "flex",
          gap: "80px",
          justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(0, 0, 0, 0.08)"
        }}>
          {/* Welcome Left Side */}
          <div style={{ flex: "0 0 55%", textAlign: "left" }}>
            <h2 style={{ fontSize: "44px", color: "#343a40", marginBottom: "20px", fontWeight: "700", letterSpacing: "1px" }}>
              Welcome to Resume Analyzer
            </h2>
            <p style={{ fontSize: "20px", color: "#6c757d", lineHeight: "1.8" }}>
              Take the next bold step in your career journey! Our smart AI analyzes your resume instantly, highlights your strengths,
              and finds job opportunities tailored just for you. Easily track your applications and stay organized — all inside a simple,
              beautiful dashboard made to help you succeed.
            </p>
          </div>

          {/* Upload + View Jobs Right Side */}
          <div style={{ flex: "0 0 40%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "20px" }}>
            <button onClick={() => setShowSaved(prev => !prev)} style={{
              backgroundColor: "#0d6efd",
              color: "white",
              border: "none",
              padding: "12px 20px",
              borderRadius: "6px",
              fontSize: "16px",
              cursor: "pointer",
              width: "100%"
            }}>
              {showSaved ? "🔙 Back to Analyzer" : "📋 View Saved Jobs"}
            </button>

            <input type="file" accept=".txt,.pdf" onChange={handleFileChange} style={{
              padding: "12px",
              borderRadius: "6px",
              border: "1px solid #ced4da",
              backgroundColor: "white",
              width: "100%",
              cursor: "pointer"
            }} />
          </div>
        </section>

        {/* Main Content */}
        <main style={{ flex: 1, padding: "20px" }}>
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            {showSaved ? (
              <SavedJobs />
            ) : (
              <>
                {analysisResult && (
                  <div style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", marginBottom: "30px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                    <h3>AI Analysis Result:</h3>
                    <pre style={{ whiteSpace: "pre-wrap", color: "#495057" }}>{analysisResult}</pre>

                    <div style={{ textAlign: "center", marginTop: "20px" }}>
                      <button onClick={handleMatchJobs} style={{
                        backgroundColor: "rgb(13, 110, 253)",
                        color: "white",
                        padding: "10px 20px",
                        fontSize: "16px",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer"
                      }}>
                        🔍 Match Jobs
                      </button>
                    </div>
                  </div>
                )}

                {matchedJobs.length > 0 && (
                  <div>
                    <h3 style={{ color: "#343a40" }}>🔗 Top Matching Jobs:</h3>
                    {matchedJobs.map((job, index) => (
                      <div key={index} style={{ backgroundColor: "white", padding: "20px", borderRadius: "10px", marginBottom: "20px", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }}>
                        <h4>{job.title}</h4>
                        <p><strong>Match Score:</strong> {job.score.toFixed(2)}</p>
                        {job.company && <p><strong>Company:</strong> {job.company}</p>}
                        {job.location && <p><strong>Location:</strong> {job.location}</p>}

                        <div style={{ marginTop: "10px" }}>
                          <a href={job.url} target="_blank" rel="noopener noreferrer" style={{
                            marginRight: "10px",
                            backgroundColor: "#0d6efd",
                            color: "white",
                            padding: "8px 12px",
                            textDecoration: "none",
                            borderRadius: "5px"
                          }}>
                            🔗 View Job Posting
                          </a>

                          <button onClick={() => handleSaveJob(job)} style={{
                            backgroundColor: "#ffc107",
                            color: "#212529",
                            padding: "8px 12px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer"
                          }}>
                            ✅ Save Job
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer style={{ backgroundColor: "#495057", padding: "30px", color: "white", textAlign: "center", fontSize: "16px" }}>
        <div>© {new Date().getFullYear()} Resume Analyzer - Built by Habtamu and Dagim</div>
        <div style={{ marginTop: "8px", fontSize: "14px" }}>Empowering job seekers with AI insights and smarter applications.</div>
      </footer>
    </div>
  );
}

export default App;
