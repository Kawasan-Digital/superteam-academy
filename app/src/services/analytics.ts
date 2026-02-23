/**
 * Analytics abstraction layer.
 * Supports GA4, Sentry, and PostHog/Clarity.
 * 
 * Configure by setting the following env vars:
 * - VITE_GA4_MEASUREMENT_ID (e.g., G-XXXXXXXXXX)
 * - VITE_SENTRY_DSN
 * - VITE_POSTHOG_KEY
 */

// ── GA4 ─────────────────────────────────────────────────────────

const GA4_ID = import.meta.env.VITE_GA4_MEASUREMENT_ID;

function initGA4() {
  if (!GA4_ID) return;

  // Load gtag script
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`;
  document.head.appendChild(script);

  (window as any).dataLayer = (window as any).dataLayer || [];
  function gtag(...args: any[]) {
    (window as any).dataLayer.push(args);
  }
  gtag('js', new Date());
  gtag('config', GA4_ID, {
    send_page_view: false, // We'll track manually for SPA
  });
  (window as any).gtag = gtag;
}

// ── Sentry ──────────────────────────────────────────────────────

const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN;

function initSentry() {
  if (!SENTRY_DSN) return;

  // Dynamically load Sentry SDK
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://browser.sentry-cdn.com/8.0.0/bundle.tracing.min.js';
  script.crossOrigin = 'anonymous';
  script.onload = () => {
    if ((window as any).Sentry) {
      (window as any).Sentry.init({
        dsn: SENTRY_DSN,
        integrations: [
          (window as any).Sentry.browserTracingIntegration(),
        ],
        tracesSampleRate: 0.2,
        environment: import.meta.env.DEV ? 'development' : 'production',
        beforeSend(event: any) {
          // Scrub sensitive data
          if (event.request?.cookies) delete event.request.cookies;
          return event;
        },
      });
    }
  };
  document.head.appendChild(script);
}

// ── Microsoft Clarity (Heatmaps) ────────────────────────────────

const CLARITY_ID = import.meta.env.VITE_CLARITY_ID;

function initClarity() {
  if (!CLARITY_ID) return;

  // Clarity snippet
  (function(c: any, l: any, a: any, r: any, i: any) {
    c[a] = c[a] || function() { (c[a].q = c[a].q || []).push(arguments); };
    const t = l.createElement(r) as HTMLScriptElement;
    t.async = true;
    t.src = 'https://www.clarity.ms/tag/' + i;
    const y = l.getElementsByTagName(r)[0] as HTMLElement;
    y.parentNode?.insertBefore(t, y);
  })(window, document, 'clarity', 'script', CLARITY_ID);
}

// ── Hotjar (Heatmaps) ──────────────────────────────────────────

const HOTJAR_ID = import.meta.env.VITE_HOTJAR_ID;

function initHotjar() {
  if (!HOTJAR_ID) return;

  (function(h: any, o: any, t: any, j: any) {
    h.hj = h.hj || function() { (h.hj.q = h.hj.q || []).push(arguments); };
    h._hjSettings = { hjid: HOTJAR_ID, hjsv: 6 };
    const a = o.getElementsByTagName('head')[0] as HTMLElement;
    const r = o.createElement('script') as HTMLScriptElement;
    r.async = true;
    r.src = t + h._hjSettings.hjid + j;
    a.appendChild(r);
  })(window, document, 'https://static.hotjar.com/c/hotjar-', '.js?sv=6');
}

// ── Custom Events ───────────────────────────────────────────────

type AnalyticsEvent =
  | { name: 'page_view'; params: { page_path: string; page_title: string } }
  | { name: 'lesson_started'; params: { course_id: string; lesson_id: string; lesson_type: string } }
  | { name: 'lesson_completed'; params: { course_id: string; lesson_id: string; xp_earned: number } }
  | { name: 'challenge_run'; params: { course_id: string; lesson_id: string; passed: boolean } }
  | { name: 'course_enrolled'; params: { courseId: string; method: string; txSignature?: string; wallet?: string; program?: string } }
  | { name: 'course_completed'; params: { course_id: string; xp_earned: number } }
  | { name: 'wallet_connected'; params: { wallet_name: string } }
  | { name: 'wallet_disconnected'; params: Record<string, never> }
  | { name: 'achievement_unlocked'; params: { achievement_id: string } }
  | { name: 'language_changed'; params: { language: string } }
  | { name: 'theme_changed'; params: { theme: string } }
  | { name: 'sign_up'; params: { method: string } }
  | { name: 'login'; params: { method: string } };

class Analytics {
  private initialized = false;

  init() {
    if (this.initialized) return;
    this.initialized = true;

    initGA4();
    initSentry();
    initClarity();
    initHotjar();

    // PostHog init (if configured)
    const posthogKey = import.meta.env.VITE_POSTHOG_KEY;
    if (posthogKey && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://us-assets.i.posthog.com/static/array.js`;
      script.onload = () => {
        if ((window as any).posthog) {
          (window as any).posthog.init(posthogKey, {
            api_host: 'https://us.i.posthog.com',
            autocapture: true,
            capture_pageview: false,
          });
        }
      };
      document.head.appendChild(script);
    }

    console.log('[Analytics] Initialized', {
      ga4: !!GA4_ID,
      sentry: !!SENTRY_DSN,
      posthog: !!posthogKey,
      clarity: !!CLARITY_ID,
      hotjar: !!HOTJAR_ID,
    });
  }

  track(event: AnalyticsEvent) {
    // GA4
    if ((window as any).gtag) {
      (window as any).gtag('event', event.name, event.params);
    }

    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.capture(event.name, event.params);
    }

    // Dev logging
    if (import.meta.env.DEV) {
      console.log(`[Analytics] ${event.name}`, event.params);
    }
  }

  pageView(path: string, title: string) {
    this.track({ name: 'page_view', params: { page_path: path, page_title: title } });

    // GA4 page view
    if ((window as any).gtag && GA4_ID) {
      (window as any).gtag('config', GA4_ID, { page_path: path, page_title: title });
    }
  }

  identify(userId: string, traits?: Record<string, any>) {
    // GA4
    if ((window as any).gtag) {
      (window as any).gtag('set', 'user_properties', { user_id: userId, ...traits });
    }

    // PostHog
    if ((window as any).posthog) {
      (window as any).posthog.identify(userId, traits);
    }

    // Sentry
    if ((window as any).Sentry) {
      (window as any).Sentry.setUser({ id: userId, ...traits });
    }
  }

  /**
   * Report an error to Sentry (and console in dev).
   */
  captureError(error: Error, context?: Record<string, any>) {
    if ((window as any).Sentry) {
      (window as any).Sentry.captureException(error, { extra: context });
    }
    if (import.meta.env.DEV) {
      console.error('[Analytics] Error captured:', error, context);
    }
  }
}

export const analytics = new Analytics();
