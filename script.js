'use strict'
//SELECTORES
const selector = document.querySelector("#selector");
const body = document.querySelector("body");
const recipesContainer = document.querySelector("#recipes");
const recipeModal = document.querySelector("#recipeModal");

let categoriaSelected = selector.value;

//APP USE
setCategories();
selector.addEventListener("change", ()=>{
    categoriaSelected = selector.value;
        //    console.log(categoriaSelected);
    showMeals(categoriaSelected);

});

//manejo la lógica de los botones por data-action en vez de por sus clases
recipesContainer.addEventListener("click", (e)=>{
    //si se hace click en un button de ver más
    if (e.target.dataset.action === "recipeTrigger"){
        const clickedRecipe = e.target;
        setRecipeModal(clickedRecipe.id, recipeModal);
    }
})




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
async function showMeals(category) {
    try{
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s");
        const data = await res.json();
        recipesContainer.innerHTML = "";
        data.meals.forEach( meal => {
            // console.log(categoriaSelected)

            if(meal.strCategory === category){
                let card = createCard(meal.strMealThumb, meal.strMeal, meal.idMeal);
                recipesContainer.appendChild(card)
                
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

async function setRecipeModal(id, recipeModal){
    try{
        const res = await fetch("https://www.themealdb.com/api/json/v1/1/search.php?s");
        const data = await res.json();

        // console.log(data.meals);

        data.meals.forEach(meal => {

        if(meal.idMeal === id){
            const modalTitle = recipeModal.querySelector("h1");
            const p = recipeModal.querySelector("p");
            const ul = recipeModal.querySelector("ul");

            // console.log(modalTitle)
            // console.log(meal.strMeal)
            modalTitle.textContent = meal.strMeal;
            p.textContent = meal.strInstructions;
            

        }
       

    });

    }catch{
        console.log("Intento fallido de conexion con la API");
    }

}         