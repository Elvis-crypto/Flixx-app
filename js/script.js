const options = {
	method: "GET",
	headers: {
		accept: "application/json",
		Authorization:
			"Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjRjOTU4YjcxMGY1ODhjOTlhMGE2ODZmNjQwZGVjNCIsInN1YiI6IjY1YTJmNDA0NTY5MGI1MTM3ZmFmZjJjMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.s1w8JHCxqgXg2a2XN2z2ISkNNQ_uR-T6S8lm7pYAm60",
	},
};

const optionsPost = {
	method: "POST",
	headers: {
		accept: "application/json",
		"content-type": "application/json",
		Authorization:
			"Bearer eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiNjRjOTU4YjcxMGY1ODhjOTlhMGE2ODZmNjQwZGVjNCIsInN1YiI6IjY1YTJmNDA0NTY5MGI1MTM3ZmFmZjJjMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.s1w8JHCxqgXg2a2XN2z2ISkNNQ_uR-T6S8lm7pYAm60",
	},
};
// Building a router to direct specific code ot specific pages
const global = {
	currentPage: window.location.pathname,
};

// Highlight movies or TV-shows
function highlightNav(contentType = "") {
	navAll = document.querySelectorAll(".main-header nav ul li a");
	navMovies = navAll[0];
	navShows = navAll[1];
	if (contentType !== "") {
		if (contentType === "movie") {
			navMovies.classList.add("active");
			navShows.classList.remove("active");
		} else if (contentType === "tv") {
			navShows.classList.add("active");
			navMovies.classList.remove("active");
		}
	} else {
		switch (global.pageType) {
			case "movies":
				navMovies.classList.add("active");
				break;
			case "shows":
				navShows.classList.add("active");
				break;
			case "search":
				// navShows.style.color = 'var(--color-secondary)'
				break;
			default:
				throw new Error(
					`Unexpected input for pageType: ${pageType}\n Acceptable values are "movies" or "shows" or "search"`
				);
		}
	}
}

async function validateGetRequest(resp) {
	if (resp.ok !== true) {
		throw new Error(
			`Get Request failed:\nStatus code: ${resp.status} -- ${resp.statusText}`
		);
	}
	const data = await resp.json();
	return data;
}

// Get the list of popular movies
async function getPopularMovies(page = 1) {
	const resp = await fetch(
		`https://api.themoviedb.org/3/movie/popular?language=en-US&page=${page}`,
		options
	);
	const data = await validateGetRequest(resp);
	return data;
}
// Get the list of popular TV-shows
async function getPopularShows(page = 1) {
	const resp = await fetch(
		`https://api.themoviedb.org/3/tv/popular?language=en-US&page=${page}`,
		options
	);
	const data = await validateGetRequest(resp);
	return data;
}

async function getMovieDetails(id) {
	const resp = await fetch(
		`https://api.themoviedb.org/3/movie/${id}?language=en-US`,
		options
	);
	const data = await validateGetRequest(resp);
	return data;
}

async function getShowDetails(id) {
	const resp = await fetch(
		`https://api.themoviedb.org/3/tv/${id}?language=en-US`,
		options
	);
	const data = await validateGetRequest(resp);
	return data;
}

async function getNowPlaying(page = 1) {
	const resp = await fetch(
		`https://api.themoviedb.org/3/movie/now_playing?language=en-US&page=${page}`,
		options
	);
	const data = await validateGetRequest(resp);
	return data;
}

async function showMovieDetails() {
	showSpinner();
	movieID = Number(window.location.search.split("=")[1]);
	data = await getMovieDetails(movieID);
	console.log(data);
	const root = document.querySelector("#movie-details");
	root.innerHTML = `
		<div class="details-top">
			<div>
				<img
					src=${
						data.poster_path
							? "https://image.tmdb.org/t/p/w342" + data.poster_path
							: "images/no-image.jpg"
					}
					class="card-img-top"
					alt=${data.title}
				/>
			</div>
			<div>
				<h2>${data.title}</h2>
				<p>
					<i class="fas fa-star text-primary"></i>
					${data.vote_average.toFixed(1)} / 10
				</p>
				<p class="text-muted">Release Date: ${data.release_date}</p>
				<p>
					${data.overview}
				</p>
				<h5>Genres</h5>
				<ul class="list-group">
				</ul>
				${
					data.homepage &&
					"<a href=" +
						data.homepage +
						' target="_blank" class="btn">Visit Movie Homepage</a>'
				}
			</div>
		</div>
		<div class="details-bottom">
			<h2>Movie Info</h2>
			<ul>
				<li><span class="text-secondary">Budget:</span> ${
					data.budget
						? data.budget.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
						  })
						: "No Data"
				}</li>
				<li><span class="text-secondary">Revenue:</span> ${
					data.revenue
						? data.revenue.toLocaleString("en-US", {
								style: "currency",
								currency: "USD",
						  })
						: "No Data"
				}</li>
				<li><span class="text-secondary">Runtime:</span> ${data.runtime} minutes</li>
				<li><span class="text-secondary">Status:</span> ${data.status}</li>
			</ul>
			<h4>Production Companies</h4>
			<div class="list-group production-group"></div>
		</div>
	`;
	displayBackgroundImage(data.backdrop_path);
	const genreList = root.querySelector("ul.list-group");
	data.genres.forEach((genre) => {
		const li = document.createElement("li");
		li.textContent = genre.name;
		genreList.appendChild(li);
	});
	const companyList = root.querySelector("div.list-group");
	numProds = data.production_companies.length;
	data.production_companies.forEach((company, idx) => {
		if (company.logo_path) {
			companyList.innerHTML += `<img src="https://image.tmdb.org/t/p/w154${company.logo_path}"/>`;
		} else {
			companyList.innerHTML += `${company.name}`;
		}
		companyList.innerHTML += `${idx < numProds - 1 ? " " : ""}`;
	});
	hideSpinner();
}

async function showTVDetails() {
	showSpinner();
	showID = Number(window.location.search.split("=")[1]);
	data = await getShowDetails(showID);
	console.log(data);
	const root = document.querySelector("#show-details");
	root.innerHTML = `
	<div class="details-top">
		<div>
		<img
		src=${
			data.poster_path
				? "https://image.tmdb.org/t/p/w342" + data.poster_path
				: "images/no-image.jpg"
		}
			src="https://image.tmdb.org/t/p/w342${data.poster_path}"
			class="card-img-top"
			alt=${data.name}
		/>
		</div>
		<div>
			<h2>${data.name}</h2>
			<p>
				<i class="fas fa-star text-primary"></i>
				${data.vote_average.toFixed(1)} / 10
			</p>
			<p class="text-muted">Air Date: ${data.first_air_date}</p>
			<p>
				${data.overview}
			</p>
			<h5>Genres</h5>
			<ul class="list-group">
				${data.genres.map((genre) => "<li>" + genre.name + "</li>").join(" ")}
			</ul>
			${
				data.homepage &&
				"<a href=" +
					data.homepage +
					' target="_blank" class="btn">Visit Show Homepage</a>'
			}
		</div>
	</div>
	<div class="details-bottom">
		<h2>Show Info</h2>
		<ul>
		<li><span class="text-secondary">Number Of Episodes:</span> ${
			data.episode_run_time[0]
		}</li>
		<li>
			<span class="text-secondary">Last Episode To Air:</span> ${
				data.last_episode_to_air.name
			}
		</li>
		<li><span class="text-secondary">Status:</span> ${data.status}</li>
		</ul>
		<h4>Production Companies</h4>
		<div class="list-group production-group"></div>
	</div>
	`;
	displayBackgroundImage(data.backdrop_path);
	// const genreList = root.querySelector("ul.list-group");
	// data.genres.forEach((genre) => {
	// 	const li = document.createElement("li");
	// 	li.textContent = genre.name;
	// 	genreList.appendChild(li);
	// });
	const companyList = root.querySelector("div.list-group");
	numProds = data.production_companies.length;
	data.production_companies.forEach((company, idx) => {
		if (company.logo_path) {
			companyList.innerHTML += `<img src="https://image.tmdb.org/t/p/w154${company.logo_path}"/>`;
		} else {
			companyList.innerHTML += `${company.name}`;
		}
		companyList.innerHTML += `${idx < numProds - 1 ? " " : ""}`;
	});
	hideSpinner();
}

async function getSearchResults(searchTerm, page = 1) {
	let resp;
	if (global.pageType === "movies") {
		resp = await fetch(
			`https://api.themoviedb.org/3/search/movie?query=${searchTerm}&include_adult=true&language=en-US&page=${page}`,
			options
		);
	} else if (global.pageType === "shows") {
		resp = await fetch(
			`https://api.themoviedb.org/3/search/tv?query=${searchTerm}&include_adult=true&language=en-US&page=${page}`,
			options
		);
	}
	const data = await validateGetRequest(resp);
	return data;
}

function setRadio(contentType) {
	const radio = document.querySelector("div.search-radio");
	console.log(global.pageType);
	if (contentType === "movie") {
		// radio.querySelector("#tv").checked = false;
		radio.querySelector("#movie").checked = true;
	} else if (contentType === "tv") {
		// radio.querySelector("#movie").checked = false;
		radio.querySelector("#tv").checked = true;
	}
}

async function showSearchResults(page = 1) {
	showSpinner();
	const queryTerm = window.location.search;
	const halves = queryTerm.split("&");
	const contentType = halves[0].split("type=")[1];
	const searchTerm = halves[1].split("search-term=")[1];
	console.log(contentType);
	if (contentType === "movie") {
		global.pageType = "movies";
	} else if (contentType === "tv") {
		global.pageType = "shows";
	}
	// console.log(global.pageType);
	setRadio(contentType);
	searchData = await getSearchResults(searchTerm, page);
	console.log(searchData);
	clearDisplayed();
	const grid = document.querySelector("#search-results");
	searchData.results.forEach((data) => {
		let card;
		if (contentType === "movie") {
			card = MakeMovieCard(data);
		} else if (contentType === "tv") {
			card = MakeShowCard(data);
		}
		grid.appendChild(card);
	});
	document.querySelector("#search-results-heading").innerHTML = `<h2>${
		contentType === "movie" ? "Movie" : "TV Show"
	} search results for: <i>${searchTerm}</i> -  page ${page} of ${
		searchData.total_pages
	}</h2>`;
	addPagination(
		searchData,
		showSearchResults,
		document.querySelector("#search-results-wrapper")
	);
	hideSpinner();
	highlightNav(contentType);
}

function addPagination(data, cb, wrapper) {
	const div = document.createElement("div");
	div.id = "pagination";
	const page = data.page;
	div.innerHTML = `
		<div class="pagination">
			${
				data.page > 1
					? '<button class="btn btn-primary" id="prev">Prev</button>'
					: ""
			}
			${
				data.page < data.total_pages
					? '<button class="btn btn-primary" id="next">Next</button>'
					: ""
			}
		<div class="page-counter">Page ${data.page} of ${data.total_pages}</div>
		</div>
	`;
	wrapper.appendChild(div);
	data.page > 1 &&
		div.querySelector("#prev").addEventListener("click", () => {
			cb(page - 1);
			div.remove();
		});
	data.page < data.total_pages &&
		div.querySelector("#next").addEventListener("click", () => {
			cb(page + 1);
			div.remove();
		});
}

function displayBackgroundImage(backdrop_path) {
	const overLayDiv = document.createElement("div");
	overLayDiv.style.background = `url(https://image.tmdb.org/t/p/original${backdrop_path}) no-repeat center center/cover`;
	overLayDiv.style.height = "100vh";
	overLayDiv.style.width = "100vw";
	overLayDiv.style.position = "absolute";
	overLayDiv.style.top = "0";
	overLayDiv.style.left = "0";
	overLayDiv.style.zIndex = "-1";
	overLayDiv.style.opacity = "0.1";

	document.body.appendChild(overLayDiv);
}

function MakeMovieCard(data) {
	const div = document.createElement("div");
	div.innerHTML = `
		<a href="movie-details.html?id=${data.id}">
		<img
			src=${
				data.poster_path
					? "https://image.tmdb.org/t/p/w342" + data.poster_path
					: "images/no-image.jpg"
			}
			src="https://image.tmdb.org/t/p/w342${data.poster_path}"
			class="card-img-top"
			alt=${data.title}
		/>
		</a>
		<div class="card-body">
		<h5 class="card-title">${data.title}</h5>
		<p class="card-text">
			<small class="text-muted">Popularity: ${Math.round(data.popularity)} (${
		data.vote_count
	} votes)</small>
		</p>
		<p class="card-text">
			<small class="text-muted">Rating: ${data.vote_average}</small>
		</p>
		<p class="card-text">
			<small class="text-muted">Release: ${data.release_date}</small>
		</p>
		</div>`;
	div.classList.add("card");
	return div;
}

function MakeShowCard(data) {
	const div = document.createElement("div");
	div.innerHTML = `
		<a href="tv-details.html?id=${data.id}">
		<img
			src=${
				data.poster_path
					? "https://image.tmdb.org/t/p/w342" + data.poster_path
					: "images/no-image.jpg"
			}
			src="https://image.tmdb.org/t/p/w342${data.poster_path}"
			class="card-img-top"
			alt=${data.name}
		/>
		</a>
		<div class="card-body">
		<h5 class="card-title">${data.name}</h5>
		<p class="card-text">
			<small class="text-muted">Popularity: ${Math.round(data.popularity)} (${
		data.vote_count
	} votes)</small>
		</p>
		<p class="card-text">
			<small class="text-muted">Rating: ${data.vote_average}</small>
		</p>
		<p class="card-text">
			<small class="text-muted">Aired First: ${data.first_air_date}</small>
		</p>
		</div>`;
	div.classList.add("card");
	return div;
}

function MakeSwiperSlide(data) {
	const div = document.createElement("div");
	div.classList.add("swiper-slide");
	div.innerHTML = `
		<a href="movie-details.html?id=${data.id}">
			<img
				src=${
					data.poster_path
						? "https://image.tmdb.org/t/p/w342" + data.poster_path
						: "images/no-image.jpg"
				}
				alt=${data.title}
			/>
		</a>
		<h4 class="swiper-rating">
			<i class="fas fa-star text-secondary"></i> ${data.vote_average.toFixed(1)} / 10
		</h4>
		`;
	return div;
}

function showSpinner() {
	const spinner = document.querySelector(".spinner");
	spinner.classList.add("show");
}

function hideSpinner() {
	const spinner = document.querySelector(".spinner");
	spinner.classList.remove("show");
}

function clearDisplayed() {
	const movieCards = document.querySelectorAll(`.card`);
	movieCards.forEach((card) => card.remove());
}

// Display data form the popular movies
async function displayPopularMovies(page = 1) {
	showSpinner();
	popMovieData = await getPopularMovies(page);
	clearDisplayed();
	const grid = document.querySelector("#popular-movies");
	popMovieData.results.forEach((movieData) => {
		const card = MakeMovieCard(movieData);
		grid.appendChild(card);
	});
	addPagination(popMovieData, displayPopularMovies, grid);
	hideSpinner();
}

async function displayPopularShows(page = 1) {
	showSpinner();
	popShowData = await getPopularShows(page);
	clearDisplayed();
	const grid = document.querySelector("#popular-shows");
	console.log(popShowData);
	popShowData.results.forEach((showData) => {
		const card = MakeShowCard(showData);
		grid.appendChild(card);
	});
	addPagination(popShowData, displayPopularShows, grid);
	hideSpinner();
}

async function displaySwiper() {
	showSpinner();
	NowPlayingData = await getNowPlaying();
	console.log(NowPlayingData);
	const swiperWrapper = document.querySelector(".swiper-wrapper");
	NowPlayingData.results.forEach((movieData) => {
		const slide = MakeSwiperSlide(movieData);
		swiperWrapper.appendChild(slide);
	});
	initSwiper();
	hideSpinner();
}

function initSwiper() {
	const swiper = new Swiper(".swiper", {
		slidesPerView: 1,
		spaceBetween: 30,
		freeMode: true,
		loop: true,
		autoplay: {
			delay: 4000,
			disableOnInteraction: true,
		},
		breakpoints: {
			500: {
				slidesPerView: 2,
			},
			700: {
				slidesPerView: 3,
			},
			1200: {
				slidesPerView: 4,
			},
		},
	});
}

// Init App
function init() {
	switch (global.currentPage) {
		case "/":
		case "/index.html":
			console.log("Home");
			global.pageType = "movies";
			displaySwiper();
			displayPopularMovies();
			break;
		case "/shows.html":
			console.log("Shows");
			global.pageType = "shows";
			displayPopularShows();
			break;
		case "/movie-details.html":
			console.log("Movie Details");
			global.pageType = "movies";
			showMovieDetails();
			break;
		case "/tv-details.html":
			console.log("TV Show Details");
			global.pageType = "shows";
			showTVDetails();
			break;
		case "/search.html":
			console.log("Search Page");
			global.pageType = "search";
			showSearchResults();
			break;
	}
	highlightNav();
}

document.addEventListener("DOMContentLoaded", init);
