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


//COMUN A AMBOS HTML //manejo de add/delete favourite 
recipeModal.addEventListener("click", (e)=>{
    if(e.target.dataset.action==="favouriteTrigger" || e.target.dataset.action ==="deleteTrigger"){

        const clickedButton = e.target;
    
        if(!savedFavourites.includes(clickedButton.id)){
            savedFavourites = saveAsFavourite(clickedButton.id, savedFavourites);


            //LOCAL STORAGE
            saveToLocalStorage("savedFavourites", savedFavourites);
            //sobrescribo con lo que haya en el localstorage siempre
            savedFavourites = getFromLocalStorage("savedFavourites")

            //Cambio de boton
            toggleFavouriteButton(clickedButton)

            //Si estamos en la seccion de favoritos hay que actualizar cada vez que se elimine un fav para  quitar el card sin recargar la página
            if(favouritesContainer){
                showFavouriteRecipes(savedFavourites,favouritesContainer);
            }

        }else if(savedFavourites.includes(clickedButton.id)){
            savedFavourites = deleteFromFavourite(clickedButton.id, savedFavourites);

            saveToLocalStorage("savedFavourites", savedFavourites);
            savedFavourites = getFromLocalStorage("savedFavourites")

            toggleRemoveButton(clickedButton);

            if(favouritesContainer){
                showFavouriteRecipes(savedFavourites,favouritesContainer);
            }
        }

    }
})

//EVENTOS EXCLUSIVOS A PAGINA DE FAVS
if(favouritesContainer){
    showFavouriteRecipes(savedFavourites,favouritesContainer);
    favouritesContainer.addEventListener("click", (e)=>{
        //si se hace click en un button de ver más
        if (e.target.dataset.action === "recipeTrigger"){
            const clickedRecipe = e.target;
            setRecipeModal(clickedRecipe.id);
        }
        if(e.target.dataset.action === "deleteFav"){
            const clickedDeleteButton = e.target;
            savedFavourites = deleteFromFavourite(clickedDeleteButton.id, savedFavourites)

            saveToLocalStorage("savedFavourites", savedFavourites);
            savedFavourites = getFromLocalStorage("savedFavourites")

            showFavouriteRecipes(savedFavourites,favouritesContainer);
        }
    })
}



//FUNCTIONS

//FUNCTION SET CATEGORY
async function setCategories(){

    try{
    const res = await fetch("https://www.themealdb.com/api/json/v1/1/categories.php");
    const data = await res.json();


    data.categories.forEach(meal => {

        const mealText = document.createElement("option");
        mealText.textContent = meal.strCategory;
        selector.appendChild(mealText);
        
    });

    }catch{
        alert("Intento fallido de conexion con la API");
    }


}
    
//FUNCTION ENSEÑAR MEALS SEGUN CATEGORY
async function showMeals(category,container) {
    try{
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/filter.php?c='+ category );
        const data = await res.json();

        recipesContainer.innerHTML = "";
        data.meals.forEach( meal => {

  
        let card = createCard(meal.strMealThumb, meal.strMeal, meal.idMeal);
        container.appendChild(card)
                

        })

    }catch{
        alert("Intento fallido de conexion con la API");
    }
}

//FUNCTION CREAR CARD
function createCard(image, title, id){
    //Crafteo de la card
    let mealCard = document.createElement("div");
    mealCard.classList.add("card");
    mealCard.classList.add("text-center")
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
    titleCard.classList.add("fs-2");
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

    if(favouritesContainer){
    let deleteButton = document.createElement("button");
    deleteButton.classList.add("btn");
    deleteButton.classList.add("btn-danger");
    deleteButton.classList.add("fs-2")
    deleteButton.classList.add("my-2")
    deleteButton.textContent = "Eliminar de favoritos";

    deleteButton.setAttribute("data-action", "deleteFav");
    deleteButton.setAttribute("id", id)

    mealCardInfoDiv.appendChild(deleteButton);
    }
    

    return mealCard;
}

async function setRecipeModal(id){
    try{
        const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+id);
        const data = await res.json();


        data.meals.forEach(meal => {

            ul.innerHTML = "";

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

       

    });

    }catch{
        alert("Intento fallido de conexion con la API");
    }

}       

//Function showFavouriteRecipes
async function showFavouriteRecipes(arrayFavoritos,container) {
    try{
        container.innerHTML= "";

        for(let favorito of arrayFavoritos){
            const res = await fetch('https://www.themealdb.com/api/json/v1/1/lookup.php?i='+favorito);
            const data = await res.json();
            //Objeto->ArrayUnico->Propiedad
            let card = createCard(data.meals[0].strMealThumb, data.meals[0].strMeal, data.meals[0].idMeal);
            container.appendChild(card)
        }

    }catch{
        alert("Intento fallido de conexion con la API");
    }
}




//FUNCTIONS SAVE FAVOURITE

function saveAsFavourite(id, favouritesArray){
    return [...favouritesArray, id];

}

function deleteFromFavourite(idParam, favouritesArray){
    return favouritesArray.filter(id=> id!==idParam);

}

function toggleFavouriteButton(button){
    button.classList.remove("btn-primary");
    button.classList.add("btn-danger");
    button.textContent = "Eliminar de favoritos";
    button.dataset.action = "deleteTrigger";

}

function toggleRemoveButton(button){
    button.classList.remove("btn-danger");
    button.classList.add("btn-primary");
    button.textContent = "Añadir a favoritos";
    button.dataset.action = "favouriteTrigger";

}

//LOCAL STORAGE
function saveToLocalStorage(itemString, item){
    localStorage.setItem(itemString,JSON.stringify(item))
}
function getFromLocalStorage(itemString){
    return JSON.parse(localStorage.getItem(itemString));
}