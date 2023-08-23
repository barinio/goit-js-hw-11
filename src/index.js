import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import { fetchResponse } from './pixabay-api';

const refs = {
  form: document.querySelector('.search-form'),
  div: document.querySelector('.gallery'),
  btnMore: document.querySelector('.load-more'),
  target: document.querySelector('.js-guard'),
};

let currentPage = 1;
let responseData = null;

const gallery = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionDelay: 250,
});

let options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};
let observer = new IntersectionObserver(onLoad, options);

refs.form.addEventListener('submit', searchImgs);

async function searchImgs(e) {
  e.preventDefault();
  observer.unobserve(refs.target);
  refs.div.innerHTML = '';
  currentPage = 1;

  try {
    responseData = await fetchResponse(currentPage);
    const arrData = responseData.data;

    if (arrData.hits.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.'
      );
      return;
    }

    if (arrData.totalHits !== 0) {
      Notify.success(`Hooray! We found ${arrData.totalHits} images.`);
    }

    updateUI(arrData.hits);
    const totalHits = arrData.totalHits;
    if (Math.ceil(totalHits / 40) <= currentPage) {
      observer.observe(refs.div.lastChild);
      observer.unobserve(refs.target);
    }
  } catch {
    Notify.failure("It's an empty string!");
  }
}

async function onLoad(entries) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      currentPage += 1;

      loadMoreData();
    }
  });
}

async function loadMoreData() {
  try {
    const nextResponseData = await fetchResponse(currentPage);
    const arrNextData = nextResponseData.data.hits;
    const totalHits = nextResponseData.data.totalHits;
    updateUI(arrNextData);
    if (Math.ceil(totalHits / 40) <= currentPage) {
      Notify.success(`The End!`);
      observer.unobserve(refs.target);
    }
  } catch {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
  }
}

function updateUI(data) {
  refs.div.insertAdjacentHTML('beforeend', markup(data));
  observer.observe(refs.target);
  observer.unobserve(refs.div.lastChild);

  gallery.refresh();
}

function markup(arr) {
  return arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => `
	<div class="photo-card">
	<a class="gallery__link" href="${largeImageURL}">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" width=264 height='175'/>
  </a>
	<div class="info">
    <p class="info-item">
      <b>Like: </b>${likes}
    </p>
    <p class="info-item">
      <b>Views: </b>${views}
    </p>
    <p class="info-item">
      <b>Comments: </b>${comments}
    </p>
    <p class="info-item">
      <b>Downloads: </b>${downloads}
    </p>
  </div>
</div>`
    )
    .join('');
}
// if (Math.ceil(responseData.data.totalHits / 40) === currentPage) {
//   console.log('yes');
// }
