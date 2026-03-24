document.addEventListener('DOMContentLoaded', () => {

const heroMain = document.getElementById('hero-main');
const heroSub1 = document.getElementById('hero-sub-1');
const heroSub2 = document.getElementById('hero-sub-2');
if (!heroMain || !heroSub1 || !heroSub2) return;

const mediaCache = {};
const categoryCache = {};
const editorCache = {};

const formatTanggal = d =>
new Date(d).toLocaleDateString('id-ID', {
day: '2-digit',
month: 'short',
year: 'numeric'
});

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
} catch (_) {}

return editor;
}

function renderFast(el, post, isMain = false) {
const judul = post.title.rendered;
const tanggal = formatTanggal(post.date);

el.innerHTML = `
<img src="image/ai.jpg" alt="${judul}" loading="lazy">
<a href="#" class="hero-overlay">
${isMain ? `<span class="hero-category">...</span>` : ``}
<h3 class="hero-title">${judul}</h3>
${
isMain
? `<div class="hero-meta">
<span class="hero-editor">By ...</span>
<span class="hero-date">${tanggal}</span>
</div>`
: ``
}
</a>
`;
}

async function enrich(el, post, isMain = false) {

const imgUrl = await getMedia(post.featured_media);
const { name, slug } = await getCategory(post.categories?.[0]);

const imgEl = el.querySelector('img');

const preload = new Image();
preload.src = imgUrl;

preload.onload = () => {
imgEl.src = imgUrl;
};

const a = el.querySelector('.hero-overlay');
a.href = `halaman.html?${slug}/${post.slug}`;

if (isMain) {
const editor = await getEditor(post);
a.querySelector('.hero-category').textContent = name;
a.querySelector('.hero-editor').textContent = `By ${editor}`;
}
}

async function init() {
try {

const res = await fetch(
'https://lampost.co/wp-json/wp/v2/posts?per_page=3&orderby=date&order=desc&_fields=id,slug,title,date,featured_media,categories,_links'
);
if (!res.ok) throw new Error();

const posts = await res.json();
if (posts.length < 3) return;

renderFast(heroMain, posts[0], true);
renderFast(heroSub1, posts[1], false);
renderFast(heroSub2, posts[2], false);

enrich(heroMain, posts[0], true);
enrich(heroSub1, posts[1], false);
enrich(heroSub2, posts[2], false);

} catch (err) {
console.error('Hero load gagal:', err);
}
}

init();

});
