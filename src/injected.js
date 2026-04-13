// SMA Sniper — injected.js
// Runs in the page context to access Steam's global g_oSearchResults object.
// Search order: target page → page-1 → page+1
(function () {
  const p         = new URLSearchParams(location.search);
  const startPage = parseInt(p.get('page'));
  const lid       = p.get('listingid');
  const cnt       = parseInt(p.get('count')) || 10;

  if (!startPage || !lid) return;

  console.log(`[SMA Sniper] Start. Page: ${startPage}, listingid: ${lid}, count: ${cnt}`);

  // --- Status indicator (Steam-styled) ---
  const indicator = document.createElement('div');
  indicator.id = 'sma-sniper-indicator';
  indicator.style.cssText = `
    position:fixed;bottom:24px;right:24px;z-index:99999;
    background:#1b2838;color:#c7d5e0;font-family:Arial,sans-serif;
    font-size:13px;padding:12px 18px;border-radius:6px;
    border:1px solid #4b6a8a;box-shadow:0 4px 16px rgba(0,0,0,.5);
    min-width:260px;line-height:1.6;
  `;
  document.body.appendChild(indicator);

  function setStatus(icon, text, color) {
    indicator.innerHTML = `<span style="color:${color||'#c7d5e0'}">${icon} <b>SMA Sniper</b></span><br>${text}`;
  }

  // --- Wait for Steam's search object to become available ---
  function waitForResults(callback) {
    const i = setInterval(() => {
      if (typeof g_oSearchResults !== 'undefined') { clearInterval(i); callback(); }
    }, 200);
  }

  // --- Navigate to page, applying cnt first if needed ---
  // bForce=true bypasses the iPage==m_iCurrentPage guard in GoToPage
  function goToPage(pageNum, callback) {
    if (cnt !== g_oSearchResults.m_cPageSize) {
      console.log(`[SMA Sniper] Applying page size ${cnt} with bForce...`);
      setStatus('⚙️', `Applying page size <b>${cnt}</b>...`, '#f0a500');
      g_oSearchResults.m_cPageSize = cnt;
      g_oSearchResults.GoToPage(pageNum - 1, true); // bForce=true to re-render same page
    } else {
      g_oSearchResults.GoToPage(pageNum - 1);
    }
    if (callback) setTimeout(callback, 800);
  }

  // --- Poll for the listing button on the current page ---
  // 5 attempts × 1 second = 5 seconds per page
  function findOnCurrentPage(pageNum, onFound, onNotFound) {
    let attempts = 0;
    const i = setInterval(() => {
      attempts++;
      const buy = document.querySelector(`#listing_${lid} a.item_market_action_button`);
      if (buy) {
        clearInterval(i);
        onFound(buy, attempts);
      } else if (attempts > 5) {
        clearInterval(i);
        onNotFound(pageNum);
      }
    }, 1000);
  }

  // --- Build search queue: target → page-1 → page+1 ---
  function buildQueue(page) {
    const q = [page];
    if (page > 1) q.push(page - 1);
    q.push(page + 1);
    return q;
  }

  let firstNav = true;

  function tryPages(queue, index) {
    if (index >= queue.length) {
      setStatus('❌', `Listing <b>${lid}</b> not found<br>on pages ${queue.join(', ')}`, '#e74c3c');
      return;
    }

    const pageNum = queue[index];
    setStatus('🔍', `Searching page <b>${pageNum}</b>...`, '#5ba0d0');
    console.log(`[SMA Sniper] Going to page ${pageNum}`);

    if (firstNav) {
      firstNav = false;
      goToPage(pageNum, () => findOnCurrentPage(pageNum, onFound, onNotFound));
    } else {
      g_oSearchResults.GoToPage(pageNum - 1);
      findOnCurrentPage(pageNum, onFound, onNotFound);
    }

    function onFound(buy, attempts) {
      setStatus('✅', `Found on page <b>${pageNum}</b> in ${attempts}s!`, '#57cbde');
      console.log('[SMA Sniper] ✅ Found, clicking...');
      setTimeout(() => buy.click(), 100);
      setTimeout(() => indicator.remove(), 5000);
    }

    function onNotFound(failedPage) {
      console.warn(`[SMA Sniper] Not found on page ${failedPage}, trying next...`);
      tryPages(queue, index + 1);
    }
  }

  waitForResults(() => {
    console.log('[SMA Sniper] g_oSearchResults ready');
    tryPages(buildQueue(startPage), 0);
  });
})();
