import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api';
const API_KEY = '38967351-7f81fcf5656e7dea2c65ce073';
const input = document.querySelector('[type="text"]');

const params = new URLSearchParams({
  image_type: 'photo;',
  orientation: 'horizontal',
  safesearch: true,
  per_page: 40,
});

export async function fetchResponse(page) {
  if (input.value !== '') {
    const response = await axios.get(
      `${BASE_URL}/?key=${API_KEY}&q=${input.value}&${params}&page=${page}`
    );

    return response;
  }
}
