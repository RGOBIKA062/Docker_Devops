# 🎨 AI Job Finder - Visual Integration Guide

## 🖼️ UI Component Structure

```
┌─────────────────────────────────────────────────────────────────┐
│                     JOB FINDER PAGE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  🔍 SEARCH FILTERS                                     │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                        │   │
│  │  City/Location:     [Bangalore          ▼]           │   │
│  │  Job Role:          [Full Stack Dev     ▼]           │   │
│  │  Experience:        [3 years           ▼]           │   │
│  │  Salary Range:      [₹60k-₹120k       ▼]           │   │
│  │  Employment Type:   [Full-time         ▼]           │   │
│  │                                                        │   │
│  │                    [🔍 SEARCH JOBS]                   │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  Found 10 jobs in Bangalore for Full Stack Developer  │   │
│  ├────────────────────────────────────────────────────────┤   │
│  │                                                        │   │
│  │  Filter by: ☑ Remote  ☐ Hybrid  ☐ On-site          │   │
│  │             ☑ Entry   ☑ Mid     ☑ Senior            │   │
│  │                                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌────────────────────────────────────────────────────────┐   │
│  │  📋 JOB RESULTS                                        │   │
│  └────────────────────────────────────────────────────────┘   │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ 1. Senior Full Stack Developer                       │     │
│  │    TechCorp India | Bangalore                        │     │
│  │    ┌────────────────────────────────────────────┐   │     │
│  │    │ Salary: ₹80K-₹120K/month                  │   │     │
│  │    │ Type: Full-time | Hybrid                  │   │     │
│  │    │ Match: 95% ★★★★★                         │   │     │
│  │    │ Reason: Perfect match for your skills     │   │     │
│  │    │                                            │   │     │
│  │    │ Skills Needed:                            │   │     │
│  │    │ ✓ React  ✓ Node.js  ✓ MongoDB           │   │     │
│  │    │ ○ Docker  ○ AWS     ○ Kubernetes         │   │     │
│  │    │                                            │   │     │
│  │    │ Growth: ⬆ High  Benefits: Health, Learn  │   │     │
│  │    │                                            │   │     │
│  │    │ [📱 APPLY NOW]  [❤️ SAVE]  [⬆️ SHARE]  │   │     │
│  │    └────────────────────────────────────────────┘   │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  ┌──────────────────────────────────────────────────────┐     │
│  │ 2. Full Stack Developer (Next Job)                  │     │
│  │    ... Similar card structure ...                    │     │
│  └──────────────────────────────────────────────────────┘     │
│                                                                 │
│  [⬅️  Page 1 of 5] [Page: 1 2 3 4 5] [Page 5 ➡️]             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💻 React Component Implementation

### 1. Search Form Component

```jsx
import { useState } from 'react';

export function JobSearchForm({ onSearch, loading }) {
  const [filters, setFilters] = useState({
    city: 'Bangalore',
    role: 'Full Stack Developer',
    experience: '',
    salaryRange: '',
    employmentType: 'All'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(filters);
  };

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <h2>🔍 Find Your Perfect Job</h2>
      
      <div className="form-group">
        <label>City/Location</label>
        <input
          type="text"
          name="city"
          value={filters.city}
          onChange={handleChange}
          placeholder="e.g., Bangalore, Mumbai, Delhi"
          required
        />
      </div>

      <div className="form-group">
        <label>Job Role</label>
        <select name="role" value={filters.role} onChange={handleChange} required>
          <option>Full Stack Developer</option>
          <option>Frontend Developer</option>
          <option>Backend Developer</option>
          <option>DevOps Engineer</option>
          <option>Data Science Engineer</option>
          <option>UI/UX Designer</option>
        </select>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Years of Experience</label>
          <input
            type="number"
            name="experience"
            value={filters.experience}
            onChange={handleChange}
            placeholder="3"
            min="0"
          />
        </div>

        <div className="form-group">
          <label>Salary Range</label>
          <input
            type="text"
            name="salaryRange"
            value={filters.salaryRange}
            onChange={handleChange}
            placeholder="₹60,000-₹120,000"
          />
        </div>
      </div>

      <div className="form-group">
        <label>Employment Type</label>
        <select name="employmentType" value={filters.employmentType} onChange={handleChange}>
          <option>All</option>
          <option>Full-time</option>
          <option>Contract</option>
          <option>Freelance</option>
          <option>Part-time</option>
        </select>
      </div>

      <button type="submit" disabled={loading} className="search-btn">
        {loading ? '🔄 Searching...' : '🔍 Search Jobs'}
      </button>
    </form>
  );
}
```

### 2. Job Card Component

```jsx
export function JobCard({ job, onApply, onSave, onShare }) {
  const getMatchColor = (percentage) => {
    if (percentage >= 90) return '#10b981'; // green
    if (percentage >= 75) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  const getSkillStatus = (skill, requiredSkills) => {
    return requiredSkills.includes(skill) ? '✓' : '○';
  };

  return (
    <div className="job-card">
      <div className="job-header">
        <div className="job-title-section">
          <h3>{job.title}</h3>
          <div className="company-info">
            <span className="company">{job.company}</span>
            <span className="location">📍 {job.location}</span>
          </div>
        </div>
        <div className="match-badge" style={{ borderColor: getMatchColor(job.matchPercentage) }}>
          <span className="percentage">{job.matchPercentage}%</span>
          <span className="label">Match</span>
        </div>
      </div>

      <div className="job-meta">
        <span className="salary">💰 {job.salary}</span>
        <span className="type">{job.jobType}</span>
        <span className="remote">{job.remoteWork}</span>
        <span className="seniority">{job.seniorityLevel}</span>
      </div>

      <p className="description">{job.description}</p>

      <div className="match-reason">
        <strong>Why this matches:</strong> {job.matchReason}
      </div>

      <div className="skills-section">
        <h4>Skills Required</h4>
        <div className="skills">
          {job.requiredSkills.map(skill => (
            <span key={skill} className="skill required">
              ✓ {skill}
            </span>
          ))}
        </div>
        {job.niceToHaveSkills && job.niceToHaveSkills.length > 0 && (
          <>
            <h4 style={{ marginTop: '12px' }}>Nice to Have</h4>
            <div className="skills">
              {job.niceToHaveSkills.map(skill => (
                <span key={skill} className="skill optional">
                  ○ {skill}
                </span>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="benefits-section">
        <h4>Benefits</h4>
        <ul>
          {job.benefits.map(benefit => (
            <li key={benefit}>✨ {benefit}</li>
          ))}
        </ul>
      </div>

      <div className="job-meta-secondary">
        <span>📅 {job.postedDate}</span>
        <span>⏰ Apply by {job.deadline}</span>
        <span className="growth">Growth: {job.growthOpportunity}</span>
      </div>

      <div className="job-actions">
        <a href={job.applyUrl} target="_blank" rel="noopener noreferrer">
          <button className="apply-btn">📱 Apply Now</button>
        </a>
        <button className="save-btn" onClick={() => onSave(job.id)}>
          ❤️ Save
        </button>
        <button className="share-btn" onClick={() => onShare(job.id)}>
          ⬆️ Share
        </button>
      </div>
    </div>
  );
}
```

### 3. Main Job Finder Page

```jsx
import { useState, useEffect } from 'react';
import { JobSearchForm } from './JobSearchForm';
import { JobCard } from './JobCard';
import { JobFilters } from './JobFilters';

export function JobFinderPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [savedJobs, setSavedJobs] = useState([]);
  const [filters, setFilters] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 5;

  const searchJobs = async (searchFilters) => {
    setLoading(true);
    setError(null);
    setCurrentPage(1);

    try {
      const response = await fetch(
        '/api/freelancer/recommendations/comprehensive',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...searchFilters,
            userId: localStorage.getItem('userId') // optional
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch jobs');
      }

      const data = await response.json();
      setJobs(data.data.recommendations || []);
      setFilters(data.data.appliedFilters);
    } catch (err) {
      setError(err.message);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = (jobId) => {
    setSavedJobs(prev => 
      prev.includes(jobId) 
        ? prev.filter(id => id !== jobId)
        : [...prev, jobId]
    );
  };

  const handleShareJob = (jobId) => {
    const job = jobs.find(j => j.id === jobId);
    const text = `Check out this job: ${job.title} at ${job.company}`;
    navigator.share?.({
      title: 'Amazing Job Opportunity',
      text,
      url: job.applyUrl
    });
  };

  // Pagination
  const totalPages = Math.ceil(jobs.length / jobsPerPage);
  const startIdx = (currentPage - 1) * jobsPerPage;
  const displayedJobs = jobs.slice(startIdx, startIdx + jobsPerPage);

  return (
    <div className="job-finder-page">
      <header className="page-header">
        <h1>🚀 AI-Powered Job Finder</h1>
        <p>Find your perfect job based on city, role, and skills</p>
      </header>

      <div className="container">
        <aside className="sidebar">
          <JobSearchForm onSearch={searchJobs} loading={loading} />
        </aside>

        <main className="main-content">
          {error && (
            <div className="error-message">
              ❌ {error}
            </div>
          )}

          {jobs.length > 0 && (
            <>
              <div className="results-header">
                <h2>Found {jobs.length} jobs in {filters.city} for {filters.role}</h2>
                <JobFilters />
              </div>

              <div className="jobs-list">
                {displayedJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onApply={() => handleSaveJob(job.id)}
                    onSave={() => handleSaveJob(job.id)}
                    onShare={() => handleShareJob(job.id)}
                    isSaved={savedJobs.includes(job.id)}
                  />
                ))}
              </div>

              <div className="pagination">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  ⬅️ Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={currentPage === i + 1 ? 'active' : ''}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next ➡️
                </button>
              </div>
            </>
          )}

          {!loading && jobs.length === 0 && !error && (
            <div className="empty-state">
              <h3>🔍 Start searching for jobs</h3>
              <p>Use the search form to find jobs based on city and role</p>
            </div>
          )}

          {loading && (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>🤖 Searching for perfect matches...</p>
            </div>
          )}
        </main>

        <aside className="saved-jobs-sidebar">
          <h3>❤️ Saved Jobs ({savedJobs.length})</h3>
          <div className="saved-list">
            {jobs
              .filter(j => savedJobs.includes(j.id))
              .map(job => (
                <div key={job.id} className="saved-item">
                  <h4>{job.title}</h4>
                  <p>{job.company}</p>
                  <button onClick={() => handleSaveJob(job.id)}>Remove</button>
                </div>
              ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
```

---

## 🎨 CSS Styling

```css
/* Job Finder Page */
.job-finder-page {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  padding: 40px 20px;
}

.page-header {
  text-align: center;
  color: white;
  margin-bottom: 40px;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.container {
  display: grid;
  grid-template-columns: 300px 1fr 250px;
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Search Form */
.search-form {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: 600;
  margin-bottom: 5px;
  color: #333;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #667eea;
}

.search-btn {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.search-btn:hover {
  transform: translateY(-2px);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Job Card */
.job-card {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
  transition: transform 0.3s, box-shadow 0.3s;
}

.job-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.15);
}

.job-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}

.job-title-section h3 {
  font-size: 1.3rem;
  margin: 0 0 5px 0;
  color: #1f2937;
}

.company-info {
  display: flex;
  gap: 10px;
  font-size: 0.9rem;
  color: #6b7280;
}

.match-badge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 80px;
  height: 80px;
  border: 3px solid;
  border-radius: 50%;
  background: #f3f4f6;
}

.match-badge .percentage {
  font-size: 1.8rem;
  font-weight: bold;
  color: #1f2937;
}

.match-badge .label {
  font-size: 0.7rem;
  color: #6b7280;
  font-weight: 600;
}

.job-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e5e7eb;
}

.job-meta span {
  padding: 4px 8px;
  background: #f0f9ff;
  border-radius: 4px;
  font-size: 0.85rem;
  color: #1e40af;
}

.skills-section {
  margin: 15px 0;
}

.skills-section h4 {
  margin: 10px 0 8px 0;
  color: #1f2937;
  font-size: 0.9rem;
}

.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.skill {
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 500;
}

.skill.required {
  background: #d1fae5;
  color: #065f46;
}

.skill.optional {
  background: #fef3c7;
  color: #92400e;
}

.job-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.job-actions button,
.job-actions a {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
}

.apply-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.save-btn {
  background: #fee2e2;
  color: #991b1b;
}

.share-btn {
  background: #dbeafe;
  color: #1e40af;
}

.job-actions button:hover {
  transform: translateY(-2px);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 15px;
  margin: 30px 0;
}

.page-numbers {
  display: flex;
  gap: 5px;
}

.page-numbers button,
.pagination button {
  padding: 8px 12px;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
}

.page-numbers button.active {
  background: #667eea;
  color: white;
  border-color: #667eea;
}

.page-numbers button:hover,
.pagination button:hover {
  border-color: #667eea;
}

/* Saved Jobs Sidebar */
.saved-jobs-sidebar {
  background: white;
  padding: 20px;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-height: 600px;
  overflow-y: auto;
}

.saved-jobs-sidebar h3 {
  margin-top: 0;
  color: #1f2937;
}

.saved-item {
  padding: 10px;
  border-bottom: 1px solid #e5e7eb;
}

.saved-item:last-child {
  border-bottom: none;
}

.saved-item h4 {
  margin: 0 0 5px 0;
  font-size: 0.9rem;
}

.saved-item p {
  margin: 0 0 8px 0;
  font-size: 0.8rem;
  color: #6b7280;
}

.saved-item button {
  width: 100%;
  padding: 6px;
  background: #fee2e2;
  color: #991b1b;
  border: none;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
}

/* Responsive */
@media (max-width: 1024px) {
  .container {
    grid-template-columns: 1fr;
  }
}
```

---

## 🔗 Integration Steps

1. **Create Job Finder Component**
   ```bash
   src/pages/JobFinder.jsx
   ```

2. **Add Route**
   ```jsx
   import JobFinderPage from './pages/JobFinder';
   
   // In router
   <Route path="/freelancer/jobs" element={<JobFinderPage />} />
   ```

3. **Add Navigation Link**
   ```jsx
   <Link to="/freelancer/jobs">🚀 Find Jobs</Link>
   ```

4. **Test with API**
   ```bash
   npm run dev
   ```

---

**Status**: ✅ Ready for Implementation  
**Version**: 2.0.0
