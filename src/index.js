import axios from 'axios';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38967351-7f81fcf5656e7dea2c65ce073';

const refs = {
  form: document.querySelector('.search-form'),
  input: document.querySelector('[type="text"]'),
  div: document.querySelector('.gallery'),
  btnMore: document.querySelector('.load-more'),
};

const params = new URLSearchParams({
  image_type: 'photo;',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
});

let currentPage = 1;

refs.form.addEventListener('submit', searchImgs);
refs.btnMore.addEventListener('click', onLoad);

refs.btnMore.classList.add('is-hidden');

async function fetchResp(page = 1) {
  let userVal = refs.input.value;

  if (userVal !== '') {
    const response = await axios.get(
      `${BASE_URL}/?key=${API_KEY}&q=${userVal}&${params}&page=${page}`
    );

    return response;
  }
}

async function searchImgs(e) {
  e.preventDefault();
  refs.div.innerHTML = '';

  try {
    const responseData = await fetchResp();
    const arrData = responseData.data.hits;

    if (arrData.length === 0) {
      Notify.failure(
        'Sorry, there are no images matching your search query. Please try again.',
        {
          timeout: 5000,
        }
      );
      refs.btnMore.classList.add('is-hidden');
      return;
    }

    if (responseData.data.totalHits !== 0) {
      Notify.success(`Hooray! We found ${responseData.data.totalHits} images.`);
    }

    updateUI(arrData);
  } catch {
    refs.btnMore.classList.add('is-hidden');
    Notify.failure("It's an empty string!");
  }
}

async function onLoad() {
  currentPage += 1;

  try {
    const responseData = await fetchResp(currentPage);
    const arrData = responseData.data.hits;

    if (arrData.length === 0) {
      Notify.success('The End');

      refs.btnMore.classList.add('is-hidden');
      return;
    }

    updateUI(responseData.data.hits);

    const { height: cardHeight } = document
      .querySelector('.gallery')
      .firstElementChild.getBoundingClientRect();

    window.scrollBy({
      top: cardHeight * 1.9,
      behavior: 'smooth',
    });
  } catch {
    Notify.failure(
      "We're sorry, but you've reached the end of search results."
    );
    refs.btnMore.classList.add('is-hidden');
  }
}

function updateUI(newData) {
  refs.div.insertAdjacentHTML('beforeend', markup(newData));

  createSimpleLightbox();
}

function markup(arr) {
  refs.btnMore.classList.remove('is-hidden');
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

function createSimpleLightbox() {
  const gallery = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionDelay: 250,
  });
  gallery.refresh();
}
