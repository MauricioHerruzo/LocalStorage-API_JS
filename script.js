'use strict'
//SELECTORES
const selector = document.querySelector("#selector");
const body = document.querySelector("body");
const recipesContainer = document.querySelector("#recipes");

let categoriaSelected = selector.value;

//APP USE
setCategories();
selector.addEventListener("change", ()=>{
    categoriaSelected = selector.value;
        //    console.log(categoriaSelected);
    showMeals(categoriaSelected);

});



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
        recipesContainer.innerHTML ="";
        data.meals.forEach( meal => {
            // console.log(categoriaSelected)

            if(meal.strCategory === category){
                let card = createCard(meal.strMealThumb, meal.strMeal);
                recipesContainer.appendChild(card)
                
            }
        })

    }catch{
        console.log("Intento fallido de conexión con la API");
    }
}

//FUNCTION CREAR CARD
function createCard(image, title,){
    //Crafteo de la card
    let mealCard = document.createElement("div");
    mealCard.classList.add("card");
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
    titleCard.textContent = title;
    mealCardInfoDiv.appendChild(titleCard);
    
    return mealCard;
}

            