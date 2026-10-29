"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { authGet, authMutation, authUpload, getPublicData, type Ministry } from "@/lib/api/church-api";
import { defaultChurchInformation, defaultHomepageSettings, type ChurchInformation, type HomepageFooterLink, type HomepageLinkCard, type HomepageSectionKey, type HomepageSettings, type WebsiteSettingRecord } from "@/lib/content/website-settings";
import { useConfirmation } from "@/components/admin/confirmation-dialog";
import { ImageUploadDropzone } from "@/components/admin/management/image-upload-dropzone";
import { MediaLibraryPicker } from "@/components/admin/management/media-library-picker";
import { ArrowDown, ArrowUp, Code, Plus, Trash2 } from "lucide-react";

type Mode = "homepage" | "church-information";
type EditableDetails = {
  contentKey?: HomepageSettings["contentKey"] | ChurchInformation["contentKey"];
  hero?: HomepageSettings["hero"];
  siteHeader?: HomepageSettings["siteHeader"];
  siteFooter?: HomepageSettings["siteFooter"];
  audienceCards?: HomepageLinkCard[];
  aboutCards?: HomepageLinkCard[];
  sections?: HomepageSettings["sections"];
  profile?: ChurchInformation["profile"];
  contact?: ChurchInformation["contact"];
  mission?: ChurchInformation["mission"];
  vision?: ChurchInformation["vision"];
  coreValues?: ChurchInformation["coreValues"];
  beliefs?: ChurchInformation["beliefs"];
  socialLinks?: ChurchInformation["socialLinks"];
  _draft?: { title?: string; description?: string; details?: EditableDetails };
  [key: string]: unknown;
};
type Editable = { id?: string; title: string; description: string; details: EditableDetails; published: boolean };
const inputClass = "mt-1 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const areaClass = "mt-1 min-h-24 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15";
const homepageSections: { key: HomepageSectionKey; label: string }[] = [
  { key: "welcome", label: "Welcome" }, { key: "facts", label: "Church at a glance" }, { key: "services", label: "Service schedule" }, { key: "about", label: "About the church" },
  { key: "ministries", label: "Featured ministries" }, { key: "events", label: "Upcoming events" }, { key: "announcements", label: "Announcements" },
  { key: "sermons", label: "Latest sermons" }, { key: "testimonials", label: "Community stories" },
  { key: "gallery", label: "Church life gallery" }, { key: "contact", label: "Contact and engagement" },
];
const footerLinkGroups = [
  { key: "churchLinks", label: "Church links" },
  { key: "ministryLinks", label: "Ministry links" },
  { key: "resourceLinks", label: "Resource links" },
  { key: "supportLinks", label: "Support links" },
  { key: "legalLinks", label: "Legal links" },
] as const;
type FooterLinkGroupKey = (typeof footerLinkGroups)[number]["key"];
const homepageCardGroups = [
  { key: "audienceCards", label: "Quick access cards" },
  { key: "aboutCards", label: "About feature cards" },
] as const;
type HomepageCardGroupKey = (typeof homepageCardGroups)[number]["key"];

function isCloudinaryUrl(url?: unknown): boolean {
  if (!url || typeof url !== "string") return true;
  try {
    const parsed = new URL(url);
    const customHost = process.env.NEXT_PUBLIC_CLOUDINARY_DELIVERY_HOST?.trim().toLowerCase();
    return parsed.protocol === "https:" && !parsed.username && !parsed.password &&
      (parsed.hostname.endsWith(".cloudinary.com") || parsed.hostname === "cloudinary.com" || parsed.hostname === customHost);
  } catch {
    return false;
  }
}

function importedLegacy(record: WebsiteSettingRecord | undefined, mode: Mode): Editable {
  if (!record) return mode === "homepage"
    ? { title: "Homepage", description: "", details: structuredClone(defaultHomepageSettings), published: false }
    : { title: "", description: "", details: structuredClone(defaultChurchInformation), published: false };
  const draft = record.details?._draft as EditableDetails["_draft"] | undefined;
  const storedDetails = (draft?.details ?? record.details) as EditableDetails;
  const details: EditableDetails = storedDetails.contentKey ? storedDetails : mode === "church-information" ? {
    ...defaultChurchInformation,
    contact: { ...defaultChurchInformation.contact, city: String(record.details?.city ?? ""), country: String(record.details?.country ?? ""), address: String(record.details?.address ?? ""), phone: String(record.details?.publicPhone ?? ""), email: String(record.details?.publicEmail ?? "") },
  } : storedDetails;
  const normalizedDetails: EditableDetails = mode === "homepage" ? {
    ...defaultHomepageSettings, ...details, hero: { ...defaultHomepageSettings.hero, ...(details.hero ?? {}) },
    siteHeader: {
      ...defaultHomepageSettings.siteHeader,
      ...(details.siteHeader ?? {}),
      announcement: { ...defaultHomepageSettings.siteHeader.announcement, ...(details.siteHeader?.announcement ?? {}) },
      primaryCta: { ...defaultHomepageSettings.siteHeader.primaryCta, ...(details.siteHeader?.primaryCta ?? {}) },
      navigation: details.siteHeader?.navigation ?? defaultHomepageSettings.siteHeader.navigation,
    },
    siteFooter: {
      ...defaultHomepageSettings.siteFooter,
      ...(details.siteFooter ?? {}),
      churchLinks: details.siteFooter?.churchLinks ?? defaultHomepageSettings.siteFooter.churchLinks,
      ministryLinks: details.siteFooter?.ministryLinks ?? defaultHomepageSettings.siteFooter.ministryLinks,
      resourceLinks: details.siteFooter?.resourceLinks ?? defaultHomepageSettings.siteFooter.resourceLinks,
      supportLinks: details.siteFooter?.supportLinks ?? defaultHomepageSettings.siteFooter.supportLinks,
      legalLinks: details.siteFooter?.legalLinks ?? defaultHomepageSettings.siteFooter.legalLinks,
    },
    audienceCards: details.audienceCards ?? defaultHomepageSettings.audienceCards,
    aboutCards: details.aboutCards ?? defaultHomepageSettings.aboutCards,
    sections: Object.fromEntries(Object.entries(defaultHomepageSettings.sections).map(([key, defaults]) => [key, { ...defaults, ...(details.sections?.[key as HomepageSectionKey] ?? {}) }])) as HomepageSettings["sections"],
  } : {
    ...defaultChurchInformation, ...details, profile: { ...defaultChurchInformation.profile, ...details.profile },
    contact: { ...defaultChurchInformation.contact, ...details.contact },
    mission: { ...defaultChurchInformation.mission, ...details.mission }, vision: { ...defaultChurchInformation.vision, ...details.vision },
    coreValues: details.coreValues ?? [], beliefs: details.beliefs ?? [], socialLinks: details.socialLinks ?? [],
  };
  return { id: record.id, title: draft?.title ?? record.title, description: draft?.description ?? record.description ?? "", details: normalizedDetails, published: record.published };
}

type OrderedItem = {
  title: string;
  description: string;
  order: number;
  visible: boolean;
};

function OrderedItemsEditor({
  title,
  subtitle,
  items,
  onChange,
  itemLabel,
  rawJson,
  onRawJsonChange,
}: {
  title: string;
  subtitle: string;
  items: OrderedItem[];
  onChange: (items: OrderedItem[]) => void;
  itemLabel: string;
  rawJson: string;
  onRawJsonChange: (json: string) => void;
}) {
  const [showJson, setShowJson] = useState(false);
  const [jsonError, setJsonError] = useState("");

  function addItem() {
    const nextOrder = items.length > 0 ? Math.max(...items.map((i) => i.order ?? 0)) + 1 : 0;
    const updated: OrderedItem[] = [
      ...items,
      { title: "", description: "", order: nextOrder, visible: true },
    ];
    onChange(updated);
  }

  function updateItem(index: number, key: keyof OrderedItem, value: unknown) {
    const updated = items.map((item, idx) =>
      idx === index ? { ...item, [key]: value } : item,
    );
    onChange(updated);
  }

  function removeItem(index: number) {
    const updated = items.filter((_, idx) => idx !== index);
    onChange(updated);
  }

  function moveItem(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    const withUpdatedOrder = reordered.map((item, idx) => ({ ...item, order: idx }));
    onChange(withUpdatedOrder);
  }

  function handleJsonTextChange(val: string) {
    onRawJsonChange(val);
    try {
      const parsed = JSON.parse(val);
      if (Array.isArray(parsed)) {
        setJsonError("");
        onChange(parsed as OrderedItem[]);
      } else {
        setJsonError("JSON must be an array of objects.");
      }
    } catch (e) {
      setJsonError((e as Error).message);
    }
  }

  return (
    <section className="admin-card space-y-5 p-5 sm:p-7">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display text-lg font-bold text-slate-900">{title}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-bold text-primary">
              {items.length} {items.length === 1 ? itemLabel.toLowerCase() : `${itemLabel.toLowerCase()}s`}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"
            onClick={() => setShowJson((prev) => !prev)}
            type="button"
          >
            <Code className="mr-1.5 size-3.5" />
            {showJson ? "Hide Raw JSON" : "View / Edit JSON"}
          </button>
          <button
            className="inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-xs font-bold text-white shadow-xs transition hover:bg-primary-hover active:scale-[0.98]"
            onClick={addItem}
            type="button"
          >
            <Plus className="mr-1.5 size-4" />
            Add {itemLabel}
          </button>
        </div>
      </div>

      {showJson && (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-center justify-between pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Raw JSON Data
            </span>
            {jsonError && <span className="text-xs font-semibold text-red-600">{jsonError}</span>}
          </div>
          <textarea
            className="min-h-40 w-full rounded-lg border border-slate-300 bg-white p-3 font-mono text-xs leading-relaxed outline-none focus:border-primary"
            onChange={(e) => handleJsonTextChange(e.target.value)}
            spellCheck={false}
            value={rawJson}
          />
          <p className="mt-1 text-[11px] text-slate-500">
            Changes made in this JSON box will automatically reflect in the visual cards above.
          </p>
        </div>
      )}

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center">
          <p className="text-sm font-medium text-slate-600">No {itemLabel.toLowerCase()}s added yet.</p>
          <button
            className="mt-3 inline-flex items-center text-xs font-bold text-primary hover:underline"
            onClick={addItem}
            type="button"
          >
            <Plus className="mr-1 size-3.5" /> Click here to add the first {itemLabel.toLowerCase()}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((item, index) => (
            <div
              className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 transition hover:border-slate-300 sm:p-5"
              key={index}
            >
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="grid size-6 place-items-center rounded-lg bg-slate-200 font-display text-xs font-bold text-slate-700">
                    {index + 1}
                  </span>
                  <span className="font-display text-sm font-bold text-slate-900">
                    {item.title || `(Untitled ${itemLabel})`}
                  </span>
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      item.visible
                        ? "bg-emerald-50 text-emerald-800"
                        : "bg-slate-200 text-slate-600"
                    }`}
                  >
                    {item.visible ? "Visible" : "Hidden"}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    aria-label={`Move ${item.title || itemLabel} up`}
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
                    disabled={index === 0}
                    onClick={() => moveItem(index, "up")}
                    type="button"
                  >
                    <ArrowUp className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Move ${item.title || itemLabel} down`}
                    className="grid size-8 place-items-center rounded-lg border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-100 disabled:opacity-30"
                    disabled={index === items.length - 1}
                    onClick={() => moveItem(index, "down")}
                    type="button"
                  >
                    <ArrowDown className="size-3.5" />
                  </button>
                  <button
                    aria-label={`Remove ${item.title || itemLabel}`}
                    className="grid size-8 place-items-center rounded-lg border border-red-200 bg-white text-red-600 transition hover:bg-red-50"
                    onClick={() => removeItem(index)}
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600">
                  {itemLabel} Title
                  <input
                    className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    onChange={(e) => updateItem(index, "title", e.target.value)}
                    placeholder={`e.g. ${itemLabel === "Core Value" ? "Faith" : "The Bible"}`}
                    value={item.title}
                  />
                </label>

                <div className="flex items-end gap-3">
                  <label className="block w-28 text-xs font-bold uppercase tracking-wider text-slate-600">
                    Order
                    <input
                      className="mt-1.5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                      min={0}
                      onChange={(e) => updateItem(index, "order", Number(e.target.value))}
                      type="number"
                      value={item.order ?? index}
                    />
                  </label>

                  <label className="flex h-11 flex-1 items-center gap-2.5 rounded-xl border border-slate-300 bg-white px-3.5 text-xs font-bold uppercase tracking-wider text-slate-700">
                    <input
                      checked={Boolean(item.visible)}
                      className="size-4 rounded-sm accent-primary"
                      onChange={(e) => updateItem(index, "visible", e.target.checked)}
                      type="checkbox"
                    />
                    Display on Website
                  </label>
                </div>

                <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 sm:col-span-2">
                  Description / Statement
                  <textarea
                    className="mt-1.5 min-h-20 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
                    onChange={(e) => updateItem(index, "description", e.target.value)}
                    placeholder={`Describe what this ${itemLabel.toLowerCase()} means for our church community…`}
                    value={item.description}
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function WebsiteSettingsManager({ mode }: { mode: Mode }) {
  const confirm = useConfirmation();
  const [record, setRecord] = useState<Editable>(() => importedLegacy(undefined, mode));
  const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [ministries, setMinistries] = useState<Ministry[]>([]);
  const [valuesJson, setValuesJson] = useState(""); const [beliefsJson, setBeliefsJson] = useState("");
  const isHome = mode === "homepage";
  const load = useCallback(async () => {
    const [data, ministryData] = await Promise.all([
      authGet<{ items?: WebsiteSettingRecord[] }>("/admin/content/settings"),
      isHome ? getPublicData<Ministry[]>("/ministries") : Promise.resolve(null),
    ]);
    const key = isHome ? "homepage" : "church-information";
    const match = data.items?.find((item) => item.details?.contentKey === key) ?? (!isHome ? data.items?.find((item) => !item.details?.contentKey) : undefined);
    const loadedRecord = importedLegacy(match, mode);
    const church = loadedRecord.details as ChurchInformation;
    return {
      ministries: ministryData ?? [],
      record: loadedRecord,
      valuesJson: JSON.stringify(church.coreValues ?? [], null, 2),
      beliefsJson: JSON.stringify(church.beliefs ?? [], null, 2),
    };
  }, [isHome, mode]);
  useEffect(() => {
    let active = true;
    void load().then((loaded) => {
      if (!active) return;
      setMinistries(loaded.ministries);
      setRecord(loaded.record);
      setValuesJson(loaded.valuesJson);
      setBeliefsJson(loaded.beliefsJson);
    }).catch((cause) => {
      if (active) setError(cause instanceof Error ? cause.message : "Could not load settings.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, [load]);

  function setDetails(path: string, value: unknown) {
    setRecord((previous) => {
      const details = structuredClone(previous.details);
      const keys = path.split(".");
      let target: Record<string, unknown> = details;
      for (const key of keys.slice(0, -1)) {
        const child = target[key];
        if (!child || typeof child !== "object" || Array.isArray(child)) target[key] = {};
        target = target[key] as Record<string, unknown>;
      }
      target[keys.at(-1)!] = value;
      return { ...previous, details };
    });
  }
  async function uploadImage(file: File | undefined, field: "hero.imageUrl" | "profile.imageUrl" | "profile.logoUrl" | "sections.welcome.imageUrl") {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type) || file.size > 15 * 1024 * 1024) { setError("Choose a JPEG, PNG, WebP, or GIF image up to 15 MB."); return; }
    setUploading(true); setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const purpose = field.startsWith("profile.") ? "branding" : "homepage";
      const result = await authUpload<{ secureUrl?: string; url?: string }>(`/media/upload?purpose=${purpose}`, form);
      const url = result?.secureUrl || result?.url;
      if (!url) throw new Error("The backend did not return an image URL.");
      setDetails(field, url);
    }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Image upload failed."); } finally { setUploading(false); }
  }
  async function save(event: FormEvent<HTMLFormElement>, publish: boolean, unpublish = false) {
    event.preventDefault();
    const label = isHome ? "homepage" : "church information";
    if (publish && !await confirm({ title: `Publish ${label}?`, description: `These approved changes will become visible across the public church website.`, confirmLabel: `Publish ${label}` })) return;
    if (unpublish && !await confirm({ title: `Withdraw ${label}?`, description: `The current live ${label} will be removed from the public website.`, confirmLabel: "Withdraw live version", tone: "danger" })) return;
    setSaving(true); setError(""); setNotice("");
    try {
      const details = structuredClone(record.details);
      if (isHome) {
        details.contentKey = "homepage";
        if (details.hero?.imageUrl && !isCloudinaryUrl(details.hero.imageUrl)) {
          details.hero.imageUrl = "";
        }
        if (details.sections?.welcome?.imageUrl && !isCloudinaryUrl(details.sections.welcome.imageUrl)) {
          details.sections.welcome.imageUrl = "";
        }
      } else {
        details.contentKey = "church-information";
        if (details.profile?.imageUrl && !isCloudinaryUrl(details.profile.imageUrl)) {
          details.profile.imageUrl = "";
        }
        try {
          details.coreValues = JSON.parse(valuesJson);
        } catch {
          details.coreValues = (record.details.coreValues ?? []) as ChurchInformation["coreValues"];
        }
        try {
          details.beliefs = JSON.parse(beliefsJson);
        } catch {
          details.beliefs = (record.details.beliefs ?? []) as ChurchInformation["beliefs"];
        }
      }
      const body = unpublish ? { unpublish: true } : { type: "settings", title: record.title.trim(), description: record.description.trim(), details, published: publish };
      if (record.id) await authMutation(`/admin/content/${record.id}`, "PATCH", body); else await authMutation("/admin/content", "POST", body);
      const loaded = await load();
      setMinistries(loaded.ministries);
      setRecord(loaded.record);
      setValuesJson(loaded.valuesJson);
      setBeliefsJson(loaded.beliefsJson);
      setNotice(unpublish ? "The live version was withdrawn." : publish ? "The approved version is live." : "Draft saved. The live version remains unchanged.");
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("church-settings-updated"));
      }
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save settings. Check the structured entries and try again."); }
    finally { setSaving(false); }
  }
  const field = (label: string, path: string, multiline = false, required = false) => {
    const value = path === "description" ? record.description : path === "title" ? record.title : path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" && key in current ? (current as Record<string, unknown>)[key] : undefined, record.details);
    return <label className="block text-sm font-medium text-slate-700">{label}{required && <span className="text-red-600"> *</span>}{multiline ? <textarea className={areaClass} value={String(value ?? "")} onChange={(e) => path === "description" ? setRecord((old) => ({ ...old, description: e.target.value })) : setDetails(path, e.target.value)} maxLength={10000} /> : <input className={inputClass} required={required} value={String(value ?? "")} onChange={(e) => path === "title" ? setRecord((old) => ({ ...old, title: e.target.value })) : setDetails(path, e.target.value)} />}</label>;
  };
  const socialLinks = (record.details.socialLinks ?? []) as ChurchInformation["socialLinks"];
  function updateSocial(index: number, key: "label" | "url" | "visible", value: string | boolean) {
    setDetails("socialLinks", socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }
  const navigation = record.details.siteHeader?.navigation ?? defaultHomepageSettings.siteHeader.navigation;
  function updateNavigation(index: number, key: "label" | "href" | "visible", value: string | boolean) {
    setDetails("siteHeader.navigation", navigation.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }
  function moveNavigation(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= navigation.length) return;
    const next = [...navigation];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    setDetails("siteHeader.navigation", next.map((entry, order) => ({ ...entry, order })));
  }
  const footerSettings = record.details.siteFooter ?? defaultHomepageSettings.siteFooter;
  function updateFooterLinks(group: FooterLinkGroupKey, links: HomepageFooterLink[]) {
    setDetails(`siteFooter.${group}`, links);
  }
  function updateFooterLink(group: FooterLinkGroupKey, index: number, key: "label" | "href" | "visible", value: string | boolean) {
    updateFooterLinks(group, footerSettings[group].map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }
  function moveFooterLink(group: FooterLinkGroupKey, index: number, direction: -1 | 1) {
    const links = footerSettings[group];
    const target = index + direction;
    if (target < 0 || target >= links.length) return;
    const next = [...links];
    const [item] = next.splice(index, 1);
    next.splice(target, 0, item);
    updateFooterLinks(group, next.map((entry, order) => ({ ...entry, order })));
  }
  function homepageCards(group: HomepageCardGroupKey) {
    return record.details[group] ?? defaultHomepageSettings[group];
  }
  function updateHomepageCards(group: HomepageCardGroupKey, cards: HomepageLinkCard[]) {
    setDetails(group, cards);
  }
  function updateHomepageCard(group: HomepageCardGroupKey, index: number, key: keyof HomepageLinkCard, value: string | boolean) {
    updateHomepageCards(group, homepageCards(group).map((card, cardIndex) => cardIndex === index ? { ...card, [key]: value } : card));
  }
  function moveHomepageCard(group: HomepageCardGroupKey, index: number, direction: -1 | 1) {
    const cards = homepageCards(group);
    const target = index + direction;
    if (target < 0 || target >= cards.length) return;
    const next = [...cards];
    const [card] = next.splice(index, 1);
    next.splice(target, 0, card);
    updateHomepageCards(group, next.map((entry, order) => ({ ...entry, order })));
  }
  return <main className="mx-auto max-w-5xl">
    <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Church · Admin workspace</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">{isHome ? "Homepage management" : "Church information"}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 font-normal">{isHome ? "Configure homepage messaging, sections, featured records and display order. Save drafts without changing what visitors see." : "Manage the official church profile, approved statements, beliefs, values, contact details and social links."}</p>
    </header>
    {record.id && <p className="mt-4 text-sm text-slate-600">Live status: <strong>{record.published ? "Published" : "Unpublished"}</strong>{record.details?._draft ? " · Draft changes waiting for approval" : ""}</p>}
    {error && <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}{notice && <p className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{notice}</p>}
    {loading ? <p className="py-10 text-sm text-slate-500">Loading settings…</p> : <form className="mt-6 space-y-8" onSubmit={(e) => void save(e, false)}>
      {isHome ? <>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div><h2 className="text-lg font-semibold">Header, navigation and announcement</h2><p className="mt-1 text-sm text-slate-500">These saved homepage settings also control the shared public header.</p></div>
          <div className="grid gap-5 sm:grid-cols-2">
            {field("Brand tagline", "siteHeader.brandTagline")}
            {field("Service summary", "siteHeader.serviceSummary")}
            {field("Directions link label", "siteHeader.directionsLabel")}
            {field("Directions destination", "siteHeader.directionsHref")}
            {field("Header button label", "siteHeader.primaryCta.label")}
            {field("Header button destination", "siteHeader.primaryCta.href")}
          </div>
          <label className="flex items-center gap-3 text-sm"><input checked={Boolean(record.details.siteHeader?.primaryCta.visible)} onChange={(event) => setDetails("siteHeader.primaryCta.visible", event.target.checked)} type="checkbox" />Show header button</label>
          <div className="space-y-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
            <label className="flex items-center gap-3 text-sm font-semibold"><input checked={Boolean(record.details.siteHeader?.announcement.visible)} onChange={(event) => setDetails("siteHeader.announcement.visible", event.target.checked)} type="checkbox" />Show announcement banner</label>
            <div className="grid gap-4 sm:grid-cols-2">{field("Announcement message", "siteHeader.announcement.text", true)}{field("Announcement button label", "siteHeader.announcement.ctaLabel")}{field("Announcement button destination", "siteHeader.announcement.href")}</div>
          </div>
          <div>
            <div className="flex flex-wrap items-center justify-between gap-3"><div><h3 className="text-sm font-semibold">Main navigation links</h3><p className="mt-1 text-xs text-slate-500">Order and edit the shared desktop and mobile navigation. Links can use a site path or HTTPS URL.</p></div><button className="min-h-10 rounded-lg border border-primary px-3.5 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50" disabled={navigation.length >= 12} onClick={() => setDetails("siteHeader.navigation", [...navigation, { label: "", href: "/", visible: true, order: navigation.length }])} type="button"><Plus aria-hidden="true" className="mr-1 inline size-3.5" />Add link</button></div>
            <div className="mt-3 space-y-3">{navigation.map((item, index) => <div className="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-end" key={`${index}-${item.order}`}>
              <label className="block text-xs font-semibold text-slate-700">Menu label<input className={inputClass} maxLength={80} onChange={(event) => updateNavigation(index, "label", event.target.value)} value={item.label} /></label>
              <label className="block text-xs font-semibold text-slate-700">Destination<input className={inputClass} maxLength={500} onChange={(event) => updateNavigation(index, "href", event.target.value)} value={item.href} /></label>
              <div className="flex items-center gap-2"><label className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-xs"><input checked={item.visible} onChange={(event) => updateNavigation(index, "visible", event.target.checked)} type="checkbox" />Visible</label><button aria-label={`Move ${item.label || "navigation link"} up`} className="grid size-10 place-items-center rounded-lg border border-slate-300 disabled:opacity-40" disabled={index === 0} onClick={() => moveNavigation(index, -1)} type="button"><ArrowUp aria-hidden="true" className="size-4" /></button><button aria-label={`Move ${item.label || "navigation link"} down`} className="grid size-10 place-items-center rounded-lg border border-slate-300 disabled:opacity-40" disabled={index === navigation.length - 1} onClick={() => moveNavigation(index, 1)} type="button"><ArrowDown aria-hidden="true" className="size-4" /></button><button aria-label={`Remove ${item.label || "navigation link"}`} className="grid size-10 place-items-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50" onClick={() => setDetails("siteHeader.navigation", navigation.filter((_, itemIndex) => itemIndex !== index).map((entry, order) => ({ ...entry, order })))} type="button"><Trash2 aria-hidden="true" className="size-4" /></button></div>
            </div>)}</div>
          </div>
        </section>
        <section className="space-y-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div><h2 className="text-lg font-semibold">Homepage feature cards</h2><p className="mt-1 text-sm text-slate-500">Manage the quick access cards and the three About links displayed on the homepage.</p></div>
          {homepageCardGroups.map(({ key, label }) => {
            const cards = homepageCards(key);
            return <div className="space-y-3 border-t border-slate-100 pt-5" key={key}>
              <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">{label}</h3><button className="min-h-9 rounded-lg border border-primary px-3 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50" disabled={cards.length >= 8} onClick={() => updateHomepageCards(key, [...cards, { id: `${key}-${Date.now()}`, eyebrow: "", title: "", description: "", href: "/", cta: "", visible: true, order: cards.length }])} type="button"><Plus aria-hidden="true" className="mr-1 inline size-3.5" />Add card</button></div>
              {cards.map((card, index) => <article className="space-y-3 rounded-xl border border-slate-200 p-4" key={card.id}>
                <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-xs font-bold text-slate-700">Card {index + 1}</p><div className="flex items-center gap-1"><label className="flex min-h-9 items-center gap-1.5 px-2 text-xs"><input checked={card.visible} onChange={(event) => updateHomepageCard(key, index, "visible", event.target.checked)} type="checkbox" />Visible</label><button aria-label={`Move card ${index + 1} up`} className="grid size-9 place-items-center rounded-lg border border-slate-300 disabled:opacity-40" disabled={index === 0} onClick={() => moveHomepageCard(key, index, -1)} type="button"><ArrowUp aria-hidden="true" className="size-4" /></button><button aria-label={`Move card ${index + 1} down`} className="grid size-9 place-items-center rounded-lg border border-slate-300 disabled:opacity-40" disabled={index === cards.length - 1} onClick={() => moveHomepageCard(key, index, 1)} type="button"><ArrowDown aria-hidden="true" className="size-4" /></button><button aria-label={`Remove card ${index + 1}`} className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50" onClick={() => updateHomepageCards(key, cards.filter((_, cardIndex) => cardIndex !== index).map((entry, order) => ({ ...entry, order })))} type="button"><Trash2 aria-hidden="true" className="size-4" /></button></div></div>
                <div className="grid gap-3 sm:grid-cols-2"><label className="block text-xs font-semibold text-slate-700">Small label<input className={inputClass} maxLength={80} onChange={(event) => updateHomepageCard(key, index, "eyebrow", event.target.value)} value={card.eyebrow} /></label><label className="block text-xs font-semibold text-slate-700">Card title<input className={inputClass} maxLength={120} onChange={(event) => updateHomepageCard(key, index, "title", event.target.value)} value={card.title} /></label><label className="block text-xs font-semibold text-slate-700 sm:col-span-2">Description<textarea className={areaClass} maxLength={500} onChange={(event) => updateHomepageCard(key, index, "description", event.target.value)} value={card.description} /></label><label className="block text-xs font-semibold text-slate-700">Destination<input className={inputClass} maxLength={500} onChange={(event) => updateHomepageCard(key, index, "href", event.target.value)} value={card.href} /></label><label className="block text-xs font-semibold text-slate-700">Button label<input className={inputClass} maxLength={80} onChange={(event) => updateHomepageCard(key, index, "cta", event.target.value)} value={card.cta} /></label></div>
              </article>)}
            </div>;
          })}
        </section>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div><h2 className="text-lg font-semibold">Footer content and navigation</h2><p className="mt-1 text-sm text-slate-500">Edit the public footer’s wording, calls to action, column labels and ordered links.</p></div>
          <div className="grid gap-4 sm:grid-cols-2">
            {field("Brand tagline", "siteFooter.tagline")}
            {field("Footer description", "siteFooter.description", true)}
            {field("Visit button label", "siteFooter.visitCtaLabel")}
            {field("Visit button destination", "siteFooter.visitCtaHref")}
            {field("Prayer button label", "siteFooter.prayerCtaLabel")}
            {field("Prayer button destination", "siteFooter.prayerCtaHref")}
            {field("Contact button label", "siteFooter.contactCtaLabel")}
            {field("Contact button destination", "siteFooter.contactCtaHref")}
            {field("Church column heading", "siteFooter.churchColumnTitle")}
            {field("Ministries column heading", "siteFooter.ministriesColumnTitle")}
            {field("Resources column heading", "siteFooter.resourcesColumnTitle")}
            {field("Service and contact heading", "siteFooter.contactColumnTitle")}
            {field("Service name", "siteFooter.serviceTitle")}
            {field("Service times", "siteFooter.serviceSummary")}
            {field("Social links heading", "siteFooter.connectLabel")}
            {field("Empty social links message", "siteFooter.emptySocialText")}
            {field("Back to top label", "siteFooter.backToTopLabel")}
            {field("Copyright suffix", "siteFooter.copyrightSuffix")}
          </div>
          <div className="space-y-6 border-t border-slate-100 pt-5">
            {footerLinkGroups.map(({ key, label }) => {
              const links = footerSettings[key];
              return <div key={key}>
                <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="text-sm font-semibold">{label}</h3><button className="min-h-9 rounded-lg border border-primary px-3 text-xs font-semibold text-primary hover:bg-primary/5 disabled:opacity-50" disabled={links.length >= 12} onClick={() => updateFooterLinks(key, [...links, { label: "", href: "/", visible: true, order: links.length }])} type="button"><Plus aria-hidden="true" className="mr-1 inline size-3.5" />Add link</button></div>
                <div className="mt-3 space-y-2">{links.map((item, index) => <div className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)_auto] sm:items-end" key={`${key}-${index}-${item.order}`}>
                  <label className="block text-xs font-semibold text-slate-700">Link label<input className={inputClass} maxLength={80} onChange={(event) => updateFooterLink(key, index, "label", event.target.value)} value={item.label} /></label>
                  <label className="block text-xs font-semibold text-slate-700">Destination<input className={inputClass} maxLength={500} onChange={(event) => updateFooterLink(key, index, "href", event.target.value)} value={item.href} /></label>
                  <div className="flex items-center gap-1"><label className="flex min-h-11 items-center gap-1.5 rounded-lg px-2 text-xs"><input checked={item.visible} onChange={(event) => updateFooterLink(key, index, "visible", event.target.checked)} type="checkbox" />Visible</label><button aria-label={`Move ${item.label || "footer link"} up`} className="grid size-9 place-items-center rounded-lg border border-slate-300 disabled:opacity-40" disabled={index === 0} onClick={() => moveFooterLink(key, index, -1)} type="button"><ArrowUp aria-hidden="true" className="size-4" /></button><button aria-label={`Move ${item.label || "footer link"} down`} className="grid size-9 place-items-center rounded-lg border border-slate-300 disabled:opacity-40" disabled={index === links.length - 1} onClick={() => moveFooterLink(key, index, 1)} type="button"><ArrowDown aria-hidden="true" className="size-4" /></button><button aria-label={`Remove ${item.label || "footer link"}`} className="grid size-9 place-items-center rounded-lg border border-red-200 text-red-700 hover:bg-red-50" onClick={() => updateFooterLinks(key, links.filter((_, itemIndex) => itemIndex !== index).map((entry, order) => ({ ...entry, order })))} type="button"><Trash2 aria-hidden="true" className="size-4" /></button></div>
                </div>)}</div>
              </div>;
            })}
          </div>
        </section>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><div><h2 className="text-lg font-semibold">Hero section</h2><p className="mt-1 text-sm text-slate-500">The headline, supporting message and calls to action.</p></div><div className="grid gap-5 sm:grid-cols-2">{field("Main headline", "hero.heading", false, true)}{field("Supporting description", "hero.description", true)}{field("Primary button text", "hero.primaryCtaLabel")}{field("Primary destination", "hero.primaryCtaHref")}{field("Secondary button text", "hero.secondaryCtaLabel")}{field("Secondary destination", "hero.secondaryCtaHref")}{field("Image alternative text", "hero.imageAlt")}</div><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(record.details.hero?.visible)} onChange={(e) => setDetails("hero.visible", e.target.checked)} />Show hero section</label><div><span className="text-sm font-medium">Hero image</span>{record.details.hero?.imageUrl ? <div className="my-3"><img alt={record.details.hero?.imageAlt || "Homepage hero preview"} className="aspect-video max-h-64 rounded object-cover" src={record.details.hero.imageUrl} /><button type="button" className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" onClick={() => setDetails("hero.imageUrl", "")}>Remove image</button></div> : null}<ImageUploadDropzone className="mt-2" disabled={uploading} label="Drag and drop a hero image or click to browse" onFile={(file) => void uploadImage(file, "hero.imageUrl")} uploading={uploading} helperText="Images are uploaded through the backend to Cloudinary · JPEG, PNG, WebP, or GIF up to 15 MB" /><MediaLibraryPicker onSelect={(asset) => { setDetails("hero.imageUrl", asset.secureUrl); setDetails("hero.imageAlt", asset.altText); }} /></div></section>
        {(() => {
          const hero = record.details.hero ?? defaultHomepageSettings.hero;
          const visibleSections = Object.entries(record.details.sections ?? {})
            .map(([key, section]) => ({ key: key as HomepageSectionKey, ...section }))
            .filter((section) => section.visible)
            .sort((left, right) => left.order - right.order);
          return <section aria-labelledby="homepage-preview-title" className="admin-card p-4 sm:p-6">
            <div className="mb-4"><h2 className="font-display text-lg font-bold text-slate-900" id="homepage-preview-title">Draft preview</h2><p className="mt-1 text-sm text-slate-600">This preview uses the unsaved settings below. Visitors will see these changes only after you publish them.</p></div>
            {hero.visible ? <div className="relative isolate flex min-h-64 items-center overflow-hidden rounded-xl bg-primary-dark p-6 text-white sm:min-h-72 sm:p-10">
              {hero.imageUrl && <img alt={hero.imageAlt || "Homepage hero image preview"} className="absolute inset-0 -z-20 size-full object-cover" src={hero.imageUrl} />}
              <div aria-hidden="true" className="absolute inset-0 -z-10 bg-gradient-to-r from-slate-950/90 via-slate-950/65 to-slate-950/25" />
              <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[.18em] text-secondary">{record.title || "Church homepage"}</p><h3 className="mt-3 whitespace-pre-line font-display text-2xl font-bold leading-tight sm:text-4xl">{hero.heading || "Welcome"}</h3><p className="mt-3 max-w-xl text-sm leading-6 text-white/85 sm:text-base">{hero.description}</p><div className="mt-5 flex flex-wrap gap-2"><span className="rounded-lg bg-secondary px-3 py-2 text-xs font-bold text-slate-950">{hero.primaryCtaLabel || "Primary action"}</span>{hero.secondaryCtaLabel && <span className="rounded-lg border border-white/50 bg-white/10 px-3 py-2 text-xs font-bold text-white">{hero.secondaryCtaLabel}</span>}</div></div>
            </div> : <p className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-600">The hero is hidden. The homepage will begin with the first visible section.</p>}
            <ol className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{visibleSections.map((section) => <li className="rounded-xl border border-slate-200 bg-white p-3" key={section.key}><p className="text-[10px] font-bold uppercase tracking-wider text-primary">{homepageSections.find((item) => item.key === section.key)?.label ?? section.key}</p><p className="mt-1 text-sm font-semibold text-slate-900">{section.heading || "Untitled section"}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{section.description}</p></li>)}</ol>
          </section>;
        })()}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div><h2 className="text-lg font-semibold">Homepage sections</h2><p className="mt-1 text-sm text-slate-500">Set the content and display order of each section. Hidden sections do not affect navigation or contact information.</p></div>
          {homepageSections.map(({ key, label }) => <article className="space-y-4 border-t border-slate-100 pt-5" key={key}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{label}</h3><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(record.details.sections?.[key]?.visible)} onChange={(e) => setDetails(`sections.${key}.visible`, e.target.checked)} />Visible</label><label className="flex items-center gap-2 text-sm">Order<input aria-label={`${label} order`} className="h-9 w-20 rounded border border-slate-300 px-2" max={100} min={0} onChange={(e) => setDetails(`sections.${key}.order`, Number(e.target.value))} type="number" value={Number(record.details.sections?.[key]?.order ?? 0)} /></label></div></div>
            <div className="grid gap-4 sm:grid-cols-2">{field("Section label", `sections.${key}.eyebrow`)}{field("Section heading", `sections.${key}.heading`)}{field("Supporting description", `sections.${key}.description`, true)}</div>
            {(["events", "announcements", "sermons", "testimonials", "gallery"] as HomepageSectionKey[]).includes(key) && <label className="block max-w-xs text-sm font-medium text-slate-700">Items to display<input className={inputClass} max={12} min={1} onChange={(e) => setDetails(`sections.${key}.limit`, Number(e.target.value))} type="number" value={Number(record.details.sections?.[key]?.limit ?? (key === "gallery" ? 6 : 3))} /></label>}
            {(["welcome", "services", "about", "ministries", "events", "sermons", "announcements", "gallery"] as HomepageSectionKey[]).includes(key) && <div className="grid gap-4 sm:grid-cols-2">{field("Primary button text", `sections.${key}.primaryCtaLabel`)}{field("Primary button destination", `sections.${key}.primaryCtaHref`)}</div>}
            {key === "contact" && <div className="grid gap-4 sm:grid-cols-2">{field("Primary button text", "sections.contact.primaryCtaLabel")}{field("Primary destination", "sections.contact.primaryCtaHref")}{field("Secondary button text", "sections.contact.secondaryCtaLabel")}{field("Secondary destination", "sections.contact.secondaryCtaHref")}</div>}
            {key === "facts" && <div className="grid gap-4 sm:grid-cols-2">{field("Worship fact label", "sections.facts.worshipFactLabel")}{field("Ministries fact label", "sections.facts.ministriesFactLabel")}{field("Events fact label", "sections.facts.eventsFactLabel")}{field("Community fact label", "sections.facts.communityFactLabel")}{field("Community fallback text", "sections.facts.communityFactFallback")}{field("Fact link label", "sections.facts.factLinkLabel")}</div>}
            {key === "welcome" && <div className="grid gap-4 sm:grid-cols-2">{field("Second button text", "sections.welcome.secondaryCtaLabel")}{field("Second button destination", "sections.welcome.secondaryCtaHref")}{field("Welcome quote", "sections.welcome.quote", true)}</div>}
            {key === "contact" && <div className="grid gap-4 sm:grid-cols-2">{field("Prayer message heading", "sections.contact.prayerHeading")}{field("Prayer quotation", "sections.contact.prayerQuote", true)}{field("Prayer reassurance", "sections.contact.prayerAssurance", true)}{field("Visit section label", "sections.contact.visitLabel")}{field("Address label", "sections.contact.addressLabel")}{field("Service times label", "sections.contact.serviceTimesLabel")}{field("Phone label", "sections.contact.phoneLabel")}{field("Email label", "sections.contact.emailLabel")}{field("Directions button label", "sections.contact.directionsLabel")}{field("Visitor guide button label", "sections.contact.visitorGuideLabel")}{field("Visitor guide destination", "sections.contact.visitorGuideHref")}{field("Social links label", "sections.contact.socialLinksLabel")}{field("Map button label", "sections.contact.mapButtonLabel")}</div>}
            {key === "welcome" && <div><label className="block text-sm font-medium text-slate-700">Image alternative text<input className={inputClass} onChange={(e) => setDetails("sections.welcome.imageAlt", e.target.value)} value={String(record.details.sections?.welcome?.imageAlt ?? "")} /></label>{record.details.sections?.welcome?.imageUrl ? <div className="my-3"><img alt={record.details.sections?.welcome?.imageAlt || "Welcome section preview"} className="aspect-video max-h-64 rounded object-cover" src={record.details.sections.welcome.imageUrl} /><button type="button" className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" onClick={() => setDetails("sections.welcome.imageUrl", "")}>Remove image</button></div> : null}<ImageUploadDropzone className="mt-2" disabled={uploading} label="Drag and drop a welcome image or click to browse" onFile={(file) => void uploadImage(file, "sections.welcome.imageUrl")} uploading={uploading} helperText="Images are uploaded through the backend to Cloudinary · JPEG, PNG, WebP, or GIF up to 15 MB" /><MediaLibraryPicker onSelect={(asset) => { setDetails("sections.welcome.imageUrl", asset.secureUrl); setDetails("sections.welcome.imageAlt", asset.altText); }} /></div>}
            {key === "ministries" && <div><h4 className="text-sm font-semibold">Featured ministries</h4><p className="mt-1 text-xs text-slate-500">Choose existing published records. Their descriptions and images are not copied.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{ministries.map((ministry) => <label className="flex items-center gap-3 rounded border border-slate-200 p-3 text-sm" key={ministry.id}><input type="checkbox" checked={Boolean(record.details.sections?.ministries?.featuredMinistryIds?.includes(ministry.id))} onChange={(e) => { const ids: string[] = record.details.sections?.ministries?.featuredMinistryIds ?? []; setDetails("sections.ministries.featuredMinistryIds", e.target.checked ? [...ids, ministry.id] : ids.filter((id) => id !== ministry.id)); }} />{ministry.name}</label>)}</div>{ministries.length === 0 && <p className="mt-2 text-sm text-slate-500">No published ministries are available to feature.</p>}</div>}
          </article>)}
        </section>
      </> : <>
        <section className="admin-card space-y-5 p-5 sm:p-7"><h2 className="text-lg font-semibold">Official church profile</h2><div className="grid gap-5 sm:grid-cols-2">{field("Official church name", "title", false, true)}{field("Introduction", "description", true)}{field("Church history", "profile.history", true)}{field("Image alternative text", "profile.imageAlt")}</div><div><span className="text-sm font-medium">Church profile image</span>{record.details.profile?.imageUrl ? <div className="my-3"><img alt={record.details.profile?.imageAlt || "Church profile preview"} className="aspect-video max-h-64 rounded object-cover" src={record.details.profile.imageUrl} /><button type="button" className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" onClick={() => setDetails("profile.imageUrl", "")}>Remove image</button></div> : null}<ImageUploadDropzone className="mt-2" disabled={uploading} label="Drag and drop a church profile image or click to browse" onFile={(file) => void uploadImage(file, "profile.imageUrl")} uploading={uploading} helperText="Images are uploaded through the backend to Cloudinary · JPEG, PNG, WebP, or GIF up to 15 MB" /><MediaLibraryPicker onSelect={(asset) => { setDetails("profile.imageUrl", asset.secureUrl); setDetails("profile.imageAlt", asset.altText); }} /></div><div className="border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold">Church logo</h3><p className="mt-1 text-sm text-slate-500">This logo appears across the website header, footer, admin sidebar, and browser icons.</p>{record.details.profile?.logoUrl ? <div className="my-3 flex items-center gap-4"><img alt={record.details.profile?.logoAlt || "Church logo preview"} className="size-20 rounded-xl bg-white p-1 object-contain ring-1 ring-slate-200 shadow-xs" src={record.details.profile.logoUrl} /><button type="button" className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50" onClick={() => setDetails("profile.logoUrl", "")}>Remove logo</button></div> : <div className="my-3 flex size-20 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-xs text-slate-400">No logo</div>}<div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Logo image URL<input className={inputClass} onChange={(e) => setDetails("profile.logoUrl", e.target.value)} placeholder="Paste an approved image URL" value={String(record.details.profile?.logoUrl ?? "")} /></label><label className="block text-sm font-medium text-slate-700">Logo alternative text<input className={inputClass} onChange={(e) => setDetails("profile.logoAlt", e.target.value)} placeholder="e.g. Church official emblem" value={String(record.details.profile?.logoAlt ?? "")} /></label><div className="sm:col-span-2"><span className="block text-sm font-medium text-slate-700">Or upload new logo file</span><ImageUploadDropzone className="mt-1" disabled={uploading} label="Drag and drop a church logo or click to browse" onFile={(file) => void uploadImage(file, "profile.logoUrl")} uploading={uploading} helperText="JPEG, PNG, WebP, or GIF · up to 15 MB" /><MediaLibraryPicker label="Choose an existing logo" onSelect={(asset) => { setDetails("profile.logoUrl", asset.secureUrl); setDetails("profile.logoAlt", asset.altText); }} /></div></div></div></section>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Official contact and location</h2><p className="text-sm text-slate-500">One shared contact record feeds the homepage, About, Contact and footer.</p><div className="grid gap-5 sm:grid-cols-2">{(["city", "country", "address", "phone", "email", "directionsUrl", "mapUrl"] as const).map((name) => <div key={name}>{field(({ directionsUrl: "Directions link", mapUrl: "Map embed URL", email: "Public email", phone: "Public phone", address: "Street address", city: "City", country: "Country" })[name], `contact.${name}`)}</div>)}</div></section>
        {(["mission", "vision"] as const).map((name) => <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7" key={name}><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{name === "mission" ? "Mission" : "Vision"}</h2><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(record.details[name]?.visible)} onChange={(e) => setDetails(`${name}.visible`, e.target.checked)} />Visible</label></div><div className="grid gap-5 sm:grid-cols-2">{field("Heading", `${name}.heading`)}{field("Approved statement", `${name}.statement`, true)}{field("Supporting description", `${name}.description`, true)}</div></section>)}
        <OrderedItemsEditor
          title="Core Values"
          subtitle="The spiritual convictions and guiding values that shape our worship, community, and service."
          itemLabel="Core Value"
          items={(record.details.coreValues ?? []) as OrderedItem[]}
          onChange={(updated) => {
            setDetails("coreValues", updated);
            setValuesJson(JSON.stringify(updated, null, 2));
          }}
          rawJson={valuesJson}
          onRawJsonChange={(val) => setValuesJson(val)}
        />

        <OrderedItemsEditor
          title="Statement of Faith & Beliefs"
          subtitle="The theological statements, scripture foundations, and doctrine of our church."
          itemLabel="Belief"
          items={(record.details.beliefs ?? []) as OrderedItem[]}
          onChange={(updated) => {
            setDetails("beliefs", updated);
            setBeliefsJson(JSON.stringify(updated, null, 2));
          }}
          rawJson={beliefsJson}
          onRawJsonChange={(val) => setBeliefsJson(val)}
        />

        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Social media links</h2><p className="mt-1 text-sm text-slate-500">Visible links appear in the public footer.</p></div><button className="min-h-10 rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5" onClick={() => setDetails("socialLinks", [...socialLinks, { label: "", url: "", visible: true }])} type="button">Add social link</button></div>
            {socialLinks.map((item, index) => <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end" key={`social-${index}-${item.label}`}><label className="block text-sm font-medium text-slate-700">Platform / label<input className={inputClass} onChange={(e) => updateSocial(index, "label", e.target.value)} placeholder="Instagram" value={item.label} /></label><label className="block text-sm font-medium text-slate-700">Profile URL<input className={inputClass} onChange={(e) => updateSocial(index, "url", e.target.value)} placeholder="https://instagram.com/yourchurch" type="url" value={item.url} /></label><label className="flex min-h-11 items-center gap-2 text-sm"><input checked={item.visible} onChange={(e) => updateSocial(index, "visible", e.target.checked)} type="checkbox" />Visible</label><button aria-label={`Remove ${item.label || "social link"}`} className="min-h-11 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => setDetails("socialLinks", socialLinks.filter((_, itemIndex) => itemIndex !== index))} type="button">Remove</button></div>)}
            {socialLinks.length === 0 && <p className="rounded-lg bg-slate-50 p-4 text-sm text-slate-500">No social links added yet.</p>}
          </div>
        </section>
      </>}
      <div className="sticky bottom-0 flex flex-wrap justify-end gap-3 border-t border-slate-200 bg-white/95 py-4 backdrop-blur">
        <button className="min-h-11 rounded-xl border border-primary px-5 text-sm font-bold text-primary hover:bg-primary/5 transition" disabled={saving || uploading} onClick={(e) => { e.preventDefault(); const form = e.currentTarget.form; if (form) void save({ preventDefault: () => {}, currentTarget: form } as FormEvent<HTMLFormElement>, true); }} type="button">{saving ? "Saving…" : "Publish approved changes"}</button>
        <button className="min-h-11 rounded-xl bg-primary px-6 text-sm font-bold text-white shadow-sm hover:bg-primary-hover disabled:opacity-60 transition" disabled={saving || uploading} type="submit">{saving ? "Saving…" : "Save draft"}</button>
        {record.id && record.published && <button className="min-h-11 rounded-xl border border-red-300 px-5 text-sm font-bold text-red-700 hover:bg-red-50 transition" disabled={saving} onClick={(e) => { e.preventDefault(); void save({ preventDefault: () => {}, currentTarget: e.currentTarget.form! } as FormEvent<HTMLFormElement>, false, true); }} type="button">Withdraw live version</button>}
      </div>
      <p className="text-xs leading-5 text-slate-500">Only publishing makes saved changes public. This project has no separate reviewer role, so an authorized administrator must publish only after church leadership has approved the official content. Drafts remain private.</p>
    </form>}
  </main>;
}
