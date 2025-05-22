let cl = console.log ;

const movieModal = document.getElementById('movieModal');
const backDrop = document.getElementById('backDrop');
const addMovie = document.getElementById('addMovie');
const movieForm = document.getElementById('movieForm');
const movieTitle = document.getElementById('movieTitle');
const movieImgURL = document.getElementById('movieImgURL');
const movieDescription = document.getElementById('movieDescription');
const movieRating = document.getElementById('movieRating');
const addMovieBtn = document.getElementById('addMovieBtn');
const updateMovieBtn = document.getElementById('updateMovieBtn');
const modalClose = document.querySelectorAll('.modalClose');
const movieContainer = document.getElementById('movieContainer');
const loader = document.getElementById('loader');

const baseURL = `https://todos-api-call-default-rtdb.firebaseio.com`;
const movieURL = `${baseURL}/cards.json`;

const onToggle = () => {
    backDrop.classList.toggle('active');
    movieModal.classList.toggle('active');
}

const setRating = (rating) => {
    if(rating > 4){
        return 'bg-success'
    }else if(rating > 3 && rating <= 4){
        return 'bg-warning'
    }else{
        return 'bg-danger'
    }
}

const snackBar = (msg, icon) => {
    swal.fire({
        title : msg,
        icon : icon,
        timer : 3000
    })
}

const createCards = (arr) => {
    let result = '';
    arr.forEach(movie => {
        result += ` <div class="col-md-4 mb-3" id='${movie.id}'>
            <figure class="movieCard">
                <img src="${movie.imgURL}" alt="${movie.title}" title="${movie.title}">

                <figcaption>
                    <div class="ratingTitle">
                        <div class="row">
                            <div class="col-10">
                                <h3>${movie.title}</h3>
                            </div>
                            <div class="col-2">
                                <small class="p-2 ${setRating(movie.rating)}">${movie.rating}</small>
                            </div>
                        </div>
                    </div>
                    <div class="movieInfo">
                        <h3>${movie.title}</h3>
                        <p>${movie.description}</p>
                    </div>
                    <div class="action">
                        <button class="btn-sm btn btn-outline-info" onclick='onEditMovie(this)'>Edit</button>
                        <button class="btn-sm btn btn-outline-danger" onclick='onRemoveMovie(this)'>Remove</button>
                    </div>
                </figcaption>
            </figure>
        </div>`
    });
    movieContainer.innerHTML = result
}

const apiCall = async (url, methodName, msgBody) => {
    try{
        msgBody = msgBody ? JSON.stringify(msgBody) :  null;

        loader.classList.remove('d-none');

        let res = await fetch(url, {
            method : methodName,
            body : msgBody,
            headers : {
                Authorization : 'Token',
                'Content-Type' : 'Application/json'
            }
        });
        return res.json()
    }
    catch(err){
        snackBar('Something went wrong!!', 'error')
    }
    finally{
        loader.classList.add('d-none')
    }
}

const objToArr = (obj) => {
    let arr = [];
    for (const key in obj) {
       arr.push({...obj[key], id : key})
    }
    return arr
}

const fetchMovie = async () => {
    let data = await apiCall(movieURL, 'GET');
    let movieArr = objToArr(data);
    createCards(movieArr)
}
fetchMovie();

const onAddMovie = async (eve) => {
    eve.preventDefault();

    let movieObj = {
        title : movieTitle.value,
        imgURL : movieImgURL.value,
        description : movieDescription.value,
        rating : movieRating.value,
    }
    cl(movieObj);
    eve.target.reset();

    let res = await apiCall(movieURL, 'POST', movieObj);
    let colDiv = document.createElement('div');
    colDiv.className = 'col-md-4 mb-3';
    colDiv.id = res.name;
    colDiv.innerHTML = ` <figure class="movieCard">
                <img src="${movieObj.imgURL}" alt="${movieObj.title}" title="${movieObj.title}">

                <figcaption>
                    <div class="ratingTitle">
                        <div class="row">
                            <div class="col-10">
                                <h3>${movieObj.title}</h3>
                            </div>
                            <div class="col-2">
                                <small class="p-2 ${setRating(movieObj.rating)}">${movieObj.rating}</small>
                            </div>
                        </div>
                    </div>
                    <div class="movieInfo">
                        <h3>${movieObj.title}</h3>
                        <p>${movieObj.description}</p>
                    </div>
                    <div class="action">
                        <button class="btn-sm btn btn-outline-info" onclick='onEditMovie(this)'>Edit</button>
                        <button class="btn-sm btn btn-outline-danger" onclick='onRemoveMovie(this)'>Remove</button>
                    </div>
                </figcaption>
            </figure>`;
    movieContainer.append(colDiv);

    onToggle();

    snackBar(`New Post created successfully with id ${colDiv.id}!!`, 'success')
}

const onEditMovie = async (ele) => {
    onToggle();

    let editId = ele.closest('.col-md-4').id;
    cl(editId);

    localStorage.setItem('editId', editId);

    let editURL = `${baseURL}/cards/${editId}.json`;

    let res = await apiCall(editURL, 'GET');
    movieTitle.value = res.title;
    movieImgURL.value = res.imgURL;
    movieDescription.value = res.description;
    movieRating.value = res.rating;

    window.scrollTo({
        top : 0,
        behavior : 'smooth'
    })

    addMovieBtn.classList.add('d-none');
    updateMovieBtn.classList.remove('d-none');
}

const onUpdateMovie = async () => {
    let updateId = localStorage.getItem('editId');

    let updateObj = {
        title : movieTitle.value,
        imgURL : movieImgURL.value,
        description : movieDescription.value,
        rating : movieRating.value,
    }
    cl(updateObj);
    movieForm.reset();

    let updateURL =  `${baseURL}/cards/${updateId}.json`;

    let res = await apiCall(updateURL, 'PATCH', updateObj);
    
    addMovieBtn.classList.remove('d-none');
    updateMovieBtn.classList.add('d-none');

    let card = document.getElementById(updateId);
      card.querySelector('.movieInfo h3').innerHTML = updateObj.title;
    card.querySelector('h3').innerHTML = updateObj.title;
    card.querySelector('p').innerHTML = updateObj.description;
    card.querySelector('img').setAttribute('src', updateObj.imgURL);
    card.querySelector('img').setAttribute('alt', updateObj.title);
    card.querySelector('img').setAttribute('title', updateObj.title);
    card.querySelector('small').innerHTML = updateObj.rating;

    snackBar(`Movie with id ${updateId} updated successfully!!`, 'success');

    card.scrollIntoView({
        behavior : 'smooth'
    });
    onToggle();
}

const onRemoveMovie = async (ele) => {
   let result = await Swal.fire({
  title: "Do you want to remove the changes?",
  showCancelButton: true,
  confirmButtonText: "Remove",
});
if(result.isConfirmed){
    let removeId = ele.closest('.col-md-4').id;

    let removeURL = `${baseURL}/cards/${removeId}.json`;

    let res = await apiCall(removeURL, 'DELETE');
    ele.closest('.col-md-4').remove();

    snackBar(`Movie with id ${removeId} removed successfully!!`, 'success')
}
}


addMovie.addEventListener('click', onToggle);
modalClose.forEach(ele => ele.addEventListener('click', onToggle));
movieForm.addEventListener('submit', onAddMovie);
updateMovieBtn.addEventListener('click', onUpdateMovie);

