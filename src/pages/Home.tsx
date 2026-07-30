import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';
import api from '../utils/api';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar, MapPin, Clock, Video, HeartHandshake,
  Compass, Send, Flame, Users, Phone, Mail, User, Pin,
  Play, BookOpen, Gift, Quote, X, Award
} from 'lucide-react';
import pastorPhotoFallback from '../assets/pastor_photo.png';

// Hardcoded Ministries Info
const MINISTRIES = [
  {
    title: "Children's Sunday School",
    desc: "బాలుడు నడువవలసిన త్రోవను వానికి నేర్పుము వాడు పెద్దవాడైనప్పుడు దానినుండి తొలగిపోడు (సామెతలు 22:6)",
    icon: Flame,
    color: "from-amber-500/20 to-orange-500/20"
  },
  {
    title: "Prayer Ministry",
    desc: "అడుగుడి మీకియ్యబడును, వెదకుడి మీకు దొరకును   (మత్తయి 7:7)",
    icon: Video,
    color: "from-blue-500/20 to-indigo-500/20"
  },
  {
    title: "Worship Service",
    desc: "ఆయన మన దేవుడు మనము ఆయన పాలించు ప్రజలము ఆయన మేపు గొఱ్ఱెలము. (కీర్తన 95:6)",
    icon: Users,
    color: "from-emerald-500/20 to-teal-500/20"
  },
  {
    title: "Youth Service",
    desc: "యౌవనస్థులు దేనిచేత తమ నడత శుద్ధిపరచు కొందురు?నీ వాక్యమునుబట్టి దానిని జాగ్రత్తగా చూచుకొనుట చేతనే గదా?(కీర్తనలు 119:9)",
    icon: Users,
    color: "from-rose-500/20 to-pink-500/20"
  },
  {
    title: "Women's Ministry",
    desc: "జ్ఞానవంతురాలు తన యిల్లు కట్టును, మూఢురాలు తన చేతులతో తన యిల్లు ఊడబెరుకును (సామెతలు 14:1)",
    icon: HeartHandshake,
    color: "from-violet-500/20 to-purple-500/20"
  }
];

// Local encouraging Bible verses rotation
const BIBLE_VERSES = [
  {
    text: "కృపచేతనే మీరు విశ్వాసముద్వారా రక్షింపబడ్డారు. ఇది మీవలన కలిగినది కాదు; దేవుని వరమే.",
    ref: "ఎఫెసీయులకు 2:8"
  },
  {
    text: "నీ వాక్యము నా పాదములకు దీపమును, నా త్రోవకు వెలుగునై యున్నది.",
    ref: "కీర్తనలు 119:105"
  },
  {
    text: "యేసు అతనితో, నేనే మార్గమును, సత్యమును, జీవమునై యున్నాను; నా ద్వారానే తప్ప ఎవడును తండ్రియొద్దకు రాడు అని చెప్పెను.",
    ref: "యోహాను 14:6"
  },
  {
    text: "ప్రభువు నా కాపరి; నాకు కొదువయుండదు.",
    ref: "కీర్తనలు 23:1"
  },
  {
    text: "నీవు భయపడకుము, నేను నీకు తోడైయున్నాను; దిగులుపడకుము, నేను నీ దేవుడను.",
    ref: "యెషయా 41:10"
  }
];

const TIMINGS = [
  { title: "Sunday School", time: "07:30 AM - 09:30 AM", desc: "A place where children learn God’s Word, grow in faith, and discover the love of Jesus." },
  { title: "Sunday Worship", time: "10:00 AM - 12:30 AM", desc: "Come together in joyful worship, hear God’s Word, and experience His presence as we grow in faith and fellowship." },
  { title: "Youth Fellowship, Prayer & Study", time: "12:30 AM - 01:30 AM", desc: "A place where young people come together in faith, fellowship, and worship, growing closer to Christ and inspiring one another to live for His purpose." },
  { title: "Wednesday Prayer & Study", time: "06:30 PM - 08:30 PM", desc: "Come together in prayer and the study of God’s Word, growing deeper in faith, wisdom, and fellowship." },
  { title: "Friday Fellowship", time: "06:30 PM - 08:30 PM", desc: "Join us for a blessed time of prayer and Bible study, seeking God’s presence and growing together in His Word." }

];

const TESTIMONIALS = [
  { name: "John Piper", role: "Ministry Member", text: "మనము దేవునిలో ఎంత సంతృప్తి పొందుతామో, అంతగా మన ద్వారా దేవుడు మహిమపరచబడతాడు." },
  { name: "Charles Spurgeon", role: "Ministry Member", text: "విశ్వాసం అంటే దేవుడు ఏమి చేయబోతున్నాడో తెలియకపోయినా, ఆయనను నమ్మడం." },
  { name: "Brother Oswald Chambers", role: "Ministry Member", text: "ప్రార్థన మన పరిస్థితులను మాత్రమే మార్చదు; అది మన హృదయాలను కూడా మారుస్తుంది." }
];



// Helper function to format time as 12-hour hh:mm AM/PM consistently
const formatEventTime = (dateStr: string) => {
  try {
    const date = new Date(dateStr.slice(0, 16));
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // hour '0' should be '12'
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    const hoursStr = hours < 10 ? '0' + hours : hours;
    return `${hoursStr}:${minutesStr} ${ampm}`;
  } catch (e) {
    return '';
  }
};

// Countdown timer helper component
const CountdownTimer: React.FC<{
  targetDate: string;
  title: string;
  location: string;
  description: string;
  onTimeUp?: () => void;
}> = ({ targetDate, title, location, description, onTimeUp }) => {
  const [timeLeft, setTimeLeft] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);
  const notifiedRef = React.useRef(false);

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setTimeLeft(null);
        if (difference > -60000 && !notifiedRef.current) { // Trigger only within a 1-minute window of the actual start
          notifiedRef.current = true;
          if (onTimeUp) onTimeUp();

          // Trigger HTML5 Desktop Notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(`Upcoming Fellowship: ${title}`, {
              body: `Starts now! Location: ${location}\n${description}`,
              icon: '/favicon.ico'
            });
          }
        }
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate, title, location, description, onTimeUp]);

  if (!timeLeft) {
    return <span className="text-xs text-rose-500 font-semibold uppercase tracking-wider">Started / Concluded</span>;
  }

  return (
    <div className="flex gap-2 text-xs font-mono text-church-gold mt-1.5 font-bold">
      <span>{timeLeft.days}d</span>:
      <span>{timeLeft.hours}h</span>:
      <span>{timeLeft.minutes}m</span>:
      <span>{timeLeft.seconds}s</span>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();


  // Page States
  const [settings, setSettings] = useState<any>({});
  const [events, setEvents] = useState<any[]>([]);
  const [prayers, setPrayers] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [sermons, setSermons] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [loadingSermons, setLoadingSermons] = useState(true);
  const [loadingPhotos, setLoadingPhotos] = useState(true);

  // Custom interactive states
  const [showPastorModal, setShowPastorModal] = useState(false);

  const [activeTestimonial, setActiveTestimonial] = useState(0);

  // Contact Form State
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);

  // Daily Bible Verse (rotates every day)
  const getDailyVerse = () => {
    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 1).getTime()) / 86400000);
    return BIBLE_VERSES[dayOfYear % BIBLE_VERSES.length];
  };
  const dailyVerse = getDailyVerse();

  // Fetch Homepage Content
  useEffect(() => {
    api.get('/api/settings/')
      .then((res) => {
        setSettings(res.data || {});
      })
      .catch((err) => {
        console.error('Settings API Error:', err);
      });

    api.get('/api/events/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];

        const future = data.filter(
          (e: any) => new Date(e.event_date) > new Date()
        );

        setEvents(future.slice(0, 3));
      })
      .catch((err) => {
        console.error('Events API Error:', err);
        setEvents([]);
      });

    api.get('/api/prayers/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];

        setPrayers(data.slice(0, 4));
      })
      .catch((err) => {
        console.error('Prayers API Error:', err);
        setPrayers([]);
      });

    api.get('/api/announcements/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];

        setAnnouncements(data.slice(0, 3));
      })
      .catch((err) => {
        console.error('Announcements API Error:', err);
        setAnnouncements([]);
      });

    api.get('/api/live-streams/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];

        setSermons(data.slice(0, 3));
      })
      .catch((err) => {
        console.error('Live Streams API Error:', err);
        setSermons([]);
      })
      .finally(() => {
        setLoadingSermons(false);
      });

    api.get('/api/gallery/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.results)
            ? res.data.results
            : [];

        setPhotos(data.slice(0, 6));
      })
      .catch((err) => {
        console.error('Gallery API Error:', err);
        setPhotos([]);
      })
      .finally(() => {
        setLoadingPhotos(false);
      });

    // Request browser notification permissions on mount
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactName || !contactEmail || !contactSubject || !contactMessage) {
      addToast('Please fill out all contact fields.', 'warning');
      return;
    }

    setSendingMessage(true);
    try {
      await api.post('/api/contact-messages/', {
        name: contactName,
        email: contactEmail,
        subject: contactSubject,
        message: contactMessage
      });
      addToast('Your contact message has been sent successfully. We will get back to you shortly.', 'success');
      setContactName('');
      setContactEmail('');
      setContactSubject('');
      setContactMessage('');
    } catch (err) {
      addToast('Failed to send contact message. Please try again.', 'error');
    } finally {
      setSendingMessage(false);
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="relative font-sans text-slate-200">

      {/* 1. HERO SECTION */}
      <section id="home" className="relative min-h-screen flex items-center justify-center text-center px-4 overflow-hidden pt-23 ">
        <div className="max-w-4xl mx-auto z-10 space-y-8 select-none py-16">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-4"
          >
            <div className="inline-block border-2 border-church-gold/45 rounded-2xl px-6 py-4 bg-church-blue/50 shadow-[0_0_25px_rgba(212,175,55,0.12)] transition-all duration-300 hover:border-church-gold/80 hover:shadow-[0_0_35px_rgba(212,175,55,0.22)]">
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-wider font-display uppercase leading-none text-transparent bg-clip-text bg-gradient-to-r from-church-gold via-church-gold-light to-church-gold whitespace-nowrap">
                {settings.church_name || "CARMEL BIBLE CHURCH"}
              </h1>
            </div>
            <p className="text-lg sm:text-2xl font-bold tracking-widest text-slate-100 uppercase drop-shadow-md">
              We believe the bible, <span className="text-transparent bg-clip-text bg-gradient-to-r from-church-gold to-church-gold-light">we teach the bible</span>
            </p>
            {settings.hero_subtitle ? (
              <>
                <p className="text-slate-350 text-sm sm:text-2xl max-w-2xl mx-auto leading-relaxed">
                  {settings.hero_subtitle}
                </p>
                {settings.hero_subtitle_telugu && (
                  <p className="text-slate-350 text-sm sm:text-2xl max-w-2xl mx-auto leading-relaxed mt-2.5">
                    {settings.hero_subtitle_telugu}
                  </p>
                )}
              </>
            ) : (
              <p className="text-slate-350 text-sm sm:text-2xl max-w-2xl mx-auto leading-relaxed">
                దేవుని వాక్యము మా పాదములకు దీపమును, మా త్రోవకు వెలుగునై యున్నది.
              </p>
            )}
          </motion.div>

          {/* Hero Bible Verse */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="p-6 max-w-3xl mx-auto rounded-2xl border border-church-gold/30 bg-church-blue/95 backdrop-blur-md shadow-2xl relative overflow-hidden"
          >
            <p className="text-sm sm:text-base text-slate-200 italic font-serif sm:whitespace-nowrap">
              "కృపచేతనే మీరు విశ్వాసముద్వారా రక్షింపబడ్డారు. ఇది మీవలన కలిగినది కాదు; దేవుని వరమే..."
            </p>
            <span className="block text-xs text-church-gold font-bold mt-2 uppercase tracking-widest">ఎఫెసీయులకు 2:8</span>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => scrollToSection('timings')}
              className="w-full sm:w-auto px-8 py-3.5 bg-church-gold text-church-blue hover:bg-church-gold-hover font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-lg hover:shadow-church-gold/15"
            >
              Join Worship
            </button>
            <button
              onClick={() => navigate('/live-stream')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white/5 border border-church-gold/30 hover:border-church-gold text-slate-200 hover:text-white font-bold text-sm tracking-wider uppercase rounded-xl transition-all shadow-md"
            >
              Watch Live
            </button>
          </motion.div>
        </div>
      </section>      <section id="about" className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col gap-12">

            {/* Church Vision / Welcome */}
            <div className="space-y-6 text-center flex flex-col items-center">
              <span className="text-xs font-black uppercase text-church-gold tracking-widest block"></span>
              <h2 className="text-5xl sm:text-5xl uppercase font-extrabold text-white tracking-tight font-display">
                " Welcome to Carmel Bible Church "
              </h2>
              <p className="text-slate-350 leading-relaxed text-sm sm:text-base max-w-4xl mx-auto">
                {settings.welcome_message || 'Carmel Bible Church is a fellowship dedicated to the glory of God through the preaching of His Word, authentic community life, and sacrificial service to others. We stand firm on reformed, expository doctrinal foundations.'}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-8 w-full text-left">
                <div className="p-6 rounded-2xl glassmorphism-dark">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-church-gold/10 text-church-gold rounded-xl border border-church-gold/25">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-white text-sm tracking-wider uppercase font-display">Our Vision</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {settings.vision ? (
                      <>
                        <span className="block">
                          {settings.vision}
                        </span>
                        {settings.vision_telugu && (
                          <span className="block mt-4">
                            {settings.vision_telugu}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="block">
                          To know Christ and to make Him known through sound biblical teaching, discipleship, and evangelism.
                        </span>
                        <span className="block mt-4">
                          క్రీస్తును తెలిసికొని, ఆయనను అందరికీ తెలియజేస్తూ, దేవుని వాక్యములో స్థిరపడిన విశ్వాసుల సమాజాన్ని నిర్మించుట.
                        </span>
                      </>
                    )}
                  </p>
                </div>

                <div className="p-6 rounded-2xl glassmorphism-dark">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2.5 bg-church-gold/10 text-church-gold rounded-xl border border-church-gold/25">
                      <HeartHandshake className="w-5 h-5" />
                    </div>
                    <h4 className="font-extrabold text-white text-sm tracking-wider uppercase font-display">Our Mission</h4>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-400">
                    {settings.mission ? (
                      <>
                        <span className="block">
                          {settings.mission}
                        </span>
                        {settings.mission_telugu && (
                          <span className="block mt-3">
                            {settings.mission_telugu}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="block">
                          To preach the Gospel, make disciples of all nations, and serve our local community with the love of Christ.
                        </span>
                        <span className="block mt-3">
                          దేవుని వాక్యాన్ని విశ్వసనీయంగా బోధించుట, సువార్తను ప్రకటించుట, శిష్యులను చేయుట, ప్రార్థనలో ఎదుగుట, ప్రేమతో సంఘానికీ సమాజానికీ సేవ చేయుట.
                        </span>
                      </>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/*  Bible Verse card */}
            <div className="max-w-3xl mx-auto w-full mt-4">
              <motion.div
                whileHover={{ y: -5 }}
                className="p-8 rounded-3xl border border-church-gold/20 bg-church-blue-light/40 shadow-2xl relative overflow-hidden text-center"
              >
                <div className="absolute top-0 right-0 p-6 opacity-[0.03]">
                  <Compass className="w-40 h-40" />
                </div>
                <div className="flex justify-center mb-4">
                  <span className="inline-block text-[10px] font-semibold tracking-wider text-church-gold uppercase bg-church-gold/10 px-3 py-1 rounded-full border border-church-gold/20">
                    డేవుని వాక్యం.
                  </span>
                </div>
                <div className="flex justify-center text-church-gold/30 mb-2">
                  <Quote className="w-8 h-8" />
                </div>
                <blockquote className="text-lg sm:text-xl font-medium font-serif leading-relaxed text-slate-100 mb-4 italic">
                  "{dailyVerse.text}"
                </blockquote>
                <cite className="block text-xs font-bold text-church-gold uppercase tracking-widest not-italic">
                  — {dailyVerse.ref}
                </cite>
              </motion.div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. MEET OUR PASTOR SECTION */}
      <section className="py-28 relative z-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs font-black uppercase text-church-gold tracking-widest">సంఘ కాపరి </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
              Meet Our Pastor
            </h2>
          </div>

          <div className="p-8 sm:p-12 rounded-3xl glassmorphism-dark shadow-2xl flex flex-col md:flex-row gap-8 items-center border border-church-gold/15">
            {/* Pastor Photo and Coordinates */}
            <div className="shrink-0 flex flex-col items-center gap-4 text-center">
              <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-church-gold shadow-lg relative group">
                <img
                  src={pastorPhotoFallback}
                  alt={settings.pastor_name || 'Shyam Chevuri'}
                  className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = pastorPhotoFallback;
                  }}
                />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-bold text-church-gold uppercase tracking-wider block">
                  {settings.pastor_designation || 'Pastor - Bible Teacher'}
                </span>
                <h3 className="text-xl font-extrabold text-white font-display">
                  {settings.pastor_name || 'Shyam Chevuri'}
                </h3>
              </div>
            </div>

            {/* Pastor Welcome Message */}
            <div className="flex-1 space-y-4">
              <span className="inline-flex items-center gap-1.5 text-xs text-church-gold font-bold bg-church-gold/10 px-3 py-1 rounded-full border border-church-gold/70">
                <Award className="w-4 h-4" /> Over 14 Years of Ministry Experience
              </span>
              <p className="text-sm font-semibold text-slate-100 italic leading-relaxed">
                "{settings.pastor_welcome_message || 'We invite you to join us as we worship our Savior, study His word, and fellowship together. Whether you are looking for answers or searching for a spiritual home, you are welcome here.'}"
              </p>
              <p className="text-xs sm:text-sm text-slate-405 leading-relaxed">
                {settings.pastor_bio ? settings.pastor_bio.slice(0, 160) + '...' : 'Pastor Shyam Chevuri has been serving the congregation at Carmel Bible Church with faithfulness and dedication. He holds a degree in theology and has spent over 14 years preaching expository sermons...'}
              </p>

              {/* Pastor Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-slate-350">
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 text-church-gold" />
                  <span>{settings.contact_email || 'pastor@carmelbiblechurch.org'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-church-gold" />
                  <span>{settings.contact_phone || '87908 73190'}</span>
                </div>
              </div>

              {/* Pastor Social Media */}
              <div className="flex items-center gap-3 pt-3">
                <a href="https://www.facebook.com/syam.chevuri.9/" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:border-church-gold hover:text-church-gold transition-all" aria-label="Facebook">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c4.56-.93 8-4.96 8-9.75z" /></svg>
                </a>
                <a href="https://www.youtube.com/@Shyam_Chevuri" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:border-church-gold hover:text-church-gold transition-all" aria-label="YouTube">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.002 3.002 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noopener noreferrer" className="p-2 bg-white/5 rounded-xl border border-white/10 hover:border-church-gold hover:text-church-gold transition-all" aria-label="Instagram">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z" /></svg>
                </a>
              </div>

              {/* Read More button */}
              <div className="pt-2">
                <button
                  onClick={() => setShowPastorModal(true)}
                  className="px-5 py-2 text-xs font-bold text-church-gold border border-church-gold/40 rounded-xl hover:bg-church-gold hover:text-church-blue hover:border-transparent transition-all"
                >
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PASTOR BIO MODAL */}
      <AnimatePresence>
        {showPastorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowPastorModal(false)}
              className="absolute inset-0 bg-slate-950/80"
            />
            {/* Modal Box */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto glassmorphism-dark p-6 sm:p-8 rounded-3xl shadow-2xl border border-church-gold/25 z-10"
            >
              <button
                onClick={() => setShowPastorModal(false)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-church-gold hover:bg-white/5 rounded-xl transition-all"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row gap-5 items-center">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-church-gold shadow-md shrink-0">
                    <img
                      src={pastorPhotoFallback}
                      alt="Pastor Shyam Chevuri"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = pastorPhotoFallback;
                      }}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-church-gold uppercase tracking-wider block">{settings.pastor_designation || 'Pastor - Bible Teacher'}</span>
                    <h3 className="text-2xl font-bold font-display text-white mt-1">{settings.pastor_name || 'Shyam Chevuri'}</h3>
                    <p className="text-xs text-slate-400 mt-0.5">Serving Carmel Bible Church since 2014</p>
                  </div>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-4 text-slate-300 text-sm leading-relaxed">
                  <h4 className="font-bold text-white tracking-wide uppercase text-xs text-church-gold">Pastoral Message</h4>
                  <p className="italic">
                    "{settings.pastor_welcome_message || 'Welcome to our church home. I invite you to join us this Sunday!'}"
                  </p>
                  <h4 className="font-bold text-white tracking-wide uppercase text-xs text-church-gold">Biography & Credentials</h4>
                  <p>
                    {settings.pastor_bio || 'Pastor Shyam Chevuri has been serving the congregation at Carmel Bible Church with faithfulness and dedication. He holds a degree in theology and has spent over 14 years preaching expository sermons, mentoring young leaders, and spearheading local community aid initiatives.'}
                  </p>
                  <p>
                    His ministry focus is grounded in Reformed theology, expository verse-by-verse preaching, and pastoral care. He believes in teaching the full counsel of God so that the body of Christ is mature and equipped for every good work.
                  </p>
                  <p>
                    Our respected Pastor is a devoted follower of Jesus Christ and a faithful servant of God who carries the Bible and lives according to its teachings. He is a passionate and active spiritual leader who has a special connection with the youth and constantly inspires, guides, and trains them to grow in faith, character, and leadership. With dedication, wisdom, and a heart for God’s people, he faithfully leads and serves the church community, working tirelessly for its spiritual growth and development.
                  </p>
                  <p>
                    He is also the author of the book <b>"LOGOS"</b>, a meaningful work written through his knowledge, faith, and spiritual insight that reflects his deep understanding of God's Word and his passion for sharing biblical truths with others. The authorship, patent, and all related rights and returns of the book are registered under his name. Above all, he is committed to contributing his time, knowledge, talents, and efforts entirely for the growth and ministry of the church.
                  </p>
                  <p>
                    Through his preaching, leadership, youth ministry, teaching, and personal guidance, he continues to be a source of inspiration and encouragement to many people. His life and ministry reflect his deep love for God, his dedication to the Bible, and his sincere desire to serve the church and build a strong generation of faithful followers of Christ.
                  </p>
                  <h4 className="font-bold text-white tracking-wide uppercase text-xs text-church-gold">Ministry Focus Areas</h4>
                  <div className="text-xs font-semibold text-church-gold bg-church-gold/10 px-3.5 py-2.5 rounded-xl border border-church-gold/20 inline-block">
                    {settings.pastor_ministry_info || 'Committed to teaching reformed theology, pastoral counseling, expository preaching, and equipping saints for global missions.'}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. CHURCH TIMINGS SECTION */}
      <section id="timings" className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-church-gold tracking-widest">WORSHIP TIMES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
              Our Church Timings
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-md mx-auto">
              Join us weekly for corporate worship, fellowship, prayer, and deep study of the Scriptures. <br />
              దేవుని సంఘములో భాగస్వాములై, ఆయన ఆరాధనలో ఏకమై, ఆయన సన్నిధిలో సమృద్ధిగా దీవెనలు పొందండి.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TIMINGS.map((t, idx) => (
              <div
                key={idx}
                className="p-6 rounded-3xl glassmorphism-dark shadow-lg border border-church-gold/10 hover:border-church-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="p-3 bg-church-gold/10 text-church-gold border border-church-gold/25 rounded-2xl inline-block">
                    <Clock className="w-5 h-5" />
                  </div>
                  <h3 className="font-bold text-base text-white tracking-wide font-display">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {t.desc}
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-800/80 text-xs font-bold text-church-gold">
                  {t.time}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. TESTIMONIALS SECTION */}
      <section className="py-28 relative z-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-church-gold tracking-widest">TESTIMONIES</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
              Words From Our Family
            </h2>
          </div>

          <div className="relative p-8 sm:p-12 rounded-3xl glassmorphism-dark border border-church-gold/15 shadow-2xl text-center overflow-hidden">
            <Quote className="w-20 h-20 text-church-gold/5 absolute -top-4 -left-4 select-none pointer-events-none" />

            <div className="min-h-[160px] flex items-center justify-center">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <p className="text-base sm:text-lg text-slate-200 leading-relaxed italic font-serif">
                  "{TESTIMONIALS[activeTestimonial].text}"
                </p>
                <div>
                  <h4 className="font-extrabold text-white text-sm tracking-wider uppercase font-display">
                    {TESTIMONIALS[activeTestimonial].name}
                  </h4>
                  <span className="text-[10px] text-church-gold font-bold uppercase tracking-wider block mt-0.5">
                    {TESTIMONIALS[activeTestimonial].role}
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center items-center gap-2 mt-8">
              {TESTIMONIALS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTestimonial(idx)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${idx === activeTestimonial ? 'bg-church-gold w-6' : 'bg-slate-700 hover:bg-slate-600'
                    }`}
                  aria-label={`Testimonial slide ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 6. MINISTRIES */}
      <section id="ministries" className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-church-gold tracking-widest">OUR SERVICE</span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
              Our Active Ministries
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-2 max-w-xl mx-auto">
              Discover areas where you can grow, build authentic fellowship, and serve the body of Christ.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {MINISTRIES.map((m, idx) => {
              const Icon = m.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-3xl glassmorphism-dark border border-church-gold/10 hover:border-church-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col items-center text-center justify-between cursor-pointer"
                >
                  <div className="space-y-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${m.color} text-church-gold inline-flex border border-church-gold/15`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-sm tracking-wide text-white font-display">
                      {m.title}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-4">
                      {m.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. LATEST SERMONS SECTION */}
      <section id="sermons" className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-black uppercase text-church-gold tracking-widest">EXPOSITORY PREACHING</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
                Latest Ceremonies
              </h2>
            </div>
            <button
              onClick={() => navigate('/live-stream')}
              className="px-6 py-2.5 text-xs font-black tracking-widest uppercase border border-church-gold/40 text-church-gold rounded-xl hover:bg-church-gold hover:text-church-blue hover:border-transparent transition-all"
            >
              Browse Library
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {loadingSermons ? (
              [1, 2, 3].map((n) => (
                <div key={n} className="rounded-3xl border border-church-gold/10 bg-slate-900/40 h-80 animate-pulse flex flex-col justify-between p-6">
                  <div className="space-y-4 w-full">
                    <div className="h-4 bg-slate-850 rounded w-1/4"></div>
                    <div className="h-6 bg-slate-850 rounded w-3/4"></div>
                    <div className="h-4 bg-slate-850 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-slate-850 rounded w-full mt-4"></div>
                </div>
              ))
            ) : sermons.length > 0 ? (
              sermons.map((s) => (
                <div
                  key={s.id}
                  className="group rounded-3xl border border-church-gold/10 bg-slate-900/40 overflow-hidden shadow-lg hover:border-church-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between cursor-pointer"
                  onClick={() => s.youtube_id && setActiveVideoId(s.youtube_id)}
                >
                  <div>
                    {/* YouTube Thumbnail Preview */}
                    <div className="aspect-video w-full bg-slate-950 relative overflow-hidden group-hover:brightness-[0.9] transition-all">
                      {s.youtube_id ? (
                        <>
                          <img
                            src={`https://img.youtube.com/vi/${s.youtube_id}/hqdefault.jpg`}
                            alt={s.title}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                            <div className="w-12 h-12 rounded-full bg-church-gold hover:bg-church-gold-hover hover:scale-110 transition-all flex items-center justify-center shadow-lg text-church-blue">
                              <Play className="w-5 h-5 fill-current ml-0.5" />
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                          <Video className="w-8 h-8" />
                        </div>
                      )}
                    </div>

                    <div className="p-6 space-y-3">
                      <div className="flex items-center justify-between text-[10px] font-mono text-church-gold font-bold uppercase">
                        <span>CEREMONY DETAILS</span>
                        <span>{new Date(s.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white font-display line-clamp-2 leading-snug">
                        {s.title}
                      </h3>
                    </div>
                  </div>

                  <div className="px-6 py-4.5 bg-slate-950/40 border-t border-slate-850 flex items-center justify-between text-xs text-slate-400">
                    <span className="font-semibold text-slate-350">Pastor Shyam Chevuri</span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (s.youtube_id) setActiveVideoId(s.youtube_id);
                      }}
                      className="flex items-center gap-1 text-church-gold hover:text-church-gold-hover font-bold text-xs"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" /> Watch Now
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
                No ceremonies listed at this time. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 8. DONATIONS / GIVE SECTION */}
      <section className="py-24 relative z-10 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="p-8 sm:p-12 rounded-3xl glassmorphism-dark border-2 border-church-gold/25 shadow-2xl relative overflow-hidden text-center space-y-6">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02]">
              <Gift className="w-48 h-48" />
            </div>
            <span className="text-xs font-black uppercase text-church-gold tracking-widest block">OFFERING"S (డేవుని కానుకలు)</span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight font-display">
              Offerings & Donations.
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
              "Each one must give as he has decided in his heart, not reluctantly or under compulsion, for God loves a cheerful giver." — 2 Corinthians 9:7.<br /><br />   "సణుగుకొనకయు బలవంతముగా కాకయు ప్రతివాడును తన హృదయములో నిశ్చయించుకొనిన ప్రకారము ఇయ్యవలెను; దేవుడు ఉత్సాహముగా ఇచ్చువానిని ప్రేమించును"<br /><br />Support our ministries and outreach initiatives of all Members .
            </p>
            <div className="pt-2">
              <button
                onClick={() => navigate('/give')}
                className="px-8 py-3 bg-church-gold text-church-blue hover:bg-church-gold-hover font-black tracking-widest uppercase rounded-xl transition-all shadow-lg hover:shadow-church-gold/20"
              >
                Give Online Now
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 9. UPCOMING EVENTS */}
      <section className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-xs font-black uppercase text-church-gold tracking-widest">FELLOWSHIPS</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
                Upcoming Events
              </h2>
            </div>
            <button
              onClick={() => navigate('/events')}
              className="text-xs font-bold text-church-gold hover:underline tracking-wider uppercase"
            >
              See All Events
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {events.length > 0 ? (
              events.map((event) => (
                <div
                  key={event.id}
                  className="group rounded-3xl border border-church-gold/10 bg-slate-900/40 overflow-hidden shadow-lg flex flex-col justify-between hover:border-church-gold hover:shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:-translate-y-1.5 transition-all duration-300 cursor-pointer"
                >
                  <div>
                    {event.event_image && (
                      <div className="h-44 w-full bg-slate-950 overflow-hidden relative border-b border-church-gold/5">
                        <img
                          src={event.event_image}
                          alt={event.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      </div>
                    )}
                    <div className="p-6 space-y-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5 text-[10px] text-church-gold font-bold bg-church-gold/10 px-2.5 py-1 rounded-full border border-church-gold/20">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(event.event_date.slice(0, 16)).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                        <CountdownTimer
                          targetDate={event.event_date.slice(0, 16)}
                          title={event.title}
                          location={event.location}
                          description={event.description}
                          onTimeUp={() => {
                            addToast(`Upcoming Fellowship: "${event.title}" has started!`, "success");
                            // Trigger backend notification email dispatch
                            api.post(`/api/events/${event.id}/notify_members/`)
                              .then(() => { })
                              .catch(() => { });
                          }}
                        />
                      </div>

                      <h3 className="text-lg font-bold text-white font-display line-clamp-1">
                        {event.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                        {event.description}
                      </p>
                    </div>
                  </div>

                  <div className="px-6 py-4 bg-slate-950/40 border-t border-slate-850 flex items-center justify-between text-[11px] text-slate-400">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <span>{formatEventTime(event.event_date)}</span>
                    </div>
                    <div className="flex items-center gap-1 max-w-[150px] truncate">
                      <MapPin className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="truncate">{event.location}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400">
                No upcoming events listed at this time. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 10. PHOTO GALLERY PREVIEW */}
      <section className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-16 gap-4">
            <div className="text-center sm:text-left">
              <span className="text-xs font-black uppercase text-church-gold tracking-widest">CHURCH MEMORIES</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
                Church Related Photo Gallery.
              </h2>
            </div>
            <button
              onClick={() => navigate('/gallery')}
              className="px-6 py-2.5 text-xs font-black tracking-widest uppercase border border-church-gold/40 text-church-gold rounded-xl hover:bg-church-gold hover:text-church-blue hover:border-transparent transition-all"
            >
              View Full Gallery
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {loadingPhotos ? (
              [1, 2, 3, 4, 5, 6].map((n) => (
                <div key={n} className="h-64 rounded-3xl bg-slate-900/40 border border-church-gold/10 animate-pulse"></div>
              ))
            ) : photos.length > 0 ? (
              photos.map((pic) => (
                <div
                  key={pic.id}
                  className="group relative h-64 rounded-3xl overflow-hidden border border-church-gold/10 shadow-lg hover:border-church-gold/30 transition-all duration-350 cursor-pointer"
                  onClick={() => navigate('/gallery')}
                >
                  <img
                    src={pic.image}
                    alt={pic.caption || "Church Gallery"}
                    className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105 filter brightness-75 group-hover:brightness-[0.85]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent p-6 flex flex-col justify-end">
                    <h4 className="text-white font-bold font-display text-base tracking-wide">{pic.caption || "Carmel Bible Church"}</h4>
                    <span className="text-[10px] text-slate-400 font-mono block mt-1">Uploaded: {new Date(pic.uploaded_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-12 text-slate-400 text-sm">
                No photo memories uploaded yet. Check back later!
              </div>
            )}
          </div>
        </div>
      </section>


      {/* 12. PRAYER WALL SNEAK PEEK */}
      <section className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-12 flex-wrap gap-4">
            <div>
              <span className="text-xs font-black uppercase text-church-gold tracking-widest">CONNECT & INTERACT WITH US </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
                Prayer Requests.
              </h2>
            </div>
            <button
              onClick={() => navigate('/prayers')}
              className="text-xs font-bold text-church-gold hover:underline tracking-wider uppercase"
            >
              See Full Requests.
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {prayers.length > 0 ? (
              prayers.map((prayer) => (
                <div
                  key={prayer.id}
                  className={`p-6 rounded-3xl border bg-slate-900/40 shadow-sm flex flex-col justify-between transition-all ${prayer.is_pinned ? 'border-church-gold/40 ring-1 ring-church-gold/15' : 'border-church-gold/10'
                    }`}
                >
                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-3">
                      <h4 className="font-extrabold text-white text-sm font-display leading-snug">{prayer.title}</h4>
                      {prayer.is_pinned && (
                        <span className="flex items-center gap-0.5 text-[8px] font-bold text-church-gold bg-church-gold/10 px-1.5 py-0.5 rounded border border-church-gold/25">
                          <Pin className="w-2.5 h-2.5" /> Pinned
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-350 line-clamp-3 leading-relaxed mb-4">
                      {prayer.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold border-t border-slate-800/80 pt-3">
                    <User className="w-3.5 h-3.5 text-church-gold" />
                    <span className="uppercase tracking-wide">Submitted by: {prayer.is_anonymous ? 'Anonymous' : prayer.username}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-2 text-center py-12 text-slate-400 text-xs">
                No active prayer requests shared on the wall currently.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 13. ANNOUNCEMENTS */}
      <section className="py-28 relative z-10 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs font-black uppercase text-church-gold tracking-widest"><b><i>**ముఖ్య గమనికలు**</i></b></span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display mt-2">
              Weekly Announcements
            </h2>
          </div>

          <div className="space-y-6">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="p-6 rounded-2xl glassmorphism-dark border border-church-gold/10 shadow-lg"
                >
                  <div className="flex justify-between items-start mb-3 flex-wrap gap-2">
                    <h3 className="font-extrabold text-base sm:text-lg text-white font-display">
                      {ann.title}
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(ann.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-355 leading-relaxed">
                    {ann.content}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-slate-400 text-xs">
                No recent announcements.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 14. CONTACT SECTION & MAP */}
      <section id="contact" className="py-28 relative z-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

            {/* Coordinates / Details */}
            <div id="locations" className="lg:col-span-5 space-y-6">
              <span className="text-xs font-black uppercase text-church-gold tracking-widest block">CONNECT & INTERACT WITH US.. </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight font-display">
                Get In Touch
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                If you have any questions, wish to know more about our church, or require pastoral counseling, please reach out to us. We would love to connect with you.
              </p>

              <ul className="space-y-6">
                <li className="flex gap-4">
                  <div className="p-3.5 bg-church-gold/10 text-church-gold border border-church-gold/25 rounded-2xl shrink-0 h-fit">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white font-display text-sm uppercase tracking-wider">Church Address</h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">{settings.contact_address || 'Carmel Bible Church, side of the water tank, Dolapeta, Rajam Pin: 532127'}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="p-3.5 bg-church-gold/10 text-church-gold border border-church-gold/25 rounded-2xl shrink-0 h-fit">
                    <Phone className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white font-display text-sm uppercase tracking-wider">Phone Coordinates</h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">{settings.contact_phone || '87908 73190'}</p>
                  </div>
                </li>
                <li className="flex gap-4">
                  <div className="p-3.5 bg-church-gold/10 text-church-gold border border-church-gold/25 rounded-2xl shrink-0 h-fit">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-white font-display text-sm uppercase tracking-wider">Email Inbox</h4>
                    <p className="text-xs sm:text-sm text-slate-400 mt-1">{settings.contact_email || 'pastor@carmelbiblechurch.org'}</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Contact Form */}
            <div id="connect" className="lg:col-span-7">
              <div className="p-8 sm:p-10 rounded-3xl border border-church-gold/10 bg-slate-900/40 shadow-2xl">
                <h3 className="text-lg sm:text-xl font-extrabold text-white font-display mb-6 tracking-wide uppercase">Send Us a Message</h3>
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Your Name</label>
                      <input
                        type="text"
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="John Doe"
                        className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Email Address</label>
                      <input
                        type="email"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="john@example.com"
                        className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Subject</label>
                    <input
                      type="text"
                      value={contactSubject}
                      onChange={(e) => setContactSubject(e.target.value)}
                      placeholder="Question regarding Sunday School"
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Message Text</label>
                    <textarea
                      rows={5}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Write your message details..."
                      className="block w-full px-4 py-3 border border-slate-800 rounded-2xl bg-slate-950 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-church-gold focus:border-transparent text-sm transition-all"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={sendingMessage}
                    className="w-full flex justify-center items-center gap-2 py-3 bg-church-gold hover:bg-church-gold-hover text-church-blue font-black tracking-widest uppercase rounded-2xl transition-all shadow-lg hover:shadow-church-gold/20 disabled:opacity-50"
                  >
                    <span>{sendingMessage ? 'Sending...' : 'Send Message'}</span>
                    {!sendingMessage && <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 15. GOOGLE MAPS LOCATION */}
      <section className="py-12 relative z-10 px-4">
        <div className="max-w-7xl mx-auto rounded-3xl overflow-hidden border border-church-gold/15 shadow-2xl h-96 relative">
          {settings.map_embed_url ? (
            <iframe
              title="Church Location Map"
              src={settings.map_embed_url}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center text-slate-500 font-bold uppercase text-xs">
              Map View Currently Unavailable
            </div>
          )}
        </div>
      </section>

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideoId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4"
            onClick={() => setActiveVideoId(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full max-w-4xl aspect-video rounded-3xl overflow-hidden shadow-2xl border border-slate-800 bg-slate-900"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setActiveVideoId(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-slate-950/80 hover:bg-slate-900 text-white rounded-full transition-colors focus:outline-none"
              >
                <X className="w-5 h-5" />
              </button>
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${activeVideoId}?autoplay=1`}
                title="Ceremony Player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              ></iframe>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
