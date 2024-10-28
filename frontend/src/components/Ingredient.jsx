import React from "react";

function Ingredient(props){
    return <div>
            <div className="ingredient-title font-sans">Ingredients</div>
                <div class="flex-container">
                    {/* {Array.isArray(props.ingredient) ? (
                        props.ingredient.map((ingredient, index) => (
                            <div key={index}>{ingredient}</div>
                        ))
                    ) : (
                        <div>No ingredients available</div>
                    )} */}
                    {props.ingredient.map((ingredient)=> (
                        <div className="ingredient">{ingredient}</div>
                    ))}
                </div>
            </div>
}

export default Ingredient;