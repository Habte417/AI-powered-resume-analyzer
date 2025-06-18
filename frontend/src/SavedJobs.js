import { useEffect, useState } from "react";

function SavedJobs() {
  const [savedJobs, setSavedJobs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3001/get-saved-jobs")
      .then((res) => res.json())
      .then((data) => setSavedJobs(data))
      .catch((err) => console.error("Error fetching saved jobs:", err));
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const response = await fetch("http://localhost:3001/update-job-status", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        const updated = savedJobs.map((job) =>
          job.id === id ? { ...job, status: newStatus } : job
        );
        setSavedJobs(updated);
      } else {
        alert("Failed to update status.");
      }
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>💾 Saved Jobs</h2>

      {savedJobs.length === 0 ? (
        <p>No saved jobs yet.</p>
      ) : (
        savedJobs.map((job) => (
          <div
            key={job.id}
            style={{
              marginBottom: "20px",
              padding: "10px",
              border: "1px solid #ccc",
              borderRadius: "10px",
            }}
          >
            <h4>{job.title}</h4>
            <p><strong>Company:</strong> {job.company}</p>
            <p><strong>Location:</strong> {job.location}</p>
            <p><strong>Score:</strong> {job.match_score?.toFixed(2)}</p>
            <p><strong>Status:</strong>
              <select
                value={job.status || "Not Applied"}
                onChange={(e) => handleStatusChange(job.id, e.target.value)}
                style={{ marginLeft: "10px" }}
              >
                <option value="Not Applied">Not Applied</option>
                <option value="Applied">Applied</option>
                <option value="Rejected">Rejected</option>
                <option value="Accepted">Accepted</option>
              </select>
            </p>
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-block",
                marginTop: "10px",
                padding: "6px 12px",
                backgroundColor: "#007bff",
                color: "white",
                borderRadius: "5px",
                textDecoration: "none",
              }}
            >
              🔗 View Job Posting
            </a>
          </div>
        ))
      )}
    </div>
  );
}

export default SavedJobs;
