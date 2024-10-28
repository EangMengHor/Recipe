import React from "react";


function Calorie(props){
    return <div>
        <p className="mb-3 font-sans text-gray-700 dark:text-gray-400">Calories: {props.cal}</p>
    </div>
}

export default Calorie;