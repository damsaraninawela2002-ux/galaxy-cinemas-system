import React, { useState } from 'react';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Clock, 
  Send, 
  CheckCircle2, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp, 
  MessageSquare,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { MOCK_CINEMAS, MOCK_FAQS } from './data/mockData';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    branch: 'Galaxy Cinema Poruwadanda',
    category: 'Ticket & Refund Support',
    message: ''
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        branch: 'Galaxy Cinema Poruwadanda',
        category: 'Ticket & Refund Support',
        message: ''
      });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#080B14] text-slate-100 pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Header Hero */}
        <div className="relative rounded-3xl overflow-hidden border border-white/[0.08] bg-gradient-to-r from-indigo-950/50 via-[#101426] to-slate-900/60 p-6 sm:p-12 shadow-2xl text-center">
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl mx-auto space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-black uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5" />
              Guest Concierge & Help
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white font-serif">
              We're Here to Help
            </h1>
            <p className="text-sm sm:text-base text-slate-300">
              Have questions about booking tickets, hosting private screenings, or lost items at our theaters? Get in touch with our team.
            </p>
          </div>
        </div>

        {/* 3 Cinema Locations Quick Cards */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-slate-400">
            <MapPin className="w-4 h-4 text-indigo-400" />
            Our Cinema Locations
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {MOCK_CINEMAS.map((cinema) => (
              <div
                key={cinema.theater_id}
                className="rounded-3xl border border-white/[0.08] bg-[#101426] overflow-hidden shadow-xl hover:border-white/20 transition group flex flex-col justify-between"
              >
                <div className="h-44 overflow-hidden relative">
                  <img
                    src={cinema.image}
                    alt={cinema.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#101426] via-transparent to-transparent" />
                  <span className="absolute bottom-3 left-4 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-md border border-white/[0.1] text-[10px] font-bold text-amber-300">
                    {cinema.location}
                  </span>
                </div>

                <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white font-serif">{cinema.name}</h3>
                    <p className="text-xs text-slate-400 flex items-start gap-1.5 leading-relaxed">
                      <MapPin className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                      {cinema.address}
                    </p>
                    <p className="text-xs text-slate-300 flex items-center gap-1.5">
                      <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      {cinema.contact_number}
                    </p>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-400 flex-shrink-0" />
                      Box Office: 10:00 AM – 11:30 PM Daily
                    </p>
                  </div>

                  <div className="pt-4 border-t border-white/[0.06] flex flex-wrap gap-1.5">
                    {cinema.amenities.slice(0, 3).map(a => (
                      <span key={a} className="text-[10px] font-semibold text-slate-300 px-2 py-0.5 rounded-md bg-white/[0.04]">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 2-Column Section: Contact Form & FAQ Accordion */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Contact Inquiry Form (6 Cols) */}
          <div className="lg:col-span-6 rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-indigo-400">
                Direct Message
              </span>
              <h2 className="text-2xl font-black text-white font-serif tracking-tight mt-1">
                Send Us a Message
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Our customer experience team typically responds in under 2 hours.
              </p>
            </div>

            {submitted ? (
              <div className="p-6 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-3 animate-fade-in">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <h4 className="text-base font-bold text-white">Message Received!</h4>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  Thank you for reaching out. A guest services representative will follow up via email shortly.
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-2 px-4 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-xs font-bold text-white transition"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Your Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Elena Rostova"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="elena@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Preferred Cinema
                    </label>
                    <select
                      value={formData.branch}
                      onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                      className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      {MOCK_CINEMAS.map(c => (
                        <option key={c.theater_id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1.5">
                      Inquiry Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
                    >
                      <option>Ticket & Refund Support</option>
                      <option>Private Screening & Events</option>
                      <option>Concessions & VIP Dining</option>
                      <option>Lost & Found Inquiries</option>
                      <option>Feedback & General Questions</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    How Can We Help?
                  </label>
                  <textarea
                    rows={4}
                    placeholder="Provide relevant booking reference or details..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    required
                    className="w-full rounded-xl bg-[#090C16] border border-white/[0.1] px-3.5 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500 font-medium resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sending Your Message...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Submit Inquiry
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Frequently Asked Questions Accordion (6 Cols) */}
          <div className="lg:col-span-6 rounded-3xl border border-white/[0.08] bg-[#101426] p-6 sm:p-8 shadow-2xl space-y-6">
            <div>
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" />
                Frequently Asked Questions
              </span>
              <h2 className="text-2xl font-black text-white font-serif tracking-tight mt-1">
                Common Guest Queries
              </h2>
            </div>

            <div className="space-y-3">
              {MOCK_FAQS.map((faq, index) => {
                const isOpen = openFaqIndex === index;
                return (
                  <div
                    key={faq.q}
                    className="rounded-2xl border border-white/[0.07] bg-[#090C16] overflow-hidden transition"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      className="w-full p-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-white hover:text-indigo-400 transition"
                    >
                      <span>{faq.q}</span>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/[0.04] pt-3 animate-fade-in">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
