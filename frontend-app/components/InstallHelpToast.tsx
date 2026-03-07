import React, { useEffect, useState } from 'react';

const isAppInstalled = () => {
  try {
    const standalone = (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || (navigator as any).standalone === true;
    return !!standalone;
  } catch {
    return false;
  }
};

const fetchJson = async (url: string) => {
  try {
    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return { ok: false, status: res.status };
    const json = await res.json();
    return { ok: true, json };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
};

const InstallHelpToast: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const [manifestStatus, setManifestStatus] = useState<string | null>(null);
  const [iconsStatus, setIconsStatus] = useState<Record<string,string>>({});
  const [manifestJson, setManifestJson] = useState<any>(null);
  const [swRegistrations, setSwRegistrations] = useState<any[]>([]);
  const [lastAttempt, setLastAttempt] = useState<{source?:string, ts?:string}|null>(null);
  const [swStatus, setSwStatus] = useState<string | null>(null);
  const [deferred, setDeferred] = useState<any>(null);

  useEffect(() => {
    // Always show this debug helper unless dismissed explicitly
    if (localStorage.getItem('installHelpDismissed') === '1') return;
    const force = localStorage.getItem('installHelpForce') === '1';
    if (!force && isAppInstalled()) return;

    const t = setTimeout(() => setVisible(true), 800);

    // Read any globally exposed deferred prompt
    setDeferred((window as any).__deferredPWAInstall || null);

    // Fetch and inspect manifest
    (async () => {
      const manifestUrl = new URL('manifest.webmanifest', import.meta.url).href;
      const m = await fetchJson(manifestUrl);
      if (!m.ok) {
        setManifestStatus(`failed (${(m as any).status || (m as any).error})`);
        return;
      }
      setManifestStatus('ok');
      setManifestJson((m as any).json);
      const icons = (m as any).json?.icons || [];
      for (const icon of icons) {
        const src = icon.src || icon.url;
        if (!src) continue;
        try {
          // Resolve relative icon paths against the manifest URL so they work under Vite base
          const iconUrl = new URL(src, manifestUrl).href;
          const res = await fetch(iconUrl, { method: 'GET', cache: 'no-store' });
          iconsStatus[iconUrl] = res.ok ? `ok (${res.status})` : `failed (${res.status})`;
        } catch (err) {
          iconsStatus[src] = `error (${String(err)})`;
        }
        setIconsStatus({ ...iconsStatus });
      }
    })();

    // Inspect service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        setSwRegistrations(regs.map(r => ({ scope: r.scope, installing: !!r.installing, waiting: !!r.waiting, active: !!r.active })));
        if (!regs || regs.length === 0) { setSwStatus('not-registered'); return; }
        setSwStatus('registered');
      }).catch(err => setSwStatus(String(err)));
    } else {
      setSwStatus('unsupported');
    }

    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const onShow = (ev?: any) => {
      setVisible(true);
      try {
        const d = ev?.detail || {};
        setLastAttempt({ source: d.source || 'unknown', ts: new Date().toISOString() });
      } catch {}
    };
    window.addEventListener('showInstallHelp', onShow as EventListener);
    return () => window.removeEventListener('showInstallHelp', onShow as EventListener);
  }, []);

  if (!visible) return null;

  const dismiss = () => {
    localStorage.setItem('installHelpDismissed', '1');
    setVisible(false);
  };

  const toggleForce = () => {
    const cur = localStorage.getItem('installHelpForce') === '1';
    if (cur) localStorage.removeItem('installHelpForce'); else localStorage.setItem('installHelpForce', '1');
    setVisible(true);
    window.location.reload();
  };

  const resetPWAState = async () => {
    // Clear our keys
    ['pwa_installed','installHelpDismissed','lastInstallClicked','installHelpForce'].forEach(k => localStorage.removeItem(k));
    try {
      delete (window as any).__deferredPWAInstall;
      delete (window as any).__hasBeforeInstallPrompt;
      delete (window as any).__pwaInstalled;
      delete (window as any).__lastInstallClicked;
    } catch {}

    // Unregister service workers
    if ('serviceWorker' in navigator) {
      const regs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(regs.map(r => r.unregister()));
    }

    // Reload to get a clean environment
    window.location.reload();
  };

  const tryPrompt = async () => {
    const deferredPrompt = (window as any).__deferredPWAInstall || deferred;
    if (!deferredPrompt) {
      window.dispatchEvent(new CustomEvent('showInstallHelp', { detail: { source: 'install-now-toast' } }));
      alert('No deferred prompt captured. Check manifest and service-worker. Debug helper opened.');
      return;
    }
    try {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      setDeferred(null);
      (window as any).__deferredPWAInstall = null;
      if (choice.outcome === 'accepted') {
        console.log('User accepted install');
      } else {
        console.log('User dismissed install');
      }
    } catch (err) {
      console.warn('Prompt failed', err);
      alert('Prompt failed: ' + String(err));
    }
  };

  return (
    <div className="fixed inset-x-0 bottom-0 z-50">
      <div className="max-w-4xl mx-auto bg-white border-t shadow-lg p-4 text-sm text-slate-800">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div className="font-semibold">Aide PWA & Assistant d'Installation</div>
              <div className="text-right">
                <div className="text-xs text-slate-500">{isAppInstalled() ? 'Installé' : 'Non installé'}</div>
                {lastAttempt ? <div className="text-xs text-slate-400">Dernière tentative: {lastAttempt.source} @ {lastAttempt.ts}</div> : null}
              </div>
            </div>

            {expanded && (
              <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="font-medium">Deferred prompt</div>
                  <div className="text-slate-600">{(window as any).__deferredPWAInstall ? 'captured' : (deferred ? 'captured (local)' : 'none')}</div>
                  <div className="text-xs text-slate-400 mt-1">window.__hasBeforeInstallPrompt: {(window as any).__hasBeforeInstallPrompt ? 'true' : 'false'}</div>
                  <div className="text-xs text-slate-400">lastInstallClicked: {localStorage.getItem('lastInstallClicked') || (window as any).__lastInstallClicked || 'none'}</div>
                </div>
                <div>
                  <div className="font-medium">Manifest</div>
                  <div className="text-slate-600">{manifestStatus || 'checking...'}</div>
                  {manifestJson ? <pre className="text-xs text-slate-500 mt-1 max-h-40 overflow-auto">{JSON.stringify(manifestJson, null, 2)}</pre> : null}
                </div>
                <div>
                  <div className="font-medium">Service Worker</div>
                  <div className="text-slate-600">{swStatus || 'checking...'}</div>
                  {swRegistrations.length > 0 ? (
                    <div className="text-xs mt-1 text-slate-500">
                      {swRegistrations.map((r,i) => (<div key={i}>{r.scope} — active:{String(r.active)} waiting:{String(r.waiting)} installing:{String(r.installing)}</div>))}
                    </div>
                  ) : null}
                </div>

                <div className="md:col-span-3">
                  <div className="font-medium">Icons</div>
                  <div className="text-slate-600 mt-1">
                    {Object.keys(iconsStatus).length === 0 ? 'checking...' : Object.entries(iconsStatus).map(([k,v]) => (
                      <div key={k} className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-slate-100 flex items-center justify-center rounded-sm overflow-hidden">
                          <img src={k} alt="icon" className="max-w-full max-h-full" />
                        </div>
                        <div className="text-xs">{k} — {v}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <button onClick={() => setExpanded(e => !e)} className="px-3 py-1 text-pistachio-dark font-medium hover:text-[#e13734] transition-colors">
              {expanded ? 'Réduire' : 'Développer'}
            </button>
            <button onClick={tryPrompt} className="px-3 py-1 bg-pistachio-dark text-white rounded hover:bg-[#e13734] transition-colors">Installer maintenant</button>
            <button onClick={dismiss} className="px-2 py-1 text-slate-500 hover:text-[#e13734] transition-colors">Ignorer</button>
            <button onClick={toggleForce} className="px-2 py-1 text-xs text-slate-600 hover:text-[#e13734] transition-colors">Forcer le débogage</button>
            <button onClick={resetPWAState} className="px-2 py-1 text-xs text-red-600 hover:text-[#e13734] transition-colors">Réinitialiser l'état PWA</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallHelpToast;
