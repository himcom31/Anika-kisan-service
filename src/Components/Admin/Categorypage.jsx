import { useState, useEffect, useRef } from "react";

const API_BASE = import.meta.env.VITE_API_URL;

function getToken() {
  return localStorage.getItem("adminToken") || "";
}

function authHeaders() {
  return { Authorization: `Bearer ${getToken()}` };
}

// ── Responsive hook ──────────────────────────────────────────────────────────
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

export default function CategoryPage() {
  const isMobile = useIsMobile();
  const styles = makeStyles(isMobile);

  const [activeTab, setActiveTab] = useState("view");
  const [categories, setCategories] = useState([]);
  const [parentCategories, setParentCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [editId, setEditId] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadPreview, setUploadPreview] = useState(null);
  const fileRef = useRef();

  const [form, setForm] = useState({
    name: "",
    description: "",
    isActive: "true",
    parent_id: "",
  });

  useEffect(() => {
    fetchCategories();
    fetchParentCategories();
  }, []);

  async function fetchCategories() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/Category/all`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setCategories(data.categories);
      } else {
        showToast(data.message || "Failed to load categories", "error");
      }
    } catch (err) {
      showToast("Cannot reach server. Is it running?", "error");
    } finally {
      setLoading(false);
    }
  }

  async function fetchParentCategories() {
    try {
      const res = await fetch(`${API_BASE}/api/Category/parents`, {
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        setParentCategories(data.categories);
      }
    } catch (err) {
      console.error("Parent categories fetch failed", err);
    }
  }

  function showToast(msg, type = "success") {
    setToast({ show: true, msg, type });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 3500);
  }

  function handleFileChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedFile(file);
    setUploadPreview(URL.createObjectURL(file));
  }

  function resetForm() {
    setForm({ name: "", description: "", isActive: "true", parent_id: "" });
    setUploadedFile(null);
    setUploadPreview(null);
    setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  function handleEdit(cat) {
    setForm({
      name: cat.name,
      description: cat.description || "",
      isActive: cat.isActive ? "true" : "false",
      parent_id: cat.parent_id ? String(cat.parent_id) : "",
    });
    setUploadPreview(cat.thumbnail || null);
    setUploadedFile(null);
    setEditId(cat.id);
    setActiveTab("add");
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      showToast("Category name is required", "error");
      return;
    }
    if (!editId && !uploadedFile) {
      showToast("Please upload a thumbnail image", "error");
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", form.name.trim());
      formData.append("description", form.description.trim());
      formData.append("isActive", form.isActive);
      if (uploadedFile) formData.append("thumbnail", uploadedFile);
      if (form.parent_id) formData.append("parent_id", form.parent_id);

      const url = editId
        ? `${API_BASE}/api/Category/${editId}`
        : `${API_BASE}/api/Category/add`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        showToast(
          editId
            ? `"${form.name}" updated successfully!`
            : `"${form.name}" created successfully!`
        );
        resetForm();
        await fetchCategories();
        await fetchParentCategories();
        setActiveTab("view");
      } else {
        showToast(data.message || "Something went wrong", "error");
      }
    } catch (err) {
      showToast("Network error. Check your server.", "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(cat) {
    if (!window.confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`${API_BASE}/api/Category/${cat.id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (data.success) {
        showToast(`"${cat.name}" deleted`);
        await fetchCategories();
        await fetchParentCategories();
      } else {
        showToast(data.message || "Delete failed", "error");
      }
    } catch {
      showToast("Network error during delete", "error");
    }
  }

  async function handleToggleStatus(cat) {
    try {
      const formData = new FormData();
      formData.append("name", cat.name);
      formData.append("isActive", !cat.isActive);
      formData.append("description", cat.description || "");

      const res = await fetch(`${API_BASE}/api/Category/${cat.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        await fetchCategories();
        showToast(`"${cat.name}" marked as ${!cat.isActive ? "active" : "inactive"}`);
      } else {
        showToast(data.message || "Update failed", "error");
      }
    } catch {
      showToast("Network error", "error");
    }
  }

  const filtered = categories.filter((c) => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus =
      filterStatus === "all"
        ? true
        : filterStatus === "active"
        ? c.isActive
        : !c.isActive;
    return matchSearch && matchStatus;
  });

  const allCats = categories.flatMap((c) => [c, ...(c.subCategories || [])]);
  const totalCount = allCats.length;
  const activeCount = allCats.filter((c) => c.isActive).length;
  const inactiveCount = totalCount - activeCount;

  return (
    <div style={styles.page}>
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        button { -webkit-tap-highlight-color: transparent; }
        button:active { opacity: 0.85; }
      `}</style>

      {/* Header */}
      <div style={styles.topbar}>
        <div>
          <h1 style={styles.pageTitle}>Category Management</h1>
          <p style={styles.pageSub}>Manage your product categories</p>
        </div>
        <button
          style={styles.btnPrimary}
          onClick={() => { resetForm(); setActiveTab("add"); }}
        >
          <span style={{ fontSize: 18 }}>＋</span> Add Category
        </button>
      </div>

      {/* Stats */}
      <div style={styles.statsRow}>
        {[
          { label: "Total Categories", value: totalCount, badge: "all time", badgeType: "gray" },
          { label: "Active", value: activeCount, badge: "✓ live on store", badgeType: "green" },
          { label: "Inactive", value: inactiveCount, badge: "hidden", badgeType: "gray" },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statLabel}>{s.label}</div>
            <div style={styles.statValue}>{s.value}</div>
            <span style={s.badgeType === "green" ? styles.badgeGreen : styles.badgeGray}>
              {s.badge}
            </span>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        <button
          style={{ ...styles.tab, ...(activeTab === "view" ? styles.tabActive : {}) }}
          onClick={() => { setActiveTab("view"); fetchCategories(); }}
        >
          ⊞ View Categories
        </button>
        <button
          style={{ ...styles.tab, ...(activeTab === "add" ? styles.tabActive : {}) }}
          onClick={() => { resetForm(); setActiveTab("add"); }}
        >
          ＋ {editId ? "Edit Category" : "Add Category"}
        </button>
      </div>

      {/* View Tab */}
      {activeTab === "view" && (
        <div style={styles.panel}>
          <div style={styles.searchRow}>
            <div style={{ position: "relative", flex: 1, minWidth: 0 }}>
              <span style={styles.searchIcon}>🔍</span>
              <input
                style={styles.searchInput}
                placeholder="Search categories..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              style={styles.filterSelect}
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <button style={styles.btnGhost} onClick={fetchCategories}>
              ↻ Refresh
            </button>
          </div>

          {loading ? (
            <div style={styles.emptyState}>
              <div style={styles.spinner} />
              <p style={{ color: "#888", marginTop: 16 }}>Loading categories...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>📂</div>
              <p style={{ color: "#888" }}>No categories found</p>
              <button
                style={{ ...styles.btnPrimary, marginTop: 16 }}
                onClick={() => { resetForm(); setActiveTab("add"); }}
              >
                Add your first category
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {filtered.map((cat) => (
                <div key={cat.id} style={{ minWidth: 0 }}>
                  <div style={{ marginBottom: cat.subCategories?.length > 0 ? 10 : 0 }}>
                    <CategoryCard
                      cat={cat}
                      isParent={true}
                      styles={styles}
                      onEdit={() => handleEdit(cat)}
                      onDelete={() => handleDelete(cat)}
                      onToggle={() => handleToggleStatus(cat)}
                    />
                  </div>

                  {cat.subCategories?.length > 0 && (
                    <div style={styles.subGrid}>
                      {cat.subCategories.map((sub) => (
                        <CategoryCard
                          key={sub.id}
                          cat={sub}
                          isParent={false}
                          styles={styles}
                          onEdit={() => handleEdit(sub)}
                          onDelete={() => handleDelete(sub)}
                          onToggle={() => handleToggleStatus(sub)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Tab */}
      {activeTab === "add" && (
        <div style={styles.panel}>
          <div style={styles.panelTitle}>
            <span style={{ color: "#1a7a4a", fontSize: 20 }}>📁</span>
            {editId ? "Edit Category" : "New Category"}
          </div>
          <div style={styles.formGrid}>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>
                Category name <span style={{ color: "#e24b4a" }}>*</span>
              </label>
              <input
                style={styles.formInput}
                placeholder="e.g. Fresh Vegetables"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.formLabel}>Status</label>
              <select
                style={styles.formSelect}
                value={form.isActive}
                onChange={(e) => setForm((f) => ({ ...f, isActive: e.target.value }))}
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
              <label style={styles.formLabel}>
                Belongs To{" "}
                <span style={{ color: "#888", fontWeight: 400 }}>
                  (Select parent if this is a sub-category)
                </span>
              </label>
              <select
                style={styles.formSelect}
                value={form.parent_id}
                onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
              >
                <option value="">— Main Category (no parent) —</option>
                {parentCategories.map((p) => (
                  <option
                    key={p.id}
                    value={p.id}
                    disabled={editId && p.id === editId}
                  >
                    {p.name}
                  </option>
                ))}
              </select>
              {form.parent_id && (
                <span style={{ fontSize: 12, color: "#0f6e56", marginTop: 4, wordBreak: "break-word" }}>
                  ✓ Yeh sub-category banega "{parentCategories.find(p => String(p.id) === String(form.parent_id))?.name}" ke andar
                </span>
              )}
            </div>

            <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
              <label style={styles.formLabel}>Description</label>
              <textarea
                style={{ ...styles.formInput, resize: "vertical", minHeight: 80 }}
                placeholder="Brief description of the category..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div style={{ ...styles.formGroup, gridColumn: "1 / -1" }}>
              <label style={styles.formLabel}>
                Thumbnail image {!editId && <span style={{ color: "#e24b4a" }}>*</span>}
              </label>
              <div
                style={styles.uploadZone}
                onClick={() => fileRef.current?.click()}
              >
                {uploadPreview ? (
                  <div style={{ textAlign: "center" }}>
                    <img
                      src={uploadPreview}
                      alt="preview"
                      style={{ height: 80, maxWidth: "100%", borderRadius: 8, objectFit: "cover", marginBottom: 8 }}
                    />
                    <p style={{ fontSize: 13, color: "#0f6e56", fontWeight: 500, wordBreak: "break-all" }}>
                      {uploadedFile ? uploadedFile.name : "Current thumbnail"}
                    </p>
                    <span style={{ fontSize: 12, color: "#888" }}>Tap to replace</span>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 36, marginBottom: 8 }}>☁</div>
                    <p style={{ fontSize: 13, color: "#555" }}>Tap to upload thumbnail</p>
                    <span style={{ fontSize: 12, color: "#999", marginTop: 4, display: "block" }}>
                      PNG, JPG, WEBP up to 5MB
                    </span>
                  </div>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleFileChange}
              />
            </div>
          </div>
          <div style={styles.formActions}>
            <button style={styles.btnGhost} onClick={resetForm}>
              Clear form
            </button>
            <button
              style={{ ...styles.btnPrimary, opacity: submitting ? 0.7 : 1 }}
              onClick={handleSubmit}
              disabled={submitting}
            >
              {submitting ? "Saving..." : editId ? "✓ Update category" : "✓ Save category"}
            </button>
          </div>
        </div>
      )}

      {/* Toast */}
      <div
        style={{
          ...styles.toast,
          ...(toast.type === "error" ? styles.toastError : {}),
          transform: toast.show ? "translateY(0)" : "translateY(80px)",
          opacity: toast.show ? 1 : 0,
        }}
      >
        {toast.type === "error" ? "✗" : "✓"} {toast.msg}
      </div>
    </div>
  );
}

function CategoryCard({ cat, isParent, styles, onEdit, onDelete, onToggle }) {
  return (
    <div style={{
      ...styles.catCard,
      border: isParent ? "1.5px solid #c8e6c9" : "1px solid #eee",
    }}>
      {isParent ? (
        <div style={{
          background: "#e1f5ee", padding: "3px 10px",
          fontSize: 11, fontWeight: 600, color: "#0f6e56", textAlign: "center",
        }}>
          MAIN CATEGORY
        </div>
      ) : (
        <div style={{
          background: "#f0f4ff", padding: "3px 10px",
          fontSize: 11, fontWeight: 600, color: "#3b5bdb", textAlign: "center",
        }}>
          SUB CATEGORY
        </div>
      )}
      <div style={styles.catThumb}>
        {cat.thumbnail ? (
          <img
            src={cat.thumbnail}
            alt={cat.name}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 40 }}>📦</span>
        )}
        <span
          style={{
            ...styles.statusDot,
            background: cat.isActive ? "#1a7a4a" : "#aaa",
          }}
        />
      </div>
      <div style={styles.catBody}>
        <div style={styles.catName}>{cat.name}</div>
        <div style={styles.catDesc}>{cat.description || "No description"}</div>
        <div style={styles.catFooter}>
          <span style={cat.isActive ? styles.badgeGreen : styles.badgeGray}>
            {cat.isActive ? "✓ Active" : "○ Inactive"}
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            <button style={styles.iconBtn} onClick={onToggle} title="Toggle status">
              {cat.isActive ? "⏸" : "▶"}
            </button>
            <button style={styles.iconBtn} onClick={onEdit} title="Edit">
              ✎
            </button>
            <button
              style={{ ...styles.iconBtn, ...styles.iconBtnDanger }}
              onClick={onDelete}
              title="Delete"
            >
              🗑
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function makeStyles(m) {
  const pad = m ? "1rem" : "1.5rem";
  return {
    page: {
      padding: pad,
      maxWidth: 1100,
      margin: "0 auto",
      fontFamily: "system-ui, -apple-system, sans-serif",
      background: "#f5f6fa",
      minHeight: "100vh",
      boxSizing: "border-box",
      width: "100%",
      overflowX: "hidden",
    },
    topbar: {
      display: "flex",
      flexDirection: m ? "column" : "row",
      alignItems: m ? "stretch" : "center",
      justifyContent: "space-between",
      gap: m ? 12 : 0,
      marginBottom: m ? "1rem" : "1.5rem",
    },
    pageTitle: { fontSize: m ? 19 : 22, fontWeight: 600, color: "#1a1a1a", margin: 0 },
    pageSub: { fontSize: 13, color: "#888", marginTop: 2 },
    btnPrimary: {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 6,
      background: "#1a7a4a",
      color: "#fff",
      border: "none",
      padding: m ? "12px 20px" : "10px 20px",
      minHeight: m ? 44 : "auto",
      borderRadius: 8,
      fontSize: 14,
      fontWeight: 500,
      cursor: "pointer",
      fontFamily: "inherit",
      width: m ? "100%" : "auto",
    },
    btnGhost: {
      padding: m ? "11px 16px" : "9px 16px",
      minHeight: m ? 44 : "auto",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: 14,
      cursor: "pointer",
      background: "#fff",
      color: "#555",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
    },
    statsRow: {
      display: "grid",
      gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
      gap: m ? 8 : 12,
      marginBottom: m ? "1rem" : "1.5rem",
    },
    statCard: {
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 12,
      padding: m ? "0.75rem" : "1rem 1.25rem",
      minWidth: 0,
    },
    statLabel: { fontSize: m ? 11 : 13, color: "#888", marginBottom: 6 },
    statValue: { fontSize: m ? 22 : 28, fontWeight: 600, color: "#1a1a1a" },
    badgeGreen: {
      display: "inline-block",
      fontSize: m ? 10 : 11,
      padding: "3px 10px",
      borderRadius: 20,
      background: "#e1f5ee",
      color: "#0f6e56",
      fontWeight: 500,
      marginTop: 4,
      whiteSpace: "nowrap",
    },
    badgeGray: {
      display: "inline-block",
      fontSize: m ? 10 : 11,
      padding: "3px 10px",
      borderRadius: 20,
      background: "#f0f0f0",
      color: "#666",
      fontWeight: 500,
      marginTop: 4,
      whiteSpace: "nowrap",
    },
    tabs: {
      display: "flex",
      gap: 0,
      marginBottom: m ? "1rem" : "1.5rem",
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 10,
      padding: 4,
      width: m ? "100%" : "fit-content",
      boxSizing: "border-box",
    },
    tab: {
      flex: m ? 1 : "0 0 auto",
      padding: m ? "10px 8px" : "8px 22px",
      borderRadius: 7,
      fontSize: m ? 13 : 14,
      fontWeight: 500,
      cursor: "pointer",
      border: "none",
      background: "transparent",
      color: "#888",
      fontFamily: "inherit",
      whiteSpace: "nowrap",
    },
    tabActive: { background: "#1a7a4a", color: "#fff" },
    panel: {
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 14,
      padding: m ? "1rem" : "1.5rem",
      minWidth: 0,
      boxSizing: "border-box",
    },
    panelTitle: {
      fontSize: 16,
      fontWeight: 600,
      color: "#1a1a1a",
      marginBottom: "1.25rem",
      display: "flex",
      alignItems: "center",
      gap: 8,
    },
    searchRow: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      gap: 10,
      marginBottom: "1.25rem",
    },
    searchIcon: {
      position: "absolute",
      left: 11,
      top: "50%",
      transform: "translateY(-50%)",
      fontSize: 14,
      color: "#aaa",
      pointerEvents: "none",
    },
    searchInput: {
      width: "100%",
      boxSizing: "border-box",
      padding: "9px 12px 9px 36px",
      minHeight: m ? 44 : "auto",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: m ? 16 : 14,
      outline: "none",
      fontFamily: "inherit",
    },
    filterSelect: {
      padding: "9px 12px",
      minHeight: m ? 44 : "auto",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: m ? 16 : 14,
      background: "#fff",
      cursor: "pointer",
      fontFamily: "inherit",
      minWidth: m ? 0 : 130,
      flex: m ? "1 1 45%" : "0 0 auto",
    },
    subGrid: {
      marginLeft: m ? 10 : 32,
      paddingLeft: m ? 10 : 16,
      borderLeft: "2px solid #e1f5ee",
      display: "grid",
      gridTemplateColumns: m ? "repeat(2, minmax(0, 1fr))" : "repeat(auto-fill, minmax(200px, 1fr))",
      gap: m ? 8 : 10,
      minWidth: 0,
    },
    catCard: {
      background: "#fff",
      border: "1px solid #eee",
      borderRadius: 12,
      overflow: "hidden",
      minWidth: 0,
      transition: "border-color 0.15s, transform 0.15s",
    },
    catThumb: {
      height: m ? 90 : 110,
      background: "#f5f6fa",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
    },
    statusDot: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 9,
      height: 9,
      borderRadius: "50%",
    },
    catBody: { padding: m ? 10 : 12, minWidth: 0 },
    catName: {
      fontSize: m ? 14 : 15,
      fontWeight: 600,
      color: "#1a1a1a",
      marginBottom: 4,
      wordBreak: "break-word",
    },
    catDesc: {
      fontSize: 12,
      color: "#888",
      lineHeight: 1.5,
      marginBottom: 10,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
    },
    catFooter: {
      display: "flex",
      flexWrap: "wrap",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 6,
      borderTop: "1px solid #eee",
      paddingTop: 10,
    },
    iconBtn: {
      width: m ? 36 : 30,
      height: m ? 36 : 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      border: "1px solid #eee",
      borderRadius: 7,
      cursor: "pointer",
      background: "#fff",
      fontSize: 14,
      padding: 0,
    },
    iconBtnDanger: { color: "#a32d2d" },
    emptyState: {
      textAlign: "center",
      padding: "3rem 1rem",
      color: "#888",
    },
    spinner: {
      width: 36,
      height: 36,
      border: "3px solid #eee",
      borderTop: "3px solid #1a7a4a",
      borderRadius: "50%",
      animation: "spin 0.8s linear infinite",
      margin: "0 auto",
    },
    formGrid: {
      display: "grid",
      gridTemplateColumns: m ? "1fr" : "1fr 1fr",
      gap: "1rem",
    },
    formGroup: { display: "flex", flexDirection: "column", gap: 6, minWidth: 0 },
    formLabel: { fontSize: 13, fontWeight: 500, color: "#555" },
    formInput: {
      padding: m ? "11px 12px" : "9px 12px",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: m ? 16 : 14,
      background: "#fff",
      color: "#1a1a1a",
      outline: "none",
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box",
      minWidth: 0,
    },
    formSelect: {
      padding: m ? "11px 12px" : "9px 12px",
      border: "1px solid #ddd",
      borderRadius: 8,
      fontSize: m ? 16 : 14,
      background: "#fff",
      color: "#1a1a1a",
      outline: "none",
      cursor: "pointer",
      fontFamily: "inherit",
      width: "100%",
      boxSizing: "border-box",
      minWidth: 0,
    },
    uploadZone: {
      border: "2px dashed #ddd",
      borderRadius: 8,
      padding: m ? "1.25rem 1rem" : "2rem",
      textAlign: "center",
      cursor: "pointer",
      background: "#fafafa",
      transition: "border-color 0.15s",
    },
    formActions: {
      display: "flex",
      flexDirection: m ? "column-reverse" : "row",
      gap: 10,
      justifyContent: "flex-end",
      marginTop: "1.5rem",
      paddingTop: "1.25rem",
      borderTop: "1px solid #eee",
    },
    toast: {
      position: "fixed",
      bottom: m ? 16 : 24,
      left: m ? 16 : "auto",
      right: m ? 16 : 24,
      background: "#1a7a4a",
      color: "#fff",
      padding: "12px 20px",
      borderRadius: 10,
      fontSize: 14,
      fontWeight: 500,
      transition: "all 0.3s",
      zIndex: 9999,
      pointerEvents: "none",
      boxShadow: "0 4px 16px rgba(0,0,0,0.15)",
      textAlign: m ? "center" : "left",
      wordBreak: "break-word",
    },
    toastError: { background: "#a32d2d" },
  };
}