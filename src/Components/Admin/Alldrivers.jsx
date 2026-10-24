import { useState, useEffect, useRef } from "react";
import axios from "axios";

// ─── Shared helpers ────────────────────────────────────────────────────────────
const API_BASEA = import.meta.env.VITE_API_URL;

const token = () => localStorage.getItem("adminToken");
const authHeaders = () => ({ Authorization: `Bearer ${token()}` });

const useIsMobile = (bp = 768) => {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth < bp : false
  );
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < bp);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, [bp]);
  return isMobile;
};

const inputStyle = {
  width: "100%",
  padding: "10px 14px",
  border: "1px solid #ddd",
  borderRadius: 8,
  fontSize: 14,
  color: "#333",
  background: "#fff",
  boxSizing: "border-box",
  outline: "none",
  minWidth: 0,
};

const labelStyle = {
  fontSize: 13,
  fontWeight: 600,
  color: "#333",
  marginBottom: 6,
  display: "block",
};

const Req = () => <span style={{ color: "#e53935" }}> *</span>;

// ─── Toggle Switch ─────────────────────────────────────────────────────────────
function ToggleSwitch({ checked, onChange }) {
  return (
    <div
      onClick={onChange}
      role="switch"
      aria-checked={checked}
      style={{
        width: 48,
        height: 26,
        borderRadius: 13,
        background: checked ? "#4CAF50" : "#ccc",
        position: "relative",
        cursor: "pointer",
        transition: "background 0.2s",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          width: 20,
          height: 20,
          background: "#fff",
          borderRadius: "50%",
          position: "absolute",
          top: 3,
          left: checked ? 25 : 3,
          transition: "left 0.2s",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
      />
    </div>
  );
}

// ─── Info Field ────────────────────────────────────────────────────────────────
function InfoField({ label, value }) {
  return (
    <div style={{ marginBottom: 4, minWidth: 0 }}>
      <p style={{ fontSize: 12, color: "#888", fontWeight: 600, marginBottom: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </p>
      <div style={{ fontSize: 15, fontWeight: 500, color: "#222", wordBreak: "break-word" }}>{value || "—"}</div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 1 — All Drivers List
// ══════════════════════════════════════════════════════════════════════════════

function AllDrivers({ onView, onEdit, onCreate }) {
  const isMobile = useIsMobile();
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [filter, setFilter] = useState("Approved");

  const fetchDrivers = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const { data } = await axios.get(`${API_BASEA}/api/driver/all`, { headers: authHeaders() });
      const list = Array.isArray(data) ? data : Array.isArray(data.drivers) ? data.drivers : [];
      setDrivers(list);
    } catch (err) {
      console.error("Failed to fetch drivers:", err);
      setFetchError(err.response?.data?.message || "Failed to load drivers.");
      setDrivers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDrivers(); }, []);

  const handleToggle = async (id) => {
    try {
      await axios.patch(`${API_BASEA}/api/driver/status/${id}`, {}, { headers: authHeaders() });
      fetchDrivers();
    } catch (err) {
      console.error("Toggle failed:", err);
    }
  };

  const ActionBtn = ({ onClick, title, bg, children }) => (
    <button
      onClick={onClick}
      title={title}
      aria-label={title}
      style={{
        background: bg, border: "none", borderRadius: 8,
        width: isMobile ? 40 : 34, height: isMobile ? 40 : 34,
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", fontSize: 16, flexShrink: 0,
      }}
    >
      {children}
    </button>
  );

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "24px", background: "#f5f6fa", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden" }}>
      <h2 style={{ fontWeight: 700, fontSize: isMobile ? 19 : 22, marginBottom: 16, marginTop: 0 }}>All Drivers</h2>

      <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden" }}>
        {/* Toolbar */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "stretch" : "center",
          justifyContent: "space-between",
          gap: 12,
          padding: isMobile ? "14px" : "16px 24px",
          borderBottom: "1px solid #f0f0f0",
        }}>
          <span style={{ fontWeight: 600, fontSize: 14 }}>All Drivers</span>
          <div style={{ display: "flex", gap: 10, alignItems: "center", width: isMobile ? "100%" : "auto" }}>
            <button
              onClick={onCreate}
              style={{
                background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8,
                padding: isMobile ? "11px 14px" : "10px 20px", fontWeight: 600, cursor: "pointer",
                fontSize: 14, flex: isMobile ? 1 : "0 0 auto", whiteSpace: "nowrap",
              }}
            >
              + Create New
            </button>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={{
                border: "1px solid #ddd", borderRadius: 8,
                padding: isMobile ? "11px 12px" : "10px 14px",
                fontSize: isMobile ? 16 : 14, background: "#fff", cursor: "pointer",
                flex: isMobile ? 1 : "0 0 auto", minWidth: 0,
              }}
            >
              <option>Approved</option>
              <option>Pending</option>
              <option>Blocked</option>
            </select>
          </div>
        </div>

        {/* Mobile: card list */}
        {isMobile ? (
          <div style={{ padding: 10, display: "flex", flexDirection: "column", gap: 10 }}>
            {loading ? (
              <div style={{ textAlign: "center", padding: 32, color: "#888" }}>Loading...</div>
            ) : fetchError ? (
              <div style={{ textAlign: "center", padding: 32, color: "#e53935" }}>{fetchError}</div>
            ) : drivers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 32, color: "#888" }}>No drivers found.</div>
            ) : (
              drivers.map((driver, index) => (
                <div key={driver.id} style={{ border: "1px solid #f0f0f0", borderRadius: 12, padding: 12, background: "#fff" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <img
                      src={driver.profileImage || "https://via.placeholder.com/48"}
                      alt={driver.fullName}
                      style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {driver.fullName}
                        </span>
                        <span style={{ fontSize: 11, color: "#999", flexShrink: 0 }}>#{index + 1}</span>
                      </div>
                      <div style={{ fontSize: 13, color: "#555", marginTop: 2 }}>{driver.phone}</div>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 12, borderTop: "1px solid #f5f5f5", gap: 8 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <ToggleSwitch checked={driver.isOnline} onChange={() => handleToggle(driver.id)} />
                      <span style={{ fontSize: 12, color: "#555", fontWeight: 600 }}>
                        {driver.isOnline ? "Online" : "Offline"}
                      </span>
                    </div>
                    <div style={{ display: "flex", gap: 8 }}>
                      <ActionBtn onClick={() => onView(driver.id)} title="View Driver" bg="#e8f5e9">👁</ActionBtn>
                      <ActionBtn onClick={() => onEdit(driver.id)} title="Edit Driver" bg="#e3f2fd">✏️</ActionBtn>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          /* Desktop: table */
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 640 }}>
              <thead>
                <tr style={{ background: "#fafafa" }}>
                  {["SL.", "Profile", "Name", "Phone", "Status", "Action"].map((h) => (
                    <th key={h} style={{ padding: "14px 24px", textAlign: "left", fontSize: 13, fontWeight: 700, color: "#333", borderBottom: "1px solid #f0f0f0" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#888" }}>Loading...</td></tr>
                ) : fetchError ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#e53935" }}>{fetchError}</td></tr>
                ) : drivers.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: "center", padding: 40, color: "#888" }}>No drivers found.</td></tr>
                ) : (
                  drivers.map((driver, index) => (
                    <tr key={driver.id} style={{ borderBottom: "1px solid #f5f5f5" }}>
                      <td style={{ padding: "16px 24px", fontSize: 14 }}>{index + 1}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <img
                          src={driver.profileImage || "https://via.placeholder.com/40"}
                          alt={driver.fullName}
                          style={{ width: 40, height: 40, borderRadius: "50%", objectFit: "cover" }}
                        />
                      </td>
                      <td style={{ padding: "16px 24px", fontSize: 14, fontWeight: 500 }}>{driver.fullName}</td>
                      <td style={{ padding: "16px 24px", fontSize: 14, color: "#555" }}>{driver.phone}</td>
                      <td style={{ padding: "16px 24px" }}>
                        <ToggleSwitch checked={driver.isOnline} onChange={() => handleToggle(driver.id)} />
                      </td>
                      <td style={{ padding: "16px 24px" }}>
                        <div style={{ display: "flex", gap: 10 }}>
                          <ActionBtn onClick={() => onView(driver.id)} title="View Driver" bg="#e8f5e9">👁</ActionBtn>
                          <ActionBtn onClick={() => onEdit(driver.id)} title="Edit Driver" bg="#e3f2fd">✏️</ActionBtn>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 2 — View Driver
// ══════════════════════════════════════════════════════════════════════════════

function ViewDriver({ driverId, onBack, onEdit }) {
  const isMobile = useIsMobile();
  const [driver, setDriver] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOne = async () => {
      try {
        const { data } = await axios.get(`${API_BASEA}/api/driver/${driverId}`, { headers: authHeaders() });
        setDriver(data.driver);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch driver");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [driverId]);

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;
  if (!driver) return null;

  const dobFormatted = driver.dateOfBirth
    ? (() => {
        const parts = driver.dateOfBirth.split("-");
        const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
        return `${parts[2]} ${months[parseInt(parts[1], 10) - 1]} ${parts[0]}`;
      })()
    : "—";

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "24px", background: "#f5f6fa", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden" }}>
      <h2 style={{ fontWeight: 700, fontSize: isMobile ? 19 : 22, marginBottom: isMobile ? 16 : 24, marginTop: 0, display: "flex", alignItems: "center", gap: 8 }}>
        👤 Driver Details
      </h2>

      <div style={{ background: "#fff", borderRadius: 12, padding: isMobile ? 16 : 32, maxWidth: 900, boxSizing: "border-box" }}>
        {/* Header */}
        <div style={{
          display: "flex",
          flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "center" : "center",
          gap: isMobile ? 14 : 24,
          marginBottom: isMobile ? 20 : 32,
          paddingBottom: isMobile ? 18 : 24,
          borderBottom: "1px solid #f0f0f0",
          textAlign: isMobile ? "center" : "left",
        }}>
          <img
            src={driver.profileImage || "https://via.placeholder.com/100"}
            alt={driver.fullName}
            style={{
              width: isMobile ? 84 : 90, height: isMobile ? 84 : 90, borderRadius: "50%",
              objectFit: "cover", border: "3px solid #e8f5e9", flexShrink: 0,
            }}
          />
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: isMobile ? 18 : 20, fontWeight: 700, marginBottom: 6, marginTop: 0, wordBreak: "break-word" }}>{driver.fullName}</h3>
            <span style={{
              background: driver.isActive ? "#e8f5e9" : "#fce4e4",
              color: driver.isActive ? "#2e7d32" : "#c62828",
              padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600,
            }}>
              {driver.isActive ? "Active" : "Inactive"}
            </span>
          </div>
          <div style={{
            marginLeft: isMobile ? 0 : "auto",
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            width: isMobile ? "100%" : "auto",
            flexDirection: isMobile ? "column" : "row",
          }}>
            <button
              onClick={() => onEdit(driver.id)}
              style={{
                background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8,
                padding: isMobile ? "12px 16px" : "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14,
                width: isMobile ? "100%" : "auto",
              }}
            >
              ✏️ Edit Driver
            </button>
            <button
              onClick={onBack}
              style={{
                background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8,
                padding: isMobile ? "12px 16px" : "10px 22px", fontWeight: 600, cursor: "pointer", fontSize: 14,
                width: isMobile ? "100%" : "auto",
              }}
            >
              ← Back
            </button>
          </div>
        </div>

        {/* Info Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: isMobile ? "16px" : "20px 40px",
        }}>
          <InfoField label="Full Name" value={driver.fullName} />
          <InfoField label="Email" value={driver.email} />
          <InfoField label="Phone Number" value={driver.phone} />
          <InfoField label="Gender" value={driver.gender} />
          <InfoField label="Date of Birth" value={dobFormatted} />
          <InfoField label="Driving License" value={driver.drivingLicense} />
          <InfoField
            label="Password"
            value={
              driver.password
                ? <span style={{ fontFamily: "monospace", fontSize: 14, letterSpacing: 1, color: "#333" }}>{driver.password}</span>
                : "—"
            }
          />
          <InfoField label="Vehicle Type" value={driver.vehicleType} />
          <InfoField label="Vehicle Number" value={driver.vehicleNumber} />
          <InfoField label="Identity Type" value={driver.identityType} />
          <InfoField label="Identity Number" value={driver.identityNumber} />
          <InfoField label="Total Orders Delivered" value={driver.totalOrdersDelivered} />
          <InfoField label="Total Earnings" value={`₹${driver.totalEarnings}`} />
          <InfoField label="Rating" value={`⭐ ${driver.rating} / 5`} />
          <InfoField
            label="Online Status"
            value={
              <span style={{ background: driver.isOnline ? "#e8f5e9" : "#f5f5f5", color: driver.isOnline ? "#2e7d32" : "#888", padding: "4px 14px", borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                {driver.isOnline ? "Online" : "Offline"}
              </span>
            }
          />
          <InfoField label="Joined" value={new Date(driver.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })} />
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// PAGE 3 — Create / Edit Driver Form
// ══════════════════════════════════════════════════════════════════════════════

function DriverForm({ driverId, onBack }) {
  const isMobile = useIsMobile();
  const isEdit = Boolean(driverId);
  const fileInputRef = useRef();

  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    firstName: "", lastName: "", phone: "", email: "",
    gender: "Male", drivingLicense: "", password: "", confirmPassword: "",
    vehicleType: "", vehicleNumber: "", identityType: "Aadhar",
    identityNumber: "", dateOfBirth: "",
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetchOne = async () => {
      try {
        const { data } = await axios.get(`${API_BASEA}/api/driver/${driverId}`, { headers: authHeaders() });
        const d = data.driver;
        const parts = (d.fullName || "").split(" ");
        setForm({
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" "),
          phone: d.phone || "",
          email: d.email || "",
          gender: d.gender || "Male",
          drivingLicense: d.drivingLicense || "",
          password: d.password || "",
          confirmPassword: d.password || "",
          vehicleType: d.vehicleType || "",
          vehicleNumber: d.vehicleNumber || "",
          identityType: d.identityType || "Aadhar",
          identityNumber: d.identityNumber || "",
          dateOfBirth: d.dateOfBirth || "",
        });
        if (d.profileImage) setPreviewImage(d.profileImage);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load driver");
      } finally {
        setLoading(false);
      }
    };
    fetchOne();
  }, [driverId]);

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setPreviewImage(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.firstName || !form.phone || !form.vehicleType) return alert("Please fill in all required fields.");
    if (form.password && form.password !== form.confirmPassword) return alert("Passwords do not match.");

    setSubmitting(true);
    try {
      const fd = new FormData();
      fd.append("fullName", `${form.firstName} ${form.lastName}`.trim());
      fd.append("phone", form.phone);
      fd.append("email", form.email);
      fd.append("gender", form.gender);
      fd.append("vehicleType", form.vehicleType);
      fd.append("vehicleNumber", form.vehicleNumber);
      fd.append("identityType", form.identityType);
      fd.append("identityNumber", form.identityNumber || form.drivingLicense);
      fd.append("drivingLicense", form.drivingLicense);
      fd.append("dob", form.dateOfBirth);
      fd.append("password", form.password);
      if (imageFile) fd.append("profileImage", imageFile);

      if (isEdit) {
        await axios.put(`${API_BASEA}/api/driver/${driverId}`, fd, {
          headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
        });
        alert("Driver updated successfully!");
      } else {
        await axios.post(`${API_BASEA}/api/driver/add`, fd, {
          headers: { ...authHeaders(), "Content-Type": "multipart/form-data" },
        });
        alert("Driver created successfully!");
      }
      onBack();
    } catch (err) {
      alert(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading driver data...</div>;
  if (error) return <div style={{ padding: 40, color: "red" }}>{error}</div>;

  const twoCol = isMobile ? "1fr" : "1fr 1fr";

  return (
    <div style={{ padding: isMobile ? "16px 12px" : "24px", background: "#f5f6fa", minHeight: "100vh", boxSizing: "border-box", overflowX: "hidden" }}>
      {/* Page header */}
      <div style={{
        display: "flex",
        flexDirection: isMobile ? "column" : "row",
        alignItems: isMobile ? "stretch" : "center",
        justifyContent: "space-between",
        gap: 12,
        marginBottom: isMobile ? 16 : 28,
      }}>
        <h2 style={{ fontWeight: 700, fontSize: isMobile ? 19 : 22, display: "flex", alignItems: "center", gap: 8, margin: 0 }}>
          👤 {isEdit ? "Update Driver" : "Create New Driver"}
        </h2>
        <button
          onClick={onBack}
          style={{
            background: "#fff", color: "#555", border: "1px solid #ddd", borderRadius: 8,
            padding: isMobile ? "12px 20px" : "9px 20px", fontWeight: 600, cursor: "pointer", fontSize: 14,
            width: isMobile ? "100%" : "auto",
          }}
        >
          ← Back
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, padding: isMobile ? 16 : 32, boxSizing: "border-box", minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: 14, color: "#333", marginBottom: 20, marginTop: 0, display: "flex", alignItems: "center", gap: 6 }}>
          👤 User Information
        </p>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: isMobile ? 24 : 32 }}>
          {/* Photo column — on mobile, shown first */}
          <div style={{ order: isMobile ? -1 : 0, minWidth: 0 }}>
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, marginTop: 0 }}>
                Profile Photo{" "}
                <span style={{ color: "#1976d2", fontWeight: 400 }}>Ratio 1:1 (500 × 500 px)</span>{" "}
                <Req />
              </p>
              <div
                onClick={() => fileInputRef.current.click()}
                style={{
                  width: "100%", height: isMobile ? 180 : 200, background: "#f5f5f5", borderRadius: 8,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  cursor: "pointer", overflow: "hidden", border: "1px dashed #ccc", boxSizing: "border-box",
                }}
              >
                {previewImage
                  ? <img src={previewImage} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ color: "#aaa", fontSize: 14 }}>500 × 500</span>}
              </div>
              <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png" style={{ display: "none" }} onChange={handleImageChange} />
              <p style={{ fontSize: 12, color: "#888", marginTop: 6 }}>Supported formats: jpg, jpeg, png</p>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Date of Birth</label>
              <input type="date" name="dateOfBirth" value={form.dateOfBirth} onChange={handleChange} style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Vehicle Type <Req /></label>
              <select name="vehicleType" value={form.vehicleType} onChange={handleChange} style={inputStyle}>
                <option value="">Enter Vehicle Type</option>
                <option>Bike</option>
                <option>Scooter</option>
                <option>Cycle</option>
                <option>Mini Truck</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Vehicle Number</label>
              <input name="vehicleNumber" value={form.vehicleNumber} onChange={handleChange} placeholder="e.g. BR-01-AX-1234" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Identity Type <Req /></label>
              <select name="identityType" value={form.identityType} onChange={handleChange} style={inputStyle}>
                <option>Aadhar</option>
                <option>Driving_License</option>
                <option>PAN</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Identity Number <Req /></label>
              <input name="identityNumber" value={form.identityNumber} onChange={handleChange} placeholder="Enter Identity Number" style={inputStyle} />
            </div>
          </div>

          {/* Info column */}
          <div style={{ minWidth: 0 }}>
            <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>First Name <Req /></label>
                <input name="firstName" value={form.firstName} onChange={handleChange} placeholder="Enter first name" style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Last Name</label>
                <input name="lastName" value={form.lastName} onChange={handleChange} placeholder="Enter last name" style={inputStyle} />
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Phone Number <Req /></label>
              <input type="tel" inputMode="tel" name="phone" value={form.phone} onChange={handleChange} placeholder="Enter phone number" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Email</label>
              <input type="email" inputMode="email" name="email" value={form.email} onChange={handleChange} placeholder="Enter Email Address" style={inputStyle} />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} style={inputStyle}>
                <option>Male</option>
                <option>Female</option>
                <option>Other</option>
              </select>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Driving License</label>
              <input name="drivingLicense" value={form.drivingLicense} onChange={handleChange} placeholder="Enter License" style={inputStyle} />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: twoCol, gap: 16, marginBottom: 20 }}>
              <div>
                <label style={labelStyle}>Password {!isEdit && <Req />}</label>
                <input type="password" name="password" value={form.password} onChange={handleChange} placeholder="Enter Password" style={inputStyle} autoComplete="new-password" />
              </div>
              <div>
                <label style={labelStyle}>Confirm Password {!isEdit && <Req />}</label>
                <input type="password" name="confirmPassword" value={form.confirmPassword} onChange={handleChange} placeholder="Enter Confirm Password" style={inputStyle} autoComplete="new-password" />
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div style={{ display: "flex", justifyContent: isMobile ? "stretch" : "flex-end", marginTop: 12 }}>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{
              background: "#4CAF50", color: "#fff", border: "none", borderRadius: 8,
              padding: isMobile ? "14px 20px" : "12px 40px", fontWeight: 700, fontSize: 15,
              cursor: submitting ? "not-allowed" : "pointer", opacity: submitting ? 0.7 : 1,
              width: isMobile ? "100%" : "auto",
            }}
          >
            {submitting ? "Saving..." : "Submit"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════════
// ROOT — Page router
// ══════════════════════════════════════════════════════════════════════════════

export default function Drivers() {
  const [page, setPage] = useState("list");
  const [selectedId, setSelectedId] = useState(null);

  const goList   = ()   => { setPage("list");  setSelectedId(null); };
  const goView   = (id) => { setPage("view");  setSelectedId(id);  };
  const goEdit   = (id) => { setPage("form");  setSelectedId(id);  };
  const goCreate = ()   => { setPage("form");  setSelectedId(null); };

  if (page === "list") {
    return <AllDrivers onView={goView} onEdit={goEdit} onCreate={goCreate} />;
  }
  if (page === "view") {
    return <ViewDriver driverId={selectedId} onBack={goList} onEdit={goEdit} />;
  }
  if (page === "form") {
    return <DriverForm driverId={selectedId} onBack={goList} />;
  }
  return null;
}