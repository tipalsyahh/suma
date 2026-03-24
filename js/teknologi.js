document.addEventListener('DOMContentLoaded', () => {

  const container = document.querySelector('.teknologi');
  if (!container) return;

  fetch('https://lampost.co/wp-json/wp/v2/categories?slug=teknologi')
    .then(res => res.json())
    .then(catData => {

      if (!catData.length) return;

      const categoryId = catData[0].id;

      return fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=3&orderby=date&order=desc&_embed`);
    })
    .then(res => res.json())
    .then(posts => {

      if (!posts || posts.length < 3) return;

      const p1 = posts[0];
      const p2 = posts[1];
      const p3 = posts[2];

      function getLink(post) {
        const kategoriSlug =
          post._embedded?.['wp:term']?.[0]?.[0]?.slug || 'berita';
        return `halaman.html?${kategoriSlug}/${post.slug}`;
      }

      function getImg(post) {
        return post._embedded?.['wp:featuredmedia']?.[0]?.source_url || 'image/ai.jpg';
      }

      const html = `
        <div class="tek-wrapper">

          <div class="tek-left">

            <a href="${getLink(p1)}" class="tek-item">
              <h3>${p1.title.rendered}</h3>
              <p>${p1.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0,120)}...</p>
              <span>5 MIN READ</span>
            </a>

            <a href="${getLink(p2)}" class="tek-item">
              <h3>${p2.title.rendered}</h3>
              <p>${p2.excerpt.rendered.replace(/<[^>]+>/g, '').slice(0,120)}...</p>
              <span>3 MIN READ</span>
            </a>

          </div>

          <div class="tek-right">
            <a href="${getLink(p3)}">
              <img src="${getImg(p3)}" alt="${p3.title.rendered}">
            </a>
          </div>

        </div>
      `;

      container.innerHTML = html;

    })
    .catch(() => {
      container.innerHTML = '<p>Gagal memuat</p>';
    });

});