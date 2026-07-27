import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { Calendar, MapPin, Clock, Loader } from 'lucide-react';
import { useToast } from '../components/Toast';

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

export const EventsPage: React.FC = () => {
  const { addToast } = useToast();
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/events/')
      .then((res) => {
        const data = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data.results)
            ? res.data.results
            : [];

        setEvents(data);
      })
      .catch(() => { })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300 pt-28 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="text-xs font-bold text-church-gold uppercase tracking-wider block mb-1">Timeline</span>
          <h1 className="text-3xl sm:text-5xl font-black text-church-blue dark:text-white font-display">Church Calendar & Events</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xl mx-auto">
            Join us in fellowship, prayer meetings, and special weekend conferences. All are welcome.
          </p>
        </div>

        {loading ? (
          <div className="py-24 flex justify-center"><Loader className="w-10 h-10 animate-spin text-church-gold" /></div>
        ) : events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {events.map((ev) => (
              <div
                key={ev.id}
                className="group rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-dark-card overflow-hidden shadow-md flex flex-col justify-between hover:shadow-lg transition-shadow"
              >
                <div>
                  {ev.event_image && (
                    <div className="h-48 w-full bg-slate-950 overflow-hidden relative border-b border-slate-150 dark:border-slate-800/80">
                      <img
                        src={ev.event_image}
                        alt={ev.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                      <div className="flex items-center gap-1.5 text-xs text-church-gold font-bold bg-church-gold/10 px-2.5 py-1 rounded-full border border-church-gold/20 inline-flex">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{new Date(ev.event_date.slice(0, 16)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      <CountdownTimer
                        targetDate={ev.event_date.slice(0, 16)}
                        title={ev.title}
                        location={ev.location}
                        description={ev.description}
                        onTimeUp={() => {
                          addToast(`Upcoming Fellowship: "${ev.title}" has started!`, "success");
                          // Notify backend
                          api.post(`/api/events/${ev.id}/notify_members/`)
                            .then(() => { })
                            .catch(() => { });
                        }}
                      />
                    </div>

                    <h3 className="text-xl font-bold text-church-blue dark:text-white font-display mb-3 line-clamp-2">
                      {ev.title}
                    </h3>
                    <p className="text-xs text-slate-550 dark:text-slate-400 leading-relaxed mb-4">
                      {ev.description}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{formatEventTime(ev.event_date)}</span>
                  </div>
                  <div className="flex items-center gap-1 max-w-[150px] truncate">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                    <span className="truncate">{ev.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-slate-400 text-sm">
            No events scheduled currently.
          </div>
        )}
      </div>
    </div>
  );
};
