// SMA Sniper — Steam Market Assistant
// Reads URL parameters and injects the sniper script into the page context.
const p = new URLSearchParams(location.search);
const page = p.get('page');
const lid  = p.get('listingid');
const cnt  = p.get('count') || '10';

if (page && lid) {
  const script = document.createElement('script');
  script.src = chrome.runtime.getURL('injected.js');
  document.documentElement.appendChild(script);
  script.remove();
}
