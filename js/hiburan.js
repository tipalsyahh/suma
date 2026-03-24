document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.hiburan');
  if (!container) return;

  const catCache = {};

  async function getCategoryName(catId) {
    if (!catId) return 'Berita';
    if (catCache[catId]) return catCache[catId];

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/categories/${catId}`);
    if (!res.ok) return 'Berita';

    const data = await res.json();
    return (catCache[catId] = data.name || 'Berita');
  }

  function formatTanggal(dateString) {
    const d = new Date(dateString);
    const now = new Date();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);

    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const jam = d.toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) return `Hari ini ${jam}`;
    if (isYesterday) return `Kemarin ${jam}`;

    return d.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }) + ` ${jam}`;
  }

  try {
    const catRes = await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=hiburan');
    if (!catRes.ok) throw new Error();

    const catData = await catRes.json();
    if (!catData.length) return;

    const categoryId = catData[0].id;

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=6&orderby=date&order=desc`);
    if (!res.ok) throw new Error();

    const posts = await res.json();

    let html = '';

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];

      const judul = post.title.rendered;
      const nomor = i + 1;

      const kategori = await getCategoryName(post.categories?.[0]);
      const tanggal = formatTanggal(post.date);

      html += `
        <a href="halaman.html?berita/${post.slug}" class="list-berita">
          <div class="nomor">#${nomor}</div>
          <div class="konten">
            <p class="judul">${judul}</p>
            <p class="meta">${kategori} ${tanggal}</p>
          </div>
        </a>
      `;
    }

    container.innerHTML = html;

  } catch (e) {
    container.innerHTML = '<p>Gagal memuat</p>';
  }

});