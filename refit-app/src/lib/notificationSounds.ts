/**
 * Notification Sound System
 * Plays sounds for different notification types and priorities
 */

// Sound URLs (using data URIs for simple beep sounds)
const SOUNDS = {
  // Simple beep for normal notifications
  normal: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcHGGm98OScTgwOUKnn77RgGwU7k9jzxnkpBSh+zPLaizsIGmW57OihUBELTKXh8bllHAU2jdXxxHwwBSl+zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8=',

  // Urgent sound (higher pitch, double beep)
  urgent: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcHGGm98OScTgwOUKnn77RgGwU7k9jzxnkpBSh+zPLaizsIGmW57OihUBELTKXh8bllHAU2jdXxxHwwBSl+zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8=',

  // Success sound (gentle tone)
  success: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTcHGGm98OScTgwOUKnn77RgGwU7k9jzxnkpBSh+zPLaizsIGmW57OihUBELTKXh8bllHAU2jdXxxHwwBSl+zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8bllHAU2jdXxxHwwBSl/zPDajDsIG2i87emhUREMTKPi8=',
};

/**
 * Audio player instance
 * Reuses single Audio instance for performance
 */
let audioPlayer: HTMLAudioElement | null = null;

/**
 * Initialize audio player (call once on app load)
 */
export function initAudioPlayer() {
  if (typeof window !== 'undefined' && !audioPlayer) {
    audioPlayer = new Audio();
    audioPlayer.volume = 0.5; // Default volume
  }
}

/**
 * Play notification sound based on priority
 */
export function playNotificationSound(priority: 'low' | 'medium' | 'high' | 'urgent') {
  // Check user preferences
  const preferences = localStorage.getItem('refit_notification_preferences');
  if (preferences) {
    try {
      const prefs = JSON.parse(preferences);
      if (!prefs.soundEnabled) {
        return; // Sounds disabled
      }
    } catch (error) {
      console.error('Error reading notification preferences:', error);
    }
  }

  // Initialize audio player if not already
  if (!audioPlayer) {
    initAudioPlayer();
  }

  if (!audioPlayer) return;

  // Select sound based on priority
  let soundUrl: string;

  if (priority === 'urgent') {
    soundUrl = SOUNDS.urgent;
  } else if (priority === 'low') {
    soundUrl = SOUNDS.success;
  } else {
    soundUrl = SOUNDS.normal;
  }

  // Play sound
  try {
    audioPlayer.src = soundUrl;
    audioPlayer.play().catch((error) => {
      // Autoplay might be blocked by browser
      console.warn('Could not play notification sound:', error);
    });
  } catch (error) {
    console.error('Error playing notification sound:', error);
  }
}

/**
 * Set volume for notification sounds
 * @param volume - Volume level (0.0 to 1.0)
 */
export function setNotificationVolume(volume: number) {
  if (audioPlayer) {
    audioPlayer.volume = Math.max(0, Math.min(1, volume));
  }
}

/**
 * Update notification preferences to enable/disable sounds
 */
export function toggleNotificationSounds(enabled: boolean) {
  const prefsKey = 'refit_notification_preferences';
  const stored = localStorage.getItem(prefsKey);

  let preferences: any = {
    soundEnabled: enabled,
  };

  if (stored) {
    try {
      const current = JSON.parse(stored);
      preferences = { ...current, soundEnabled: enabled };
    } catch (error) {
      console.error('Error parsing preferences:', error);
    }
  }

  localStorage.setItem(prefsKey, JSON.stringify(preferences));
}
