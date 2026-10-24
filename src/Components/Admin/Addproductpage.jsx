import { useState, useEffect, useRef } from "react";
const API_BASEA = import.meta.env.VITE_API_URL;

const API_BASE = `${API_BASEA}/api/products`;
const getToken = () => localStorage.getItem("adminToken") || "";

async function apiFetch(path, options = {}) {
    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        headers: { Authorization: `Bearer ${getToken()}`, ...(options.headers || {}) },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Request failed");
    return data;
}

// ─── Tiny helpers ──────────────────────────────────────────────
function Label({ children, required }) {
    return (
        <label className="block text-xs font-semibold text-gray-600 mb-1.5">
            {children} {required && <span className="text-red-500">*</span>}
        </label>
    );
}

// text-base on mobile prevents iOS zoom-on-focus; sm: returns to normal size
function Input({ className = "", ...props }) {
    return (
        <input
            className={`w-full min-w-0 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400 transition ${className}`}
            {...props}
        />
    );
}

function Textarea({ className = "", ...props }) {
    return (
        <textarea
            className={`w-full min-w-0 px-3 py-2 text-base sm:text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400 transition resize-y ${className}`}
            {...props}
        />
    );
}

function Select({ className = "", children, ...props }) {
    return (
        <select
            className={`w-full min-w-0 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent text-gray-700 transition ${className}`}
            {...props}
        >
            {children}
        </select>
    );
}

function SectionCard({ title, children, icon }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-w-0">
            <div className="flex items-center gap-2.5 px-4 sm:px-6 py-3.5 sm:py-4 border-b border-gray-50 bg-gray-50/50">
                {icon && <span className="text-emerald-500">{icon}</span>}
                <h2 className="text-sm font-bold text-gray-800 tracking-tight">{title}</h2>
            </div>
            <div className="p-4 sm:p-6">{children}</div>
        </div>
    );
}

function Spinner() {
    return (
        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
        </svg>
    );
}

function Toast({ toast }) {
    if (!toast) return null;
    return (
        <div
            style={{ animation: "toastIn 0.2s ease-out", maxWidth: "calc(100vw - 32px)" }}
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-semibold text-white ${toast.type === "error" ? "bg-red-500" : "bg-emerald-500"}`}
        >
            {toast.type === "error" ? (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            ) : (
                <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
            )}
            <span>{toast.msg}</span>
        </div>
    );
}

// ─── Rich Text Toolbar ─────────────────────────────────────────
const TOOLBAR_BUTTONS = [
    { label: "B", title: "Bold", cmd: "bold" },
    { label: "I", title: "Italic", cmd: "italic" },
    { label: "U", title: "Underline", cmd: "underline" },
    { label: "S", title: "Strikethrough", cmd: "strikeThrough" },
];

const LIST_BUTTONS = [
    { title: "Bullet list", icon: "≡", cmd: "insertUnorderedList" },
    { title: "Numbered list", icon: "1≡", cmd: "insertOrderedList" },
];

function RichEditor({ value, onChange }) {
    const editorRef = useRef(null);

    // Sirf mount par initial HTML daalo (edit mode me parent key badal kar remount karta hai)
    useEffect(() => {
        if (editorRef.current) editorRef.current.innerHTML = value || "";
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function execCmd(cmd, val = null) {
        editorRef.current?.focus();
        document.execCommand(cmd, false, val);
        onChange(editorRef.current?.innerHTML || "");
    }

    return (
        <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-transparent transition">
            <div className="flex items-center gap-1 px-2 sm:px-3 py-2 bg-gray-50 border-b border-gray-100 flex-wrap">
                <select
                    onChange={(e) => {
                        const map = { Normal: "P", H1: "H1", H2: "H2", H3: "H3" };
                        execCmd("formatBlock", map[e.target.value]);
                    }}
                    className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white mr-1 focus:outline-none"
                >
                    <option>Normal</option><option>H1</option><option>H2</option><option>H3</option>
                </select>
                <select className="text-xs border border-gray-200 rounded px-1.5 py-1 bg-white mr-2 focus:outline-none">
                    <option>Sans Serif</option><option>Serif</option><option>Monospace</option>
                </select>
                {TOOLBAR_BUTTONS.map((btn) => (
                    <button
                        key={btn.cmd}
                        type="button"
                        title={btn.title}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd(btn.cmd)}
                        className={`h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center rounded text-sm font-bold text-gray-600 hover:bg-gray-200 transition-colors ${btn.label === "B" ? "font-black" : btn.label === "I" ? "italic" : btn.label === "U" ? "underline" : "line-through"}`}
                    >
                        {btn.label}
                    </button>
                ))}
                <div className="w-px h-5 bg-gray-200 mx-1" />
                {LIST_BUTTONS.map((b) => (
                    <button
                        key={b.cmd}
                        type="button"
                        title={b.title}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCmd(b.cmd)}
                        className="h-8 w-8 sm:h-7 sm:w-7 flex items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                    >
                        {b.icon}
                    </button>
                ))}
                <div className="w-px h-5 bg-gray-200 mx-1" />
                {["🔗", "🖼", "📋", "f(x)"].map((ic) => (
                    <button key={ic} type="button" className="h-8 sm:h-7 px-2 sm:px-1.5 flex items-center justify-center rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors">{ic}</button>
                ))}
            </div>
            <div
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
                className="pd-description min-h-[100px] px-4 py-3 text-base sm:text-sm text-gray-700 focus:outline-none"
                data-placeholder="Enter product description…"
                style={{ lineHeight: "1.6" }}
            />
        </div>
    );
}

// ─── Image Drop Zone ──────────────────────────────────────────
function ImageDropzone({ label, hint, multiple = false, onChange, maxFiles = 1, existingUrls = [] }) {
    const [previews, setPreviews] = useState([]);
    const filesRef = useRef([]);
    const inputRef = useRef();
    const [existingPreviewUrls, setExistingPreviewUrls] = useState(existingUrls);

    useEffect(() => {
        setExistingPreviewUrls(existingUrls);
    }, [existingUrls.join(',')]);

    function handleFiles(newFiles) {
        const incoming = Array.from(newFiles);
        const slotsLeft = maxFiles - existingPreviewUrls.length - filesRef.current.length;
        if (slotsLeft <= 0) return;

        const toAdd = incoming.slice(0, slotsLeft);
        const newUrls = toAdd.map(f => URL.createObjectURL(f));

        filesRef.current = [...filesRef.current, ...toAdd];
        const nextPreviews = [...previews, ...newUrls];
        setPreviews(nextPreviews);

        onChange(multiple ? filesRef.current : filesRef.current[0]);
    }

    function removeExisting(i) {
        setExistingPreviewUrls(prev => prev.filter((_, j) => j !== i));
        if (!multiple) onChange(null);
    }

    function removeBlob(i) {
        URL.revokeObjectURL(previews[i]);
        const nextPreviews = previews.filter((_, j) => j !== i);
        filesRef.current = filesRef.current.filter((_, j) => j !== i);
        setPreviews(nextPreviews);
        onChange(multiple ? filesRef.current : filesRef.current[0] || null);
    }

    function handleDrop(e) {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    }

    const allPreviews = [
        ...existingPreviewUrls.map(url => ({ url, type: 'existing' })),
        ...previews.map(url => ({ url, type: 'blob' })),
    ];
    const canAddMore = allPreviews.length < maxFiles;

    return (
        <div>
            <Label>
                {label}{' '}
                {hint && <span className="text-blue-500 font-normal ml-1">({hint})</span>}{' '}
                <span className="text-red-500">*</span>
            </Label>
            <div className="flex flex-wrap gap-3">
                {allPreviews.map((item, i) => (
                    <div key={i} className="relative h-24 w-24 rounded-xl overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                        <img src={item.url} alt="" className="h-full w-full object-cover" />
                        <button
                            type="button"
                            onClick={() =>
                                item.type === 'existing'
                                    ? removeExisting(i)
                                    : removeBlob(i - existingPreviewUrls.length)
                            }
                            className="absolute top-1 right-1 h-7 w-7 sm:h-5 sm:w-5 rounded-full bg-red-500 text-white flex items-center justify-center text-sm sm:text-xs shadow"
                        >×</button>
                    </div>
                ))}

                {canAddMore && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={e => e.preventDefault()}
                        onClick={() => inputRef.current.click()}
                        className="h-24 w-24 flex-shrink-0 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center text-gray-300 hover:border-emerald-400 hover:text-emerald-400 active:bg-emerald-50 transition-colors bg-gray-50 cursor-pointer"
                    >
                        {allPreviews.length === 0 ? (
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01" />
                            </svg>
                        ) : (
                            <span className="text-2xl font-light">+</span>
                        )}
                    </div>
                )}

                <input
                    ref={inputRef}
                    type="file"
                    accept="image/*"
                    multiple={multiple}
                    className="hidden"
                    onChange={e => handleFiles(e.target.files)}
                />
            </div>
            {multiple && (
                <p className="text-xs text-gray-400 mt-1.5">
                    {allPreviews.length}/{maxFiles} images added
                </p>
            )}
        </div>
    );
}

// ─── Meta Keywords tag input ──────────────────────────────────
function TagInput({ tags, onChange }) {
    const [input, setInput] = useState("");

    function addTag(e) {
        if ((e.key === "Enter" || e.key === ",") && input.trim()) {
            e.preventDefault();
            if (!tags.includes(input.trim())) onChange([...tags, input.trim()]);
            setInput("");
        }
    }

    function removeTag(t) { onChange(tags.filter((x) => x !== t)); }

    return (
        <div className="min-h-[40px] flex flex-wrap gap-1.5 items-center px-3 py-2 border border-gray-200 rounded-lg bg-white focus-within:ring-2 focus-within:ring-emerald-400 focus-within:border-transparent transition">
            {tags.map((t) => (
                <span key={t} className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ring-emerald-200">
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="text-emerald-400 hover:text-emerald-600 text-sm leading-none px-0.5">×</button>
                </span>
            ))}
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={addTag}
                placeholder={tags.length === 0 ? "Write keywords and Press enter to add new one" : ""}
                className="flex-1 min-w-[140px] text-base sm:text-sm focus:outline-none placeholder-gray-400 bg-transparent"
            />
        </div>
    );
}

// ─── Product Variants Section ─────────────────────────────────
const EMPTY_VARIANT = () => ({
    _id: Math.random().toString(36).slice(2),
    label: "",
    sku: String(Math.floor(100000 + Math.random() * 900000)),
    buyingPrice: "",
    sellingPrice: "",
    discountPrice: "",
    stockQuantity: "",
    minOrderQuantity: "1",
    isDefault: false,
});

function VariantsSection({ variants, onChange }) {

    function addVariant() {
        const next = [...variants, EMPTY_VARIANT()];
        if (next.length === 1) next[0].isDefault = true;
        onChange(next);
    }

    function removeVariant(idx) {
        const next = variants.filter((_, i) => i !== idx);
        const hasDefault = next.some(v => v.isDefault);
        if (!hasDefault && next.length > 0) next[0].isDefault = true;
        onChange(next);
    }

    function updateVariant(idx, field, value) {
        const next = variants.map((v, i) => i === idx ? { ...v, [field]: value } : v);
        onChange(next);
    }

    function setDefault(idx) {
        onChange(variants.map((v, i) => ({ ...v, isDefault: i === idx })));
    }

    function generateSku(idx) {
        updateVariant(idx, "sku", String(Math.floor(100000 + Math.random() * 900000)));
    }

    function handlePriceChange(idx, field, value) {
        const next = variants.map((v, i) => {
            if (i !== idx) return v;
            const updated = { ...v, [field]: value };
            const buying = parseFloat(field === "buyingPrice" ? value : v.buyingPrice);
            const selling = parseFloat(field === "sellingPrice" ? value : v.sellingPrice);
            if (!isNaN(buying) && !isNaN(selling) && buying > selling) {
                updated.discountPrice = (buying - selling).toFixed(2);
            } else {
                updated.discountPrice = "";
            }
            return updated;
        });
        onChange(next);
    }

    return (
        <SectionCard
            title="Product Variants"
            icon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                </svg>
            }
        >
            <div className="space-y-4">
                <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100 text-xs text-blue-700">
                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>
                        Variants allow customers to choose size, weight, or pack — e.g. <strong>500ml</strong>, <strong>1kg</strong>, <strong>2kg</strong>.
                        If no variants are added, the base product price &amp; stock is used.
                    </span>
                </div>

                {variants.length === 0 ? (
                    <div className="text-center py-8 px-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 text-sm">
                        No variants added yet. Click <strong className="text-emerald-600">+ Add Variant</strong> to start.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {variants.map((v, idx) => (
                            <div
                                key={v._id}
                                className={`relative rounded-xl border ${v.isDefault ? "border-emerald-300 bg-emerald-50/30" : "border-gray-200 bg-white"} p-3 sm:p-4`}
                            >
                                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${v.isDefault ? "bg-emerald-500 text-white" : "bg-gray-100 text-gray-500"}`}>
                                            {v.isDefault ? "★ Default" : `Variant ${idx + 1}`}
                                        </span>
                                        {v.label && (
                                            <span className="text-xs font-semibold text-gray-700 bg-gray-100 px-2 py-0.5 rounded-full">
                                                {v.label}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {!v.isDefault && (
                                            <button
                                                type="button"
                                                onClick={() => setDefault(idx)}
                                                className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline py-1"
                                            >
                                                Set Default
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(idx)}
                                            className="h-8 w-8 sm:h-6 sm:w-6 flex items-center justify-center rounded-full bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-600 transition-colors text-base font-bold"
                                            title="Remove variant"
                                        >
                                            ×
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    <div className="col-span-2 sm:col-span-1">
                                        <Label required>Variant Label</Label>
                                        <Input
                                            value={v.label}
                                            onChange={(e) => updateVariant(idx, "label", e.target.value)}
                                            placeholder="e.g. 500ml, 1kg, Large"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <Label required>SKU</Label>
                                            <button
                                                type="button"
                                                onClick={() => generateSku(idx)}
                                                className="text-xs font-semibold text-emerald-600 hover:underline"
                                            >
                                                Generate
                                            </button>
                                        </div>
                                        <Input
                                            value={v.sku}
                                            onChange={(e) => updateVariant(idx, "sku", e.target.value)}
                                            placeholder="SKU"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label required>Old Price (MRP)</Label>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            value={v.buyingPrice}
                                            onChange={(e) => handlePriceChange(idx, "buyingPrice", e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label required>New Price</Label>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            value={v.sellingPrice}
                                            onChange={(e) => handlePriceChange(idx, "sellingPrice", e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Discount</Label>
                                        <Input
                                            type="number"
                                            inputMode="decimal"
                                            value={v.discountPrice}
                                            onChange={(e) => updateVariant(idx, "discountPrice", e.target.value)}
                                            placeholder="0.00"
                                            min="0"
                                            step="0.01"
                                        />
                                    </div>

                                    <div>
                                        <Label required>Stock Qty</Label>
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            value={v.stockQuantity}
                                            onChange={(e) => updateVariant(idx, "stockQuantity", e.target.value)}
                                            placeholder="0"
                                            min="0"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <Label>Min Order Qty</Label>
                                        <Input
                                            type="number"
                                            inputMode="numeric"
                                            value={v.minOrderQuantity}
                                            onChange={(e) => updateVariant(idx, "minOrderQuantity", e.target.value)}
                                            placeholder="1"
                                            min="1"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <button
                    type="button"
                    onClick={addVariant}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 sm:py-2.5 border-2 border-dashed border-emerald-300 rounded-xl text-sm font-semibold text-emerald-600 hover:border-emerald-400 hover:bg-emerald-50 active:bg-emerald-50 transition-colors"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Variant
                </button>
            </div>
        </SectionCard>
    );
}

// ─── Helper ───────────────────────────────────────────────────
function resolveId(field) {
    if (!field) return "";
    if (typeof field === "object" && field.id) return field.id;
    return field;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────
export default function AddProductPage({ existingProduct = null, onSaved, onCancel }) {
    const isEditMode = Boolean(existingProduct);

    const [name, setName] = useState("");
    const [slug, setSlug] = useState("");
    const [shortDesc, setShortDesc] = useState("");
    const [description, setDescription] = useState("");
    const [descKey, setDescKey] = useState(0);

    const [brand, setBrand] = useState("");
    const [unit, setUnit] = useState("");
    const [sku, setSku] = useState(String(Math.floor(100000 + Math.random() * 900000)));
    const [selectedCategories, setSelectedCategories] = useState([]);

    const [buyingPrice, setBuyingPrice] = useState("");
    const [sellingPrice, setSellingPrice] = useState("");
    const [discountPrice, setDiscountPrice] = useState("0");
    const [stockQty, setStockQty] = useState("");
    const [minOrderQty, setMinOrderQty] = useState("1");

    const [thumbnail, setThumbnail] = useState(null);
    const [existingThumbnail, setExistingThumbnail] = useState("");
    const [additionalImages, setAdditionalImages] = useState([]);
    const [existingAdditional, setExistingAdditional] = useState([]);
    const [videoType, setVideoType] = useState("Upload Video File");
    const [videoFile, setVideoFile] = useState(null);

    const [metaTitle, setMetaTitle] = useState("");
    const [metaDesc, setMetaDesc] = useState("");
    const [metaKeywords, setMetaKeywords] = useState([]);

    const [variants, setVariants] = useState([]);

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [categoriesLoading, setCategoriesLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [toast, setToast] = useState(null);
    const [attributes, setAttributes] = useState([]);

    function showToast(msg, type = "success") {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3500);
    }

    // ── Pre-fill in edit mode ─────────────────────────────────
    useEffect(() => {
        if (!existingProduct) return;
        const p = existingProduct;
        setName(p.name || "");
        setSlug(p.slug || "");
        setShortDesc(p.shortDescription || "");
        setDescription(p.description || "");
        setDescKey(k => k + 1);
        setBrand(resolveId(p.brand));
        setUnit(p.unit || "");
        setSku(p.sku || "");
        const catId = resolveId(p.category);
        setSelectedCategories(catId ? [catId] : []);
        setBuyingPrice(p.buyingPrice ?? "");
        setSellingPrice(p.sellingPrice ?? p.price ?? "");
        setDiscountPrice(p.discountPrice ?? "0");
        setStockQty(p.stockQuantity ?? "");
        setMinOrderQty(p.minOrderQuantity ?? "1");
        setExistingThumbnail(p.thumbnail || "");
        setExistingAdditional(p.additionalImages || []);
        setMetaTitle(p.metaTitle || "");
        setMetaDesc(p.metaDescription || "");
        setMetaKeywords(
            Array.isArray(p.metaKeywords)
                ? p.metaKeywords
                : typeof p.metaKeywords === "string"
                    ? JSON.parse(p.metaKeywords || "[]")
                    : []
        );
        setAttributes(Array.isArray(p.attributes) ? p.attributes : []);

        if (Array.isArray(p.variants) && p.variants.length > 0) {
            setVariants(
                p.variants.map(v => ({
                    ...v,
                    _id: v.id || Math.random().toString(36).slice(2),
                }))
            );
        }
    }, [existingProduct]);

    // Edit mode: poora product server se laakar description bharo
    useEffect(() => {
        if (!existingProduct?.id) return;
        apiFetch(`/${existingProduct.id}`)
            .then((d) => {
                const desc = d.product?.description;
                if (desc) {
                    const isHtml = /<\/?[a-z][\s\S]*>/i.test(desc);
                    setDescription(isHtml ? desc : desc.replace(/\n/g, "<br>"));
                    setDescKey(k => k + 1);
                }
            })
            .catch(() => {});
    }, [existingProduct?.id]);

    // Auto-slug
    useEffect(() => {
        if (!isEditMode) {
            setSlug(name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
        }
    }, [name, isEditMode]);

    // Auto-discount on base prices
    useEffect(() => {
        const buying = parseFloat(buyingPrice);
        const selling = parseFloat(sellingPrice);
        if (!isNaN(buying) && !isNaN(selling) && buying > selling) {
            setDiscountPrice((buying - selling).toFixed(2));
        } else {
            setDiscountPrice("");
        }
    }, [buyingPrice, sellingPrice]);

    useEffect(() => {
        apiFetch("/brand/all").then((d) => setBrands(d.brands || [])).catch(() => { });
    }, []);

    useEffect(() => {
        fetch(`${API_BASEA}/api/Category/flat`, {
            headers: { Authorization: `Bearer ${getToken()}` },
        })
            .then((r) => r.json())
            .then((d) => setCategories(d.categories || d.data || d || []))
            .catch(() => { })
            .finally(() => setCategoriesLoading(false));
    }, []);

    function generateSku() { setSku(String(Math.floor(100000 + Math.random() * 900000))); }

    function handleAttributeChange(key, value) {
        setAttributes(prev => {
            const existing = prev.find(a => a.key === key);
            if (existing) return prev.map(a => a.key === key ? { key, value } : a);
            return [...prev, { key, value }];
        });
    }

    function toggleCategory(id) {
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );
    }

    function validateVariants() {
        for (let i = 0; i < variants.length; i++) {
            const v = variants[i];
            if (!v.label.trim()) return `Variant ${i + 1}: Label is required`;
            if (!v.sku.trim()) return `Variant ${i + 1}: SKU is required`;
            if (!v.buyingPrice) return `Variant ${i + 1}: Old Price is required`;
            if (!v.sellingPrice) return `Variant ${i + 1}: New Price is required`;
            if (!v.stockQuantity && v.stockQuantity !== 0)
                return `Variant ${i + 1}: Stock Qty is required`;
        }
        const skus = variants.map(v => v.sku.trim());
        if (new Set(skus).size !== skus.length) return "Variants have duplicate SKUs";
        return null;
    }

    // ── Submit ────────────────────────────────────────────────
    async function handleSubmit(e) {
        e.preventDefault();
        if (!isEditMode && !thumbnail) return showToast("Thumbnail image is required", "error");
        if (selectedCategories.length === 0) return showToast("Please select at least one category", "error");

        const variantError = validateVariants();
        if (variantError) return showToast(variantError, "error");

        setSubmitting(true);
        try {
            const fd = new FormData();
            fd.append("name", name);
            fd.append("slug", slug);
            fd.append("shortDescription", shortDesc);
            fd.append("description", description);
            fd.append("brand", brand);
            fd.append("unit", unit);
            fd.append("sku", sku);
            fd.append("category", selectedCategories[0]);
            fd.append("buyingPrice", buyingPrice);
            fd.append("sellingPrice", sellingPrice);
            fd.append("discountPrice", discountPrice || 0);
            fd.append("stockQuantity", stockQty);
            fd.append("minOrderQuantity", minOrderQty);
            fd.append("metaTitle", metaTitle);
            fd.append("metaDescription", metaDesc);
            fd.append("metaKeywords", JSON.stringify(metaKeywords));
            fd.append("attributes", JSON.stringify(attributes));

            const cleanVariants = variants.map(({ _id, ...v }) => v);
            fd.append("variants", JSON.stringify(cleanVariants));

            if (thumbnail) fd.append("thumbnail", thumbnail);
            additionalImages.forEach((img) => fd.append("additionalImages", img));
            if (videoFile) { fd.append("videoType", "Upload"); fd.append("video", videoFile); }

            if (isEditMode) {
                await apiFetch(`/update/${existingProduct.id}`, { method: "PUT", body: fd });
            } else {
                await apiFetch("/add", { method: "POST", body: fd });
            }

            if (onSaved) onSaved();
            else showToast(isEditMode ? "Product updated successfully!" : "Product added successfully!");

            if (!isEditMode) handleReset();
        } catch (err) {
            showToast(err.message, "error");
        } finally {
            setSubmitting(false);
        }
    }

    function handleReset() {
        if (isEditMode && existingProduct) {
            const p = existingProduct;
            setName(p.name || ""); setSlug(p.slug || ""); setShortDesc(p.shortDescription || "");
            setDescription(p.description || ""); setDescKey(k => k + 1); setBrand(resolveId(p.brand)); setUnit(p.unit || "");
            setSku(p.sku || ""); setBuyingPrice(p.buyingPrice ?? ""); setSellingPrice(p.sellingPrice ?? "");
            setDiscountPrice(p.discountPrice ?? "0"); setStockQty(p.stockQuantity ?? "");
            setMinOrderQty(p.minOrderQuantity ?? "1"); setMetaTitle(p.metaTitle || "");
            setMetaDesc(p.metaDescription || ""); setThumbnail(null); setAdditionalImages([]);
            setVariants(Array.isArray(p.variants) ? p.variants.map(v => ({ ...v, _id: v.id || Math.random().toString(36).slice(2) })) : []);
            return;
        }
        setName(""); setSlug(""); setShortDesc(""); setDescription(""); setDescKey(k => k + 1);
        setBrand(""); setUnit(""); setSku(String(Math.floor(100000 + Math.random() * 900000)));
        setSelectedCategories([]); setBuyingPrice(""); setSellingPrice(""); setDiscountPrice("0");
        setStockQty(""); setMinOrderQty("1"); setThumbnail(null); setAdditionalImages([]);
        setVideoFile(null); setMetaTitle(""); setMetaDesc(""); setMetaKeywords([]);
        setAttributes([]); setVariants([]);
    }

    // ── Render ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-gray-50 font-[Outfit,sans-serif] overflow-x-hidden">
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');
        @keyframes toastIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        [contenteditable]:empty:before { content: attr(data-placeholder); color: #9ca3af; }

        .pd-description { word-break: break-word; }
        .pd-description p { margin: 0 0 10px; }
        .pd-description b, .pd-description strong { font-weight: 800; }
        .pd-description i, .pd-description em { font-style: italic; }
        .pd-description u { text-decoration: underline; }
        .pd-description s, .pd-description strike { text-decoration: line-through; }
        .pd-description ul { list-style: disc; padding-left: 22px; margin: 0 0 10px; }
        .pd-description ol { list-style: decimal; padding-left: 22px; margin: 0 0 10px; }
        .pd-description li { margin: 0 0 4px; }
        .pd-description h1 { font-size: 20px; font-weight: 800; margin: 12px 0 8px; }
        .pd-description h2 { font-size: 17px; font-weight: 800; margin: 12px 0 8px; }
        .pd-description h3 { font-size: 15px; font-weight: 700; margin: 10px 0 6px; }
        .pd-description a { color: #16a34a; text-decoration: underline; }
        .pd-description img { max-width: 100%; height: auto; border-radius: 8px; }
        button { -webkit-tap-highlight-color: transparent; }
      `}</style>

            {/* Header */}
            <header className="bg-white border-b border-gray-100 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-0 sm:h-14 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-500 min-w-0 flex-1">
                        {isEditMode && onCancel && (
                            <button
                                type="button"
                                onClick={onCancel}
                                className="flex items-center gap-1 mr-1 text-gray-500 hover:text-gray-800 transition-colors py-1 flex-shrink-0"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                </svg>
                                Back
                            </button>
                        )}
                        <span className="font-semibold text-gray-800 flex-shrink-0">Products</span>
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        <span className="truncate">{isEditMode ? "Edit Product" : "Add New Product"}</span>
                    </div>

                    {isEditMode && (
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-lg border border-blue-100 min-w-0">
                            <svg className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            <span className="text-xs font-semibold text-blue-600 truncate max-w-[200px]">Editing: {existingProduct?.name}</span>
                        </div>
                    )}

                    <div className="flex gap-2 ml-auto">
                        <button type="button" onClick={isEditMode && onCancel ? onCancel : handleReset}
                            className="px-3 sm:px-4 py-2 min-h-[36px] text-xs font-semibold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 active:bg-gray-100 transition-colors">
                            {isEditMode ? "Cancel" : "Reset"}
                        </button>
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 min-h-[36px] text-xs font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-lg transition-colors shadow-sm shadow-emerald-200"
                        >
                            {submitting && <Spinner />}
                            {submitting ? "Saving…" : isEditMode ? "Update Product" : "Submit"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                <div className="mb-4 sm:mb-5 flex items-center gap-3 flex-wrap">
                    <h1 className="text-lg sm:text-xl font-bold text-gray-900">
                        {isEditMode ? "Edit Product" : "Add New Product"}
                    </h1>
                    {isEditMode && (
                        <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">EDIT MODE</span>
                    )}
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5 items-start">

                    {/* ── LEFT COLUMN ── */}
                    <div className="space-y-5 min-w-0">

                        {/* Product Info */}
                        <SectionCard title="Product Info" icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        }>
                            <div className="space-y-4">
                                <div>
                                    <Label required>Product Name</Label>
                                    <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Enter Product Name" required />
                                </div>
                                <div>
                                    <Label>Product Permalink/Slug</Label>
                                    <div className="flex flex-col sm:flex-row">
                                        <span className="flex items-center px-3 py-2 text-[11px] sm:text-xs text-gray-500 bg-gray-50 border border-gray-200 rounded-t-lg sm:rounded-t-none sm:rounded-l-lg sm:border-r-0 break-all">
                                            https://anikakisan.com/products/
                                        </span>
                                        <input
                                            value={slug}
                                            onChange={(e) => setSlug(e.target.value)}
                                            placeholder="your-product-permalink"
                                            className="flex-1 min-w-0 px-3 py-2.5 sm:py-2 text-base sm:text-sm border border-gray-200 border-t-0 sm:border-t rounded-b-lg sm:rounded-b-none sm:rounded-r-lg focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent placeholder-gray-400 bg-white transition"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <Label required>Short Description</Label>
                                    <Textarea value={shortDesc} onChange={(e) => setShortDesc(e.target.value)} rows={3} placeholder="Enter short description" required />
                                </div>
                                <div>
                                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                                        <Label required>Description</Label>
                                        <button type="button" className="flex items-center gap-1 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 px-2.5 py-1.5 rounded-lg transition-colors">
                                            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a10 10 0 100 20A10 10 0 0012 2zm0 4a1 1 0 110 2 1 1 0 010-2zm0 4a1 1 0 011 1v4a1 1 0 11-2 0v-4a1 1 0 011-1z" /></svg>
                                            Generate AI
                                        </button>
                                    </div>
                                    <RichEditor key={descKey} value={description} onChange={setDescription} />
                                </div>
                            </div>
                        </SectionCard>

                        {/* General Information */}
                        <SectionCard title="General Information" icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div>
                                    <Label>Select Brand</Label>
                                    <Select value={brand} onChange={(e) => setBrand(e.target.value)}>
                                        <option value="">Select Brand</option>
                                        {brands.map((b) => (
                                            <option key={b.id} value={b.id}>{b.name}</option>
                                        ))}
                                    </Select>
                                </div>
                                <div>
                                    <Label required>Unit</Label>
                                    <Input value={unit} onChange={(e) => setUnit(e.target.value)} placeholder="Unit (e.g. kg, pc, packet)" required />
                                </div>
                                <div className="sm:col-span-2">
                                    <div className="flex items-center justify-between mb-1.5">
                                        <Label required>Product SKU</Label>
                                        <button type="button" onClick={generateSku} className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 hover:underline py-1">
                                            Generate Code
                                        </button>
                                    </div>
                                    <Input value={sku} onChange={(e) => setSku(e.target.value)} placeholder="SKU" required className="sm:max-w-xs" />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Base Price Information */}
                        <SectionCard title="Base Price Information" icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        }>
                            {variants.length > 0 && (
                                <div className="mb-4 flex items-start gap-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                                    <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Variants added — base price is used as fallback if a variant is not selected.</span>
                                </div>
                            )}
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label required>Old Price</Label>
                                    <Input type="number" inputMode="decimal" value={buyingPrice} onChange={(e) => setBuyingPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
                                </div>
                                <div>
                                    <Label required>New Price</Label>
                                    <Input type="number" inputMode="decimal" value={sellingPrice} onChange={(e) => setSellingPrice(e.target.value)} placeholder="0.00" min="0" step="0.01" required />
                                </div>
                                <div>
                                    <Label>Discount Price</Label>
                                    <Input type="number" inputMode="decimal" value={discountPrice} onChange={(e) => setDiscountPrice(e.target.value)} placeholder="0" min="0" step="0.01" />
                                </div>
                                <div>
                                    <Label required>Current Stock Quantity</Label>
                                    <Input type="number" inputMode="numeric" value={stockQty} onChange={(e) => setStockQty(e.target.value)} placeholder="0" min="0" required />
                                </div>
                                <div>
                                    <Label>Minimum Order Quantity</Label>
                                    <Input type="number" inputMode="numeric" value={minOrderQty} onChange={(e) => setMinOrderQty(e.target.value)} placeholder="1" min="1" />
                                </div>
                            </div>
                        </SectionCard>

                        {/* Variants */}
                        <VariantsSection variants={variants} onChange={setVariants} />

                        {/* Images */}
                        <SectionCard title="Images" icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                        }>
                            <div className="space-y-5">
                                {isEditMode && existingThumbnail && !thumbnail && (
                                    <div className="flex items-start gap-2 p-2.5 bg-blue-50 rounded-lg border border-blue-100 text-xs text-blue-600">
                                        <svg className="w-4 h-4 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Current thumbnail will be kept unless you upload a new one.</span>
                                    </div>
                                )}
                                <ImageDropzone
                                    label="Thumbnail"
                                    hint="Ratio 1280 × 960 px"
                                    onChange={setThumbnail}
                                    existingUrls={existingThumbnail ? [existingThumbnail] : []}
                                />
                                <ImageDropzone
                                    label="Additional Thumbnail"
                                    hint="Ratio 1280 × 960 px"
                                    multiple
                                    maxFiles={5}
                                    onChange={setAdditionalImages}
                                    existingUrls={existingAdditional}
                                />
                                <div>
                                    <button type="button" className="flex items-center gap-2 text-sm font-semibold text-gray-700 hover:text-emerald-600 transition-colors py-1">
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                        Upload or Add Product Video
                                    </button>
                                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <Label>Select Video Type</Label>
                                            <Select value={videoType} onChange={(e) => setVideoType(e.target.value)}>
                                                <option>Upload Video File</option>
                                                <option>YouTube</option>
                                                <option>Vimeo</option>
                                                <option>Dailymotion</option>
                                            </Select>
                                        </div>
                                        <div>
                                            <Label>Upload Product Video</Label>
                                            {videoType === "Upload Video File" ? (
                                                <div>
                                                    <input type="file" accept="video/mp4,video/avi,video/mov,video/wmv" onChange={(e) => setVideoFile(e.target.files[0])}
                                                        className="block w-full text-xs text-gray-500 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 border border-gray-200 rounded-lg" />
                                                    <p className="text-xs text-gray-400 mt-1">Supported formats: MP4, AVI, MOV, WMV</p>
                                                </div>
                                            ) : (
                                                <Input placeholder={`Paste ${videoType} URL`} />
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </SectionCard>

                        {/* SEO */}
                        <SectionCard title="SEO Information" icon={
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        }>
                            <div className="space-y-4">
                                <div>
                                    <Label>Meta Title</Label>
                                    <Input value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Meta Title" />
                                </div>
                                <div>
                                    <Label>Meta Description</Label>
                                    <Textarea value={metaDesc} onChange={(e) => setMetaDesc(e.target.value)} rows={3} placeholder="Meta Description" />
                                </div>
                                <div>
                                    <Label>Meta Keywords</Label>
                                    <TagInput tags={metaKeywords} onChange={setMetaKeywords} />
                                    <p className="text-xs text-gray-400 mt-1">Write keywords and Press enter to add new one</p>
                                </div>
                            </div>
                        </SectionCard>

                        {/* Footer buttons */}
                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pb-6">
                            <button type="button" onClick={isEditMode && onCancel ? onCancel : handleReset}
                                className="w-full sm:w-auto px-6 py-3 sm:py-2.5 text-sm font-semibold text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 active:bg-gray-100 transition-colors">
                                {isEditMode ? "Cancel" : "Reset"}
                            </button>
                            <button type="submit" disabled={submitting}
                                className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 sm:py-2.5 text-sm font-semibold bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white rounded-xl transition-colors shadow-sm shadow-emerald-200">
                                {submitting && <Spinner />}
                                {submitting ? "Saving…" : isEditMode ? "Update Product" : "Submit"}
                            </button>
                        </div>
                    </div>

                    {/* ── RIGHT COLUMN ── */}
                    <div className="space-y-5 min-w-0 lg:sticky lg:top-[72px]">

                        {/* Categories */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-800">Categories</h3>
                            </div>
                            <div className="p-3 sm:p-4 space-y-1 max-h-72 overflow-y-auto">
                                {categoriesLoading ? (
                                    <div className="flex items-center gap-2 py-4 text-gray-400 text-xs">
                                        <svg className="animate-spin h-4 w-4 text-emerald-400" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                                        </svg>
                                        Loading categories…
                                    </div>
                                ) : categories.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic py-3">No categories found.</p>
                                ) : (
                                    (() => {
                                        const parents = categories.filter(c => c.parent_id === null);
                                        const getSubCats = (parentId) =>
                                            categories.filter(c => c.parent_id === parentId);

                                        return parents.map((parent) => {
                                            const subCats = getSubCats(parent.id);
                                            const hasSubCats = subCats.length > 0;

                                            return (
                                                <div key={parent.id} className="mb-1">
                                                    {!hasSubCats ? (
                                                        <label className="flex items-center gap-2.5 px-2 py-2 sm:py-1.5 rounded-lg cursor-pointer hover:bg-gray-50 active:bg-gray-100 transition-colors group">
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedCategories.includes(parent.id)}
                                                                onChange={() => toggleCategory(parent.id)}
                                                                className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
                                                            />
                                                            <span className="text-sm font-semibold text-gray-800">
                                                                {parent.name}
                                                            </span>
                                                        </label>
                                                    ) : (
                                                        <div className="flex items-center gap-2 px-2 py-1.5">
                                                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wide">
                                                                📁 {parent.name}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {hasSubCats && (
                                                        <div className="ml-4 pl-3 border-l-2 border-emerald-100 space-y-0.5 mt-0.5">
                                                            {subCats.map((sub) => (
                                                                <label
                                                                    key={sub.id}
                                                                    className="flex items-center gap-2.5 px-2 py-2 sm:py-1.5 rounded-lg cursor-pointer hover:bg-emerald-50 active:bg-emerald-50 transition-colors group"
                                                                >
                                                                    <input
                                                                        type="checkbox"
                                                                        checked={selectedCategories.includes(sub.id)}
                                                                        onChange={() => toggleCategory(sub.id)}
                                                                        className="h-5 w-5 sm:h-4 sm:w-4 rounded border-gray-300 text-emerald-500 focus:ring-emerald-400 accent-emerald-500"
                                                                    />
                                                                    <span className="text-sm text-gray-700 group-hover:text-gray-900">
                                                                        {sub.name}
                                                                    </span>
                                                                    {!sub.isActive && (
                                                                        <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded-full ml-auto">
                                                                            Inactive
                                                                        </span>
                                                                    )}
                                                                </label>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        });
                                    })()
                                )}
                            </div>
                            {selectedCategories.length > 0 && (
                                <div className="px-4 py-3 border-t border-gray-50 bg-emerald-50/40">
                                    <p className="text-xs text-emerald-700 font-semibold break-words">
                                        {selectedCategories.length} selected:{" "}
                                        {selectedCategories.map((id) => categories.find((c) => c.id === id)?.name).filter(Boolean).join(", ")}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Category Attribute */}
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="px-5 py-3.5 border-b border-gray-50 bg-gray-50/50">
                                <h3 className="text-sm font-bold text-gray-800">Category Attribute</h3>
                            </div>
                            <div className="p-4">
                                {selectedCategories.length === 0 ? (
                                    <p className="text-xs text-gray-400 italic">Select a category to see its attributes.</p>
                                ) : (
                                    <div className="space-y-3">
                                        <p className="text-xs text-gray-500 font-medium">
                                            Attributes for: <span className="text-gray-700 font-semibold">{categories.find((c) => c.id === selectedCategories[0])?.name}</span>
                                        </p>
                                        {["Size", "Weight", "Color"].map((attr) => (
                                            <div key={attr}>
                                                <Label>{attr}</Label>
                                                <Input
                                                    placeholder={`Enter ${attr}`}
                                                    value={attributes.find(a => a.key === attr)?.value || ""}
                                                    onChange={(e) => handleAttributeChange(attr, e.target.value)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Quick summary card */}
                        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl p-4 text-white shadow-md shadow-emerald-200">
                            <p className="text-xs font-bold uppercase tracking-wider opacity-80 mb-3">Product Summary</p>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between gap-2">
                                    <span className="opacity-75 flex-shrink-0">Name</span>
                                    <span className="font-semibold truncate text-right min-w-0">{name || "—"}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="opacity-75 flex-shrink-0">SKU</span>
                                    <span className="font-semibold break-all text-right">{sku}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="opacity-75 flex-shrink-0">Selling Price</span>
                                    <span className="font-semibold">{sellingPrice ? `৳${sellingPrice}` : "—"}</span>
                                </div>
                                <div className="flex justify-between gap-2">
                                    <span className="opacity-75 flex-shrink-0">Stock</span>
                                    <span className="font-semibold">{stockQty || "—"}</span>
                                </div>
                                {variants.length > 0 && (
                                    <div className="pt-2 border-t border-white/20 flex justify-between gap-2">
                                        <span className="opacity-75">Variants</span>
                                        <span className="font-semibold text-yellow-200">{variants.length} added</span>
                                    </div>
                                )}
                                {isEditMode && (
                                    <div className="pt-2 border-t border-white/20 flex justify-between gap-2">
                                        <span className="opacity-75">Mode</span>
                                        <span className="font-semibold text-yellow-200">✏ Editing</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </main>

            <Toast toast={toast} />
        </div>
    );
}