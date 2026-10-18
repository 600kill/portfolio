/*
 * 作品集站点脚本（原生实现，零依赖）
 *  1) 底部「放大 Dock」（原生复刻 MagnificationDock：鼠标距离驱动缩放 + tooltip）
 *  2) 滚动入场动画（IntersectionObserver 触发 .reveal）
 *  3) 顶部导航当前页高亮 + 平滑锚点
 *
 * ★ 待替换信息都集中在下面的 SITE 对象里（改这一处即可全站生效）。
 */

const SITE = {
    name: '可子翔',                                   // 展示用称呼（真实姓名，面试官可对上人）
    github: 'https://github.com/600kill',
    email: '2070819828@qq.com',
    wechat: 'wxid_i3vmy5f434ri22',
    direction: 'AI 应用开发 / 全栈开发（实习）',
    avatar: 'assets/avatar.jpg',
    resume: 'resume/resume-fullstack.pdf',            // 投递全栈开发岗，默认给全栈版（另有 resume-ai.pdf / resume-backend.pdf）
    // 两个项目的源码仓库（留空则按钮显示为「源码暂未公开」并禁用）
    repoAgent: 'https://github.com/600kill/Agent-Platform',
    repoResume: 'https://github.com/600kill/resume-multi-agent-helper',
};

const svg = (paths, extra = '') =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7"
        stroke-linecap="round" stroke-linejoin="round" ${extra}>${paths}</svg>`;

const ICONS = {
    home: svg('<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/>'),
    bot: svg('<rect x="4" y="8" width="16" height="12" rx="3"/><path d="M12 8V4"/><circle cx="9.5" cy="14" r="1"/><circle cx="14.5" cy="14" r="1"/>'),
    resume: svg('<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6M9 17h4"/>'),
    github: svg('<path d="M9 19c-4.3 1.2-4.3-2.2-6-2.6m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 4.5-1.4 4.5-5a3.9 3.9 0 0 0-1.1-2.7 3.6 3.6 0 0 0-.1-2.8s-1.2-.3-3.8 1.5a9.3 9.3 0 0 0-5 0C6.4 5.4 5.2 5.7 5.2 5.7a3.6 3.6 0 0 0-.1 2.8A3.9 3.9 0 0 0 4 11.2c0 3.6 1.7 4.7 4.5 5-.6.6-.6 1.2-.5 2V21"/>'),
    mail: svg('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3.5 6.5 8.5 6 8.5-6"/>'),
    arrow: svg('<path d="M5 12h14M13 6l6 6-6 6"/>'),
};

function renderDock() {
    const host = document.getElementById('dock');
    if (!host) return;
    const items = [
        { icon: ICONS.home, label: '首页', href: 'index.html' },
        { icon: ICONS.bot, label: 'AI Agent 平台', href: 'agent-platform.html', prominent: true },
        { icon: ICONS.resume, label: '简历优化助手', href: 'resume-assistant.html' },
        { sep: true },
        { icon: ICONS.github, label: 'GitHub 源码', href: SITE.github, external: true },
        { icon: ICONS.mail, label: '发邮件给我', href: `mailto:${SITE.email}` },
    ];
    host.innerHTML = `<div class="dock" id="dockInner">${
        items.map((it) => it.sep
            ? '<span class="dock-sep"></span>'
            : `<a class="dock-item${it.prominent ? ' prominent' : ''}" href="${it.href}"
                    ${it.external ? 'target="_blank" rel="noopener"' : ''} title="${it.label}">
                    ${it.icon}<span class="dock-tip">${it.label}</span></a>`).join('')
    }</div>`;

    const dock = document.getElementById('dockInner');
    const nodes = Array.from(dock.querySelectorAll('.dock-item'));

    // 放大效果：鼠标距离驱动缩放 + 上浮（原生近似 spring）
    const DISTANCE = 190;
    const MAX_SCALE = 1.5;
    const LIFT = 10;

    const reset = () => nodes.forEach((n) => { n.style.transform = ''; });
    dock.addEventListener('mousemove', (e) => {
        const rect = dock.getBoundingClientRect();
        const x = e.clientX - rect.left;
        nodes.forEach((n) => {
            const c = n.offsetLeft + n.offsetWidth / 2;
            const d = Math.abs(x - c);
            const t = Math.max(0, 1 - d / DISTANCE);
            const eased = t * t * (3 - 2 * t); // smoothstep
            const scale = 1 + (MAX_SCALE - 1) * eased;
            n.style.transform = `translateY(${-LIFT * eased}px) scale(${scale})`;
            n.style.zIndex = String(100 + Math.round(eased * 100));
        });
    });
    dock.addEventListener('mouseleave', reset);
    dock.addEventListener('focusin', reset);
}

function initReveal() {
    const targets = document.querySelectorAll('[data-reveal]');
    if (!targets.length) return;
    if (!('IntersectionObserver' in window)) {
        targets.forEach((el) => el.classList.add('reveal'));
        return;
    }
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) return;
            const el = entry.target;
            const delay = Number(el.dataset.revealDelay || 0);
            el.style.animationDelay = delay + 'ms';
            el.classList.add('reveal');
            io.unobserve(el);
        });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    targets.forEach((el) => io.observe(el));
}

function initNav() {
    // 顶部导航高亮：按当前文件名匹配
    const here = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.topnav-links a').forEach((a) => {
        const target = a.getAttribute('href');
        if (!target) return;
        if (target === here || (here === '' && target === 'index.html')) a.classList.add('is-active');
    });
    // 锚点平滑滚动（hash 链接）
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
        a.addEventListener('click', (e) => {
            const id = a.getAttribute('href').slice(1);
            const el = id && document.getElementById(id);
            if (!el) return;
            e.preventDefault();
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });
}

function applySiteConfig() {
    document.querySelectorAll('[data-site]').forEach((el) => {
        const key = el.dataset.site;
        const value = SITE[key];
        if (!value) { if (key !== 'name') el.style.display = 'none'; return; }
        if (key === 'avatar') {
            el.setAttribute('src', value);
            return;
        }
        if (key === 'name' || key === 'email' || key === 'wechat' || key === 'direction') {
            el.textContent = value;
        }
        if (key === 'email') el.setAttribute('href', `mailto:${SITE.email}`);
        if (key === 'github') {
            el.setAttribute('href', value);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener');
        }
    });
    // 没有简历 PDF 时隐藏「下载简历」按钮
    document.querySelectorAll('[data-resume-btn]').forEach((el) => {
        if (SITE.resume) el.setAttribute('href', SITE.resume);
        else el.remove();
    });
    // 项目源码按钮：仓库地址为空时置为「暂未公开」态
    document.querySelectorAll('[data-repo]').forEach((el) => {
        const url = el.dataset.repo === 'agent' ? SITE.repoAgent : SITE.repoResume;
        if (url) {
            el.setAttribute('href', url);
            el.setAttribute('target', '_blank');
            el.setAttribute('rel', 'noopener');
        } else {
            el.removeAttribute('href');
            el.textContent = '源码整理中（暂未公开）';
            el.classList.remove('primary', 'shiny');
            el.classList.add('is-disabled');
            el.setAttribute('aria-disabled', 'true');
            el.setAttribute('title', '仓库还在整理，稍后公开');
        }
    });
    // 一键复制（邮箱 / 微信号）
    document.addEventListener('click', (e) => {
        const btn = e.target.closest('[data-copy]');
        if (!btn) return;
        const text = SITE[btn.dataset.copy];
        if (!text) return;
        e.preventDefault();
        const done = () => {
            const old = btn.textContent;
            btn.textContent = '已复制';
            setTimeout(() => { btn.textContent = old; }, 1400);
        };
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(done).catch(() => {
                window.prompt('手动复制：', text);
            });
        } else {
            window.prompt('手动复制：', text);
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    applySiteConfig();
    renderDock();
    initReveal();
    initNav();
});
