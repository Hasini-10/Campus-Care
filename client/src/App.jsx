import { useEffect, useMemo, useState } from "react";
import {
  Activity, AlertCircle, ArrowUpRight, CheckCircle2, ChevronDown,
  ClipboardList, Clock3, Filter, MapPin, Plus, Search, ShieldCheck,
  Trash2, X, Menu, Building2, RefreshCw
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CATEGORIES = ["Facilities", "Cleanliness", "Transport", "Wi-Fi / IT", "Safety", "Other"];
const STATUSES = ["Submitted", "In Progress", "Resolved"];

function prettyDate(value) {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}
function initials(name = "") {
  return name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join("") || "U";
}

export default function App() {
  const [complaints, setComplaints] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [categoryFilter, setCategoryFilter] = useState("All categories");
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState({ title: "", category: "Facilities", location: "", description: "", reporter: "" });

  async function request(path, options = {}) {
    const response = await fetch(`${API}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", ...(options.headers || {}) }
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.message || "Request failed. Is the backend running?");
    return data;
  }

  async function loadComplaints() {
    setBusy(true); setError("");
    try {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      if (statusFilter !== "All statuses") params.set("status", statusFilter);
      if (categoryFilter !== "All categories") params.set("category", categoryFilter);
      setComplaints(await request(`/api/complaints?${params.toString()}`));
    } catch (e) {
      setError(`${e.message} Check the API and MongoDB connection.`);
    } finally { setBusy(false); }
  }

  useEffect(() => { loadComplaints(); }, [query, statusFilter, categoryFilter]);
  const stats = useMemo(() => ({
    total: complaints.length,
    submitted: complaints.filter(c => c.status === "Submitted").length,
    progress: complaints.filter(c => c.status === "In Progress").length,
    resolved: complaints.filter(c => c.status === "Resolved").length
  }), [complaints]);

  async function submitComplaint(event) {
    event.preventDefault(); setError(""); setNotice("");
    try {
      await request("/api/complaints", { method: "POST", body: JSON.stringify(form) });
      setForm({ title: "", category: "Facilities", location: "", description: "", reporter: "" });
      setShowForm(false); setNotice("Your complaint was submitted successfully.");
      await loadComplaints();
    } catch (e) { setError(e.message); }
  }

  async function updateStatus(id, status) {
    try {
      await request(`/api/complaints/${id}`, { method: "PATCH", body: JSON.stringify({ status }) });
      setNotice("Complaint status updated."); await loadComplaints();
    } catch (e) { setError(e.message); }
  }

  async function deleteComplaint(id) {
    if (!window.confirm("Delete this complaint? This cannot be undone.")) return;
    try {
      await request(`/api/complaints/${id}`, { method: "DELETE" });
      setNotice("Complaint deleted."); await loadComplaints();
    } catch (e) { setError(e.message); }
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand"><div className="brand-mark"><Building2 size={22}/></div><div><strong>CampusCare</strong><span>STUDENT SERVICES</span></div></div>
        <div className="side-label">WORKSPACE</div>
        <button className="side-link active"><ClipboardList size={18}/> Complaint dashboard</button>
        <div className="side-label side-label-lower">YOUR CAMPUS</div>
        <div className="campus-card"><div className="campus-icon"><ShieldCheck size={18}/></div><div><b>Campus Support</b><small>Make campus better</small></div><span className="online-dot"/></div>
        <div className="sidebar-bottom"><div className="help-icon">?</div><div><b>Need help?</b><p>Report an issue and follow its progress.</p></div></div>
      </aside>

      <main className="main">
        <header className="topbar">
          <div className="mobile-brand"><div className="brand-mark"><Building2 size={20}/></div><strong>CampusCare</strong></div>
          <div className="breadcrumb">Workspace <span>/</span> <b>Complaint dashboard</b></div>
          <div className="top-actions"><span className="secure-label"><ShieldCheck size={15}/> Campus portal</span><div className="avatar">CC</div></div>
        </header>

        <section className="content">
          <div className="welcome-row">
            <div><div className="eyebrow"><span className="eyebrow-dot"/> CAMPUS SERVICES</div><h1>Complaint dashboard</h1><p className="subtitle">A better campus starts with being heard. Report an issue and track it here.</p></div>
            <button className="primary-btn" onClick={() => { setShowForm(true); setNotice(""); }}><Plus size={18}/> New complaint</button>
          </div>

          {notice && <div className="notice success"><CheckCircle2 size={17}/>{notice}<button onClick={() => setNotice("")}><X size={16}/></button></div>}
          {error && <div className="notice danger"><AlertCircle size={17}/><span>{error}</span><button onClick={() => setError("")}><X size={16}/></button></div>}

          <div className="stats-grid">
            <StatCard label="Total complaints" value={stats.total} icon={<ClipboardList size={19}/>} tone="blue" caption="Matching your current filters"/>
            <StatCard label="Submitted" value={stats.submitted} icon={<Clock3 size={19}/>} tone="amber" caption="Awaiting review"/>
            <StatCard label="In progress" value={stats.progress} icon={<Activity size={19}/>} tone="violet" caption="Being worked on"/>
            <StatCard label="Resolved" value={stats.resolved} icon={<CheckCircle2 size={19}/>} tone="green" caption="Issues addressed"/>
          </div>

          <section className="panel">
            <div className="panel-head"><div><h2>Recent complaints</h2><p>Review reports and keep their status up to date.</p></div><button className="icon-btn" onClick={loadComplaints} title="Refresh"><RefreshCw size={17}/></button></div>
            <div className="toolbar">
              <div className="search-box"><Search size={17}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search complaints, locations..." /></div>
              <div className="filter-wrap"><Filter size={16}/><select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}><option>All categories</option>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select><ChevronDown size={14}/></div>
              <div className="filter-wrap"><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}><option>All statuses</option>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><ChevronDown size={14}/></div>
            </div>

            {busy ? <div className="empty"><RefreshCw className="spin" size={24}/><b>Loading complaints...</b></div> :
              complaints.length === 0 ? <div className="empty"><div className="empty-icon"><ClipboardList size={25}/></div><b>No complaints found</b><p>Try another filter or create the first complaint.</p><button className="secondary-btn" onClick={() => setShowForm(true)}><Plus size={16}/> Add complaint</button></div> :
              <div className="complaint-list">{complaints.map(item => <article className="complaint" key={item._id}>
                <div className={`category-icon ${item.category === "Safety" ? "cat-red" : item.category === "Transport" ? "cat-purple" : item.category === "Cleanliness" ? "cat-green" : "cat-blue"}`}><ClipboardList size={19}/></div>
                <div className="complaint-body"><div className="complaint-title-row"><h3>{item.title}</h3><StatusBadge status={item.status}/></div><p className="description">{item.description}</p><div className="meta"><span><MapPin size={14}/>{item.location}</span><span className="meta-dot">·</span><span>{item.category}</span><span className="meta-dot">·</span><span>{prettyDate(item.createdAt)}</span></div><div className="reporter"><span className="reporter-avatar">{initials(item.reporter)}</span><span>Reported by <b>{item.reporter}</b></span></div></div>
                <div className="complaint-controls"><label htmlFor={`status-${item._id}`}>Update status</label><select id={`status-${item._id}`} value={item.status} onChange={e => updateStatus(item._id, e.target.value)}>{STATUSES.map(s => <option key={s}>{s}</option>)}</select><button className="delete-btn" onClick={() => deleteComplaint(item._id)} title="Delete complaint"><Trash2 size={15}/></button></div>
              </article>)}</div>
            }
            <div className="panel-footer"><span>Showing <b>{complaints.length}</b> complaint{complaints.length === 1 ? "" : "s"}</span><span className="footer-live"><span/> Live database</span></div>
          </section>
          <footer className="footer"><span>© 2026 CampusCare · Student project</span><span>Built for a more helpful campus <span className="heart">♥</span></span></footer>
        </section>
      </main>

      {showForm && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setShowForm(false); }}><section className="modal">
        <div className="modal-head"><div><span className="eyebrow">CAMPUS SERVICES</span><h2>Submit a complaint</h2><p>Tell us what needs attention. All fields are required.</p></div><button className="icon-btn" onClick={() => setShowForm(false)}><X size={19}/></button></div>
        <form onSubmit={submitComplaint} className="complaint-form">
          <label>Complaint title<input required maxLength="100" placeholder="e.g. Projector not working" value={form.title} onChange={e => setForm({...form, title:e.target.value})}/></label>
          <div className="form-row"><label>Category<select value={form.category} onChange={e => setForm({...form, category:e.target.value})}>{CATEGORIES.map(c => <option key={c}>{c}</option>)}</select></label><label>Location<input required maxLength="120" placeholder="e.g. Block B, Room 204" value={form.location} onChange={e => setForm({...form, location:e.target.value})}/></label></div>
          <label>Description<textarea required maxLength="1000" rows="4" placeholder="Describe the issue clearly..." value={form.description} onChange={e => setForm({...form, description:e.target.value})}/></label>
          <label>Your name<input required maxLength="80" placeholder="Enter your name" value={form.reporter} onChange={e => setForm({...form, reporter:e.target.value})}/></label>
          <div className="form-note"><ShieldCheck size={16}/> Please don't include private or sensitive information.</div>
          <div className="modal-actions"><button type="button" className="secondary-btn" onClick={() => setShowForm(false)}>Cancel</button><button type="submit" className="primary-btn"><Plus size={17}/> Submit complaint</button></div>
        </form>
      </section></div>}
    </div>
  );
}

function StatCard({ label, value, icon, tone, caption }) {
  return <div className="stat-card"><div className={`stat-icon ${tone}`}>{icon}</div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-caption">{caption}</div></div>;
}
function StatusBadge({ status }) {
  const cls = status === "Resolved" ? "resolved" : status === "In Progress" ? "progress" : "submitted";
  return <span className={`status-badge ${cls}`}><span/>{status}</span>;
}