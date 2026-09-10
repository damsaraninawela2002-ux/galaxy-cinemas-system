import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  FiFilm,
  FiUploadCloud,
  FiX,
  FiPlus,
  FiPlay,
  FiCalendar,
  FiClock,
  FiStar,
  FiArrowLeft,
  FiCheck,
  FiAlertCircle,
  FiImage,
  FiUser,
  FiGlobe,
  FiShield
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import { apiService } from '../../services/api';

// Popular standard genres for quick selection chips
const PRESET_GENRES = [
  'Action',
  'Adventure',
  'Animation',
  'Comedy',
  'Crime',
  'Drama',
  'Family',
  'Fantasy',
  'Historical',
  'Horror',
  'Mystery',
  'Romance',
  'Sci-Fi',
  'Superhero',
  'Thriller'
];

const LANGUAGES = [
  'English',
  'Sinhala',
  'Tamil',
  'Hindi',
  'Japanese',
  'Korean',
  'French',
  'Spanish',
  'German',
  'Mandarin'
];

const AGE_RATINGS = [
  { value: 'G', label: 'G — General Audiences' },
  { value: 'PG', label: 'PG — Parental Guidance' },
  { value: 'PG-13', label: 'PG-13 — Parents Strongly Cautioned' },
  { value: 'R', label: 'R — Restricted' },
  { value: 'NC-17', label: 'NC-17 — Adults Only' }
];

// Helper to extract YouTube video ID from various URL formats
export const getYouTubeId = (url) => {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) return match[1];
  // Check if already an 11-char ID
  if (/^[\w-]{11}$/.test(url.trim())) return url.trim();
  return null;
};

const MovieForm = ({ initialData = null, isEdit = false }) => {
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    movie_id: initialData?.movie_id || null,
    title: initialData?.title || '',
    description: initialData?.description || initialData?.synopsis || '',
    genre: Array.isArray(initialData?.genre)
      ? initialData.genre
      : typeof initialData?.genre === 'string' && initialData.genre.trim()
      ? initialData.genre.split(',').map((g) => g.trim()).filter(Boolean)
      : [],
    release_date: initialData?.release_date || new Date().toISOString().split('T')[0],
    duration: initialData?.duration || initialData?.duration_minutes || 120,
    language: initialData?.language || 'English',
    age_rating: initialData?.age_rating || initialData?.rating || 'PG-13',
    director: initialData?.director || '',
    cast: Array.isArray(initialData?.cast)
      ? initialData.cast.map((c) => (typeof c === 'string' ? c : c.name || ''))
      : typeof initialData?.cast === 'string' && initialData.cast.trim()
      ? initialData.cast.split(',').map((c) => c.trim()).filter(Boolean)
      : [],
    poster_url: initialData?.poster_url || '',
    backdrop_url: initialData?.backdrop_url || '',
    trailer_url: initialData?.trailer_url || (initialData?.trailer_id ? `https://www.youtube.com/watch?v=${initialData.trailer_id}` : ''),
    status: initialData?.status === 'ended' ? 'archived' : initialData?.status || 'coming_soon',
    rating: initialData?.rating || '4.5'
  });

  // Inputs for dynamic tags
  const [customGenreInput, setCustomGenreInput] = useState('');
  const [castInput, setCastInput] = useState('');

  // Drag & drop state
  const [isDraggingPoster, setIsDraggingPoster] = useState(false);
  const [isDraggingBackdrop, setIsDraggingBackdrop] = useState(false);

  // Image loading & error states
  const [posterLoading, setPosterLoading] = useState(false);
  const [posterError, setPosterError] = useState(false);
  const [backdropLoading, setBackdropLoading] = useState(false);
  const [backdropError, setBackdropError] = useState(false);

  // Validation errors
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync if initialData changes
  useEffect(() => {
    if (initialData) {
      setFormData({
        movie_id: initialData.movie_id || null,
        title: initialData.title || '',
        description: initialData.description || initialData.synopsis || '',
        genre: Array.isArray(initialData.genre)
          ? initialData.genre
          : typeof initialData.genre === 'string'
          ? initialData.genre.split(',').map((g) => g.trim()).filter(Boolean)
          : [],
        release_date: initialData.release_date || new Date().toISOString().split('T')[0],
        duration: initialData.duration || initialData.duration_minutes || 120,
        language: initialData.language || 'English',
        age_rating: initialData.age_rating || (['G', 'PG', 'PG-13', 'R', 'NC-17'].includes(initialData.rating) ? initialData.rating : 'PG-13'),
        director: initialData.director || '',
        cast: Array.isArray(initialData.cast)
          ? initialData.cast.map((c) => (typeof c === 'string' ? c : c.name || ''))
          : typeof initialData.cast === 'string'
          ? initialData.cast.split(',').map((c) => c.trim()).filter(Boolean)
          : [],
        poster_url: initialData.poster_url || '',
        backdrop_url: initialData.backdrop_url || '',
        trailer_url: initialData.trailer_url || (initialData.trailer_id ? `https://www.youtube.com/watch?v=${initialData.trailer_id}` : ''),
        status: initialData.status === 'ended' ? 'archived' : initialData.status || 'coming_soon',
        rating: initialData.rating || '4.5'
      });
    }
  }, [initialData]);

  // --- Genre Tag Handlers ---
  const handleToggleGenre = (tag) => {
    setFormData((prev) => {
      const exists = prev.genre.includes(tag);
      const updated = exists ? prev.genre.filter((g) => g !== tag) : [...prev.genre, tag];
      if (errors.genre && updated.length > 0) {
        setErrors((e) => ({ ...e, genre: null }));
      }
      return { ...prev, genre: updated };
    });
  };

  const handleAddCustomGenre = (e) => {
    e.preventDefault();
    const trimmed = customGenreInput.trim();
    if (!trimmed) return;
    if (!formData.genre.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, genre: [...prev.genre, trimmed] }));
      if (errors.genre) setErrors((e) => ({ ...e, genre: null }));
    }
    setCustomGenreInput('');
  };

  const handleRemoveGenre = (tag) => {
    setFormData((prev) => ({
      ...prev,
      genre: prev.genre.filter((g) => g !== tag)
    }));
  };

  // --- Cast List Handlers ---
  const handleAddCast = (e) => {
    e?.preventDefault();
    const trimmed = castInput.trim();
    if (!trimmed) return;
    if (!formData.cast.includes(trimmed)) {
      setFormData((prev) => ({ ...prev, cast: [...prev.cast, trimmed] }));
      if (errors.cast) setErrors((e) => ({ ...e, cast: null }));
    }
    setCastInput('');
  };

  const handleRemoveCast = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      cast: prev.cast.filter((_, i) => i !== indexToRemove)
    }));
  };

  // --- Image Upload Mock & Local Handlers ---
  const handleFileUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (field === 'poster_url') {
      setPosterLoading(true);
      setPosterError(false);
    } else if (field === 'backdrop_url') {
      setBackdropLoading(true);
      setBackdropError(false);
    }

    // Create object URL for instant preview
    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, [field]: previewUrl }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: null }));
    toast.success(`${field === 'poster_url' ? 'Poster' : 'Backdrop'} uploaded`);
  };

  const handleFileDrop = (e, field) => {
    e.preventDefault();
    if (field === 'poster_url') setIsDraggingPoster(false);
    if (field === 'backdrop_url') setIsDraggingBackdrop(false);

    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (field === 'poster_url') {
      setPosterLoading(true);
      setPosterError(false);
    } else if (field === 'backdrop_url') {
      setBackdropLoading(true);
      setBackdropError(false);
    }

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({ ...prev, [field]: previewUrl }));
    if (errors[field]) setErrors((err) => ({ ...err, [field]: null }));
    toast.success(`${field === 'poster_url' ? 'Poster' : 'Backdrop'} uploaded`);
  };

  // --- Client-Side Validation ---
  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Title is required';
    if (!formData.description.trim()) errs.description = 'Synopsis description is required';
    if (!formData.genre || formData.genre.length === 0) errs.genre = 'Select at least one genre';
    if (!formData.language.trim()) errs.language = 'Language is required';
    if (!formData.age_rating) errs.age_rating = 'Age rating is required';
    if (!formData.director.trim()) errs.director = 'Director name is required';
    if (!formData.cast || formData.cast.length === 0) errs.cast = 'Add at least one cast member';
    if (!formData.release_date) {
      errs.release_date = 'Release date is required';
    } else if (!/^\d{4}-\d{2}-\d{2}$/.test(formData.release_date)) {
      errs.release_date = 'Date must be in YYYY-MM-DD format';
    }
    if (!formData.duration || Number(formData.duration) <= 0) {
      errs.duration = 'Duration must be greater than 0 minutes';
    }
    if (!formData.poster_url.trim()) errs.poster_url = 'Poster image is required';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // --- Submit Handlers ---
  const handleSubmit = async (targetStatus) => {
    const finalStatus = targetStatus || formData.status;
    const dataToSave = {
      ...formData,
      status: finalStatus,
      duration: Number(formData.duration),
      duration_minutes: Number(formData.duration)
    };

    if (!validate()) {
      toast.error('Please fix validation errors before saving');
      return;
    }

    setIsSubmitting(true);
    try {
      if (isEdit) {
        // Edit flow
        await apiService.editMovie(dataToSave);
        toast.success(`"${dataToSave.title}" updated successfully!`);
      } else {
        // Add flow
        await apiService.addMovie(dataToSave);
        toast.success(
          finalStatus === 'coming_soon' && targetStatus === 'coming_soon'
            ? `"${dataToSave.title}" saved as draft!`
            : `"${dataToSave.title}" published successfully!`
        );
      }

      // Success toast + redirect to Movie Management list on save
      navigate('/admin/movies');
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to save movie details');
    } finally {
      setIsSubmitting(false);
    }
  };

  const youtubeVideoId = getYouTubeId(formData.trailer_url);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Top Header & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
            <Link to="/admin/movies" className="hover:text-white transition flex items-center gap-1">
              <FiArrowLeft className="h-3.5 w-3.5" /> Movie Management
            </Link>
            <span>/</span>
            <span className="text-[#E50914] font-semibold">{isEdit ? 'Edit Movie' : 'Add New Movie'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-3">
            <FiFilm className="h-7 w-7 text-[#E50914]" />
            {isEdit ? `Edit "${formData.title || 'Movie'}"` : 'Add New Movie to Catalog'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure synopsis, classification ratings, media assets, cast credits, and scheduling status
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="rounded-xl border border-white/[0.1] bg-[#141824] px-4 py-2.5 text-xs font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit('coming_soon')}
            className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2.5 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
          >
            Save as Draft
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={() => handleSubmit()}
            className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-6 py-2.5 text-xs font-black text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:brightness-110 transition flex items-center gap-2"
          >
            <FiCheck className="h-4 w-4" />
            {isEdit ? 'Save Changes' : 'Publish Movie'}
          </button>
        </div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-8">
        {/* ============================================================ */}
        {/* SECTION 1: BASIC INFO */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0E111B]/80 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20">
              <span className="font-mono font-black text-sm">01</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Basic Info</h2>
              <p className="text-xs text-slate-400">Core catalog metadata, storyline, language, and age classification</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Movie Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => {
                  setFormData({ ...formData, title: e.target.value });
                  if (errors.title) setErrors({ ...errors, title: null });
                }}
                placeholder="e.g. Spider-Man: Brand New Day"
                className={`w-full rounded-xl border ${
                  errors.title ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/[0.08]'
                } bg-[#141824] px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition`}
              />
              {errors.title && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="h-3 w-3" /> {errors.title}
                </p>
              )}
            </div>

            {/* Language & Age Rating Row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Language */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Original Language <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.language}
                    onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-3 text-sm text-white focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition appearance-none cursor-pointer"
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang} className="bg-[#141824] text-white">
                        {lang}
                      </option>
                    ))}
                  </select>
                  <FiGlobe className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4" />
                </div>
              </div>

              {/* Age Rating */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-200 block">
                  Age Rating <span className="text-red-400">*</span>
                </label>
                <div className="relative">
                  <select
                    value={formData.age_rating}
                    onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                    className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-3 text-sm text-white focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition appearance-none cursor-pointer font-bold"
                  >
                    {AGE_RATINGS.map((r) => (
                      <option key={r.value} value={r.value} className="bg-[#141824] text-white">
                        {r.label}
                      </option>
                    ))}
                  </select>
                  <FiShield className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Description / Synopsis */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-200 block">
              Full Synopsis / Description <span className="text-red-400">*</span>
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => {
                setFormData({ ...formData, description: e.target.value });
                if (errors.description) setErrors({ ...errors, description: null });
              }}
              placeholder="Provide the comprehensive storyline overview, character arcs, and premise..."
              className={`w-full rounded-2xl border ${
                errors.description ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/[0.08]'
              } bg-[#141824] p-4 text-sm text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition leading-relaxed`}
            />
            {errors.description && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                <FiAlertCircle className="h-3 w-3" /> {errors.description}
              </p>
            )}
          </div>

          {/* Genre: Multi-Select Tag Input */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-200">
                Genre Tags <span className="text-red-400">*</span> (Multi-select tag chips)
              </label>
              <span className="text-[11px] text-slate-400">
                {formData.genre.length} genre{formData.genre.length === 1 ? '' : 's'} selected
              </span>
            </div>

            {/* Selected Genre Chips */}
            <div className="min-h-[48px] rounded-2xl border border-white/[0.08] bg-[#121522] p-3 flex flex-wrap items-center gap-2">
              {formData.genre.length === 0 ? (
                <span className="text-xs text-slate-500 italic">No genres selected yet. Click quick tags below or enter custom genres.</span>
              ) : (
                formData.genre.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#E50914]/20 to-[#B91C1C]/20 border border-[#E50914]/40 px-3 py-1.5 text-xs font-bold text-red-300 shadow-sm animate-fadeIn"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveGenre(tag)}
                      className="rounded-full hover:bg-red-500/30 p-0.5 text-red-400 hover:text-white transition"
                      title={`Remove ${tag}`}
                    >
                      <FiX className="h-3 w-3" />
                    </button>
                  </span>
                ))
              )}
            </div>
            {errors.genre && (
              <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                <FiAlertCircle className="h-3 w-3" /> {errors.genre}
              </p>
            )}

            {/* Preset Genre Selection Buttons */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Popular Categories:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_GENRES.map((preset) => {
                  const isSelected = formData.genre.includes(preset);
                  return (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => handleToggleGenre(preset)}
                      className={`rounded-xl px-3 py-1 text-xs font-bold transition flex items-center gap-1 ${
                        isSelected
                          ? 'bg-[#E50914] text-white shadow-[0_0_12px_rgba(229,9,20,0.4)]'
                          : 'border border-white/[0.08] bg-[#161B2B] text-slate-300 hover:border-white/20 hover:text-white'
                      }`}
                    >
                      {isSelected && <FiCheck className="h-3 w-3" />}
                      {preset}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Genre Tag Input */}
            <div className="flex items-center gap-2 pt-1 max-w-sm">
              <input
                type="text"
                value={customGenreInput}
                onChange={(e) => setCustomGenreInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomGenre(e);
                  }
                }}
                placeholder="Add custom tag (e.g. IMAX 3D, Cyberpunk)..."
                className="flex-1 rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomGenre}
                className="rounded-xl border border-white/[0.1] bg-[#161B2B] px-3.5 py-2 text-xs font-bold text-slate-200 hover:bg-white/[0.08] hover:text-white transition flex items-center gap-1"
              >
                <FiPlus className="h-3.5 w-3.5" /> Add
              </button>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 2: MEDIA ASSETS */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0E111B]/80 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20">
              <span className="font-mono font-black text-sm">02</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Media Assets</h2>
              <p className="text-xs text-slate-400">High-resolution poster art, cinematic backdrop hero banner, and YouTube trailer</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Poster Upload + Live Preview */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 block">
                Poster Artwork <span className="text-red-400">*</span> (2:3 Aspect Ratio)
              </label>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingPoster(true); }}
                onDragLeave={() => setIsDraggingPoster(false)}
                onDrop={(e) => handleFileDrop(e, 'poster_url')}
                className={`relative rounded-2xl border-2 border-dashed p-4 transition text-center flex flex-col items-center justify-center gap-2 ${
                  isDraggingPoster
                    ? 'border-[#E50914] bg-[#E50914]/10'
                    : 'border-white/[0.12] bg-[#121522] hover:border-white/25'
                }`}
              >
                <FiUploadCloud className="h-8 w-8 text-[#E50914]" />
                <p className="text-xs font-semibold text-slate-200">
                  Drag & drop poster image file here, or{' '}
                  <label className="text-[#E50914] hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'poster_url')}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-[10px] text-slate-400">PNG, JPG, WEBP recommended up to 10MB</p>
              </div>

              {/* Or Direct URL Input */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Or enter image URL:</span>
                <input
                  type="text"
                  value={formData.poster_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, poster_url: val });
                    setPosterError(false);
                    if (val.trim()) setPosterLoading(true);
                    if (errors.poster_url) setErrors({ ...errors, poster_url: null });
                  }}
                  placeholder="https://... or /images/shrek5.jpg"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>
              {errors.poster_url && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="h-3 w-3" /> {errors.poster_url}
                </p>
              )}

              {/* Poster Live Preview (2:3 Aspect Ratio Box) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">Poster Artwork Preview</span>
                  <span className="text-[10px] text-slate-400 font-mono">2:3 Aspect Ratio</span>
                </div>
                <div className="w-full aspect-[2/3] rounded-xl overflow-hidden bg-gray-800 relative border border-white/[0.1] shadow-lg flex items-center justify-center">
                  {/* Subtle skeleton / pulse loading state */}
                  {posterLoading && (
                    <div className="absolute inset-0 bg-gray-700/80 animate-pulse flex flex-col items-center justify-center gap-2 z-10">
                      <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] text-slate-300 font-semibold">Loading poster...</span>
                    </div>
                  )}

                  {/* Fallback / Error State */}
                  {posterError ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2 w-full h-full bg-gray-800">
                      <FiAlertCircle className="h-10 w-10 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Image failed to load</span>
                      <span className="text-[11px] text-slate-400 max-w-[200px]">Check image URL or upload a different file</span>
                    </div>
                  ) : formData.poster_url ? (
                    <img
                      src={formData.poster_url}
                      alt="Poster Artwork Preview"
                      onLoad={() => setPosterLoading(false)}
                      onError={() => {
                        setPosterLoading(false);
                        setPosterError(true);
                      }}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2">
                      <FiImage className="h-10 w-10 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-400">No poster image selected</span>
                      <span className="text-[10px] text-slate-500">Paste URL or drop an image above</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Backdrop Upload + Live Preview */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-200 block">
                Backdrop Banner (16:9 Landscape Hero Artwork)
              </label>

              {/* Drag & Drop Area */}
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingBackdrop(true); }}
                onDragLeave={() => setIsDraggingBackdrop(false)}
                onDrop={(e) => handleFileDrop(e, 'backdrop_url')}
                className={`relative rounded-2xl border-2 border-dashed p-4 transition text-center flex flex-col items-center justify-center gap-2 ${
                  isDraggingBackdrop
                    ? 'border-[#E50914] bg-[#E50914]/10'
                    : 'border-white/[0.12] bg-[#121522] hover:border-white/25'
                }`}
              >
                <FiImage className="h-8 w-8 text-[#E50914]" />
                <p className="text-xs font-semibold text-slate-200">
                  Drag & drop wide banner file here, or{' '}
                  <label className="text-[#E50914] hover:underline cursor-pointer">
                    browse
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, 'backdrop_url')}
                      className="hidden"
                    />
                  </label>
                </p>
                <p className="text-[10px] text-slate-400">1920x1080 banner recommended</p>
              </div>

              {/* Or Direct URL Input */}
              <div className="space-y-1">
                <span className="text-[11px] text-slate-400 font-medium">Or enter backdrop URL:</span>
                <input
                  type="text"
                  value={formData.backdrop_url}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({ ...formData, backdrop_url: val });
                    setBackdropError(false);
                    if (val.trim()) setBackdropLoading(true);
                  }}
                  placeholder="https://... or /images/shrek5.jpg"
                  className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none"
                />
              </div>

              {/* Backdrop Live Preview (16:9 Aspect Ratio Box) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-slate-300">Backdrop Banner Preview</span>
                  <span className="text-[10px] text-slate-400 font-mono">16:9 Aspect Ratio</span>
                </div>
                <div className="w-full aspect-[16/9] rounded-xl overflow-hidden bg-gray-800 relative border border-white/[0.1] shadow-lg flex items-center justify-center">
                  {/* Subtle skeleton / pulse loading state */}
                  {backdropLoading && (
                    <div className="absolute inset-0 bg-gray-700/80 animate-pulse flex flex-col items-center justify-center gap-2 z-10">
                      <div className="w-8 h-8 border-2 border-[#E50914] border-t-transparent rounded-full animate-spin" />
                      <span className="text-[11px] text-slate-300 font-semibold">Loading banner...</span>
                    </div>
                  )}

                  {/* Fallback / Error State */}
                  {backdropError ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-400 gap-2 w-full h-full bg-gray-800">
                      <FiAlertCircle className="h-10 w-10 text-amber-400" />
                      <span className="text-xs font-bold text-slate-200">Image failed to load</span>
                      <span className="text-[11px] text-slate-400 max-w-xs">Check image URL or upload a different file</span>
                    </div>
                  ) : formData.backdrop_url ? (
                    <img
                      src={formData.backdrop_url}
                      alt="Backdrop Banner Preview"
                      onLoad={() => setBackdropLoading(false)}
                      onError={() => {
                        setBackdropLoading(false);
                        setBackdropError(true);
                      }}
                      className="w-full h-full object-cover object-center"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center p-6 text-center text-slate-500 gap-2">
                      <FiImage className="h-10 w-10 text-slate-600" />
                      <span className="text-xs font-semibold text-slate-400">No backdrop banner selected</span>
                      <span className="text-[10px] text-slate-500">Paste URL or drop an image above</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* YouTube Trailer Link with Embedded Player Preview */}
          <div className="space-y-3 pt-2 border-t border-white/[0.06]">
            <label className="text-xs font-bold text-slate-200 block">
              YouTube Trailer Link (with Live Embedded Video Preview)
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.trailer_url}
                onChange={(e) => setFormData({ ...formData, trailer_url: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=example_shrek5 or https://youtu.be/..."
                className="w-full rounded-xl border border-white/[0.08] bg-[#141824] pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition"
              />
              <FiPlay className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#E50914] h-4 w-4" />
            </div>

            {/* Live YouTube Preview Player Once Valid URL Entered */}
            {youtubeVideoId ? (
              <div className="p-4 rounded-2xl border border-white/[0.1] bg-[#121522] space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    Valid YouTube Link Detected (Video ID: {youtubeVideoId})
                  </span>
                  <span className="text-[11px] text-slate-400">Live Player Preview</span>
                </div>
                <div className="aspect-video w-full rounded-xl overflow-hidden shadow-2xl border border-white/[0.08] bg-black">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${youtubeVideoId}`}
                    title="Movie Trailer Preview"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>
              </div>
            ) : formData.trailer_url ? (
              <p className="text-[11px] text-amber-400 font-medium">
                Enter a standard YouTube link (e.g. youtube.com/watch?v=... or youtu.be/...) to load live player preview.
              </p>
            ) : null}
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 3: CAST & CREW */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0E111B]/80 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20">
              <span className="font-mono font-black text-sm">03</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Cast & Crew</h2>
              <p className="text-xs text-slate-400">Director credit and dynamic interactive cast roster</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Director */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Director <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.director}
                  onChange={(e) => {
                    setFormData({ ...formData, director: e.target.value });
                    if (errors.director) setErrors({ ...errors, director: null });
                  }}
                  placeholder="e.g. Christopher Nolan or Walt Dohrn"
                  className={`w-full rounded-xl border ${
                    errors.director ? 'border-red-500 ring-2 ring-red-500/20' : 'border-white/[0.08]'
                  } bg-[#141824] pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none focus:ring-2 focus:ring-[#E50914]/20 transition`}
                />
                <FiUser className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
              {errors.director && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="h-3 w-3" /> {errors.director}
                </p>
              )}
            </div>

            {/* Cast List: Dynamic item add/remove */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200">
                  Cast Members <span className="text-red-400">*</span> (Dynamic tag list)
                </label>
                <span className="text-[11px] text-slate-400">
                  {formData.cast.length} actor{formData.cast.length === 1 ? '' : 's'} added
                </span>
              </div>

              {/* Input to add cast member */}
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={castInput}
                  onChange={(e) => setCastInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddCast(e);
                    }
                  }}
                  placeholder="Type actor name (e.g. Tom Holland) and press Add..."
                  className="flex-1 rounded-xl border border-white/[0.08] bg-[#141824] px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:border-[#E50914] focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddCast}
                  className="rounded-xl bg-[#E50914] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#F40612] shadow-sm transition flex items-center gap-1"
                >
                  <FiPlus className="h-4 w-4" /> Add
                </button>
              </div>
              {errors.cast && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="h-3 w-3" /> {errors.cast}
                </p>
              )}

              {/* Dynamic Cast Cards / Chips */}
              <div className="min-h-[50px] rounded-2xl border border-white/[0.08] bg-[#121522] p-3 flex flex-wrap gap-2">
                {formData.cast.length === 0 ? (
                  <span className="text-xs text-slate-500 italic">No cast members added yet. Type a name above to add.</span>
                ) : (
                  formData.cast.map((actor, idx) => (
                    <div
                      key={idx}
                      className="inline-flex items-center gap-2 rounded-xl border border-white/[0.1] bg-[#181D2E] px-3 py-1.5 text-xs text-slate-200 shadow-sm"
                    >
                      <div className="h-5 w-5 rounded-full bg-[#E50914]/20 text-[#E50914] flex items-center justify-center font-bold text-[10px]">
                        {actor.charAt(0)}
                      </div>
                      <span className="font-semibold">{actor}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCast(idx)}
                        className="p-0.5 text-slate-400 hover:text-red-400 rounded-full hover:bg-white/[0.05] transition"
                        title={`Remove ${actor}`}
                      >
                        <FiX className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================ */}
        {/* SECTION 4: SCHEDULING & RATING */}
        {/* ============================================================ */}
        <div className="rounded-3xl border border-white/[0.08] bg-[#0E111B]/80 backdrop-blur-xl p-6 sm:p-8 space-y-6 shadow-xl">
          <div className="flex items-center gap-3 border-b border-white/[0.06] pb-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#E50914]/10 text-[#E50914] border border-[#E50914]/20">
              <span className="font-mono font-black text-sm">04</span>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white">Scheduling & Rating</h2>
              <p className="text-xs text-slate-400">Release timeline, theatrical runtime, rotation status, and review metrics</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Release Date */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Release Date <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={formData.release_date}
                  onChange={(e) => {
                    setFormData({ ...formData, release_date: e.target.value });
                    if (errors.release_date) setErrors({ ...errors, release_date: null });
                  }}
                  className={`w-full rounded-xl border ${
                    errors.release_date ? 'border-red-500' : 'border-white/[0.08]'
                  } bg-[#141824] px-3.5 py-3 text-xs text-white focus:border-[#E50914] focus:outline-none transition`}
                />
              </div>
              {errors.release_date && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="h-3 w-3" /> {errors.release_date}
                </p>
              )}
            </div>

            {/* Duration (minutes) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Duration (minutes) <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  min="1"
                  value={formData.duration}
                  onChange={(e) => {
                    setFormData({ ...formData, duration: Number(e.target.value) });
                    if (errors.duration) setErrors({ ...errors, duration: null });
                  }}
                  className={`w-full rounded-xl border ${
                    errors.duration ? 'border-red-500' : 'border-white/[0.08]'
                  } bg-[#141824] pl-10 pr-4 py-3 text-xs text-white focus:border-[#E50914] focus:outline-none transition font-mono`}
                />
                <FiClock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
              </div>
              {errors.duration && (
                <p className="text-[11px] text-red-400 flex items-center gap-1 font-medium">
                  <FiAlertCircle className="h-3 w-3" /> {errors.duration}
                </p>
              )}
            </div>

            {/* Status */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                Catalog Status <span className="text-red-400">*</span>
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-xl border border-white/[0.08] bg-[#141824] px-3.5 py-3 text-xs font-bold text-white focus:border-[#E50914] focus:outline-none transition cursor-pointer"
              >
                <option value="now_showing">🟢 Now Showing</option>
                <option value="coming_soon">🟡 Coming Soon</option>
                <option value="archived">⚪ Archived</option>
              </select>
            </div>

            {/* Rating: Read-only auto calculated display */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-200 block">
                User Rating (Auto-calculated)
              </label>
              <div className="rounded-xl border border-white/[0.08] bg-[#141824]/50 px-3.5 py-2.5 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-amber-400 font-black">
                  <FiStar className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span>{isEdit ? `${formData.rating || '4.5'} / 5.0` : 'New Movie'}</span>
                </div>
                <span className="text-[10px] text-slate-400 italic">
                  {isEdit ? 'Read-only from reviews' : 'Calculated upon reviews'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400">
                Admins cannot manually set ratings; this score aggregates customer reviews.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-white/[0.08]">
          <button
            type="button"
            onClick={() => navigate('/admin/movies')}
            className="rounded-xl border border-white/[0.1] bg-[#141824] px-6 py-3 text-xs font-bold text-slate-300 hover:bg-white/[0.08] hover:text-white transition"
          >
            Cancel & Return to Movies
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSubmitting}
              onClick={() => handleSubmit('coming_soon')}
              className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-5 py-3 text-xs font-bold text-amber-400 hover:bg-amber-500/20 transition"
            >
              Save as Draft
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl bg-gradient-to-r from-[#E50914] to-[#B91C1C] px-8 py-3 text-xs font-black text-white shadow-[0_0_20px_rgba(229,9,20,0.4)] hover:brightness-110 transition flex items-center gap-2"
            >
              <FiCheck className="h-4 w-4" />
              {isEdit ? 'Save Changes' : 'Publish Movie'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default MovieForm;
