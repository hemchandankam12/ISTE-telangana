/* ISTE Telangana - Dynamic Frontend Integration */
(function () {
    const API = '/api/public';

    // Fix notification bar: fixed below header
    function fixNotificationBar() {
        const bar = document.querySelector('.notification-bar');
        const header = document.querySelector('header');
        if (!bar || !header) return;
        const headerH = header.offsetHeight;
        bar.style.position = 'fixed';
        bar.style.top = headerH + 'px';
        bar.style.left = '0';
        bar.style.right = '0';
        bar.style.zIndex = '999';
        const barH = bar.offsetHeight;
        const hero = document.querySelector('.hero, .page-header');
        if (hero) {
            const current = parseInt(window.getComputedStyle(hero).marginTop) || 0;
            hero.style.marginTop = (current + barH) + 'px';
        }
        const track = document.getElementById('notificationTrack');
        if (track) {
            track.style.animation = 'scroll 15s linear infinite';
        }
    }

    // Headlines + Announcements merged in notification bar
    async function loadHeadlines() {
        const track = document.getElementById('notificationTrack');
        if (!track) return;
        try {
            const [hlRes, anRes] = await Promise.all([
                fetch(API + '/headlines').then(r => r.json()).catch(() => []),
                fetch(API + '/announcements').then(r => r.json()).catch(() => [])
            ]);
            const scrollItems = [];
            if (hlRes && hlRes.length > 0) {
                hlRes.forEach(h => {
                    scrollItems.push(`<span class="notification-item">${h.text}</span>`);
                });
            }
            if (anRes && anRes.length > 0) {
                anRes.forEach(a => {
                    scrollItems.push(`<a href="/notices.html" class="notification-item" style="color:white;text-decoration:none;cursor:pointer;">NEW: ${a.title}</a>`);
                });
            }
            if (scrollItems.length > 0) {
                track.innerHTML = scrollItems.join('') + scrollItems.join('');
            } else {
                setFallbackHeadlines(track);
            }
        } catch (e) {
            setFallbackHeadlines(track);
        }
        setTimeout(fixNotificationBar, 50);
    }

    function setFallbackHeadlines(track) {
        const fallbacks = ['Welcome to ISTE Telangana Section', 'Annual Convention 2025 - Coming Soon', 'Membership Renewal Open'];
        const items = fallbacks.map(t => `<span class="notification-item">${t}</span>`).join('');
        track.innerHTML = items + items;
    }

    // Events on index.html
    async function loadHomeEvents() {
        const grid = document.querySelector('.events-grid');
        if (!grid || !isPage('index')) return;
        try {
            const r = await fetch(API + '/events?upcoming=true');
            const events = await r.json();
            if (events.length > 0) {
                grid.innerHTML = events.slice(0, 3).map(ev => {
                    const d = new Date(ev.eventDate);
                    const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    return `<div class="event-card" onclick="window.location='event-detail.html?id=${ev._id}'" style="cursor:pointer">
                        <div class="event-image" ${ev.coverImage ? `style="background:url(${ev.coverImage}) center/cover"` : ''}><div class="event-date">${date}</div></div>
                        <div class="event-content">
                            <span class="event-category">${ev.category}</span>
                            <h3>${ev.title}</h3>
                            <p>${ev.description.substring(0, 80)}${ev.description.length > 80 ? '...' : ''}</p>
                            <div class="event-meta"><span>${ev.location}</span></div>
                        </div>
                    </div>`;
                }).join('');
            }
        } catch (e) { }
    }

    // Events on events.html
    async function loadEventsPage() {
        const grid = document.querySelector('.events-grid');
        if (!grid || !isPage('events')) return;
        try {
            const r = await fetch(API + '/events');
            const events = await r.json();
            if (events.length > 0) {
                grid.innerHTML = events.map(ev => {
                    const d = new Date(ev.eventDate);
                    const date = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
                    return `<div class="event-card" onclick="window.location='event-detail.html?id=${ev._id}'" style="cursor:pointer">
                        <div class="event-image" ${ev.coverImage ? `style="background:url(${ev.coverImage}) center/cover"` : ''}><div class="event-date">${date}</div></div>
                        <div class="event-content">
                            <span class="event-category">${ev.category}</span>
                            <h3>${ev.title}</h3>
                            <p>${ev.description.substring(0, 100)}${ev.description.length > 100 ? '...' : ''}</p>
                            <div class="event-meta"><span>${ev.location}</span></div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                grid.innerHTML = '<p class="empty-msg" style="text-align:center;grid-column:1/-1;padding:30px;">No events available yet.</p>';
            }
        } catch (e) { }
    }

    // Notices section on index.html (replaces old announcements)
    async function loadHomeNotices() {
        if (!isPage('index')) return;
        try {
            const r = await fetch(API + '/announcements');
            const items = await r.json();
            if (!items || items.length === 0) return;
            const footer = document.querySelector('footer');
            if (!footer) return;
            const section = document.createElement('section');
            section.id = 'announcements';
            section.innerHTML = `<div class="container">
                <div class="section-header">
                    <h2>Latest Notices</h2>
                    <p>Stay updated with the latest announcements and notices</p>
                </div>
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;">
                    ${items.slice(0, 6).map(a => {
                const d = a.publishDate ? new Date(a.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '';
                const badge = a.priority === 'urgent' ? '<span style="background:rgba(248,81,73,.15);color:#f85149;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">URGENT</span>' :
                    a.priority === 'high' ? '<span style="background:rgba(88,166,255,.15);color:#58a6ff;padding:2px 8px;border-radius:10px;font-size:10px;font-weight:600;">HIGH</span>' : '';
                return `<a href="/notices.html" class="notice-card" style="display:block;border-radius:12px;padding:20px;transition:transform .3s;text-decoration:none;" onmouseover="this.style.transform='translateY(-3px)'" onmouseout="this.style.transform='none'">
                            <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
                                <h3 style="font-size:16px;">${a.title}</h3>
                                ${badge}
                            </div>
                            <p style="font-size:13px;line-height:1.5;margin-bottom:10px;">${a.description ? a.description.substring(0, 120) + (a.description.length > 120 ? '...' : '') : ''}</p>
                            <div style="display:flex;justify-content:space-between;align-items:center;">
                                <span style="font-size:11px;">${d}</span>
                                ${a.pdfPath ? `<span style="color:#f0883e;font-size:12px;font-weight:600;">View PDF</span>` : ''}
                            </div>
                        </a>`;
            }).join('')}
                </div>
            </div>`;
            footer.parentNode.insertBefore(section, footer);
        } catch (e) { }
    }

    // Members on index.html
    async function loadHomeMembers() {
        const grid = document.querySelector('.committee-grid');
        if (!grid || isPage('committee')) return;
        try {
            const r = await fetch(API + '/members');
            const members = await r.json();
            if (members.length > 0) {
                grid.innerHTML = members.slice(0, 4).map(m => memberCard(m)).join('');
            }
        } catch (e) { }
    }

    // Members on committee.html
    async function loadCommitteePage() {
        const grid = document.getElementById('committee-grid');
        if (!grid || !isPage('committee')) return;
        try {
            const r = await fetch(API + '/members');
            const members = await r.json();
            if (members.length > 0) {
                grid.innerHTML = members.map(m => memberCard(m)).join('');
            } else {
                grid.innerHTML = '<p class="empty-msg">No committee members added yet.</p>';
            }
        } catch (e) {
            grid.innerHTML = '<p class="empty-msg">Could not load members.</p>';
        }
    }

    function memberCard(m) {
        return `<div class="committee-card">
            <div class="committee-image" ${m.photo ? `style="background:url(${m.photo}) center/cover;font-size:0"` : ''}></div>
            <div class="committee-info">
                <h3>${m.name}</h3>
                <div class="committee-role">${m.designation}</div>
                <div class="committee-org">${m.organization || ''}</div>
            </div>
        </div>`;
    }

    // Awards on awards.html
    async function loadAwardsPage() {
        const grid = document.getElementById('awards-grid');
        if (!grid || !isPage('awards')) return;
        try {
            const r = await fetch(API + '/awards');
            const awards = await r.json();
            if (awards.length > 0) {
                grid.innerHTML = awards.map(a => {
                    const hasFile = a.pdfPath ? true : false;
                    const tag = hasFile ? '<span class="award-pdf-badge">PDF Available</span>' : '';
                    const click = hasFile ? `onclick="window.open('${a.pdfPath}','_blank')"` : '';
                    return `<div class="award-card" ${click} style="cursor:${hasFile ? 'pointer' : 'default'}">
                        <div class="award-icon">${a.icon || ''}</div>
                        <div class="award-content">
                            <h3>${a.title}${tag}</h3>
                            <p>${a.description}</p>
                            <div class="award-year">${a.year}</div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                grid.innerHTML = '<p class="empty-msg">No awards available yet.</p>';
            }
        } catch (e) {
            grid.innerHTML = '<p class="empty-msg">Could not load awards.</p>';
        }
    }

    // Gallery on gallery.html
    async function loadGalleryPage() {
        const grid = document.querySelector('.gallery-grid');
        if (!grid || !isPage('gallery') || isPage('gallery-detail')) return;
        try {
            const r = await fetch(API + '/gallery');
            const galleries = await r.json();
            if (galleries.length > 0) {
                grid.innerHTML = galleries.map(g => {
                    const imgs = g.images || [];
                    const cover = g.coverImage || (imgs.length > 0 ? imgs[0] : '');
                    return `<a href="gallery-detail.html?id=${g._id}" class="gallery-item" style="position:relative;${cover ? `background:url(${cover}) center/cover` : ''}">
                        <div style="background:linear-gradient(transparent,rgba(0,0,0,.7));position:absolute;bottom:0;left:0;right:0;padding:15px;border-radius:0 0 12px 12px;">
                            <h3 style="font-size:14px;margin-bottom:3px;color:#e6edf3;">${g.title}</h3>
                            <span style="font-size:12px;opacity:.8;color:#8b949e;">${imgs.length} photos</span>
                        </div>
                    </a>`;
                }).join('');
            } else {
                grid.innerHTML = '<p class="empty-msg" style="text-align:center;grid-column:1/-1;padding:30px;">No gallery items yet.</p>';
            }
        } catch (e) { }
    }

    // Site Settings
    async function loadSiteSettings() {
        try {
            const r = await fetch(API + '/settings');
            const s = await r.json();
            const heroTitle = document.querySelector('.hero h1');
            if (heroTitle && s.bannerTitle) {
                const parts = s.bannerTitle.split(' ');
                const last = parts.pop();
                heroTitle.innerHTML = parts.join(' ') + '<br><span>' + last + '</span>';
            }
            const heroP = document.querySelector('.hero p');
            if (heroP && s.bannerSubtitle) heroP.textContent = s.bannerSubtitle;
            const footerP = document.querySelector('.footer-about p');
            if (footerP && s.footerText) footerP.textContent = s.footerText;
        } catch (e) { }
    }

    function isPage(name) {
        const path = window.location.pathname;
        if (name === 'index') return path === '/' || path.endsWith('/index.html') || path.endsWith('/');
        return path.includes(name + '.html');
    }

    // Awards on index.html
    async function loadHomeAwards() {
        const grid = document.getElementById('home-awards-grid');
        if (!grid || !isPage('index')) return;
        try {
            const r = await fetch(API + '/awards');
            let awards = await r.json();
            if (awards.length > 0) {
                // Show latest 4 awards
                awards = awards.slice(0, 4);
                grid.innerHTML = awards.map(a => {
                    const hasFile = a.pdfPath ? true : false;
                    const tag = hasFile ? '<span class="award-pdf-badge" style="font-size:11px;background:var(--secondary);color:white;padding:2px 6px;border-radius:4px;margin-left:8px;">PDF</span>' : '';
                    const click = hasFile ? `onclick="window.open('${a.pdfPath}','_blank')"` : '';
                    return `<div class="award-card" ${click} style="cursor:${hasFile ? 'pointer' : 'default'}">
                        <div class="award-icon">${a.icon || '🏆'}</div>
                        <div class="award-content">
                            <h3>${a.title}${tag}</h3>
                            <p>${a.description}</p>
                            <div class="award-year">${a.year}</div>
                        </div>
                    </div>`;
                }).join('');
            } else {
                grid.innerHTML = '<p class="empty-msg">No recent awards.</p>';
            }
        } catch (e) {
            grid.innerHTML = '<p class="empty-msg">Could not load awards.</p>';
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        loadHeadlines();
        loadHomeEvents();
        loadEventsPage();
        loadHomeMembers();
        loadCommitteePage();
        loadAwardsPage();
        loadHomeAwards();
        loadGalleryPage();
        loadHomeNotices();
        loadSiteSettings();
    });
})();
