"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { authGet, authMutation, authUpload, getPublicData, type Ministry } from "@/lib/api/church-api";
import { defaultChurchInformation, defaultHomepageSettings, type ChurchInformation, type HomepageSectionKey, type HomepageSettings, type WebsiteSettingRecord } from "@/lib/content/website-settings";
import { useConfirmation } from "@/components/admin/confirmation-dialog";

type Mode = "homepage" | "church-information";
type EditableDetails = {
  contentKey?: HomepageSettings["contentKey"] | ChurchInformation["contentKey"];
  hero?: HomepageSettings["hero"];
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
    sections: Object.fromEntries(Object.entries(defaultHomepageSettings.sections).map(([key, defaults]) => [key, { ...defaults, ...(details.sections?.[key as HomepageSectionKey] ?? {}) }])) as HomepageSettings["sections"],
  } : {
    ...defaultChurchInformation, ...details, profile: { ...defaultChurchInformation.profile, ...details.profile },
    contact: { ...defaultChurchInformation.contact, ...details.contact },
    mission: { ...defaultChurchInformation.mission, ...details.mission }, vision: { ...defaultChurchInformation.vision, ...details.vision },
    coreValues: details.coreValues ?? [], beliefs: details.beliefs ?? [], socialLinks: details.socialLinks ?? [],
  };
  return { id: record.id, title: draft?.title ?? record.title, description: draft?.description ?? record.description ?? "", details: normalizedDetails, published: record.published };
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
    try { const form = new FormData(); form.set("file", file); const result = await authUpload<{ url: string }>("/media/upload?purpose=image", form); if (!result.url) throw new Error("The backend did not return an image URL."); setDetails(field, result.url); }
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
      if (isHome) details.contentKey = "homepage";
      else { details.contentKey = "church-information"; details.coreValues = JSON.parse(valuesJson); details.beliefs = JSON.parse(beliefsJson); }
      const body = unpublish ? { unpublish: true } : { type: "settings", title: record.title.trim(), description: record.description.trim(), details, published: publish };
      if (record.id) await authMutation(`/admin/content/${record.id}`, "PATCH", body); else await authMutation("/admin/content", "POST", body);
      const loaded = await load();
      setMinistries(loaded.ministries);
      setRecord(loaded.record);
      setValuesJson(loaded.valuesJson);
      setBeliefsJson(loaded.beliefsJson);
      setNotice(unpublish ? "The live version was withdrawn." : publish ? "The approved version is live." : "Draft saved. The live version remains unchanged.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save settings. Check the structured entries and try again."); }
    finally { setSaving(false); }
  }
  const field = (label: string, path: string, multiline = false, required = false) => {
    const value = path === "description" ? record.description : path === "title" ? record.title : path.split(".").reduce<unknown>((current, key) => current && typeof current === "object" && key in current ? (current as Record<string, unknown>)[key] : undefined, record.details);
    return <label className="block text-sm font-medium text-slate-700">{label}{required && <span className="text-red-600"> *</span>}{multiline ? <textarea className={areaClass} value={String(value ?? "")} onChange={(e) => path === "description" ? setRecord((old) => ({ ...old, description: e.target.value })) : setDetails(path, e.target.value)} maxLength={10000} /> : <input className={inputClass} required={required} value={String(value ?? "")} onChange={(e) => path === "title" ? setRecord((old) => ({ ...old, title: e.target.value })) : setDetails(path, e.target.value)} />}</label>;
  };
  const jsonField = (label: string, value: string, update: (value: string) => void, help: string) => <label className="block text-sm font-medium text-slate-700">{label}<textarea className={`${areaClass} min-h-48 font-mono text-xs`} value={value} onChange={(e) => update(e.target.value)} spellCheck={false} /><span className="mt-1 block text-xs font-normal text-slate-500">{help}</span></label>;
  const socialLinks = (record.details.socialLinks ?? []) as ChurchInformation["socialLinks"];
  function updateSocial(index: number, key: "label" | "url" | "visible", value: string | boolean) {
    setDetails("socialLinks", socialLinks.map((item, itemIndex) => itemIndex === index ? { ...item, [key]: value } : item));
  }
  return <main className="mx-auto max-w-5xl">
    <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-bold uppercase tracking-[.16em] text-primary">Church · Admin workspace</p>
      <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">{isHome ? "Homepage management" : "Church information"}</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-500 font-normal">{isHome ? "Configure homepage messaging, sections, featured records and display order. Save drafts without changing what visitors see." : "Manage the official church profile, approved statements, beliefs, values, contact details and social links."}</p>
    </header>
    {record.id && <p className="mt-4 text-sm text-slate-600">Live status: <strong>{record.published ? "Published" : "Unpublished"}</strong>{record.details?._draft ? " Â· Draft changes waiting for approval" : ""}</p>}
    {error && <p className="mt-5 border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">{error}</p>}{notice && <p className="mt-5 border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800" role="status">{notice}</p>}
    {loading ? <p className="py-10 text-sm text-slate-500">Loading settingsâ€¦</p> : <form className="mt-6 space-y-8" onSubmit={(e) => void save(e, false)}>
      {isHome ? <>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><div><h2 className="text-lg font-semibold">Hero section</h2><p className="mt-1 text-sm text-slate-500">The headline, supporting message and calls to action.</p></div><div className="grid gap-5 sm:grid-cols-2">{field("Main headline", "hero.heading", false, true)}{field("Supporting description", "hero.description", true)}{field("Primary button text", "hero.primaryCtaLabel")}{field("Primary destination", "hero.primaryCtaHref")}{field("Secondary button text", "hero.secondaryCtaLabel")}{field("Secondary destination", "hero.secondaryCtaHref")}{field("Image alternative text", "hero.imageAlt")}</div><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={Boolean(record.details.hero?.visible)} onChange={(e) => setDetails("hero.visible", e.target.checked)} />Show hero section</label><div><span className="text-sm font-medium">Hero image</span>{record.details.hero?.imageUrl && <img alt={record.details.hero?.imageAlt || "Homepage hero preview"} className="my-3 aspect-video max-h-64 rounded object-cover" src={record.details.hero.imageUrl} />}<input aria-label="Upload hero image" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-2 block w-full text-sm" disabled={uploading} onChange={(e) => void uploadImage(e.target.files?.[0], "hero.imageUrl")} type="file"/><p className="mt-1 text-xs text-slate-500">Image files are sent directly to the backend media service. {uploading ? "Uploadingâ€¦" : "JPEG, PNG, WebP, or GIF Â· up to 15 MB"}</p></div></section>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div><h2 className="text-lg font-semibold">Homepage sections</h2><p className="mt-1 text-sm text-slate-500">Set the content and display order of each section. Hidden sections do not affect navigation or contact information.</p></div>
          {homepageSections.map(({ key, label }) => <article className="space-y-4 border-t border-slate-100 pt-5" key={key}>
            <div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{label}</h3><div className="flex items-center gap-4"><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(record.details.sections?.[key]?.visible)} onChange={(e) => setDetails(`sections.${key}.visible`, e.target.checked)} />Visible</label><label className="flex items-center gap-2 text-sm">Order<input aria-label={`${label} order`} className="h-9 w-20 rounded border border-slate-300 px-2" max={100} min={0} onChange={(e) => setDetails(`sections.${key}.order`, Number(e.target.value))} type="number" value={Number(record.details.sections?.[key]?.order ?? 0)} /></label></div></div>
            <div className="grid gap-4 sm:grid-cols-2">{field("Section heading", `sections.${key}.heading`)}{field("Supporting description", `sections.${key}.description`, true)}</div>
            {(["events", "announcements", "sermons", "testimonials", "gallery"] as HomepageSectionKey[]).includes(key) && <label className="block max-w-xs text-sm font-medium text-slate-700">Items to display<input className={inputClass} max={12} min={1} onChange={(e) => setDetails(`sections.${key}.limit`, Number(e.target.value))} type="number" value={Number(record.details.sections?.[key]?.limit ?? (key === "gallery" ? 6 : 3))} /></label>}
            {(key === "welcome" || key === "about") && <div className="grid gap-4 sm:grid-cols-2">{field("Button text", `sections.${key}.primaryCtaLabel`)}{field("Button destination", `sections.${key}.primaryCtaHref`)}</div>}
            {key === "contact" && <div className="grid gap-4 sm:grid-cols-2">{field("Primary button text", "sections.contact.primaryCtaLabel")}{field("Primary destination", "sections.contact.primaryCtaHref")}{field("Secondary button text", "sections.contact.secondaryCtaLabel")}{field("Secondary destination", "sections.contact.secondaryCtaHref")}</div>}
            {key === "welcome" && <div><label className="block text-sm font-medium text-slate-700">Image alternative text<input className={inputClass} onChange={(e) => setDetails("sections.welcome.imageAlt", e.target.value)} value={String(record.details.sections?.welcome?.imageAlt ?? "")} /></label>{record.details.sections?.welcome?.imageUrl && <img alt={record.details.sections?.welcome?.imageAlt || "Welcome section preview"} className="my-3 aspect-video max-h-64 rounded object-cover" src={record.details.sections.welcome.imageUrl} />}<input aria-label="Upload welcome section image" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-2 block w-full text-sm" disabled={uploading} onChange={(e) => void uploadImage(e.target.files?.[0], "sections.welcome.imageUrl")} type="file"/><p className="mt-1 text-xs text-slate-500">Image files are uploaded by the backend media service.</p></div>}
            {key === "ministries" && <div><h4 className="text-sm font-semibold">Featured ministries</h4><p className="mt-1 text-xs text-slate-500">Choose existing published records. Their descriptions and images are not copied.</p><div className="mt-3 grid gap-2 sm:grid-cols-2">{ministries.map((ministry) => <label className="flex items-center gap-3 rounded border border-slate-200 p-3 text-sm" key={ministry.id}><input type="checkbox" checked={Boolean(record.details.sections?.ministries?.featuredMinistryIds?.includes(ministry.id))} onChange={(e) => { const ids: string[] = record.details.sections?.ministries?.featuredMinistryIds ?? []; setDetails("sections.ministries.featuredMinistryIds", e.target.checked ? [...ids, ministry.id] : ids.filter((id) => id !== ministry.id)); }} />{ministry.name}</label>)}</div>{ministries.length === 0 && <p className="mt-2 text-sm text-slate-500">No published ministries are available to feature.</p>}</div>}
          </article>)}
        </section>
      </> : <>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Official church profile</h2><div className="grid gap-5 sm:grid-cols-2">{field("Official church name", "title", false, true)}{field("Introduction", "description", true)}{field("Church history", "profile.history", true)}{field("Image alternative text", "profile.imageAlt")}</div><div>{record.details.profile?.imageUrl && <img alt={record.details.profile?.imageAlt || "Church profile preview"} className="my-3 aspect-video max-h-64 rounded object-cover" src={record.details.profile.imageUrl} />}<input aria-label="Upload church profile image" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-2 block w-full text-sm" disabled={uploading} onChange={(e) => void uploadImage(e.target.files?.[0], "profile.imageUrl")} type="file"/><p className="mt-1 text-xs text-slate-500">Backend media upload Â· JPEG, PNG, WebP, or GIF up to 15 MB.</p></div><div className="border-t border-slate-100 pt-5"><h3 className="text-sm font-semibold">Church logo</h3><p className="mt-1 text-sm text-slate-500">This logo appears in the public header and footer.</p>{record.details.profile?.logoUrl && <img alt={record.details.profile?.logoAlt || "Church logo preview"} className="my-3 size-20 rounded object-contain ring-1 ring-slate-200" src={record.details.profile.logoUrl} />}<div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-medium text-slate-700">Logo alternative text<input className={inputClass} onChange={(e) => setDetails("profile.logoAlt", e.target.value)} value={String(record.details.profile?.logoAlt ?? "")} /></label><div><label className="block text-sm font-medium text-slate-700">Upload logo<input aria-label="Upload church logo" accept="image/jpeg,image/png,image/webp,image/gif" className="mt-1 block w-full text-sm" disabled={uploading} onChange={(e) => void uploadImage(e.target.files?.[0], "profile.logoUrl")} type="file" /></label><p className="mt-1 text-xs text-slate-500">JPEG, PNG, WebP, or GIF up to 15 MB.</p></div></div></div></section>
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7"><h2 className="text-lg font-semibold">Official contact and location</h2><p className="text-sm text-slate-500">One shared contact record feeds the homepage, About, Contact and footer.</p><div className="grid gap-5 sm:grid-cols-2">{(["city", "country", "address", "phone", "email", "directionsUrl", "mapUrl"] as const).map((name) => field(({ directionsUrl: "Directions link", mapUrl: "Map embed URL", email: "Public email", phone: "Public phone", address: "Street address", city: "City", country: "Country" })[name], `contact.${name}`))}</div></section>
        {(["mission", "vision"] as const).map((name) => <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7" key={name}><div className="flex items-center justify-between"><h2 className="text-lg font-semibold">{name === "mission" ? "Mission" : "Vision"}</h2><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={Boolean(record.details[name]?.visible)} onChange={(e) => setDetails(`${name}.visible`, e.target.checked)} />Visible</label></div><div className="grid gap-5 sm:grid-cols-2">{field("Heading", `${name}.heading`)}{field("Approved statement", `${name}.statement`, true)}{field("Supporting description", `${name}.description`, true)}</div></section>)}
        <section className="space-y-5 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">{jsonField("Core values", valuesJson, setValuesJson, 'JSON array of {"title":"","description":"","order":0,"visible":true}. Use consecutive order values starting from 0.')}{jsonField("Statement of faith / beliefs", beliefsJson, setBeliefsJson, 'JSON array of {"title":"","description":"","order":0,"visible":false}. Content stays unpublished with the draft until leadership approves publication.')}
          <div className="space-y-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold">Social media links</h2><p className="mt-1 text-sm text-slate-500">Visible links appear in the public footer.</p></div><button className="min-h-10 rounded-lg border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary/5" onClick={() => setDetails("socialLinks", [...socialLinks, { label: "", url: "", visible: true }])} type="button">Add social link</button></div>
            {socialLinks.map((item, index) => <div className="grid gap-3 rounded-xl border border-slate-200 p-4 sm:grid-cols-[1fr_2fr_auto_auto] sm:items-end" key={`${index}-${item.label}`}><label className="block text-sm font-medium text-slate-700">Platform / label<input className={inputClass} onChange={(e) => updateSocial(index, "label", e.target.value)} placeholder="Instagram" value={item.label} /></label><label className="block text-sm font-medium text-slate-700">Profile URL<input className={inputClass} onChange={(e) => updateSocial(index, "url", e.target.value)} placeholder="https://instagram.com/yourchurch" type="url" value={item.url} /></label><label className="flex min-h-11 items-center gap-2 text-sm"><input checked={item.visible} onChange={(e) => updateSocial(index, "visible", e.target.checked)} type="checkbox" />Visible</label><button aria-label={`Remove ${item.label || "social link"}`} className="min-h-11 rounded-lg border border-red-200 px-3 text-sm font-semibold text-red-700 hover:bg-red-50" onClick={() => setDetails("socialLinks", socialLinks.filter((_, itemIndex) => itemIndex !== index))} type="button">Remove</button></div>)}
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
