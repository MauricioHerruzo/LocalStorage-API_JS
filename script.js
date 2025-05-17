'use strict'
//SELECTORES

const selector = document.querySelector("#selector");
const body = document.querySelector("body");
const recipesContainer = document.querySelector("#recipes");
const recipeModal = document.querySelector("#recipeModal");
const favouritesContainer = document.querySelector("#favourites");
//selectores modal
const modalTitle = recipeModal.querySelector("h1");
const p = recipeModal.querySelector("p");
const ul = recipeModal.querySelector("ul");
const btnFavourite = recipeModal.querySelector(".favourite");


let savedFavourites = JSON.parse(localStorage.getItem("savedFavourites")) || [];


// APP USE 
//comprobar que el elemento exista en la página html que estamos para no saltar errores porque el selector solo existe en el index
if(selector){
    let categoriaSelected = selector.value;
    setCategories();
    selector.addEventListener("change", ()=>{
        categoriaSelected = selector.value;
            //    console.log(categoriaSelected);
        showMeals(categoriaSelected,recipesContainer);
    
    });


    //manejo la lógica de los botones por data-action en vez de por sus clases
    recipesContainer.addEventListener("click", (e)=>{
        //si se hace click en un button de ver más
        if (e.target.dataset.action === "recipeTrigger"){
            const clickedRecipe = e.target;
            setRecipeModal(clickedRecipe.id);
            
        }
    })

}


//manejo de add/delete favourite
recipeModal.addEventListener("click", (e)=>{
    if(e.target.dataset.action==="favouriteTrigger" || e.target.dataset.action ==="deleteTrigger"){

        const clickedButton = e.target;
    
        if(!savedFavourites.includes(clickedButton.id)){
            savedFavourites = saveAsFavourite(clickedButton.id, savedFavourites);

            //localstorage, reescribir el mismo array 
            localStorage.setItem("savedFavourites",JSON.stringify(savedFavourites));
            savedFavourites = JSON.parse(localStorage.getItem("savedFavourites"))

            toggleFavouriteButton(clickedButton)
            // console.log(savedFavourites)
            // console.log(clickedButton.id);
            
            //Si estamos en la seccion de favoritos hay que actualizar cada vez que se elimine un fav
            if(favouritesContainer){
                showFavouriteRecipes(savedFavourites,favouritesContainer);
            }

        }else if(savedFavourites.includes(clickedButton.id)){
            savedFavourites = deleteFromFavourite(clickedButton.id, savedFavourites);

            //localstorage
            localStorage.setItem("savedFavourites",JSON.stringify(savedFavourites));
            savedFavourites = JSON.parse(localStorage.getItem("savedFavourites"))

            toggleRemoveButton(clickedButton);
            // console.log(savedFavourites)
            // console.log(clickedButton.id);

            //Si estamos en la seccion de favoritos hay que actualizar cada vez que se elimine un fav
            if(favouritesContainer){
                showFavouriteRecipes(savedFavourites,favouritesContainer);
            }
        }

    }
})

//Pagina de favoritos
if(favouritesContainer){
    showFavouriteRecipes(savedFavourites,favouritesContainer);
    favouritesContainer.addEventListener("click", (e)=>{
        //si se hace click en un button de ver más
        if (e.target.dataset.action === "recipeTrigger"){
            const clickedRecipe = e.target;
            setRecipeModal(clickedRecipe.id);
        }
    })
}

//FUNCTIONS



//FUNCTION SET CATEGORY
async function setCategories(){

    try{
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
    const data = await res.json();

    // console.log(data.meals);

    data.categories.forEach(meal => {

        // console.log(meal.strMeal);
        const mealText = document.createElement("option");
        mealText.textContent = meal.strCategory;
        selector.appendChild(mealText);
        
    });

    }catch{
        console.log("Intento fallido de conexion con la API");
    }


}
    
//FUNCTION ENSEÑAR MEALS SEGUN CATEGORY
async function showMeals(category,container) {
    try{
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s");
        const data = await res.json();
        recipesContainer.innerHTML = "";
        data.meals.forEach( meal => {
            // console.log(categoriaSelected)

            if(meal.strCategory === category){
                let card = createCard(meal.strMealThumb, meal.strMeal, meal.idMeal);
                container.appendChild(card)
                
            }
        })

    }catch{
        console.log("Intento fallido de conexión con la API");
    }
}

//FUNCTION CREAR CARD
function createCard(image, title, id){
    //Crafteo de la card
    let mealCard = document.createElement("div");
    mealCard.classList.add("card");
    mealCard.setAttribute("id", id);
    mealCard.style = "width: 25rem"

    let img = document.createElement("img");
    img.classList.add("card-img-top");
    img.src= image;
    mealCard.appendChild(img);

    let mealCardInfoDiv = document.createElement("div");
    mealCardInfoDiv.classList.add("card-body");
    mealCard.appendChild(mealCardInfoDiv);

    let titleCard = document.createElement("h5");
    titleCard.classList.add("card-title");
    titleCard.classList.add("fs-1");
    titleCard.classList.add("mb-4");
    titleCard.textContent = title;
    mealCardInfoDiv.appendChild(titleCard);

    //Button
    let buttonCard = document.createElement("button");
    buttonCard.classList.add("btn");
    buttonCard.classList.add("btn-primary");
    // buttonCard.classList.add("recipeTrigger");
    buttonCard.classList.add("fs-2");
    buttonCard.textContent = "Ver receta";
    buttonCard.setAttribute("data-action", "recipeTrigger");
    buttonCard.setAttribute("id", id)

    buttonCard.setAttribute("data-bs-toggle", "modal");
    buttonCard.setAttribute("data-bs-target", "#recipeModal");

    mealCardInfoDiv.appendChild(buttonCard);
    

    return mealCard;
}

async function setRecipeModal(id){
    try{
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s");
        const data = await res.json();

        // console.log(data.meals);

        data.meals.forEach(meal => {

        if(meal.idMeal === id){

            //vaciar ul
            ul.innerHTML = "";

            // console.log(modalTitle)
            // console.log(meal.strMeal)
            modalTitle.textContent = meal.strMeal;
            p.textContent = meal.strInstructions;
            //id al boton de favoritos para facilitar el guardarla 
            btnFavourite.setAttribute("id", meal.idMeal);

            //set button segun si la id se encuentra
            if(!savedFavourites.includes( btnFavourite.id)){
                toggleRemoveButton( btnFavourite )
            }
            if(savedFavourites.includes( btnFavourite.id)){
                toggleFavouriteButton(btnFavourite)
            }
            
            for(let i = 1; i <= 20; i++){
                //El genio de la API no ha hecho los ingredientes en un array asi que hay que buscárselas para recorrerlos
                let iIngredient = "strIngredient"+i.toString()
                let iMeasure ="strMeasure"+i.toString();
                if(meal[iIngredient] !== null & meal[iIngredient] !== " " & meal[iIngredient] !== ""){
                    const li = document.createElement("li");
                    li.textContent = meal[iIngredient] + " - " + meal[iMeasure];
                    ul.appendChild(li);

                }
            }

        }
       

    });

    }catch{
        console.log("Intento fallido de conexion con la API");
    }

}       

//Function showFavouriteRecipes
async function showFavouriteRecipes(arrayFavoritos,container) {
    try{
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s");
    const data = await res.json();
    favouritesContainer.innerHTML= "";
     data.meals.forEach(meal => {
        if(arrayFavoritos.includes(meal.idMeal)){
            let card = createCard(meal.strMealThumb, meal.strMeal, meal.idMeal);
            container.appendChild(card)
        }
     })
       

    }catch{
        console.log("Intento fallido de conexion con la API");
    }
}




//FUNCTIONS SAVE FAVOURITE

function saveAsFavourite(id, favouritesArray){
    return [...favouritesArray, id];
    // console.log(favouritesArray);
}

function deleteFromFavourite(idParam, favouritesArray){
    return favouritesArray.filter(id=> id!==idParam);
    // console.log(favouritesArray);
}

function toggleFavouriteButton(button){
    button.classList.remove("btn-primary");
    button.classList.add("btn-danger");
    button.textContent = "Eliminar de favoritos";
    button.dataset.action = "deleteTrigger";
    // console.log("HE hecho rojo el boton")
}

function toggleRemoveButton(button){
    button.classList.remove("btn-danger");
    button.classList.add("btn-primary");
    button.textContent = "Añadir a favoritos";
    button.dataset.action = "favouriteTrigger";
    // console.log("HE hecho azul el boton")
}