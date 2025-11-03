// Beginner-friendly JS that fetches the README JSON feed and renders a gallery + modal.
// Uses const/let and comments for clarity.

// CDN JSON URL from the project's README (no NASA API key used)
const JSON_URL = 'https://cdn.jsdelivr.net/gh/GCA-Classroom/apod/data.json';

// Get references to DOM elements
const getImageBtn = document.getElementById('getImageBtn');
const gallery = document.getElementById('gallery');
const modal = document.getElementById('modal');
const modalClose = document.getElementById('modalClose');
const modalMedia = document.getElementById('modalMedia');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalExplanation = document.getElementById('modalExplanation');

// Show a short loading message while fetching
function showLoading() {
  gallery.innerHTML = `
    <div class="loading">
      <div class="loading-icon">🔄</div>
      <p>Loading space photos…</p>
    </div>
  `;
}

// Show an error message in the gallery area
function showError(message) {
  gallery.innerHTML = `
    <div class="error">
      <p>${message}</p>
    </div>
  `;
}

// Create a gallery card for an APOD-like object
function createCard(item) {
  // Use thumbnail for videos when provided, otherwise use the main url
  const thumb = item.media_type === 'video' ? (item.thumbnail_url || item.url) : item.url;

  if (!thumb) {
    // Skip items with no usable image/thumbnail
    return null;
  }

  const card = document.createElement('div');
  card.className = 'card';
  card.innerHTML = `
    <img class="card-image" src="${thumb}" alt="${item.title || 'space image'}" loading="lazy" />
    <div class="card-info">
      <h3 class="card-title">${item.title || ''}</h3>
      <p class="card-date">${item.date || ''}</p>
    </div>
  `;

  // Open modal with details when clicked
  card.addEventListener('click', () => {
    openModal(item);
  });

  return card;
}

// Open modal and show image or embedded video
function openModal(item) {
  // Clear previous media
  modalMedia.innerHTML = '';

  if (item.media_type === 'image') {
    const img = document.createElement('img');
    img.src = item.hdurl || item.url;
    img.alt = item.title || '';
    img.className = 'modal-image';
    modalMedia.appendChild(img);
  } else if (item.media_type === 'video') {
    // If embed URL (youtube embed) is provided, use an iframe.
    if (item.url && item.url.includes('youtube')) {
      const iframe = document.createElement('iframe');
      iframe.src = item.url;
      iframe.width = '100%';
      iframe.height = '500';
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      modalMedia.appendChild(iframe);
    } else if (item.thumbnail_url) {
      // Show thumbnail and a link to the video page
      const img = document.createElement('img');
      img.src = item.thumbnail_url;
      img.alt = item.title || 'video thumbnail';
      img.className = 'modal-image';
      modalMedia.appendChild(img);

      const link = document.createElement('p');
      link.innerHTML = `<a href="${item.url}" target="_blank" rel="noopener">Open video in a new tab</a>`;
      modalMedia.appendChild(link);
    } else if (item.url) {
      const link = document.createElement('a');
      link.href = item.url;
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = 'Open video in a new tab';
      modalMedia.appendChild(link);
    } else {
      const p = document.createElement('p');
      p.textContent = 'No playable video available.';
      modalMedia.appendChild(p);
    }
  } else {
    const p = document.createElement('p');
    p.textContent = 'Unsupported media type.';
    modalMedia.appendChild(p);
  }

  // Fill text details
  modalTitle.textContent = item.title || '';
  modalDate.textContent = item.date || '';
  modalExplanation.textContent = item.explanation || '';

  // Show modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

// Close modal and clear media
function closeModal() {
  modal.classList.add('hidden');
  modalMedia.innerHTML = '';
  document.body.style.overflow = '';
}

// Fetch data from the provided CDN JSON and render gallery
async function fetchImages() {
  showLoading();

  try {
    const res = await fetch(JSON_URL);
    if (!res.ok) {
      throw new Error(`Network response not ok: ${res.status}`);
    }

    const data = await res.json();

    // Build the grid
    gallery.innerHTML = '';
    const grid = document.createElement('div');
    grid.className = 'grid';

    let added = 0;
    data.forEach((item) => {
      const card = createCard(item);
      if (card) {
        grid.appendChild(card);
        added += 1;
      }
    });

    if (added === 0) {
      showError('No images or thumbnails available right now. Try again later.');
      return;
    }

    gallery.appendChild(grid);
  } catch (err) {
    console.error(err);
    showError('Failed to load images. Please try again later.');
  }
}

// Wire up UI events
getImageBtn.addEventListener('click', fetchImages);
modalClose.addEventListener('click', closeModal);

// Close modal by clicking outside content
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});