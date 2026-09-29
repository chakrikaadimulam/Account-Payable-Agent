import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import CountUp from "./components/common/CountUp";
import { LayoutDashboard, FileSearch, Building2, ShieldCheck, Brain, Cpu, ArrowRight, Wallet, FileText, Clock, CheckCircle2 } from "lucide-react";

const API = "http://localhost:5000";

const defaultVendorProfiles = {
  "ABC Supplies": {
    initials: "AS",
    range: "₹20K – ₹80K",
    shipping: "₹2K – ₹6K",
    terms: "Net 60",
    threshold: "₹75K",
  },
  "Vertex Systems": {
    initials: "VS",
    range: "₹20K – ₹80K",
    shipping: "₹2K – ₹6K",
    terms: "Net 30",
    threshold: "₹75K",
  },
  "CloudNova Solutions": {
    initials: "CS",
    range: "₹20K – ₹80K",
    shipping: "₹2K – ₹6K",
    terms: "Net 45",
    threshold: "₹75K",
  }
};

export function App() {
  const [activeView, setActiveView] = useState("dashboard");
  const [vendorList, setVendorList] = useState(["ABC Supplies", "Vertex Systems", "CloudNova Solutions", "PrimeTech Components", "Orion Services", "BluePeak Consulting", "DataSphere Technologies", "Metro Office Solutions", "SecureNet Systems", "GreenLine Logistics"]);
  const [vendorProfiles, setVendorProfiles] = useState(defaultVendorProfiles);
  const [vendor, setVendor] = useState("ABC Supplies");
  const [amount, setAmount] = useState("");
  const [shipping, setShipping] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [history, setHistory] = useState([]);
  
  // Dynamic stats from SQLite DB
  const [dbStats, setDbStats] = useState({
    totalInvoices: 0,
    totalSpend: 0,
    approvedCount: 0,
    reviewCount: 0,
    holdCount: 0,
    totalVendors: 10,
    recentActivity: []
  });

  const loadBackendData = async () => {
    try {
      const [vRes, hRes, sRes] = await Promise.all([
        axios.get(`${API}/api/vendors`),
        axios.get(`${API}/api/invoices/history`),
        axios.get(`${API}/api/invoices/stats`)
      ]);

      if (vRes.data && vRes.data.length > 0) {
        const names = vRes.data.map(v => v.vendor_name);
        setVendorList(names);
        if (!names.includes(vendor)) setVendor(names[0]);

        const dynamicProfiles = { ...defaultVendorProfiles };
        vRes.data.forEach(v => {
          dynamicProfiles[v.vendor_name] = {
            initials: v.initials || v.vendor_name.substring(0, 2).toUpperCase(),
            range: `₹${(v.normal_min / 1000).toFixed(0)}K – ₹${(v.normal_max / 1000).toFixed(0)}K`,
            shipping: `₹${(v.shipping_min / 1000).toFixed(0)}K – ₹${(v.shipping_max / 1000).toFixed(0)}K`,
            terms: v.payment_terms || "Net 30",
            threshold: `₹${(v.approval_threshold / 1000).toFixed(0)}K`,
          };
        });
        setVendorProfiles(dynamicProfiles);
      }

      if (hRes.data && Array.isArray(hRes.data)) {
        setHistory(hRes.data.map(item => ({
          id: item.id,
          vendor: item.vendor_name,
          amount: item.amount,
          decision: (item.decision || "REVIEW").toUpperCase(),
          confidence: Number(item.confidence) || 0,
          time: new Date(item.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        })));
      }

      if (sRes.data) {
        setDbStats(sRes.data);
      }
    } catch (err) {
      console.log("Backend connection pending.");
    }
  };

  useEffect(() => {
    loadBackendData();
  }, []);

  // IntersectionObserver for slow scroll-reveal entrance animations
  useEffect(() => {
    const observerCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
        }
      });
    };

    const observerOptions = {
      root: null,
      rootMargin: "0px 0px -20px 0px",
      threshold: 0.05,
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    const timer = setTimeout(() => {
      const elements = document.querySelectorAll(".scroll-reveal");
      elements.forEach((el) => observer.observe(el));
    }, 40);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [activeView, dbStats, history, result]);


  const profile = vendorProfiles[vendor] || {
    initials: vendor.substring(0, 2).toUpperCase(),
    range: "₹20K – ₹80K",
    shipping: "₹2K – ₹6K",
    terms: "Net 30",
    threshold: "₹75K",
  };

  const analyzeInvoice = async () => {
    if (!amount) {
      alert("Please enter invoice amount.");
      return;
    }

    const invoiceAmount = Number(amount);
    const shippingAmount = Number(shipping) || 0;
    const totalAmount = invoiceAmount + shippingAmount;

    setLoading(true);
    setFeedbackSent(false);

    try {
      const response = await axios.post(
        `${API}/api/invoices/analyze`,
        {
          vendor_name: vendor,
          amount: invoiceAmount,
          shipping: shippingAmount,
          total_amount: totalAmount,
        }
      );

      setResult(response.data);
      loadBackendData();
    } catch (error) {
      console.error("Invoice analysis error:", error);
      alert(error.response?.data?.error || "Unable to analyze invoice. Make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const sendFeedback = async (humanDecision) => {
    if (!result) return;

    try {
      await axios.post(`${API}/api/feedback`, {
        decision_id: result.id,
        vendor_name: result.invoice.vendor_name,
        amount: result.invoice.amount,
        shipping: result.invoice.shipping,
        total_amount: result.invoice.total_amount,
        agent_decision: result.decision?.decision,
        human_decision: humanDecision,
        feedback:
          humanDecision === "APPROVE"
            ? "Human reviewer approved invoice after PO verification."
            : "Human reviewer requested additional manager review.",
      });

      setFeedbackSent(true);
      loadBackendData();
    } catch (error) {
      console.error(error);
      alert("Unable to save feedback.");
    }
  };

  const decision = result?.decision?.decision?.toUpperCase() || null;
  const confidence = Number(result?.decision?.confidence) || 0;
  const memories = result?.memories || [];

  const totalDecisions = (dbStats.approvedCount || 0) + (dbStats.reviewCount || 0) + (dbStats.holdCount || 0);
  const approvedPct = totalDecisions > 0 ? Math.round((dbStats.approvedCount / totalDecisions) * 100) : 0;
  const reviewPct = totalDecisions > 0 ? Math.round((dbStats.reviewCount / totalDecisions) * 100) : 0;
  const holdPct = totalDecisions > 0 ? Math.round((dbStats.holdCount / totalDecisions) * 100) : 0;

  return (
    <div className="app">
      {/* NAVBAR */}
      <header className="navbar">
        <div className="nav-left">
          <div className="logo">
            <Cpu size={20} />
          </div>

          <div>
            <div className="logo-title">AP Memory Agent</div>
            <div className="logo-subtitle">Accounts Payable AI</div>
          </div>
        </div>

        {/* TOP NAVIGATION LINKS */}
        <nav>
          <button
            className={`nav-link ${activeView === "dashboard" ? "active" : ""}`}
            onClick={() => setActiveView("dashboard")}
          >
            <LayoutDashboard size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Dashboard
          </button>

          <button
            className={`nav-link ${activeView === "analyze" ? "active" : ""}`}
            onClick={() => setActiveView("analyze")}
          >
            <FileSearch size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Analyze Invoice
          </button>

          <button
            className={`nav-link ${activeView === "vendors" ? "active" : ""}`}
            onClick={() => setActiveView("vendors")}
          >
            <Building2 size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Vendors
          </button>

          <button
            className={`nav-link ${activeView === "decisions" ? "active" : ""}`}
            onClick={() => setActiveView("decisions")}
          >
            <ShieldCheck size={14} style={{ marginRight: "6px", verticalAlign: "middle" }} />
            Decisions
          </button>
        </nav>

        {/* CORNER PROFILE AVATAR — CLICKING OPENS PROFILE VIEW */}
        <div className="nav-right">
          <div className="memory-indicator">
            <span></span>
            Hindsight active
          </div>

          <div
            className={`avatar ${activeView === "profile" ? "profile-active" : ""}`}
            onClick={() => setActiveView("profile")}
            title="User Profile"
            style={{ cursor: "pointer" }}
          >
            C
          </div>
        </div>
      </header>

      {/* VIEW: DASHBOARD EXECUTIVE OVERVIEW */}
      {activeView === "dashboard" && (
        <main>
          <section className="hero-section scroll-reveal">
            <div>
              <div className="welcome">ACCOUNTS PAYABLE OVERVIEW</div>
              <h1>
                Monitor invoice activity,
                <br />
                <span>review decisions & track vendors.</span>
              </h1>
              <p>
                Executive summary of current accounts payable operations powered by SQLite DB & Hindsight memory.
              </p>
            </div>

            <div className="hero-status">
              <div className="status-icon"><Brain size={24} color="#635bff" /></div>
              <div>
                <span>MEMORY ENGINE</span>
                <strong>Hindsight Bank</strong>
                <small>Persistent vector experience</small>
              </div>
            </div>
          </section>

          {/* 4 DYNAMIC STAT BOXES WITH COUNTUP ANIMATION */}
          <section className="stats-grid">
            <div className="stat scroll-reveal scroll-reveal-delay-1">
              <span>TOTAL INVOICES</span>
              <strong style={{ color: "#344054" }}>
                <FileText size={26} style={{ marginRight: "10px", color: "#635bff", flexShrink: 0 }} />
                <CountUp end={dbStats.totalInvoices} duration={1500} />
              </strong>
            </div>

            <div className="stat scroll-reveal scroll-reveal-delay-2">
              <span>TOTAL SPEND</span>
              <strong style={{ color: "#344054" }}>
                <Wallet size={26} style={{ marginRight: "10px", color: "#2563eb", flexShrink: 0 }} />
                <CountUp end={dbStats.totalSpend} duration={1500} prefix="₹" />
              </strong>
            </div>

            <div className="stat scroll-reveal scroll-reveal-delay-3">
              <span>PENDING REVIEW</span>
              <strong style={{ color: "#344054" }}>
                <Clock size={26} style={{ marginRight: "10px", color: "#d97706", flexShrink: 0 }} />
                <CountUp end={dbStats.reviewCount} duration={1500} />
              </strong>
            </div>

            <div className="stat scroll-reveal scroll-reveal-delay-4">
              <span>ACTIVE VENDORS</span>
              <strong style={{ color: "#344054" }}>
                <Building2 size={26} style={{ marginRight: "10px", color: "#16a34a", flexShrink: 0 }} />
                <CountUp end={dbStats.totalVendors || vendorList.length} duration={1500} />
              </strong>
            </div>
          </section>

          {/* RECENT ACTIVITY SECTION */}
          <section className="card scroll-reveal scroll-reveal-delay-1" style={{ padding: "26px", marginBottom: "24px" }}>
            <div className="card-top" style={{ padding: 0, marginBottom: "16px" }}>
              <div>
                <span className="eyebrow">LIVE LOGS</span>
                <h2>Recent Activity</h2>
              </div>
              <button
                className="nav-link"
                style={{ color: "#635bff", fontWeight: "700", cursor: "pointer" }}
                onClick={() => setActiveView("decisions")}
              >
                View all decisions →
              </button>
            </div>

            {!dbStats.recentActivity || dbStats.recentActivity.length === 0 ? (
              <div style={{ color: "#667085", fontSize: "13px" }}>
                No recent activity logged. Use <strong>Analyze Invoice</strong> tab to run invoice checks.
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {dbStats.recentActivity.map((act, idx) => (
                  <div key={act.id} className={`scroll-reveal scroll-reveal-delay-${(idx % 4) + 1}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", background: "#fafbfc", border: "1px solid #eaecf0", borderRadius: "10px" }}>
                    <div>
                      <strong style={{ fontSize: "14px", color: "#344054" }}>{act.vendor_name}</strong>
                      <div style={{ fontSize: "11px", color: "#667085", marginTop: "2px" }}>
                        ₹{Number(act.total_amount).toLocaleString("en-IN")} · {act.reason ? act.reason.slice(0, 60) + "..." : "Invoice analyzed"}
                      </div>
                    </div>
                    <DecisionBadge decision={act.decision} />
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* VENDOR OVERVIEW & DECISION DISTRIBUTION */}
          <section className="analysis-layout" style={{ gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div className="card scroll-reveal scroll-reveal-delay-2" style={{ padding: "26px" }}>
              <div className="card-top" style={{ padding: 0, marginBottom: "16px" }}>
                <div>
                  <span className="eyebrow">REGISTRY</span>
                  <h2>Vendor Overview</h2>
                </div>
                <button
                  className="nav-link"
                  style={{ color: "#635bff", fontWeight: "700", cursor: "pointer" }}
                  onClick={() => setActiveView("vendors")}
                >
                  View all vendors →
                </button>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px" }}>
                <div className="stat">
                  <span>VENDORS</span>
                  <strong style={{ color: "#344054" }}><CountUp end={dbStats.totalVendors || vendorList.length} duration={1200} /></strong>
                </div>
                <div className="stat">
                  <span>EXCEPTIONS</span>
                  <strong style={{ color: "#344054" }}><CountUp end={dbStats.vendorsWithExceptions || 0} duration={1200} /></strong>
                </div>
                <div className="stat">
                  <span>ATTENTION</span>
                  <strong style={{ color: "#344054" }}><CountUp end={dbStats.vendorsRequiringAttention || 0} duration={1200} /></strong>
                </div>
              </div>
            </div>

            <div className="card scroll-reveal scroll-reveal-delay-3" style={{ padding: "26px" }}>
              <div className="card-top" style={{ padding: 0, marginBottom: "16px" }}>
                <div>
                  <span className="eyebrow">DISTRIBUTION</span>
                  <h2>Decision Overview</h2>
                </div>
                <button
                  className="nav-link"
                  style={{ color: "#635bff", fontWeight: "700", cursor: "pointer" }}
                  onClick={() => setActiveView("decisions")}
                >
                  View history →
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px", fontSize: "12px" }}>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#15803d", fontWeight: "700" }}>Approved ({dbStats.approvedCount || 0})</span>
                    <span style={{ color: "#667085" }}>{approvedPct}%</span>
                  </div>
                  <div className="meter"><div style={{ width: `${approvedPct}%`, background: "#22c55e" }}></div></div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#b45309", fontWeight: "700" }}>Pending Review ({dbStats.reviewCount || 0})</span>
                    <span style={{ color: "#667085" }}>{reviewPct}%</span>
                  </div>
                  <div className="meter"><div style={{ width: `${reviewPct}%`, background: "#f59e0b" }}></div></div>
                </div>
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                    <span style={{ color: "#b91c1c", fontWeight: "700" }}>On Hold ({dbStats.holdCount || 0})</span>
                    <span style={{ color: "#667085" }}>{holdPct}%</span>
                  </div>
                  <div className="meter"><div style={{ width: `${holdPct}%`, background: "#ef4444" }}></div></div>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* VIEW: ANALYZE INVOICE */}
      {activeView === "analyze" && (
        <main>
          <section className="hero-section scroll-reveal">
            <div>
              <div className="welcome">AI-POWERED AP OPERATIONS</div>
              <h1>
                Make every invoice
                <br />
                <span>decision smarter.</span>
              </h1>
              <p>
                Your accounts payable agent analyzes invoices, remembers vendor history, and learns from every human decision.
              </p>
            </div>

            <div className="hero-status">
              <div className="status-icon"><Brain size={24} color="#635bff" /></div>
              <div>
                <span>AGENT MEMORY</span>
                <strong>Hindsight</strong>
                <small>Learning continuously</small>
              </div>
            </div>
          </section>

          <section className="analysis-layout">
            <div className="card invoice-card scroll-reveal scroll-reveal-delay-1">
              <div className="card-top">
                <div>
                  <span className="eyebrow">NEW ANALYSIS</span>
                  <h2>Invoice details</h2>
                </div>
                <div className="secure-label">
                  <span>●</span> SECURE
                </div>
              </div>

              <div className="invoice-paper">
                <div className="invoice-header">
                  <div className="invoice-brand">
                    <div className="mini-logo">AP</div>
                    <div>
                      <strong>AP Intelligence</strong>
                      <span>Invoice analysis</span>
                    </div>
                  </div>
                  <div className="invoice-id">
                    <span>INVOICE</span>
                    <strong>AP-2026</strong>
                  </div>
                </div>

                <div className="paper-line"></div>

                <label>Vendor</label>
                <select
                  value={vendor}
                  onChange={(e) => {
                    setVendor(e.target.value);
                    setResult(null);
                  }}
                >
                  {vendorList.map((vName) => (
                    <option key={vName} value={vName}>
                      {vName}
                    </option>
                  ))}
                </select>

                <div className="two-fields">
                  <div>
                    <label>Invoice amount</label>
                    <div className="money-input">
                      <span>₹</span>
                      <input
                        type="number"
                        placeholder="72,000"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label>Shipping</label>
                    <div className="money-input">
                      <span>₹</span>
                      <input
                        type="number"
                        placeholder="4,000"
                        value={shipping}
                        onChange={(e) => setShipping(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <button className="analyze-btn" onClick={analyzeInvoice} disabled={loading}>
                  {loading ? (
                    <>Checking memory...</>
                  ) : (
                    <>Analyze invoice <span>→</span></>
                  )}
                </button>
              </div>

              <div className="invoice-note">
                <span>✦</span> Analysis uses current invoice data + historical vendor memory.
              </div>
            </div>

            <div className="card vendor-card scroll-reveal scroll-reveal-delay-2">
              <div className="card-top">
                <div>
                  <span className="eyebrow">VENDOR INTELLIGENCE</span>
                  <h2>Historical profile</h2>
                </div>
                <div className="verified">✓ Verified</div>
              </div>

              <div className="vendor-profile">
                <div className="vendor-avatar">{profile.initials}</div>
                <div>
                  <h3>{vendor}</h3>
                  <p>Known vendor profile</p>
                </div>
              </div>

              <div className="stats-grid">
                <Stat label="Typical invoices" value={profile.range} />
                <Stat label="Typical shipping" value={profile.shipping} />
                <Stat label="Payment terms" value={profile.terms} />
                <Stat label="Approval threshold" value={profile.threshold} />
              </div>

              <div className="memory-summary">
                <div className="memory-symbol"><Brain size={20} color="#635bff" /></div>
                <div className="memory-summary-text">
                  <strong>Persistent memory</strong>
                  <p>Previous invoices, exceptions and human feedback can influence this decision.</p>
                </div>
                <div className="memory-number">
                  {memories.length}
                  <small>recalled</small>
                </div>
              </div>
            </div>
          </section>

          {/* DECISION CENTER RESULTS */}
          <section className="decision-section scroll-reveal scroll-reveal-delay-1">
            <div className="section-heading">
              <div>
                <span className="eyebrow">AI ANALYSIS</span>
                <h2>Decision center</h2>
              </div>
              {decision && <DecisionBadge decision={decision} />}
            </div>

            {!result ? (
              <div className="waiting-card scroll-reveal scroll-reveal-delay-2">
                <div className="waiting-icon"><SparklesIcon size={24} color="#635bff" /></div>
                <h3>Ready when you are</h3>
                <p>Submit an invoice to see the agent's decision, reasoning, and recalled Hindsight memories.</p>
              </div>
            ) : (
              <>
                <div className="decision-grid">
                  <div className={`card main-decision ${decision.toLowerCase()} scroll-reveal scroll-reveal-delay-1`}>
                    <div className="decision-card-header">
                      <div>
                        <span className="eyebrow">AGENT RECOMMENDATION</span>
                        <div className="decision-title">
                          <span>{decision}</span>
                        </div>
                      </div>
                      <div className="confidence">
                        <strong style={{ color: "#344054" }}><CountUp end={confidence} duration={1000} suffix="%" /></strong>
                        <span>confidence</span>
                      </div>
                    </div>

                    <div className="decision-reason">
                      <span>WHY?</span>
                      <p>{result.decision?.reason || "The agent evaluated the invoice using vendor history and current invoice information."}</p>
                    </div>

                    <div className="recommendation-box">
                      <span>RECOMMENDED ACTION</span>
                      <strong>{result.decision?.recommendation || "Review invoice against purchase order."}</strong>
                    </div>
                  </div>

                  <div className="card snapshot-card scroll-reveal scroll-reveal-delay-2">
                    <div className="snapshot-title">Invoice snapshot</div>
                    <div className="snapshot-row"><span>Vendor</span><strong style={{ color: "#344054" }}>{result.invoice.vendor_name}</strong></div>
                    <div className="snapshot-row"><span>Invoice</span><strong style={{ color: "#344054" }}>₹{Number(result.invoice.amount).toLocaleString("en-IN")}</strong></div>
                    <div className="snapshot-row"><span>Shipping</span><strong style={{ color: "#344054" }}>₹{Number(result.invoice.shipping).toLocaleString("en-IN")}</strong></div>
                    <div className="snapshot-row total"><span>Total exposure</span><strong style={{ color: "#344054" }}>₹{(Number(result.invoice.amount) + Number(result.invoice.shipping)).toLocaleString("en-IN")}</strong></div>
                    <div className="risk-meter">
                      <div className="risk-meter-top"><span>AI confidence</span><strong>{confidence}%</strong></div>
                      <div className="meter"><div style={{ width: `${Math.min(confidence, 100)}%` }}></div></div>
                    </div>
                  </div>
                </div>

                <div className="card hindsight scroll-reveal scroll-reveal-delay-3">
                  <div className="hindsight-top">
                    <div className="hindsight-brand">
                      <div><Brain size={20} color="#635bff" /></div>
                      <div>
                        <span>HINDSIGHT MEMORY</span>
                        <h2>What the agent remembers</h2>
                      </div>
                    </div>
                    <div className="memory-used"><span></span>{memories.length} memories recalled</div>
                  </div>

                  {memories.length > 0 ? (
                    <div className="memory-list">
                      {memories.map((memory, index) => (
                        <div className={`memory-item scroll-reveal scroll-reveal-delay-${(index % 4) + 1}`} key={index}>
                          <div className="memory-index">{String(index + 1).padStart(2, "0")}</div>
                          <div className="memory-item-content">
                            <div className="memory-item-type">{memory.type || "Historical memory"}</div>
                            <p>{memory.text || "Historical vendor information recalled by Hindsight."}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-memory">
                      <div>○</div>
                      <div>
                        <strong>No previous memory matched this invoice.</strong>
                        <p>The agent is evaluating this invoice primarily from the current vendor profile.</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="feedback-card scroll-reveal scroll-reveal-delay-4">
                  <div>
                    <span className="eyebrow">HUMAN-IN-THE-LOOP</span>
                    <h3>Teach the agent what happened.</h3>
                    <p>Your decision is stored as persistent memory for future invoices from this vendor.</p>
                  </div>

                  <div className="feedback-buttons">
                    <button onClick={() => sendFeedback("APPROVE")} className="approve-btn">
                      ✓ Approve
                    </button>
                    <button onClick={() => sendFeedback("REVIEW")} className="review-btn">
                      Request review
                    </button>
                  </div>
                </div>

                {feedbackSent && (
                  <div className="feedback-success">
                    <CheckCircle2 size={18} style={{ marginRight: "8px" }} />
                    <div>
                      <strong>Learning saved to Hindsight</strong>
                      <p>This human decision can now influence future vendor analysis.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </section>
        </main>
      )}

      {/* VIEW: VENDORS REGISTRY */}
      {activeView === "vendors" && (
        <main className="page-view">
          <section className="hero-section compact-hero scroll-reveal">
            <div>
              <div className="welcome">VENDOR INTELLIGENCE</div>
              <h1>Know your <span>vendors.</span></h1>
              <p>See what AP Intelligence knows about each vendor stored in SQLite database.</p>
            </div>
            <div className="hero-status">
              <div className="status-icon"><Brain size={24} color="#635bff" /></div>
              <div>
                <span>AGENT MEMORY</span>
                <strong>Hindsight</strong>
                <small>Vendor experience retained</small>
              </div>
            </div>
          </section>

          <section className="vendor-directory">
            {Object.entries(vendorProfiles).map(([name, vProfile], idx) => (
              <div className={`card vendor-directory-card scroll-reveal scroll-reveal-delay-${(idx % 4) + 1}`} key={name}>
                <div className="vendor-profile">
                  <div className="vendor-avatar">{vProfile.initials}</div>
                  <div>
                    <h3>{name}</h3>
                    <p>Known vendor profile (SQLite)</p>
                  </div>
                </div>

                <div className="stats-grid">
                  <Stat label="Typical invoices" value={vProfile.range} />
                  <Stat label="Typical shipping" value={vProfile.shipping} />
                  <Stat label="Payment terms" value={vProfile.terms} />
                  <Stat label="Approval threshold" value={vProfile.threshold} />
                </div>

                <button
                  className="analyze-btn vendor-use-btn"
                  onClick={() => {
                    setVendor(name);
                    setActiveView("analyze");
                    setResult(null);
                  }}
                >
                  Analyze an invoice for this vendor <span>→</span>
                </button>
              </div>
            ))}
          </section>
        </main>
      )}

      {/* VIEW: DECISIONS HISTORY */}
      {activeView === "decisions" && (
        <main className="page-view">
          <section className="hero-section compact-hero scroll-reveal">
            <div>
              <div className="welcome">DECISION INTELLIGENCE</div>
              <h1>See how the agent <span>decides.</span></h1>
              <p>Follow every invoice from initial analysis to Hindsight memory and human feedback.</p>
            </div>
            <div className="hero-status">
              <div className="status-icon"><Brain size={24} color="#635bff" /></div>
              <div>
                <span>DECISION MEMORY</span>
                <strong style={{ color: "#344054" }}><CountUp end={history.length} duration={1200} /> decisions</strong>
                <small>SQLite database logs</small>
              </div>
            </div>
          </section>

          <section className="history-section">
            {history.length === 0 ? (
              <div className="empty-history card scroll-reveal scroll-reveal-delay-1">
                <h3>No decisions recorded yet.</h3>
                <p>Analyze an invoice from the Analyze Invoice tab to generate audit logs.</p>
              </div>
            ) : (
              <div className="history-card scroll-reveal scroll-reveal-delay-1">
                {history.map((item, idx) => (
                  <div className={`history-row scroll-reveal scroll-reveal-delay-${Math.min((idx % 6) + 1, 6)}`} key={item.id}>
                    <div className="history-vendor">
                      <div>{item.vendor.substring(0, 2).toUpperCase()}</div>
                      <span>{item.vendor}</span>
                    </div>
                    <div className="history-amount">₹{item.amount.toLocaleString("en-IN")}</div>
                    <DecisionBadge decision={item.decision} />
                    <div className="history-confidence">{item.confidence}% confidence</div>
                    <div className="history-time">{item.time}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* VIEW: PROFILE (ACCESSIBLE BY CLICKING TOP-RIGHT AVATAR 'C') */}
      {activeView === "profile" && (
        <main className="page-view">
          <section className="hero-section compact-hero scroll-reveal">
            <div>
              <div className="welcome">ACCOUNT</div>
              <h1>My <span>profile.</span></h1>
              <p>Application and agent information for the current user.</p>
            </div>
            <div className="hero-status">
              <div className="status-icon">C</div>
              <div>
                <span>PROFILE</span>
                <strong>Chakrika Adimulam</strong>
                <small>AP Operations</small>
              </div>
            </div>
          </section>

          <section className="profile-grid">
            <div className="card profile-card scroll-reveal scroll-reveal-delay-1">
              <div className="profile-large-avatar">C</div>
              <span className="eyebrow">USER PROFILE</span>
              <h2>Chakrika Adimulam</h2>
              <p>AP Operations Analyst</p>
              <div className="profile-detail"><span>Application</span><strong>AP Intelligence</strong></div>
              <div className="profile-detail"><span>Memory system</span><strong>Hindsight (Vectorize)</strong></div>
              <div className="profile-detail"><span>Database engine</span><strong>SQLite (ap_database.sqlite)</strong></div>
            </div>

            <div className="card profile-card scroll-reveal scroll-reveal-delay-2">
              <span className="eyebrow">SYSTEM STATUS</span>
              <h2>Agent services</h2>
              <div className="system-status-row"><span>Hindsight Memory</span><strong>Active</strong></div>
              <div className="system-status-row"><span>SQLite Database</span><strong>Connected</strong></div>
              <div className="system-status-row"><span>Invoice Analysis</span><strong>Ready</strong></div>
              <div className="system-status-row"><span>Human Feedback</span><strong>Enabled</strong></div>
            </div>
          </section>
        </main>
      )}

      <footer>
        <span>AP Intelligence</span>
        <span>Groq · Hindsight · SQLite Database · AI Agent</span>
      </footer>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="stat">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function DecisionBadge({ decision }) {
  const normalized = (decision || "").toLowerCase();
  return (
    <div className={`decision-badge ${normalized}`}>
      <span></span>
      {decision}
    </div>
  );
}

function SparklesIcon({ size = 18, color = "currentColor" }) {
  return <Cpu size={size} color={color} />;
}

export default App;