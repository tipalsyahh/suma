document.addEventListener('DOMContentLoaded', () => {

    const heroLeft = document.querySelector('.hero-left');
    const top1 = document.querySelector('.top-1');
    const top2 = document.querySelector('.top-2');
    const bottom1 = document.querySelector('.bottom-1');

    if (!heroLeft || !top1 || !top2 || !bottom1) return;

    const mediaCache = {};
    const categoryCache = {};
    const editorCache = {};

    function formatTanggal(dateString) {
        const d = new Date(dateString);
        const bulan = d.toLocaleString('en-US', { month: 'short' });
        return `${bulan} ${d.getDate()}`;
    }

    async function getMedia(mediaId) {
        if (!mediaId) return 'image/ai.jpg';
        if (mediaCache[mediaId]) return mediaCache[mediaId];

        const res = await fetch(`https://lampost.co/wp-json/wp/v2/media/${mediaId}`);
        const data = await res.json();

        return (mediaCache[mediaId] =
            data.media_details?.sizes?.full?.source_url ||
            data.media_details?.sizes?.large?.source_url ||
            data.source_url ||
            'image/ai.jpg'
        );
    }

    async function getCategory(catId) {
        if (!catId) return { name: 'Berita', slug: 'berita' };
        if (categoryCache[catId]) return categoryCache[catId];

        const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`);
        const data = await res.json();

        return (categoryCache[catId] = {
            name: data.name,
            slug: data.slug
        });
    }

    async function getEditor(post) {
        let editor = 'Redaksi';
        const termLink = post._links?.['wp:term']?.[2]?.href;
        if (!termLink) return editor;

        if (editorCache[termLink]) return editorCache[termLink];

        try {
            const res = await fetch(termLink);
            if (res.ok) {
                const data = await res.json();
                editor = data?.[0]?.name || editor;
                editorCache[termLink] = editor;
            }
        } catch (_) { }

        return editor;
    }

    function killBorder(el) {
        el.style.width = '100%';
        el.style.boxSizing = 'border-box';
        el.style.outline = 'none';
        el.style.border = 'none';
        el.style.boxShadow = 'none';
        el.style.webkitTapHighlightColor = 'transparent';
    }

    function renderFast(el, post) {
        const judul = post.title.rendered;
        const tanggal = formatTanggal(post.date);
        const id = `hero-${post.id}`;

        el.innerHTML = `
            <a class="hero-link" id="${id}">
            <img src="image/ai.jpg" alt="" loading="lazy">
            <div class="hero-content">
            <p class="hero-category">...</p>
            <h2 class="card-text">${judul}</h2>
            <div class="detail-info">
            <p class="editor-slider">By ...</p>
            <p class="tanggal-slider">${tanggal}</p>
            </div>
            </div>
            </a>
            `;

        const linkEl = el.querySelector('.hero-link');
        killBorder(linkEl);

        (async () => {

            const imgUrl = await getMedia(post.featured_media);
            const { name: kategori, slug } = await getCategory(post.categories?.[0]);
            const editor = await getEditor(post);

            const imgEl = el.querySelector('img');
            if (!linkEl || !imgEl) return;

            const preload = new Image();
            preload.src = imgUrl;

            preload.onload = () => {
                imgEl.src = imgUrl;
                imgEl.alt = judul;
                linkEl.href = `halaman.html?${slug}/${post.slug}`;
                killBorder(linkEl);
            };

            linkEl.querySelector('.hero-category').textContent = kategori;
            linkEl.querySelector('.editor-slider').textContent = `By ${editor}`;

        })();
    }

    async function init() {
        try {

            const res = await fetch('https://lampost.co/wp-json/wp/v2/posts?per_page=4&orderby=date&order=desc');
            if (!res.ok) throw new Error('Gagal ambil data');

            const posts = await res.json();
            if (posts.length < 4) return;

            renderFast(heroLeft, posts[0]);
            renderFast(top1, posts[1]);
            renderFast(top2, posts[2]);
            renderFast(bottom1, posts[3]);

        } catch (err) {
            console.error(err);
        }
    }

    init();

});
