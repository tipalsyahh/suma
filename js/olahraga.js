document.addEventListener('DOMContentLoaded', async () => {

  const container = document.querySelector('.sport');
  if (!container) return;

  container.innerHTML = `
    <div class="slider-outer">
      <div class="slider"></div>
    </div>
    <div class="dots"></div>
  `;

  const slider = container.querySelector('.slider');
  const dotsContainer = container.querySelector('.dots');

  const MEDIA_CACHE = {};
  const TERM_CACHE = {};

  try {

    const catRes = await fetch('https://lampost.co/wp-json/wp/v2/categories?slug=olahraga');
    if (!catRes.ok) return;
    const catData = await catRes.json();
    if (!catData.length) return;

    const categoryId = catData[0].id;
    const kategoriSlug = 'olahraga';

    const res = await fetch(`https://lampost.co/wp-json/wp/v2/posts?categories=${categoryId}&per_page=6&orderby=date&order=desc`);
    if (!res.ok) return;
    const posts = await res.json();
    if (!posts.length) return;

    const groups = [];
    for (let i = 0; i < posts.length; i += 2) {
      groups.push(posts.slice(i, i + 2));
    }

    for (let i = 0; i < groups.length; i++) {

      let cardsHTML = '';

      for (const post of groups[i]) {

        const judul = post.title.rendered;
        const link = `halaman.html?${kategoriSlug}/${post.slug}`;

        let gambar = 'image/ai.jpg';
        let kategori = 'Berita';

        if (post.featured_media) {
          if (MEDIA_CACHE[post.featured_media]) {
            gambar = MEDIA_CACHE[post.featured_media];
          } else {
            fetch(`https://lampost.co/wp-json/wp/v2/media/${post.featured_media}`)
              .then(res => res.json())
              .then(media => {
                const img =
                  media.media_details?.sizes?.medium?.source_url ||
                  media.source_url ||
                  gambar;

                MEDIA_CACHE[post.featured_media] = img;

                const imgEl = slider.querySelector(`[data-id="${post.id}"] img`);
                if (imgEl) imgEl.src = img;
              });
          }
        }

        const termLink = post._links?.['wp:term']?.[0]?.href;
        if (termLink) {
          if (TERM_CACHE[termLink]) {
            kategori = TERM_CACHE[termLink];
          } else {
            fetch(termLink)
              .then(res => res.json())
              .then(data => {
                const catName = data?.[0]?.name || kategori;
                TERM_CACHE[termLink] = catName;

                const el = slider.querySelector(`[data-id="${post.id}"] .kategori`);
                if (el) el.textContent = catName;
              });
          }
        }

        cardsHTML += `
          <a href="${link}" class="card-slider" data-id="${post.id}">
            <img src="${gambar}" alt="${judul}">
            <div class="content">
              <span class="kategori">${kategori}</span>
              <p class="judul">${judul}</p>
            </div>
          </a>
        `;
      }

      slider.insertAdjacentHTML('beforeend', `
        <div class="slide">${cardsHTML}</div>
      `);

      dotsContainer.insertAdjacentHTML('beforeend', `<span class="dot ${i === 0 ? 'active' : ''}"></span>`);
    }

    const slides = slider.querySelectorAll('.slide');
    const dots = dotsContainer.querySelectorAll('.dot');

    let index = 0;

    function updateSlide(i) {
      index = i;
      slider.style.transform = `translateX(-${i * 100}%)`;
      dots.forEach(d => d.classList.remove('active'));
      dots[i].classList.add('active');
    }

    setInterval(() => {
      index = (index + 1) % slides.length;
      updateSlide(index);
    }, 3000);

  } catch (err) {
    container.innerHTML = '<p>Gagal memuat</p>';
  }

});