import React, { useEffect, useRef, useState } from 'react';
import { Bell, BellRing, Check, Clock3, ExternalLink, Volume2 } from 'lucide-react';
import { Order } from '../../types';

interface AdminOrderNotificationsProps {
  orders: Order[];
  onNavigate: (path: string) => void;
}

function playOrderNotificationSound() {
  try {
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioContext = new AudioContextClass();
    const now = audioContext.currentTime;
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.5);
    gain.connect(audioContext.destination);
    const oscillator = audioContext.createOscillator();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.setValueAtTime(1175, now + 0.18);
    oscillator.connect(gain);
    oscillator.start(now);
    oscillator.stop(now + 0.52);
    oscillator.addEventListener('ended', () => void audioContext.close());
  } catch {
    // Browser autoplay rules can block audio; the visual bell remains available.
  }
}

function formatOrderTime(value: string) {
  return new Date(value).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
}

export const AdminOrderNotifications: React.FC<AdminOrderNotificationsProps> = ({ orders, onNavigate }) => {
  const [open, setOpen] = useState(false);
  const [readIds, setReadIds] = useState<string[]>(() => {
    try {
      return JSON.parse(window.localStorage.getItem('mpastamm_admin_read_orders_v1') || '[]');
    } catch {
      return [];
    }
  });
  const previousOrderIds = useRef<string[] | null>(null);
  const newOrders = orders
    .filter((order) => order.status === 'NUOVO')
    .sort((left, right) => new Date(right.created_at).getTime() - new Date(left.created_at).getTime());
  const unreadOrders = newOrders.filter((order) => !readIds.includes(order.id));

  useEffect(() => {
    const currentIds = newOrders.map((order) => order.id);
    if (previousOrderIds.current === null) {
      previousOrderIds.current = currentIds;
      return;
    }
    const added = newOrders.find((order) => !previousOrderIds.current?.includes(order.id));
    if (added) {
      playOrderNotificationSound();
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(`Nuovo ordine ${added.order_number}`, {
          body: `${added.customer_name} · €${added.total.toFixed(2).replace('.', ',')}`,
          tag: added.id,
        });
      }
    }
    previousOrderIds.current = currentIds;
  }, [newOrders.map((order) => `${order.id}:${order.status}`).join('|')]);

  const saveReadIds = (nextIds: string[]) => {
    setReadIds(nextIds);
    window.localStorage.setItem('mpastamm_admin_read_orders_v1', JSON.stringify(nextIds));
  };

  const markAllRead = () => saveReadIds(Array.from(new Set([...readIds, ...newOrders.map((order) => order.id)])));

  const requestDesktopNotifications = async () => {
    if ('Notification' in window && Notification.permission === 'default') await Notification.requestPermission();
  };

  return (
    <div className="relative flex justify-end">
      <button
        onClick={() => {
          setOpen((current) => !current);
          playOrderNotificationSound();
        }}
        aria-label="Notifiche nuovi ordini"
        className={`relative inline-flex min-h-[44px] items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-bold transition-colors ${
          unreadOrders.length > 0
            ? 'border-red-200 bg-red-50 text-red-800 hover:bg-red-100'
            : 'border-[#E8DFD1] bg-white text-[#1B3B2B] hover:bg-[#FAF7F2]'
        }`}
      >
        {unreadOrders.length > 0 ? <BellRing className="h-5 w-5 animate-pulse" /> : <Bell className="h-5 w-5" />}
        <span className="hidden sm:inline">Notifiche ordini</span>
        {unreadOrders.length > 0 && (
          <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white">
            {unreadOrders.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 z-50 w-[min(92vw,22rem)] overflow-hidden rounded-2xl border border-[#D8C3A5] bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-[#F0EBE1] bg-[#FAF7F2] px-4 py-3">
            <div>
              <h3 className="text-sm font-bold text-[#1C211E]">Nuovi ordini</h3>
              <p className="text-[11px] text-[#7A8A7E]">Il suono viene riprodotto quando arriva una nuova richiesta.</p>
            </div>
            {unreadOrders.length > 0 && (
              <button onClick={markAllRead} className="rounded-lg p-2 text-[#1B3B2B] hover:bg-white" title="Segna tutte come lette">
                <Check className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto">
            {newOrders.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs text-[#7A8A7E]">Nessun nuovo ordine in attesa.</div>
            ) : (
              newOrders.slice(0, 8).map((order) => (
                <button
                  key={order.id}
                  onClick={() => {
                    saveReadIds(Array.from(new Set([...readIds, order.id])));
                    setOpen(false);
                    onNavigate('/admin/ordini');
                  }}
                  className="flex w-full items-start gap-3 border-b border-[#F0EBE1] px-4 py-3 text-left hover:bg-[#FAF7F2]"
                >
                  <span className={`mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full ${readIds.includes(order.id) ? 'bg-stone-300' : 'bg-red-600 animate-pulse'}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2 text-xs font-bold text-[#1C211E]">
                      <span>{order.order_number} · {order.customer_name}</span>
                      <span className="inline-flex shrink-0 items-center gap-1 font-mono text-[10px] text-[#7A8A7E]"><Clock3 className="h-3 w-3" />{formatOrderTime(order.created_at)}</span>
                    </span>
                    <span className="mt-1 block text-[11px] text-[#55645A]">{order.items.length} articoli · €{order.total.toFixed(2).replace('.', ',')}</span>
                  </span>
                  <ExternalLink className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#8A9A86]" />
                </button>
              ))
            )}
          </div>

          <div className="flex flex-wrap gap-2 border-t border-[#F0EBE1] px-4 py-3">
            <button
              onClick={() => {
                setOpen(false);
                onNavigate('/admin/ordini');
              }}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1B3B2B] px-3 py-2 text-xs font-bold text-white"
            >
              Gestisci ordini
            </button>
            {'Notification' in window && Notification.permission !== 'granted' && (
              <button onClick={requestDesktopNotifications} className="inline-flex items-center gap-1.5 rounded-lg border border-[#D8C3A5] px-3 py-2 text-xs font-bold text-[#425046]">
                <Volume2 className="h-3.5 w-3.5" /> Attiva notifiche
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
