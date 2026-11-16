/* ALBERT.T Productions: interactions (no dependencies) */
(() => {
  "use strict";
  const doc = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  doc.classList.add("js");

  /* ---------- No single-word last lines ----------
     Glues the last three words of every text block with non-breaking spaces,
     so the final line always carries at least three words. */
  const NBSP = " ";
  function noWidows(el) {
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => n.parentElement.closest("svg, script, style, .no-glue") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    let glued = 0, seenWord = false;
    for (let i = nodes.length - 1; i >= 0 && glued < 2; i--) {
      const n = nodes[i];
      if (/^\s*$/.test(n.nodeValue) && n.nodeValue.includes("\n")) continue; // formatting whitespace
      const chars = [...n.nodeValue];
      for (let j = chars.length - 1; j >= 0 && glued < 2; j--) {
        const c = chars[j];
        if (c === "-" && /\w/.test(chars[j - 1] || "")) { chars[j] = "-\u2060"; continue; } // word-joiner: no break after hyphen
        if (c === NBSP) { if (seenWord) glued++; seenWord = false; }
        else if (/\s/.test(c)) { if (seenWord) { chars[j] = NBSP; glued++; } seenWord = false; }
        else seenWord = true;
      }
      n.nodeValue = chars.join("");
    }
  }
  const glueTargets = $$("p, li, h1, h2, h3, h4, blockquote, figcaption, dd, .lead, summary, .line, .quote p, .strip .muted")
    .filter((el) => !el.closest(".no-glue, nav, .ticker, .menu, .chips, button, .btn") && !el.querySelector(".line"));
  glueTargets.forEach(noWidows);

  /* ---------- Theme toggle ---------- */
  const setTheme = (t) => {
    doc.dataset.theme = t;
    try { localStorage.setItem("albertt-theme", t); } catch (e) {}
    $$(".theme-toggle").forEach((b) => b.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode"));
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = t === "dark" ? "#0A0A0B" : "#F3F0EA";
  };
  setTheme(doc.dataset.theme || "dark");
  $$(".theme-toggle").forEach((b) => b.addEventListener("click", () => {
    const next = doc.dataset.theme === "dark" ? "light" : "dark";
    if (document.startViewTransition && !reduce) document.startViewTransition(() => setTheme(next));
    else setTheme(next);
  }));

  /* ---------- Page transitions (shutter) ---------- */
  requestAnimationFrame(() => requestAnimationFrame(() => doc.classList.add("is-loaded")));
  window.addEventListener("pageshow", (e) => { if (e.persisted) doc.classList.remove("is-leaving"); doc.classList.add("is-loaded"); });
  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a || reduce) return;
    const url = new URL(a.href, location.href);
    const internal = url.origin === location.origin && !a.target && !a.hasAttribute("download") && !e.metaKey && !e.ctrlKey && !e.shiftKey;
    const samePageHash = url.pathname === location.pathname && url.hash;
    if (!internal || samePageHash || url.protocol.indexOf("http") !== 0) return;
    e.preventDefault();
    doc.classList.add("is-leaving");
    setTimeout(() => { location.href = a.href; }, 480);
  });

  /* ---------- Nav: scrolled / hide on scroll down ---------- */
  const nav = $(".nav");
  let lastY = scrollY;
  const onScroll = () => {
    const y = scrollY;
    nav && nav.classList.toggle("is-scrolled", y > 24);
    if (nav && !doc.classList.contains("menu-open")) nav.classList.toggle("is-hidden", y > 400 && y > lastY + 4);
    if (y < lastY - 4 || y < 400) nav && nav.classList.remove("is-hidden");
    lastY = y;
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobile menu ---------- */
  const menuBtn = $(".menu-btn");
  const menu = $("#menu");
  const toggleMenu = (open) => {
    doc.classList.toggle("menu-open", open);
    menuBtn && menuBtn.setAttribute("aria-expanded", String(open));
    menu && menu.setAttribute("aria-hidden", String(!open));
    if (open) { const first = menu && $("a", menu); first && setTimeout(() => first.focus(), 300); }
  };
  menuBtn && menuBtn.addEventListener("click", () => toggleMenu(!doc.classList.contains("menu-open")));
  addEventListener("keydown", (e) => { if (e.key === "Escape") { toggleMenu(false); closeModal(); } });

  /* ---------- Split headings into lines ---------- */
  $$("[data-split]").forEach((el) => {
    const lines = $$(".line", el);
    if (!lines.length) {
      el.innerHTML = `<span class="line"><span>${el.innerHTML}</span></span>`;
    } else {
      lines.forEach((l, i) => { l.style.setProperty("--l", i); l.innerHTML = `<span>${l.innerHTML}</span>`; });
    }
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("is-in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
  $$("[data-reveal], [data-split]").forEach((el) => io.observe(el));
  $$("[data-stagger]").forEach((g) => $$("[data-reveal]", g).forEach((el, i) => el.style.setProperty("--i", i)));

  /* ---------- Hero timecode (24fps) ---------- */
  const tcs = $$("[data-timecode]");
  if (tcs.length) {
    const t0 = performance.now();
    const pad = (n) => String(n).padStart(2, "0");
    const tick = () => {
      const f = Math.floor((performance.now() - t0) / (1000 / 24));
      const ff = f % 24, s = Math.floor(f / 24) % 60, m = Math.floor(f / 1440) % 60, h = Math.floor(f / 86400);
      const str = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(ff)}`;
      tcs.forEach((t) => (t.textContent = str));
      requestAnimationFrame(tick);
    };
    reduce ? tcs.forEach((t) => (t.textContent = "00:00:24:00")) : tick();
  }

  /* ---------- Count-up numbers ---------- */
  $$("[data-count]").forEach((el) => {
    const end = parseInt(el.dataset.count, 10), dur = 1400;
    if (reduce || !("IntersectionObserver" in window)) { el.textContent = end; return; }
    const o = new IntersectionObserver((es) => {
      if (!es[0].isIntersecting) return; o.disconnect();
      const t0 = performance.now();
      const step = (t) => {
        const k = Math.min((t - t0) / dur, 1), e = 1 - Math.pow(1 - k, 4);
        el.textContent = Math.round(end * e);
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, { threshold: 0.6 });
    o.observe(el);
  });

  /* ---------- Fit the giant wordmarks to their width ---------- */
  const fitWords = () => $$("[data-fit]").forEach((el) => {
    el.style.fontSize = "100px";
    const cs = getComputedStyle(el);
    const box = el.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
    const range = document.createRange(); range.selectNodeContents(el);
    const w = range.getBoundingClientRect().width;
    if (w) el.style.fontSize = Math.min(100 * (box / w) * 0.98, 460) + "px";
  });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(fitWords);
  fitWords();
  addEventListener("resize", fitWords);

  /* ---------- Scroll-lit statement ---------- */
  $$("[data-lit]").forEach((el) => {
    const walk = (node) => {
      [...node.childNodes].forEach((c) => {
        if (c.nodeType === 3) {
          const frag = document.createDocumentFragment();
          c.nodeValue.split(/( +)/).forEach((part) => {
            if (!part) return;
            if (/^ +$/.test(part)) frag.appendChild(document.createTextNode(part));
            else { const s = document.createElement("span"); s.className = "w"; s.textContent = part; frag.appendChild(s); }
          });
          c.replaceWith(frag);
        } else if (c.nodeType === 1 && !c.classList.contains("streak-pill")) walk(c);
        else if (c.nodeType === 1) c.classList.add("w");
      });
    };
    walk(el);
    const words = $$(".w", el);
    const update = () => {
      const r = el.getBoundingClientRect();
      const vh = innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.85 - r.top) / (r.height + vh * 0.35)));
      const n = Math.round(p * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < n));
    };
    if (reduce) words.forEach((w) => w.classList.add("is-lit"));
    else { addEventListener("scroll", () => requestAnimationFrame(update), { passive: true }); update(); }
  });

  /* ---------- Parallax banners ---------- */
  const px = $$(".parallax");
  if (px.length && !reduce) {
    const upd = () => px.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = (r.top + r.height / 2 - innerHeight / 2) / innerHeight;
      el.style.setProperty("--py", (p * -60).toFixed(1) + "px");
    });
    addEventListener("scroll", () => requestAnimationFrame(upd), { passive: true }); upd();
  }

  /* ---------- Tilt cards ---------- */
  if (fine && !reduce) $$("[data-tilt]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(900px) rotateY(${x * 7}deg) rotateX(${-y * 7}deg) translateY(-4px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });

  /* ---------- Magnetic buttons ---------- */
  if (fine && !reduce) $$("[data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.18}px, ${(e.clientY - r.top - r.height / 2) * 0.25}px)`;
    });
    el.addEventListener("pointerleave", () => (el.style.transform = ""));
  });

  /* ---------- Custom cursor ---------- */
  const cur = $(".cursor");
  if (cur && fine && !reduce) {
    const dot = $(".cursor__dot", cur), ring = $(".cursor__ring", cur);
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    addEventListener("pointermove", (e) => { mx = e.clientX; my = e.clientY; cur.classList.add("is-active"); dot.style.transform = `translate(${mx}px, ${my}px)`; });
    const loop = () => { rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18; ring.style.transform = `translate(${rx}px, ${ry}px)`; requestAnimationFrame(loop); };
    loop();
    document.addEventListener("pointerover", (e) => {
      const lab = e.target.closest("[data-cursor]");
      const hov = e.target.closest("a, button, summary, label, input, textarea, select");
      cur.classList.toggle("is-label", !!lab);
      cur.classList.toggle("is-hover", !lab && !!hov);
      ring.textContent = lab ? lab.dataset.cursor : "";
    });
    document.documentElement.addEventListener("pointerleave", () => cur.classList.remove("is-active"));
  }

  /* ---------- Coverflow ---------- */
  $$("[data-flow]").forEach((root) => {
    const stage = $(".flow__stage", root);
    const items = $$(".flow__item", root);
    const chips = $$(".chip", root);
    const count = $(".flow__count", root);
    let list = items.slice();
    let idx = Math.min(1, list.length - 1);

    const render = () => {
      const narrow = innerWidth < 640;
      const gap = narrow ? 0.62 : 0.7;
      items.forEach((it) => { it.dataset.hidden = list.includes(it) ? "false" : "true"; it.classList.remove("is-active"); });
      list.forEach((it, i) => {
        const o = i - idx, a = Math.abs(o);
        const w = it.offsetWidth;
        const tx = Math.sign(o) * (a === 0 ? 0 : w * gap + (a - 1) * w * 0.38);
        const ry = Math.max(-38, Math.min(38, -o * 34));
        const sc = 1 - Math.min(a, 3) * 0.1;
        it.style.transform = `translateX(${tx}px) translateZ(${-a * 120}px) rotateY(${ry}deg) scale(${sc})`;
        it.style.zIndex = String(100 - a);
        it.style.opacity = a > 2 ? "0" : String(1 - a * 0.22);
        it.style.filter = a ? `brightness(${1 - a * 0.22})` : "none";
        it.style.pointerEvents = a > 2 ? "none" : "auto";
        if (!a) it.classList.add("is-active");
      });
      if (count) count.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    };
    const go = (n) => { idx = (n + list.length) % list.length; render(); };
    $(".flow__prev", root)?.addEventListener("click", () => go(idx - 1));
    $(".flow__next", root)?.addEventListener("click", () => go(idx + 1));
    items.forEach((it) => it.addEventListener("click", (e) => {
      const i = list.indexOf(it);
      if (i !== idx) { e.preventDefault(); e.stopPropagation(); go(i); }
    }, true));
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      const f = c.dataset.filter;
      list = f === "all" ? items.slice() : items.filter((it) => it.dataset.cat.split(" ").includes(f));
      idx = Math.min(list.length > 2 ? 1 : 0, list.length - 1);
      render();
    }));
    // drag / swipe
    let sx = null, moved = false;
    stage.addEventListener("pointerdown", (e) => { sx = e.clientX; moved = false; });
    addEventListener("pointerup", (e) => {
      if (sx === null) return;
      const dx = e.clientX - sx; sx = null;
      if (Math.abs(dx) > 40) { moved = true; go(idx + (dx < 0 ? 1 : -1)); }
    });
    stage.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);
    root.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") go(idx - 1); if (e.key === "ArrowRight") go(idx + 1); });
    addEventListener("resize", render);
    render();
  });

  /* ---------- Testimonials ---------- */
  $$("[data-quotes]").forEach((root) => {
    const qs = $$(".quote", root), dots = $$(".dots button", root);
    let i = 0, timer;
    const DUR = 6500;
    root.style.setProperty("--dur", DUR + "ms");
    const show = (n) => {
      i = (n + qs.length) % qs.length;
      qs.forEach((q, k) => q.classList.toggle("is-active", k === i));
      dots.forEach((d, k) => { d.removeAttribute("aria-current"); if (k === i) { void d.offsetWidth; d.setAttribute("aria-current", "true"); } });
      clearTimeout(timer); if (!reduce) timer = setTimeout(() => show(i + 1), DUR);
    };
    dots.forEach((d, k) => d.addEventListener("click", () => show(k)));
    $(".q-prev", root)?.addEventListener("click", () => show(i - 1));
    $(".q-next", root)?.addEventListener("click", () => show(i + 1));
    show(0);
  });

  /* ---------- Video modal ---------- */
  const modal = $("#videoModal");
  function closeModal() {
    if (!modal || !modal.classList.contains("is-open")) return;
    modal.classList.remove("is-open");
    setTimeout(() => { $(".modal__slot", modal).innerHTML = ""; }, 400);
    doc.style.overflow = "";
  }
  document.addEventListener("click", (e) => {
    const t = e.target.closest("[data-video]");
    if (!t || !modal) return;
    e.preventDefault();
    const id = t.dataset.video.trim();
    const slot = $(".modal__slot", modal);
    if (id) {
      slot.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0" title="Video player" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    } else {
      const img = t.dataset.poster || "";
      const title = t.dataset.title || "Showreel";
      slot.innerHTML = `<div class="modal__ph">${img ? `<img src="${img}" alt="">` : ""}<div><span class="mono" style="color:var(--ember)">● Coming soon</span><strong class="h3">${title}</strong><span style="opacity:.75;max-width:40ch">The full film will play here once it's uploaded to YouTube.</span></div></div>`;
    }
    modal.classList.add("is-open");
    doc.style.overflow = "hidden";
    $(".modal__close", modal).focus();
  });
  modal && $$(".modal__bg, .modal__close", modal).forEach((el) => el.addEventListener("click", closeModal));

  /* ---------- Work filter ---------- */
  $$("[data-filter-group]").forEach((g) => {
    const chips = $$(".chip", g);
    const items = $$(g.dataset.filterGroup);
    chips.forEach((c) => c.addEventListener("click", () => {
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      const f = c.dataset.filter;
      items.forEach((it) => {
        const show = f === "all" || it.dataset.cat.split(" ").includes(f);
        it.classList.toggle("is-out", !show);
        if (show) { it.classList.remove("is-in"); requestAnimationFrame(() => it.classList.add("is-in")); }
      });
    }));
  });

  /* ---------- Contact form → WhatsApp / Email ---------- */
  const form = $("#enquiry");
  if (form) {
    const PHONE = "60146718586";
    const EMAIL = "albert.tengkuyu@gmail.com";
    const fmtDate = (v) => { if (!v) return ""; const [y, m, d] = v.split("-"); return `${d}/${m}/${y.slice(2)}`; };
    const build = () => {
      const fd = new FormData(form);
      const types = fd.getAll("type").join(", ");
      const lines = [
        "Hi ALBERT.T Productions, I'd like to enquire about a project.",
        "",
        `Name: ${fd.get("name") || "-"}`,
        fd.get("company") ? `Company: ${fd.get("company")}` : null,
        `Project type: ${types || "-"}`,
        fd.get("date") ? `Shoot date: ${fmtDate(fd.get("date"))}` : null,
        fd.get("location") ? `Location: ${fd.get("location")}` : null,
        fd.get("budget") ? `Budget: ${fd.get("budget")}` : null,
        "",
        `${fd.get("message") || ""}`,
      ].filter((l) => l !== null);
      return lines.join("\n");
    };
    const valid = () => {
      let ok = true;
      ["name", "message"].forEach((n) => {
        const f = form.elements[n];
        const bad = !f.value.trim();
        f.closest(".field").classList.toggle("field--error", bad);
        if (bad && ok) { f.focus(); ok = false; }
      });
      return ok;
    };
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!valid()) return;
      window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(build())}`, "_blank", "noopener");
    });
    $("#sendEmail")?.addEventListener("click", () => {
      if (!valid()) return;
      const subj = `Project enquiry: ${form.elements.name.value.trim()}`;
      location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(subj)}&body=${encodeURIComponent(build())}`;
    });
    const min = new Date(); form.elements.date && (form.elements.date.min = min.toISOString().slice(0, 10));
  }

  /* ---------- Client logos: auto-scroll, swipe or drag ---------- */
  $$(".logos").forEach((row) => {
    const dir = Number(row.dataset.dir) || 1;
    const half = () => row.scrollWidth / 2;
    let pos = dir < 0 ? half() : 0, held = false, resume = 0, drag = null;
    row.scrollLeft = pos;
    const hold = () => { held = true; clearTimeout(resume); };
    const release = () => { clearTimeout(resume); resume = setTimeout(() => { pos = row.scrollLeft; held = false; }, 1800); };
    row.addEventListener("touchstart", hold, { passive: true });
    row.addEventListener("touchend", release, { passive: true });
    row.addEventListener("touchcancel", release, { passive: true });
    row.addEventListener("wheel", () => { hold(); release(); }, { passive: true });
    row.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse") return;
      hold(); drag = { x: e.clientX, left: row.scrollLeft }; row.classList.add("is-drag");
    });
    addEventListener("pointermove", (e) => { if (drag) row.scrollLeft = drag.left - (e.clientX - drag.x); });
    addEventListener("pointerup", () => { if (drag) { drag = null; row.classList.remove("is-drag"); release(); } });
    row.addEventListener("scroll", () => {
      if (!held) return;
      const h = half();
      if (row.scrollLeft >= h) row.scrollLeft -= h;
      else if (row.scrollLeft <= 0) row.scrollLeft += h;
      pos = row.scrollLeft;
    }, { passive: true });
    if (reduce) return;
    const speed = 0.45;
    const tick = () => {
      if (!held) {
        pos += speed * dir;
        const h = half();
        if (pos >= h) pos -= h;
        if (pos <= 0) pos += h;
        row.scrollLeft = pos;
      }
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });

  /* ---------- Footer: live KK time (12-hour) + year ---------- */
  const clock = $("[data-clock]");
  if (clock) {
    const f = new Intl.DateTimeFormat("en-MY", { timeZone: "Asia/Kuching", hour: "numeric", minute: "2-digit", hour12: true });
    const t = () => (clock.textContent = f.format(new Date()).toUpperCase());
    t(); setInterval(t, 30000);
  }
  $$("[data-year]").forEach((y) => (y.textContent = new Date().getFullYear()));
})();
