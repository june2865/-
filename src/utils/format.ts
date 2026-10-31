/**
 * Formatting utilities for Korean English Auction app
 */

export function formatKRW(amount: number): string {
  return `₩${amount.toLocaleString('ko-KR')}`;
}

export function formatCompactKRW(amount: number): string {
  if (amount >= 100000000) {
    const eok = (amount / 100000000).toFixed(1).replace('.0', '');
    return `₩${eok}억`;
  }
  if (amount >= 10000) {
    const man = Math.floor(amount / 10000);
    return `₩${man.toLocaleString('ko-KR')}만`;
  }
  return formatKRW(amount);
}

/**
 * Converts numbers to intuitive Korean spoken currency text
 * Examples:
 * 5000 -> "5천원"
 * 10000 -> "1만원"
 * 100000 -> "10만원"
 * 1000000 -> "100만원"
 * 1500000 -> "150만원"
 * 1505000 -> "150만 5천원"
 * 100000000 -> "1억원"
 * 150000000 -> "1억 5,000만원"
 */
export function formatKoreanNumberWords(num: number): string {
  if (!num || isNaN(num) || num <= 0) return '0원';

  const eok = Math.floor(num / 100000000);
  const remainderAfterEok = num % 100000000;
  const man = Math.floor(remainderAfterEok / 10000);
  const remainderAfterMan = remainderAfterEok % 10000;

  const parts: string[] = [];
  if (eok > 0) {
    parts.push(`${eok.toLocaleString('ko-KR')}억`);
  }
  if (man > 0) {
    parts.push(`${man.toLocaleString('ko-KR')}만`);
  }
  if (remainderAfterMan > 0) {
    if (remainderAfterMan >= 1000 && remainderAfterMan % 1000 === 0) {
      parts.push(`${Math.floor(remainderAfterMan / 1000)}천`);
    } else {
      parts.push(`${remainderAfterMan.toLocaleString('ko-KR')}`);
    }
  }

  if (parts.length === 0) return '0원';
  return `${parts.join(' ')}원`;
}

export interface TimeRemainingInfo {
  text: string;
  isExpired: boolean;
  isUrgent: boolean; // under 1 hour
  isCritical: boolean; // under 5 minutes
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
}

export function getTimeRemaining(endTimeMs: number, nowMs: number = Date.now()): TimeRemainingInfo {
  const diffMs = endTimeMs - nowMs;

  if (diffMs <= 0) {
    return {
      text: '경매 마감',
      isExpired: true,
      isUrgent: false,
      isCritical: false,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  let text = '';
  if (hours > 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    text = `${days}일 ${remHours}시간`;
  } else {
    text = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  }

  const isUrgent = totalSeconds < 3600; // < 1 hour
  const isCritical = totalSeconds < 300; // < 5 minutes

  return {
    text,
    isExpired: false,
    isUrgent,
    isCritical,
    hours,
    minutes,
    seconds,
    totalSeconds,
  };
}

/**
 * Clean Web Audio API chime for bids & celebrations
 */
export function playChimeSound(type: 'bid' | 'win' | 'pop' = 'bid') {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    if (type === 'bid') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.12); // A5
      gain.gain.setValueAtTime(0.18, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'win') {
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.35);
      });
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    }
  } catch {
    // Ignore audio context autoplay limitations if blocked
  }
}
