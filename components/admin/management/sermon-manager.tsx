"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import {
  Calendar,
  Check,
  Download,
  Eye,
  FileAudio,
  Film,
  Globe,
  Headphones,
  Image as ImageIcon,
  Mic,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Tag,
  Trash2,
  Upload,
  User,
  Users,
  Video,
  X,
} from "lucide-react";
import {
  authGet,
  authMutation,
  authUpload,
  type Sermon,
  type Speaker,
} from "@/lib/api/church-api";
import { formatSermonDate, parseVideoUrl } from "@/lib/media/video-utils";
import { useConfirmation } from "@/components/admin/confirmation-dialog";

const STANDARD_CATEGORIES = [
  "Faith",
  "Grace",
  "Prayer",
  "Discipleship",
  "Worship",
  "Hope",
  "Love",
  "Family",
  "Holy Spirit",
  "Spiritual Warfare",
  "Stewardship",
  "Missions & Outreach",
  "Christian Living",
];

const STANDARD_BIBLE_BOOKS = [
  "Genesis", "Exodus", "Leviticus", "Numbers", "Deuteronomy",
  "Joshua", "Judges", "Ruth", "1 Samuel", "2 Samuel", "1 Kings", "2 Kings",
  "1 Chronicles", "2 Chronicles", "Ezra", "Nehemiah", "Esther", "Job", "Psalms",
  "Proverbs", "Ecclesiastes", "Song of Solomon", "Isaiah", "Jeremiah", "Lamentations",
  "Ezekiel", "Daniel", "Hosea", "Joel", "Amos", "Obadiah", "Jonah", "Micah",
  "Nahum", "Habakkuk", "Zephaniah", "Haggai", "Zechariah", "Malachi",
  "Matthew", "Mark", "Luke", "John", "Acts", "Romans",
  "1 Corinthians", "2 Corinthians", "Galatians", "Ephesians", "Philippians", "Colossians",
  "1 Thessalonians", "2 Thessalonians", "1 Timothy", "2 Timothy", "Titus", "Philemon",
  "Hebrews", "James", "1 Peter", "2 Peter", "1 John", "2 John", "3 John", "Jude", "Revelation",
];

const STANDARD_SERVICES = [
  "Sunday First Service (09:00 AM)",
  "Sunday Main Worship (10:30 AM)",
  "Sunday Evening Service (05:00 PM)",
  "Wednesday Bible Study (06:00 PM)",
  "Friday Prayer & Miracle Service",
  "Special Conference Service",
];

const STANDARD_MINISTRIES = [
  "All Church / General",
  "Children's Ministry",
  "Youth Ministry",
  "Men's Ministry",
  "Women's Ministry",
  "Worship Ministry",
  "Evangelism & Outreach",
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function SermonManager() {
  const confirm = useConfirmation();
  const [activeTab, setActiveTab] = useState<"sermons" | "speakers">("sermons");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Filters for sermons
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [speakerFilter, setSpeakerFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Sermon Editor Modal State
  const [sermonModalOpen, setSermonModalOpen] = useState(false);
  const [editingSermon, setEditingSermon] = useState<Sermon | null>(null);

  // Form fields
  const [formTitle, setFormTitle] = useState("");
  const [formSlug, setFormSlug] = useState("");
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [formSpeakerName, setFormSpeakerName] = useState("");
  const [formSpeakerId, setFormSpeakerId] = useState("");
  const [formDate, setFormDate] = useState("");
  const [formCategory, setFormCategory] = useState("Faith");
  const [customCategory, setCustomCategory] = useState("");
  const [formScripture, setFormScripture] = useState("");
  const [formBibleBook, setFormBibleBook] = useState("");
  const [formSeries, setFormSeries] = useState("");
  const [formMinistry, setFormMinistry] = useState("");
  const [formService, setFormService] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formThumbnailUrl, setFormThumbnailUrl] = useState("");
  const [formAudioUrl, setFormAudioUrl] = useState("");
  const [formVideoUrl, setFormVideoUrl] = useState("");
  const [formAllowDownload, setFormAllowDownload] = useState(true);
  const [formStatus, setFormStatus] = useState<"draft" | "published" | "archived">("draft");

  // Media uploading state
  const [imageUploading, setImageUploading] = useState(false);
  const [audioUploading, setAudioUploading] = useState(false);

  // Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewSermon, setPreviewSermon] = useState<Sermon | null>(null);

  // Speaker Modal State
  const [speakerModalOpen, setSpeakerModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [speakerName, setSpeakerName] = useState("");
  const [speakerTitle, setSpeakerTitle] = useState("");
  const [speakerBio, setSpeakerBio] = useState("");
  const [speakerPhotoUrl, setSpeakerPhotoUrl] = useState("");
  const [speakerEmail, setSpeakerEmail] = useState("");
  const [speakerPhone, setSpeakerPhone] = useState("");
  const [speakerUploading, setSpeakerUploading] = useState(false);

  // Load Data
  const loadData = useCallback(async () => {
    try {
      setError("");
      const [sermonsData, speakersData] = await Promise.all([
        authGet<Sermon[] | { items?: Sermon[] }>("/admin/sermons"),
        authGet<Speaker[]>("/admin/speakers"),
      ]);
      const loadedSermons = Array.isArray(sermonsData) ? sermonsData : sermonsData.items ?? [];
      setSermons(loadedSermons);
      setSpeakers(Array.isArray(speakersData) ? speakersData : []);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load sermons data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void loadData();
    }, 0);
    return () => window.clearTimeout(timeoutId);
  }, [loadData]);

  // Handle title change & auto-slug
  const handleTitleChange = (val: string) => {
    setFormTitle(val);
    if (!slugManuallyEdited) {
      setFormSlug(slugify(val));
    }
  };

  // Open Sermon Modal for New Sermon
  const openNewSermon = () => {
    setEditingSermon(null);
    setFormTitle("");
    setFormSlug("");
    setSlugManuallyEdited(false);
    const defaultSpeaker = speakers[0];
    setFormSpeakerId(defaultSpeaker?.id ?? "");
    setFormSpeakerName(defaultSpeaker?.name ?? "");
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormCategory("Faith");
    setCustomCategory("");
    setFormScripture("");
    setFormBibleBook("");
    setFormSeries("");
    setFormMinistry("");
    setFormService(STANDARD_SERVICES[0]);
    setFormDescription("");
    setFormThumbnailUrl("");
    setFormAudioUrl("");
    setFormVideoUrl("");
    setFormAllowDownload(true);
    setFormStatus("draft");
    setError("");
    setNotice("");
    setSermonModalOpen(true);
  };

  // Open Sermon Modal for Edit
  const openEditSermon = (sermon: Sermon) => {
    setEditingSermon(sermon);
    setFormTitle(sermon.title);
    setFormSlug(sermon.slug);
    setSlugManuallyEdited(true);
    setFormSpeakerId(sermon.speakerId ?? "");
    setFormSpeakerName(sermon.speaker);
    setFormDate(sermon.date ? sermon.date.slice(0, 10) : "");
    if (STANDARD_CATEGORIES.includes(sermon.category)) {
      setFormCategory(sermon.category);
      setCustomCategory("");
    } else {
      setFormCategory("Custom");
      setCustomCategory(sermon.category);
    }
    setFormScripture(sermon.scripture ?? "");
    setFormBibleBook(sermon.bibleBook ?? "");
    setFormSeries(sermon.series ?? "");
    setFormMinistry(sermon.ministry ?? "");
    setFormService(sermon.service ?? "");
    setFormDescription(sermon.description ?? "");
    setFormThumbnailUrl(sermon.thumbnailUrl ?? "");
    setFormAudioUrl(sermon.audioUrl ?? "");
    setFormVideoUrl(sermon.videoUrl ?? "");
    setFormAllowDownload(sermon.allowDownload ?? true);
    setFormStatus(sermon.status ?? "draft");
    setError("");
    setNotice("");
    setSermonModalOpen(true);
  };

  // Open Preview Modal
  const openPreview = (sermon: Sermon) => {
    setPreviewSermon(sermon);
    setPreviewModalOpen(true);
  };

  // Open Preview directly from current form state
  const openCurrentFormPreview = () => {
    const finalCategory = formCategory === "Custom" ? customCategory : formCategory;
    const currentPreview: Sermon = {
      id: editingSermon?.id || "preview-temp",
      title: formTitle || "Untitled Sermon",
      slug: formSlug || "untitled-sermon",
      speaker: formSpeakerName || "Guest Speaker",
      speakerId: formSpeakerId || null,
      speakerRef: speakers.find((s) => s.id === formSpeakerId) || null,
      date: formDate || new Date().toISOString().slice(0, 10),
      category: finalCategory || "Message",
      scripture: formScripture || null,
      bibleBook: formBibleBook || null,
      series: formSeries || null,
      ministry: formMinistry || null,
      service: formService || null,
      description: formDescription || null,
      thumbnailUrl: formThumbnailUrl || null,
      audioUrl: formAudioUrl || null,
      videoUrl: formVideoUrl || null,
      allowDownload: formAllowDownload,
      status: formStatus,
    };
    setPreviewSermon(currentPreview);
    setPreviewModalOpen(true);
  };

  // Upload Thumbnail
  const handleThumbnailUpload = async (file?: File) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp", "image/gif"].includes(file.type)) {
      setError("Please choose a JPEG, PNG, or WebP image.");
      return;
    }
    if (file.size > 15 * 1024 * 1024) {
      setError("Thumbnail image must be 15 MB or smaller.");
      return;
    }

    setImageUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await authUpload<{ url: string }>("/media/upload", form);
      if (!res?.url) throw new Error("Upload did not return a valid URL.");
      setFormThumbnailUrl(res.url);
      setNotice("Thumbnail uploaded successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to upload thumbnail.");
    } finally {
      setImageUploading(false);
    }
  };

  // Upload Audio
  const handleAudioUpload = async (file?: File) => {
    if (!file) return;
    if (
      !/^(audio\/(mpeg|mp3|wav|ogg|aac|m4a|x-m4a))$/i.test(file.type) &&
      !/\.(mp3|wav|ogg|m4a|aac)$/i.test(file.name)
    ) {
      setError("Please choose an MP3, WAV, OGG, or M4A audio file.");
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      setError("Audio file must be 50 MB or smaller.");
      return;
    }

    setAudioUploading(true);
    setError("");
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await authUpload<{ url: string }>("/media/upload", form);
      if (!res?.url) throw new Error("Audio upload did not return a valid URL.");
      setFormAudioUrl(res.url);
      setNotice("Audio file uploaded successfully.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to upload audio sermon.");
    } finally {
      setAudioUploading(false);
    }
  };

  // Save Sermon
  const handleSaveSermon = async (e: FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setError("Sermon title is required.");
      return;
    }
    if (!formSpeakerName.trim() && !formSpeakerId) {
      setError("Speaker is required.");
      return;
    }
    if (!formDate) {
      setError("Sermon date is required.");
      return;
    }

    const finalCategory = formCategory === "Custom" ? customCategory.trim() : formCategory;
    if (!finalCategory) {
      setError("Please specify a category.");
      return;
    }

    if (formStatus === "published" && !await confirm({ title: editingSermon?.status === "published" ? "Save live sermon changes?" : "Publish this sermon?", description: `“${formTitle.trim()}” will be available in the public sermon library.`, confirmLabel: editingSermon?.status === "published" ? "Save live changes" : "Publish sermon" })) return;
    if (formStatus === "archived" && editingSermon?.status !== "archived" && !await confirm({ title: "Archive this sermon?", description: `“${formTitle.trim()}” will be removed from active sermon listings.`, confirmLabel: "Archive sermon", tone: "danger" })) return;
    if (formStatus === "draft" && editingSermon?.status === "published" && !await confirm({ title: "Unpublish this sermon?", description: `“${formTitle.trim()}” will be removed from the public sermon library and saved as a draft.`, confirmLabel: "Save as draft", tone: "danger" })) return;

    setSaving(true);
    setError("");
    setNotice("");

    const payload = {
      title: formTitle.trim(),
      slug: formSlug.trim() || slugify(formTitle),
      speaker: formSpeakerName.trim(),
      speakerId: formSpeakerId || undefined,
      date: formDate,
      category: finalCategory,
      scripture: formScripture.trim() || undefined,
      bibleBook: formBibleBook.trim() || undefined,
      series: formSeries.trim() || undefined,
      ministry: formMinistry.trim() || undefined,
      service: formService.trim() || undefined,
      description: formDescription.trim() || undefined,
      thumbnailUrl: formThumbnailUrl.trim() || undefined,
      audioUrl: formAudioUrl.trim() || undefined,
      videoUrl: formVideoUrl.trim() || undefined,
      allowDownload: formAllowDownload,
      status: formStatus,
    };

    try {
      if (editingSermon) {
        await authMutation(`/admin/sermons/${editingSermon.id}`, "PATCH", payload);
        setNotice("Sermon updated successfully.");
      } else {
        await authMutation("/admin/sermons", "POST", payload);
        setNotice("Sermon created successfully.");
      }
      setSermonModalOpen(false);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save sermon.");
    } finally {
      setSaving(false);
    }
  };

  // Quick Publish / Unpublish
  const togglePublishStatus = async (sermon: Sermon) => {
    setError("");
    setNotice("");
    const action = sermon.status === "published" ? "unpublish" : "publish";
    if (!await confirm({ title: action === "publish" ? "Publish this sermon?" : "Unpublish this sermon?", description: action === "publish" ? `“${sermon.title}” will be available to visitors.` : `“${sermon.title}” will be removed from the public sermon library.`, confirmLabel: action === "publish" ? "Publish sermon" : "Unpublish", tone: action === "publish" ? "primary" : "danger" })) return;
    try {
      await authMutation(`/admin/sermons/${sermon.id}/${action}`, "PATCH");
      setNotice(
        action === "publish"
          ? `“${sermon.title}” is now published and live.`
          : `“${sermon.title}” was unpublished and moved to drafts.`,
      );
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : `Could not ${action} sermon.`);
    }
  };

  // Delete Sermon
  const handleDeleteSermon = async (sermon: Sermon) => {
    if (!await confirm({ title: "Delete this sermon?", description: `“${sermon.title}” will be permanently deleted. This action cannot be undone.`, confirmLabel: "Delete sermon", tone: "danger" })) return;
    setError("");
    setNotice("");
    try {
      await authMutation(`/admin/sermons/${sermon.id}`, "DELETE");
      setNotice(`“${sermon.title}” was deleted.`);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to delete sermon.");
    }
  };

  // Open Speaker Modal
  const openNewSpeaker = () => {
    setEditingSpeaker(null);
    setSpeakerName("");
    setSpeakerTitle("");
    setSpeakerBio("");
    setSpeakerPhotoUrl("");
    setSpeakerEmail("");
    setSpeakerPhone("");
    setSpeakerModalOpen(true);
  };

  const openEditSpeaker = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setSpeakerName(speaker.name);
    setSpeakerTitle(speaker.title ?? "");
    setSpeakerBio(speaker.bio ?? "");
    setSpeakerPhotoUrl(speaker.photoUrl ?? "");
    setSpeakerEmail(speaker.email ?? "");
    setSpeakerPhone(speaker.phone ?? "");
    setSpeakerModalOpen(true);
  };

  // Upload Speaker Photo
  const handleSpeakerPhotoUpload = async (file?: File) => {
    if (!file) return;
    setSpeakerUploading(true);
    try {
      const form = new FormData();
      form.set("file", file);
      const res = await authUpload<{ url: string }>("/media/upload", form);
      if (res?.url) {
        setSpeakerPhotoUrl(res.url);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to upload photo.");
    } finally {
      setSpeakerUploading(false);
    }
  };

  // Save Speaker
  const handleSaveSpeaker = async (e: FormEvent) => {
    e.preventDefault();
    if (!speakerName.trim()) {
      setError("Speaker name is required.");
      return;
    }
    setSaving(true);
    setError("");
    const payload = {
      name: speakerName.trim(),
      title: speakerTitle.trim() || undefined,
      bio: speakerBio.trim() || undefined,
      photoUrl: speakerPhotoUrl.trim() || undefined,
      email: speakerEmail.trim() || undefined,
      phone: speakerPhone.trim() || undefined,
    };

    try {
      if (editingSpeaker) {
        await authMutation(`/admin/speakers/${editingSpeaker.id}`, "PATCH", payload);
        setNotice(`Speaker “${payload.name}” updated.`);
      } else {
        const created = await authMutation<Speaker>("/admin/speakers", "POST", payload);
        setNotice(`Speaker “${payload.name}” added.`);
        // If we opened this from sermon modal, select it automatically
        if (sermonModalOpen && created?.id) {
          setFormSpeakerId(created.id);
          setFormSpeakerName(created.name);
        }
      }
      setSpeakerModalOpen(false);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to save speaker.");
    } finally {
      setSaving(false);
    }
  };

  // Delete Speaker
  const handleDeleteSpeaker = async (speaker: Speaker) => {
    if (!await confirm({ title: "Delete this speaker?", description: `“${speaker.name}” will be deleted. Existing sermons will keep the speaker’s name.`, confirmLabel: "Delete speaker", tone: "danger" })) return;
    try {
      await authMutation(`/admin/speakers/${speaker.id}`, "DELETE");
      setNotice(`Speaker “${speaker.name}” was deleted.`);
      await loadData();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Failed to delete speaker.");
    }
  };

  // Filtered Sermons
  const filteredSermons = useMemo(() => {
    return sermons.filter((s) => {
      const matchesSearch =
        !searchQuery.trim() ||
        `${s.title} ${s.speaker} ${s.scripture ?? ""} ${s.category} ${s.series ?? ""} ${s.description ?? ""}`
          .toLowerCase()
          .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || s.status === statusFilter;
      const matchesSpeaker = speakerFilter === "all" || s.speaker === speakerFilter;
      const matchesCategory = categoryFilter === "all" || s.category === categoryFilter;
      return matchesSearch && matchesStatus && matchesSpeaker && matchesCategory;
    });
  }, [sermons, searchQuery, statusFilter, speakerFilter, categoryFilter]);

  // Unique categories and speakers for filter dropdowns
  const availableCategories = useMemo(
    () => [...new Set(sermons.map((s) => s.category).filter(Boolean))].sort(),
    [sermons],
  );
  const availableSpeakers = useMemo(
    () => [...new Set(sermons.map((s) => s.speaker).filter(Boolean))].sort(),
    [sermons],
  );

  // Statistics
  const stats = useMemo(() => {
    return {
      total: sermons.length,
      published: sermons.filter((s) => s.status === "published").length,
      drafts: sermons.filter((s) => s.status === "draft").length,
      withAudio: sermons.filter((s) => Boolean(s.audioUrl)).length,
      withVideo: sermons.filter((s) => Boolean(s.videoUrl)).length,
    };
  }, [sermons]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary">
            Church · Admin
          </p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground">
            Sermon Management System
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Create, publish, edit, preview, and organize messages, media files, Scripture references, and speakers.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-surface px-4 text-xs font-semibold text-foreground shadow-xs transition hover:bg-surface-strong"
            onClick={openNewSpeaker}
            type="button"
          >
            <User aria-hidden="true" className="mr-2 size-4 text-muted" />
            Add Speaker
          </button>
          <button
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground shadow-md transition hover:bg-primary-hover active:scale-[0.98]"
            onClick={openNewSermon}
            type="button"
          >
            <Plus aria-hidden="true" className="mr-2 size-4" />
            Add Sermon
          </button>
        </div>
      </header>

      {/* Notifications */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-300" role="alert">
          <p>{error}</p>
          <button aria-label="Dismiss error" className="text-red-600 hover:text-red-900" onClick={() => setError("")} type="button">
            <X className="size-4" />
          </button>
        </div>
      )}
      {notice && (
        <div className="flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300" role="status">
          <p>{notice}</p>
          <button aria-label="Dismiss notice" className="text-emerald-600 hover:text-emerald-900" onClick={() => setNotice("")} type="button">
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
        <div className="rounded-2xl border border-border bg-surface p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">Total Sermons</p>
          <p className="mt-1 font-display text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-emerald-200/60 bg-emerald-50/50 p-4 shadow-xs dark:border-emerald-900/40 dark:bg-emerald-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">Published</p>
          <p className="mt-1 font-display text-2xl font-bold text-emerald-800 dark:text-emerald-200">{stats.published}</p>
        </div>
        <div className="rounded-2xl border border-amber-200/60 bg-amber-50/50 p-4 shadow-xs dark:border-amber-900/40 dark:bg-amber-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-300">Drafts</p>
          <p className="mt-1 font-display text-2xl font-bold text-amber-800 dark:text-amber-200">{stats.drafts}</p>
        </div>
        <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-xs">
          <p className="text-xs font-bold uppercase tracking-wider text-primary">With Audio</p>
          <p className="mt-1 font-display text-2xl font-bold text-primary">{stats.withAudio}</p>
        </div>
        <div className="rounded-2xl border border-purple-200/60 bg-purple-50/50 p-4 shadow-xs col-span-2 sm:col-span-1 dark:border-purple-900/40 dark:bg-purple-950/20">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300">With Video</p>
          <p className="mt-1 font-display text-2xl font-bold text-purple-800 dark:text-purple-200">{stats.withVideo}</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-border">
        <button
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "sermons"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
          onClick={() => setActiveTab("sermons")}
          type="button"
        >
          <Mic className="size-4" />
          Sermons ({sermons.length})
        </button>
        <button
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition ${
            activeTab === "speakers"
              ? "border-primary text-primary"
              : "border-transparent text-muted hover:text-foreground"
          }`}
          onClick={() => setActiveTab("speakers")}
          type="button"
        >
          <Users className="size-4" />
          Speakers ({speakers.length})
        </button>
      </div>

      {/* SERMONS TAB */}
      {activeTab === "sermons" && (
        <section className="overflow-hidden rounded-2xl border border-border bg-surface shadow-xs" aria-label="Sermons table">
          {/* Filter Bar */}
          <div className="grid gap-3 border-b border-border p-4 sm:grid-cols-2 lg:grid-cols-4 lg:p-5">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted" />
              <input
                className="h-11 w-full rounded-xl border border-border bg-surface pl-10 pr-3.5 text-sm text-foreground outline-none placeholder:text-muted focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search title, speaker, scripture…"
                type="search"
                value={searchQuery}
              />
            </div>
            <div>
              <select
                className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                onChange={(e) => setStatusFilter(e.target.value)}
                value={statusFilter}
              >
                <option value="all">All publication statuses</option>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <select
                className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                onChange={(e) => setSpeakerFilter(e.target.value)}
                value={speakerFilter}
              >
                <option value="all">All speakers</option>
                {availableSpeakers.map((spk) => (
                  <option key={spk} value={spk}>{spk}</option>
                ))}
              </select>
            </div>
            <div>
              <select
                className="h-11 w-full rounded-xl border border-border bg-surface px-3.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition"
                onChange={(e) => setCategoryFilter(e.target.value)}
                value={categoryFilter}
              >
                <option value="all">All categories</option>
                {availableCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="p-12 text-center text-sm text-muted">
              <RefreshCw className="mx-auto mb-3 size-6 animate-spin text-primary" />
              Loading sermons library…
            </div>
          ) : filteredSermons.length ? (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[55rem] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3.5" scope="col">Sermon</th>
                    <th className="px-5 py-3.5" scope="col">Speaker</th>
                    <th className="px-5 py-3.5" scope="col">Date</th>
                    <th className="px-5 py-3.5" scope="col">Scripture / Topic</th>
                    <th className="px-5 py-3.5" scope="col">Media</th>
                    <th className="px-5 py-3.5" scope="col">Status</th>
                    <th className="px-5 py-3.5 text-right" scope="col">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSermons.map((sermon) => {
                    const status = sermon.status ?? "draft";
                    return (
                      <tr className="transition hover:bg-surface-strong/40" key={sermon.id}>
                        {/* Title & Thumbnail */}
                        <td className="max-w-xs px-5 py-4">
                          <div className="flex items-center gap-3">
                            {sermon.thumbnailUrl ? (
                              <div
                                aria-hidden="true"
                                className="size-12 shrink-0 rounded-xl bg-cover bg-center border border-border shadow-2xs"
                                style={{ backgroundImage: `url("${sermon.thumbnailUrl}")` }}
                              />
                            ) : (
                              <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                                <Mic className="size-5" />
                              </div>
                            )}
                            <div className="min-w-0">
                              <p className="truncate font-display text-sm font-bold text-foreground" title={sermon.title}>
                                {sermon.title}
                              </p>
                              <p className="mt-0.5 truncate text-xs text-muted" title={sermon.slug}>
                                /{sermon.slug}
                              </p>
                              {sermon.series && (
                                <span className="mt-1 inline-block text-[11px] font-semibold text-primary bg-primary/10 px-2 py-0.5 rounded-md">
                                  Series: {sermon.series}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Speaker */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2.5">
                            {sermon.speakerRef?.photoUrl ? (
                              <img
                                alt={sermon.speaker}
                                className="size-8 rounded-full object-cover border border-border"
                                src={sermon.speakerRef.photoUrl}
                              />
                            ) : (
                              <div className="grid size-8 place-items-center rounded-full bg-surface-strong text-muted border border-border">
                                <User className="size-4" />
                              </div>
                            )}
                            <div>
                              <p className="font-display text-xs font-bold text-foreground">{sermon.speaker}</p>
                              {sermon.speakerRef?.title && (
                                <p className="text-[11px] text-muted">{sermon.speakerRef.title}</p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Date */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-muted">
                          {formatSermonDate(sermon.date)}
                        </td>

                        {/* Scripture & Topic */}
                        <td className="px-5 py-4">
                          <p className="text-xs font-bold text-foreground">{sermon.scripture || "—"}</p>
                          <div className="mt-1 flex flex-wrap gap-1">
                            <span className="inline-block rounded-md bg-surface-strong px-2 py-0.5 text-[11px] font-medium text-foreground">
                              {sermon.category}
                            </span>
                            {sermon.bibleBook && (
                              <span className="inline-block rounded-md border border-amber-200/60 bg-amber-50/50 px-2 py-0.5 text-[11px] font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300">
                                {sermon.bibleBook}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Media Availability */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-1.5">
                            {sermon.audioUrl ? (
                              <span
                                className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary"
                                title="Audio sermon available"
                              >
                                <Headphones className="size-3.5" />
                                Audio
                              </span>
                            ) : null}
                            {sermon.videoUrl ? (
                              <span
                                className="inline-flex items-center gap-1 rounded-md bg-purple-50 px-2 py-0.5 text-xs font-semibold text-purple-700 dark:bg-purple-950/40 dark:text-purple-300"
                                title="Video recording available"
                              >
                                <Film className="size-3.5" />
                                Video
                              </span>
                            ) : null}
                            {!sermon.audioUrl && !sermon.videoUrl && (
                              <span className="text-xs text-muted/60">No media</span>
                            )}
                          </div>
                        </td>

                        {/* Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
                              status === "published"
                                ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : status === "archived"
                                  ? "bg-muted/10 text-muted"
                                  : "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300"
                            }`}
                          >
                            <span
                              className={`size-1.5 rounded-full ${
                                status === "published"
                                  ? "bg-emerald-600"
                                  : status === "archived"
                                    ? "bg-muted"
                                    : "bg-amber-500"
                              }`}
                            />
                            {status}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Preview */}
                            <button
                              aria-label={`Preview ${sermon.title}`}
                              className="grid size-8 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                              onClick={() => openPreview(sermon)}
                              title="Preview sermon page"
                              type="button"
                            >
                              <Eye className="size-4" />
                            </button>

                            {/* Quick Publish / Unpublish */}
                            <button
                              aria-label={status === "published" ? "Unpublish sermon" : "Publish sermon"}
                              className={`grid size-8 place-items-center rounded-xl border transition ${
                                status === "published"
                                  ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-900/40 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
                                  : "border-border bg-surface text-muted hover:border-emerald-300 hover:text-emerald-700"
                              }`}
                              onClick={() => togglePublishStatus(sermon)}
                              title={status === "published" ? "Unpublish to draft" : "Publish sermon now"}
                              type="button"
                            >
                              <Globe className="size-4" />
                            </button>

                            {/* Edit */}
                            <button
                              aria-label={`Edit ${sermon.title}`}
                              className="grid size-8 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-primary/40 hover:text-primary"
                              onClick={() => openEditSermon(sermon)}
                              title="Edit sermon"
                              type="button"
                            >
                              <Pencil className="size-4" />
                            </button>

                            {/* Delete */}
                            <button
                              aria-label={`Delete ${sermon.title}`}
                              className="grid size-8 place-items-center rounded-xl border border-border bg-surface text-muted transition hover:border-red-300 hover:text-red-700"
                              onClick={() => handleDeleteSermon(sermon)}
                              title="Delete sermon"
                              type="button"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Mic className="mx-auto size-10 text-slate-300" />
              <h3 className="mt-3 font-semibold text-slate-900">
                {searchQuery || statusFilter !== "all" || speakerFilter !== "all" || categoryFilter !== "all"
                  ? "No matching sermons"
                  : "No sermons yet"}
              </h3>
              <p className="mt-1 text-sm text-slate-500 max-w-sm mx-auto">
                {searchQuery || statusFilter !== "all"
                  ? "Try adjusting your filters or search terms."
                  : "Create your first church sermon to publish it to the public library."}
              </p>
              <button
                className="mt-5 inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm"
                onClick={openNewSermon}
                type="button"
              >
                <Plus className="mr-2 size-4" />
                Add Sermon
              </button>
            </div>
          )}
        </section>
      )}

      {/* SPEAKERS TAB */}
      {activeTab === "speakers" && (
        <section className="space-y-4" aria-label="Speaker directory">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Manage pastors, ministers, and guest preachers associated with church messages.
            </p>
            <button
              className="inline-flex min-h-10 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-hover transition shadow-sm"
              onClick={openNewSpeaker}
              type="button"
            >
              <Plus className="mr-2 size-4" />
              New Speaker
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {speakers.map((spk) => (
              <article
                className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition hover:shadow-md hover:border-primary/30"
                key={spk.id}
              >
                <div>
                  <div className="flex items-start gap-4">
                    {spk.photoUrl ? (
                      <img
                        alt={spk.name}
                        className="size-14 rounded-full object-cover border border-slate-200"
                        src={spk.photoUrl}
                      />
                    ) : (
                      <div className="grid size-14 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
                        <User className="size-6" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <h3 className="font-display font-bold text-slate-900 truncate">{spk.name}</h3>
                      <p className="text-xs text-primary font-medium mt-0.5">{spk.title || "Preacher / Speaker"}</p>
                      <p className="text-xs text-slate-400 mt-1">
                        {spk.sermonCount ?? 0} sermon{(spk.sermonCount ?? 0) === 1 ? "" : "s"} recorded
                      </p>
                    </div>
                  </div>
                  {spk.bio && (
                    <p className="mt-4 line-clamp-3 text-xs leading-relaxed text-slate-600">
                      {spk.bio}
                    </p>
                  )}
                  {(spk.email || spk.phone) && (
                    <div className="mt-3 text-[11px] text-slate-400 space-y-0.5">
                      {spk.email && <p className="truncate">Email: {spk.email}</p>}
                      {spk.phone && <p>Phone: {spk.phone}</p>}
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                  <button
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition"
                    onClick={() => openEditSpeaker(spk)}
                    type="button"
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </button>
                  <button
                    className="inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 transition"
                    onClick={() => handleDeleteSpeaker(spk)}
                    type="button"
                  >
                    <Trash2 className="size-3.5" />
                    Delete
                  </button>
                </div>
              </article>
            ))}

            {!speakers.length && (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-300 p-10 text-center bg-slate-50/50">
                <Users className="mx-auto size-8 text-slate-400" />
                <h4 className="mt-2 font-display font-bold text-slate-800">No speakers defined</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Add church pastors or guest ministers to assign them to messages.
                </p>
                <button
                  className="mt-4 inline-flex items-center rounded-xl bg-primary px-3.5 py-2 text-xs font-semibold text-white hover:bg-primary-hover shadow-sm"
                  onClick={openNewSpeaker}
                  type="button"
                >
                  <Plus className="mr-1.5 size-3.5" />
                  Add First Speaker
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CREATE / EDIT SERMON MODAL */}
      {sermonModalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSermonModalOpen(false);
          }}
        >
          <section
            aria-labelledby="sermon-form-title"
            aria-modal="true"
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl"
            role="dialog"
          >
            {/* Modal Header */}
            <div className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900" id="sermon-form-title">
                  {editingSermon ? `Edit Sermon: ${editingSermon.title}` : "Create New Sermon"}
                </h2>
                <p className="text-xs text-slate-500">
                  Fill in message details, Scripture references, media links, and set publication status.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={openCurrentFormPreview}
                  type="button"
                >
                  <Eye className="size-3.5" />
                  Live Preview
                </button>
                <button
                  aria-label="Close form"
                  className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                  onClick={() => setSermonModalOpen(false)}
                  type="button"
                >
                  <X className="size-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <form className="p-6 space-y-6" onSubmit={handleSaveSermon}>
              {/* SECTION: Basic Information */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
                  1. Basic Information
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Sermon Title */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Sermon Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="e.g. Walking in Faith and Victory"
                      required
                      type="text"
                      value={formTitle}
                    />
                  </div>

                  {/* Slug */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      URL Slug <span className="text-slate-400 font-normal">(auto-generated, customize if desired)</span>
                    </label>
                    <div className="mt-1.5 flex rounded-lg border border-slate-300 bg-slate-50 overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
                      <span className="inline-flex items-center px-3 bg-slate-100 text-xs text-slate-500 border-r border-slate-300">
                        /sermons/
                      </span>
                      <input
                        className="h-10 flex-1 bg-transparent px-3 text-sm outline-none"
                        onChange={(e) => {
                          setFormSlug(slugify(e.target.value));
                          setSlugManuallyEdited(true);
                        }}
                        placeholder="walking-in-faith"
                        type="text"
                        value={formSlug}
                      />
                    </div>
                  </div>

                  {/* Speaker Selector */}
                  <div>
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-semibold text-slate-700">
                        Speaker <span className="text-red-500">*</span>
                      </label>
                      <button
                        className="text-xs font-semibold text-primary hover:text-primary-hover"
                        onClick={openNewSpeaker}
                        type="button"
                      >
                        + New Speaker
                      </button>
                    </div>
                    <select
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        const selectedId = e.target.value;
                        setFormSpeakerId(selectedId);
                        const selectedSpk = speakers.find((s) => s.id === selectedId);
                        if (selectedSpk) setFormSpeakerName(selectedSpk.name);
                      }}
                      required
                      value={formSpeakerId}
                    >
                      <option value="">-- Select Speaker --</option>
                      {speakers.map((spk) => (
                        <option key={spk.id} value={spk.id}>
                          {spk.name} {spk.title ? `(${spk.title})` : ""}
                        </option>
                      ))}
                    </select>
                    {/* Fallback custom speaker name if no speaker profile selected */}
                    {!formSpeakerId && (
                      <input
                        className="mt-2 h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs outline-none focus:border-primary focus:bg-white"
                        onChange={(e) => setFormSpeakerName(e.target.value)}
                        placeholder="Or enter speaker name directly"
                        type="text"
                        value={formSpeakerName}
                      />
                    )}
                  </div>

                  {/* Date */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Sermon Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormDate(e.target.value)}
                      required
                      type="date"
                      value={formDate}
                    />
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Category / Topic <span className="text-red-500">*</span>
                    </label>
                    <select
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormCategory(e.target.value)}
                      value={formCategory}
                    >
                      {STANDARD_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      <option value="Custom">Custom Category...</option>
                    </select>
                    {formCategory === "Custom" && (
                      <input
                        className="mt-2 h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs outline-none focus:border-primary focus:bg-white"
                        onChange={(e) => setCustomCategory(e.target.value)}
                        placeholder="Enter custom category name"
                        required
                        type="text"
                        value={customCategory}
                      />
                    )}
                  </div>

                  {/* Sermon Series */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Sermon Series <span className="text-slate-400 font-normal">(optional)</span>
                    </label>
                    <input
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormSeries(e.target.value)}
                      placeholder="e.g. Walking in the Spirit"
                      type="text"
                      value={formSeries}
                    />
                  </div>

                  {/* Description / Sermon Notes */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700">
                      Description & Study Notes
                    </label>
                    <textarea
                      className="mt-1.5 min-h-24 w-full rounded-lg border border-slate-300 bg-slate-50 p-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Outline the main message points, key thoughts, or devotional takeaways..."
                      rows={4}
                      value={formDescription}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION: Scripture & Dimensions */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
                  2. Scripture & Context
                </h3>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* Scripture Reference */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Scripture Reference <span className="text-slate-400 font-normal">(e.g. Hebrews 11:1, John 3:16-17)</span>
                    </label>
                    <input
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => {
                        setFormScripture(e.target.value);
                        // Auto detect bible book if not set
                        const match = e.target.value.match(/^([1-3]\s+)?[A-Za-z]+/);
                        if (match && (!formBibleBook || formBibleBook === "")) {
                          setFormBibleBook(match[0]);
                        }
                      }}
                      placeholder="e.g. Hebrews 11:1"
                      type="text"
                      value={formScripture}
                    />
                  </div>

                  {/* Primary Bible Book */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Bible Book Filter
                    </label>
                    <select
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormBibleBook(e.target.value)}
                      value={formBibleBook}
                    >
                      <option value="">-- None / Select Book --</option>
                      {STANDARD_BIBLE_BOOKS.map((book) => (
                        <option key={book} value={book}>{book}</option>
                      ))}
                    </select>
                  </div>

                  {/* Service */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Church Service
                    </label>
                    <select
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormService(e.target.value)}
                      value={formService}
                    >
                      <option value="">-- Unspecified --</option>
                      {STANDARD_SERVICES.map((srv) => (
                        <option key={srv} value={srv}>{srv}</option>
                      ))}
                    </select>
                  </div>

                  {/* Ministry */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700">
                      Ministry Group
                    </label>
                    <select
                      className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                      onChange={(e) => setFormMinistry(e.target.value)}
                      value={formMinistry}
                    >
                      <option value="">-- Unspecified --</option>
                      {STANDARD_MINISTRIES.map((min) => (
                        <option key={min} value={min}>{min}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION: Media Management */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
                  3. Media Management
                </h3>

                {/* Thumbnail */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Sermon Thumbnail Image
                  </label>
                  <div className="mt-2 flex flex-col sm:flex-row items-start gap-4">
                    {formThumbnailUrl ? (
                      <div className="relative group size-28 shrink-0 rounded-lg overflow-hidden border border-slate-200">
                        <img
                          alt="Thumbnail preview"
                          className="size-full object-cover"
                          src={formThumbnailUrl}
                        />
                        <button
                          className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition"
                          onClick={() => setFormThumbnailUrl("")}
                          type="button"
                        >
                          <Trash2 className="size-5" />
                        </button>
                      </div>
                    ) : (
                      <div className="grid size-28 shrink-0 place-items-center rounded-lg border-2 border-dashed border-slate-300 text-slate-400 bg-slate-50">
                        <ImageIcon className="size-8" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs">
                          <Upload className="size-3.5" />
                          {imageUploading ? "Uploading image…" : "Choose Image File"}
                          <input
                            accept="image/jpeg,image/png,image/webp"
                            className="hidden"
                            disabled={imageUploading}
                            onChange={(e) => handleThumbnailUpload(e.target.files?.[0])}
                            type="file"
                          />
                        </label>
                        {formThumbnailUrl && (
                          <button
                            className="text-xs font-semibold text-red-600 hover:text-red-800"
                            onClick={() => setFormThumbnailUrl("")}
                            type="button"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs outline-none focus:border-primary focus:bg-white"
                        onChange={(e) => setFormThumbnailUrl(e.target.value)}
                        placeholder="Or paste external image URL..."
                        type="url"
                        value={formThumbnailUrl}
                      />
                      <p className="text-[11px] text-slate-400">
                        Recommended: 16:9 ratio, JPEG, PNG, or WebP up to 15 MB.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audio Upload */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Audio Sermon File
                  </label>
                  <div className="mt-2 space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 shadow-xs">
                        <FileAudio className="size-3.5 text-primary" />
                        {audioUploading ? "Uploading audio sermon…" : "Upload Audio (MP3, WAV, OGG, M4A)"}
                        <input
                          accept="audio/mpeg,audio/mp3,audio/wav,audio/ogg,audio/m4a,audio/aac"
                          className="hidden"
                          disabled={audioUploading}
                          onChange={(e) => handleAudioUpload(e.target.files?.[0])}
                          type="file"
                        />
                      </label>
                      {formAudioUrl && (
                        <button
                          className="text-xs font-semibold text-red-600 hover:text-red-800"
                          onClick={() => setFormAudioUrl("")}
                          type="button"
                        >
                          Clear audio
                        </button>
                      )}
                    </div>
                    <input
                      className="h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-xs outline-none focus:border-primary focus:bg-white"
                      onChange={(e) => setFormAudioUrl(e.target.value)}
                      placeholder="Or paste direct audio file URL (https://...)..."
                      type="url"
                      value={formAudioUrl}
                    />
                    {formAudioUrl && (
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-200">
                        <p className="text-[11px] font-semibold text-slate-600 mb-1 flex items-center gap-1">
                          <Headphones className="size-3 text-primary" />
                          Audio Playback Preview:
                        </p>
                        <audio className="w-full h-8" controls preload="none" src={formAudioUrl}>
                          Audio not supported
                        </audio>
                      </div>
                    )}
                    <label className="flex items-center gap-2 pt-1">
                      <input
                        checked={formAllowDownload}
                        className="size-4 rounded accent-primary"
                        onChange={(e) => setFormAllowDownload(e.target.checked)}
                        type="checkbox"
                      />
                      <span className="text-xs text-slate-700 font-medium">
                        Allow website visitors to download this audio message
                      </span>
                    </label>
                  </div>
                </div>

                {/* Video URL */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700">
                    Video URL <span className="text-slate-400 font-normal">(YouTube or Vimeo link)</span>
                  </label>
                  <input
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                    onChange={(e) => setFormVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=... or https://vimeo.com/..."
                    type="url"
                    value={formVideoUrl}
                  />
                  {formVideoUrl && (() => {
                    const parsed = parseVideoUrl(formVideoUrl);
                    if (parsed.isValid && parsed.embedUrl) {
                      return (
                        <div className="mt-3 aspect-video max-w-sm rounded-lg overflow-hidden border border-slate-200 bg-black">
                          <iframe
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="size-full border-0"
                            src={parsed.embedUrl}
                            title="Video Preview"
                          />
                        </div>
                      );
                    }
                    return (
                      <p className="mt-1 text-xs text-amber-600">
                        Note: For video embeds, please enter a valid YouTube or Vimeo URL.
                      </p>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION: Publication Status */}
              <div className="space-y-3 pt-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary border-b border-primary/20 pb-1">
                  4. Publication Status
                </h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition ${
                      formStatus === "draft"
                        ? "border-amber-500 bg-amber-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      checked={formStatus === "draft"}
                      className="size-4 accent-amber-600"
                      name="status"
                      onChange={() => setFormStatus("draft")}
                      type="radio"
                      value="draft"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Draft</p>
                      <p className="text-[11px] text-slate-500">Only visible to administrators</p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition ${
                      formStatus === "published"
                        ? "border-emerald-500 bg-emerald-50/50"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      checked={formStatus === "published"}
                      className="size-4 accent-emerald-600"
                      name="status"
                      onChange={() => setFormStatus("published")}
                      type="radio"
                      value="published"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Published</p>
                      <p className="text-[11px] text-slate-500">Live on /sermons and public search</p>
                    </div>
                  </label>

                  <label
                    className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3.5 transition ${
                      formStatus === "archived"
                        ? "border-slate-500 bg-slate-100"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <input
                      checked={formStatus === "archived"}
                      className="size-4 accent-slate-600"
                      name="status"
                      onChange={() => setFormStatus("archived")}
                      type="radio"
                      value="archived"
                    />
                    <div>
                      <p className="text-xs font-bold text-slate-900">Archived</p>
                      <p className="text-[11px] text-slate-500">Stored but hidden from public</p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Footer */}
              <div className="flex flex-col-reverse gap-3 border-t border-slate-200 pt-5 sm:flex-row sm:justify-end">
                <button
                  className="min-h-11 rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setSermonModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="min-h-11 rounded-xl bg-primary px-6 text-sm font-semibold text-white hover:bg-primary-hover disabled:opacity-60 transition shadow-sm"
                  disabled={saving || imageUploading || audioUploading}
                  type="submit"
                >
                  {saving ? "Saving Sermon…" : editingSermon ? "Update Sermon" : "Save Sermon"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* CREATE / EDIT SPEAKER MODAL */}
      {speakerModalOpen && (
        <div
          className="fixed inset-0 z-[110] flex items-end justify-center bg-slate-950/60 p-0 sm:items-center sm:p-4 backdrop-blur-xs"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setSpeakerModalOpen(false);
          }}
        >
          <section
            aria-labelledby="speaker-form-title"
            aria-modal="true"
            className="w-full max-w-md rounded-t-2xl bg-white shadow-2xl sm:rounded-2xl overflow-hidden"
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <h2 className="font-display text-base font-bold text-slate-900" id="speaker-form-title">
                {editingSpeaker ? `Edit Speaker: ${editingSpeaker.name}` : "Add New Speaker"}
              </h2>
              <button
                aria-label="Close"
                className="grid size-8 place-items-center rounded-lg border border-slate-200 text-slate-400 hover:bg-slate-50 hover:text-slate-700"
                onClick={() => setSpeakerModalOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>
            <form className="p-6 space-y-4" onSubmit={handleSaveSpeaker}>
              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  onChange={(e) => setSpeakerName(e.target.value)}
                  placeholder="e.g. Pastor John Doe"
                  required
                  type="text"
                  value={speakerName}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Role / Title
                </label>
                <input
                  className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-slate-50 px-3 text-sm outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  onChange={(e) => setSpeakerTitle(e.target.value)}
                  placeholder="e.g. Senior Pastor, Guest Minister"
                  type="text"
                  value={speakerTitle}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Profile Photo
                </label>
                <div className="mt-1.5 flex items-center gap-3">
                  {speakerPhotoUrl ? (
                    <img
                      alt="Speaker"
                      className="size-12 rounded-full object-cover border"
                      src={speakerPhotoUrl}
                    />
                  ) : (
                    <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
                      <User className="size-5" />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <label className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                      <Upload className="size-3" />
                      {speakerUploading ? "Uploading…" : "Upload photo"}
                      <input
                        accept="image/*"
                        className="hidden"
                        disabled={speakerUploading}
                        onChange={(e) => handleSpeakerPhotoUpload(e.target.files?.[0])}
                        type="file"
                      />
                    </label>
                    <input
                      className="h-8 w-full rounded-lg border border-slate-300 bg-slate-50 px-2 text-xs"
                      onChange={(e) => setSpeakerPhotoUrl(e.target.value)}
                      placeholder="Or photo URL"
                      type="url"
                      value={speakerPhotoUrl}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">
                  Biography
                </label>
                <textarea
                  className="mt-1 w-full rounded-lg border border-slate-300 bg-slate-50 p-2.5 text-xs outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20"
                  onChange={(e) => setSpeakerBio(e.target.value)}
                  placeholder="Short bio or ministry background..."
                  rows={3}
                  value={speakerBio}
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Email</label>
                  <input
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 text-xs outline-none focus:border-primary focus:bg-white"
                    onChange={(e) => setSpeakerEmail(e.target.value)}
                    type="email"
                    value={speakerEmail}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Phone</label>
                  <input
                    className="mt-1 h-9 w-full rounded-lg border border-slate-300 bg-slate-50 px-2.5 text-xs outline-none focus:border-primary focus:bg-white"
                    onChange={(e) => setSpeakerPhone(e.target.value)}
                    type="tel"
                    value={speakerPhone}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-200 pt-4">
                <button
                  className="rounded-xl border border-slate-300 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  onClick={() => setSpeakerModalOpen(false)}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-white hover:bg-primary-hover disabled:opacity-60 shadow-sm"
                  disabled={saving || speakerUploading}
                  type="submit"
                >
                  {saving ? "Saving…" : editingSpeaker ? "Save Speaker" : "Create Speaker"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {/* FULL SERMON PREVIEW MODAL */}
      {previewModalOpen && previewSermon && (
        <div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setPreviewModalOpen(false);
          }}
        >
          <section
            aria-labelledby="preview-title"
            aria-modal="true"
            className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
            role="dialog"
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-primary px-6 py-4 text-white">
              <div className="flex items-center gap-2">
                <Sparkles className="size-4 text-accent" />
                <h3 className="font-display font-semibold text-sm">
                  Visitor Preview Mode · {previewSermon.status === "published" ? "Published View" : "Draft Preview"}
                </h3>
              </div>
              <button
                aria-label="Close preview"
                className="grid size-8 place-items-center rounded-lg bg-white/10 text-slate-300 hover:text-white"
                onClick={() => setPreviewModalOpen(false)}
                type="button"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="p-6 sm:p-10 space-y-8 bg-slate-50/50">
              {/* Hero Banner inside preview */}
              <div className="rounded-2xl bg-gradient-to-br from-primary via-slate-900 to-primary-hover p-6 sm:p-8 text-white shadow-lg">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent">
                  <span>{previewSermon.category}</span>
                  <span>•</span>
                  <span>{formatSermonDate(previewSermon.date)}</span>
                  {previewSermon.series && (
                    <>
                      <span>•</span>
                      <span className="text-accent">Series: {previewSermon.series}</span>
                    </>
                  )}
                </div>
                <h1 className="mt-3 text-2xl sm:text-4xl font-display font-bold tracking-tight" id="preview-title">
                  {previewSermon.title}
                </h1>
                <p className="mt-3 text-sm text-slate-300 flex items-center gap-2">
                  <User className="size-4 text-accent" />
                  Preached by <strong className="text-white">{previewSermon.speaker}</strong>
                  {previewSermon.scripture && (
                    <>
                      <span>·</span>
                      <span className="text-slate-200">Scripture: {previewSermon.scripture}</span>
                    </>
                  )}
                </p>
              </div>

              {/* Media Player Area */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                  {/* Video Player */}
                  {previewSermon.videoUrl && (() => {
                    const videoInfo = parseVideoUrl(previewSermon.videoUrl);
                    if (videoInfo.isValid && videoInfo.embedUrl) {
                      return (
                        <div className="overflow-hidden rounded-xl border border-slate-200 bg-black aspect-video shadow-sm">
                          <iframe
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="size-full border-0"
                            src={videoInfo.embedUrl}
                            title={previewSermon.title}
                          />
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Audio Player Card */}
                  {previewSermon.audioUrl && (
                    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="grid size-9 place-items-center rounded-lg bg-primary/10 text-primary">
                            <Headphones className="size-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-900">LISTEN TO MESSAGE</p>
                            <p className="text-[11px] text-slate-500">Full Audio Recording</p>
                          </div>
                        </div>
                        {previewSermon.allowDownload && (
                          <a
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                            download
                            href={previewSermon.audioUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Download className="size-3.5" />
                            Download MP3
                          </a>
                        )}
                      </div>
                      <audio className="w-full" controls preload="none" src={previewSermon.audioUrl}>
                        Audio playback is not supported
                      </audio>
                    </div>
                  )}

                  {/* Message Description & Notes */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs space-y-3">
                    <h4 className="font-display font-bold text-slate-900 text-sm">Message Overview & Notes</h4>
                    <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-line">
                      {previewSermon.description || "No study notes have been attached to this sermon yet."}
                    </p>
                  </div>
                </div>

                {/* Sidebar details */}
                <aside className="space-y-4">
                  {/* Speaker Info Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                      About the Speaker
                    </p>
                    <div className="flex items-center gap-3">
                      {previewSermon.speakerRef?.photoUrl ? (
                        <img
                          alt={previewSermon.speaker}
                          className="size-12 rounded-full object-cover"
                          src={previewSermon.speakerRef.photoUrl}
                        />
                      ) : (
                        <div className="grid size-12 place-items-center rounded-full bg-primary/10 text-primary border border-primary/20">
                          <User className="size-5" />
                        </div>
                      )}
                      <div>
                        <h4 className="font-display font-bold text-sm text-slate-900">{previewSermon.speaker}</h4>
                        <p className="text-xs text-primary font-medium">{previewSermon.speakerRef?.title || "Speaker"}</p>
                      </div>
                    </div>
                    {previewSermon.speakerRef?.bio && (
                      <p className="mt-3 text-xs leading-relaxed text-slate-500">
                        {previewSermon.speakerRef.bio}
                      </p>
                    )}
                  </div>

                  {/* Metadata Card */}
                  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs divide-y divide-slate-100 text-xs">
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400 font-medium">Scripture</span>
                      <span className="font-semibold text-slate-800">{previewSermon.scripture || "—"}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400 font-medium">Bible Book</span>
                      <span className="font-semibold text-slate-800">{previewSermon.bibleBook || "—"}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400 font-medium">Service</span>
                      <span className="font-semibold text-slate-800">{previewSermon.service || "—"}</span>
                    </div>
                    <div className="py-2.5 flex justify-between">
                      <span className="text-slate-400 font-medium">Ministry</span>
                      <span className="font-semibold text-slate-800">{previewSermon.ministry || "—"}</span>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
