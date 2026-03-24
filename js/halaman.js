document.addEventListener('DOMContentLoaded', async () => {

    const berita = document.getElementById('berita');
    if (!berita) return;

    const query = decodeURIComponent(window.location.search.replace('?', ''));
    const [kategoriSlug, slug] = query.split('/');

    if (!slug) {
        berita.innerHTML = '<p>Berita tidak ditemukan</p>';
        return;
    }

    try {

        const api = `https://lampost.co/wp-json/wp/v2/posts?slug=${slug}&orderby=date&order=desc`;
        const res = await fetch(api);
        if (!res.ok) throw new Error();

        const posts = await res.json();
        if (!posts.length) throw new Error();

        const post = posts[0];

        const judulEl = document.querySelector('.judul-berita');
        if (judulEl) judulEl.innerHTML = post.title.rendered;

        const isi = document.querySelector('.isi-berita');
        isi.innerHTML = post.content.rendered;

        isi.querySelectorAll('p').forEach(p => {
            const t = p.innerHTML.replace(/&nbsp;/g, '').replace(/\s+/g, '').trim();
            if (!t) p.remove();
        });

        isi.querySelectorAll('a[href]').forEach(link => {
            let href = link.getAttribute('href');
            if (!href) return;
            if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

            try {
                const url = href.startsWith('http') ? new URL(href) : new URL(href, 'https://lampost.co');
                if (!url.hostname.includes('lampost.co')) return;

                const search = url.searchParams.get('s');
                if (search) {
                    link.href = `search.html?q=${encodeURIComponent(search)}`;
                    link.target = '_self';
                    return;
                }

                const parts = url.pathname.split('/').filter(Boolean);
                if (parts.length >= 2) {
                    link.href = `halaman.html?${parts.at(-2)}/${parts.at(-1)}`;
                    link.target = '_self';
                    return;
                }

                link.href = 'index.html';
                link.target = '_self';
            } catch {
                link.href = 'index.html';
                link.target = '_self';
            }
        });

        isi.querySelectorAll('img').forEach(img => {
            img.removeAttribute('width');
            img.removeAttribute('height');
            img.style.width = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
        });

        isi.querySelectorAll('figure').forEach(f => {
            f.style.width = '100%';
            f.style.margin = '1rem auto';
        });

        isi.querySelectorAll('.alignleft,.alignright').forEach(el => {
            el.style.float = 'none';
            el.style.margin = '1rem auto';
        });

        const gambar = document.querySelector('.gambar-berita');
        if (gambar && post.featured_media) {
            fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
                .then(r => r.ok ? r.json() : null)
                .then(m => {
                    if (!m) return;
                    gambar.src = m.source_url;
                    gambar.style.width = '100%';
                    gambar.style.height = 'auto';
                })
                .catch(() => gambar.src = 'image/default.jpg');
        }

        const tanggal = document.getElementById('tanggal');
        if (tanggal) {
            tanggal.innerText = new Date(post.date).toLocaleDateString('id-ID', {
                weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
            });
        }

        const editorEl = document.getElementById('editor');
        if (editorEl) {
            const termLink = post._links?.['wp:term']?.[2]?.href;
            if (!termLink) {
                editorEl.innerText = 'by Redaksi';
            } else {
                fetch(termLink)
                    .then(r => r.ok ? r.json() : [])
                    .then(editors => {
                        if (!editors.length) {
                            editorEl.innerText = 'by Redaksi';
                        } else if (editors.length === 1) {
                            editorEl.innerText = `by ${editors[0].name}`;
                        } else {
                            const last = editors.pop().name;
                            editorEl.innerText = `by ${editors.map(e => e.name).join(', ')}, and ${last}`;
                        }
                    })
                    .catch(() => editorEl.innerText = 'by Redaksi');
            }
        }

        const kategoriEl = document.getElementById('kategori');
        if (kategoriEl && post.categories?.[0]) {
            fetch(`https://lampost.co/wp-json/wp/v2/categories/${post.categories[0]}`)
                .then(r => r.ok ? r.json() : null)
                .then(cat => kategoriEl.innerText = cat?.name || kategoriSlug || 'Berita')
                .catch(() => kategoriEl.innerText = kategoriSlug || 'Berita');
        }

        setTimeout(() => {

            const tagBox = document.getElementById("aiTags");
            if (!tagBox) return;

            let kategoriNama = document.getElementById('kategori')?.innerText || '';

            const stopWords = [
                "yang", "dan", "di", "ke", "dari", "ini", "itu", "untuk", "pada", "dengan", "adalah", "akan", "juga",
                "karena", "oleh", "sebagai", "atau", "dalam", "para", "tidak", "telah", "agar", "bagi", "hingga",
                "kepada", "serta", "bahwa", "yakni", "ia", "kami", "mereka", "anda", "saya", "jadi", "pun", "lagi"
            ];

            const platform = ["instagram", "tiktok", "youtube", "facebook", "twitter", "x", "whatsapp", "telegram"];

            const raw = (post.title.rendered + " " + isi.innerText)
                .replace(/[0-9]/g, ' ')
                .replace(/[^\w\s]/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();

            const lower = raw.toLowerCase();

            let words = lower.split(' ').filter(w => w.length > 4 && !stopWords.includes(w));

            let freq = {};
            words.forEach(w => freq[w] = (freq[w] || 0) + 1);

            const judulWords = post.title.rendered.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
            Object.keys(freq).forEach(k => {
                if (judulWords.includes(k)) freq[k] += 8;
            });

            let tags = Object.entries(freq).sort((a, b) => b[1] - a[1]).map(t => t[0]);

            const namaOrang = [...new Set(
                (post.content.rendered.match(/\b[A-Z][a-z]{2,}\s+[A-Z][a-z]{2,}\b/g) || [])
                    .map(n => n.trim())
            )];

            const platformTags = platform.filter(p => lower.includes(p));

            if (kategoriNama) tags.unshift(kategoriNama.toLowerCase());

            platformTags.forEach(p => tags.unshift(p));

            namaOrang.forEach(n => tags.unshift(n));

            tags = [...new Set(tags)].slice(0, 12);

            tagBox.innerHTML = '';

            tags.forEach(tag => {

                let clean = tag.toLowerCase().replace(/\s+/g, '').trim();
                if (!clean) return;

                const short = clean.length > 14 ? clean.slice(0, 14) + '…' : clean;

                const a = document.createElement("a");
                a.href = `search.html?q=${encodeURIComponent(tag)}`;
                a.innerText = "#" + short;
                a.title = tag;

                tagBox.appendChild(a);

            });

        }, 500);

    } catch (err) {
        console.error(err);
        berita.innerHTML = '<p>Gagal memuat berita</p>';
    }

});
