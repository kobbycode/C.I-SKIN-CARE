import React, { useState } from 'react';
import { useSiteConfig } from '../context/SiteConfigContext';
import { useNotification } from '../context/NotificationContext';
import SocialIcon from '../components/SocialIcon';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

const Contact: React.FC = () => {
  const { siteConfig } = useSiteConfig();
  const { showNotification } = useNotification();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    subject: 'Product Inquiry',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'contactSubmissions'), {
        ...formData,
        submittedAt: new Date().toISOString(),
        status: 'New'
      });

      setIsSubmitted(true);
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        subject: 'Product Inquiry',
        message: ''
      });
      showNotification('Message sent successfully!', 'success');
    } catch (error) {
      console.error('Error submitting contact form:', error);
      showNotification('Failed to send message. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#FDFCFB] dark:bg-background-dark pt-40 pb-24 transition-colors duration-300">
      {/* Hero Header */}
      <header className="max-w-4xl mx-auto text-center px-6 mb-20">
        <span className="text-[10px] uppercase tracking-[0.4em] text-[#A68966] mb-4 block font-black">
          Get in Touch
        </span>
        <h1 className="font-display text-5xl md:text-6xl text-[#221C1D] dark:text-white mb-8 leading-tight transition-colors">
          Connect With Our Specialists
        </h1>
        <p className="text-base text-stone-500 dark:text-stone-400 font-light leading-relaxed max-w-2xl mx-auto transition-colors">
          Experience the essence of luxury skincare. Whether you have questions
          about our formulations or need a personalized routine, we're here to assist you.
        </p>
      </header>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
        {/* Contact Form Card */}
        <section className="bg-white dark:bg-stone-900 p-10 md:p-14 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.03)] dark:shadow-none border border-stone-100 dark:border-stone-800 transition-colors">
          {isSubmitted ? (
            <div className="text-center py-16 animate-in fade-in zoom-in duration-500">
              <span className="material-symbols-outlined text-[#A68966] text-7xl mb-6 font-light">
                mark_email_read
              </span>
              <h3 className="font-display text-3xl mb-4 text-[#221C1D] dark:text-white transition-colors">Message Received</h3>
              <p className="text-stone-500 dark:text-stone-400 leading-relaxed mb-10 text-sm transition-colors">
                Thank you for reaching out. One of our skincare specialists will
                review your inquiry and respond within 24 hours.
              </p>
              <button
                onClick={() => setIsSubmitted(false)}
                className="text-[#A68966] font-bold uppercase tracking-widest text-[10px] border-b border-[#A68966]/30 pb-1 hover:border-[#A68966] transition-all"
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 transition-colors">
                    First Name
                  </label>
                  <input
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#FDFCFB] dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-4 outline-none focus:ring-1 focus:ring-[#A68966] text-sm text-[#221C1D] dark:text-white transition-all"
                    type="text"
                    placeholder=""
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 transition-colors">
                    Last Name
                  </label>
                  <input
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#FDFCFB] dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-4 outline-none focus:ring-1 focus:ring-[#A68966] text-sm text-[#221C1D] dark:text-white transition-all"
                    type="text"
                    placeholder=""
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 transition-colors">
                  Email Address
                </label>
                <input
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-[#FDFCFB] dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-4 outline-none focus:ring-1 focus:ring-[#A68966] text-sm text-[#221C1D] dark:text-white transition-all"
                  type="email"
                  placeholder=""
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 transition-colors">
                  Subject
                </label>
                <div className="relative">
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#FDFCFB] dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-4 outline-none focus:ring-1 focus:ring-[#A68966] text-sm text-[#221C1D] dark:text-white appearance-none transition-all"
                  >
                    <option>Product Inquiry</option>
                    <option>Order Status</option>
                    <option>Skin Consultation</option>
                    <option>Press & Partnerships</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-[#221C1D] dark:text-stone-300 mb-3 transition-colors">
                  Your Message
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full bg-[#FDFCFB] dark:bg-stone-800 border border-stone-100 dark:border-stone-700 rounded-xl px-4 py-4 outline-none focus:ring-1 focus:ring-[#A68966] min-h-[160px] resize-none text-sm text-[#221C1D] dark:text-white transition-all"
                  placeholder=""
                ></textarea>
              </div>

              <button
                disabled={isSubmitting}
                className="w-full bg-[#A68966] text-white font-black py-5 rounded-xl uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-[#8C7456] active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex justify-center items-center gap-2 shadow-lg shadow-[#A68966]/20"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Processing...
                  </>
                ) : 'Send Message'}
              </button>
            </form>
          )}
        </section>

        {/* Info Column */}
        <section className="lg:pl-12 py-10 space-y-16">
          <div>
            <h2 className="font-display text-4xl text-[#221C1D] dark:text-white mb-12 border-l-[3px] border-[#A68966] pl-6 transition-colors">
              Visit Our Flagship
            </h2>
            <div className="space-y-12">
              {[
                {
                  icon: 'location_on',
                  label: 'Our Location',
                  text: siteConfig.contactInfo.address
                },
                {
                  icon: 'mail',
                  label: 'Email Us',
                  text: siteConfig.contactInfo.email
                },
                {
                  icon: 'phone_iphone',
                  label: 'Call Us',
                  text: siteConfig.contactInfo.phone
                }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-8 group">
                  <div className="w-12 h-12 rounded-full bg-[#A68966]/5 dark:bg-[#A68966]/10 flex items-center justify-center shrink-0 border border-[#A68966]/10 group-hover:bg-[#A68966] group-hover:text-white transition-all duration-500">
                    <span className="material-symbols-outlined text-[#A68966] group-hover:text-white transition-colors">{item.icon}</span>
                  </div>
                  <div>
                    <h4 className="font-black text-[10px] uppercase tracking-[0.2em] text-[#A68966] mb-3">
                      {item.label}
                    </h4>
                    <p className="text-sm font-light text-stone-500 dark:text-stone-400 leading-relaxed whitespace-pre-line transition-colors">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Map Embed */}
          <div className="pt-12 border-t border-stone-100 dark:border-stone-800 transition-colors">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-6 font-bold transition-colors">
              Find Us Locally
            </h4>
            <div className="w-full aspect-video rounded-3xl overflow-hidden border border-stone-100 dark:border-stone-800 shadow-sm transition-shadow hover:shadow-md">
              <iframe
                title="C.I Skin Care Location"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                marginHeight={0}
                marginWidth={0}
                src="https://maps.google.com/maps?q=Audiomate+Center+Market+St,+Accra,+GA-222-2148,+GH&t=&z=15&ie=UTF8&iwloc=&output=embed"
                className="grayscale opacity-80 hover:grayscale-0 hover:opacity-100 transition-all duration-700"
              />
            </div>
          </div>

          <div className="pt-12 border-t border-stone-100 dark:border-stone-800 transition-colors">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400 dark:text-stone-500 mb-8 font-bold transition-colors">
              Follow Our Journey
            </h4>
            <div className="flex gap-4">
              {siteConfig.socialLinks.filter(s => s.url).map(social => (
                <a
                  key={social.platform}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 border border-stone-200 dark:border-stone-700 rounded-full flex items-center justify-center text-[#A68966] hover:border-[#A68966] hover:bg-[#A68966]/5 transition-all duration-300"
                >
                  <SocialIcon platform={social.platform} className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Contact;
