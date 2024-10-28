import React, { useState } from "react";

function Title(){

    const [name, setName] = useState("Welcome to ProCipe");

    function handleClick(){
        setName("A Protein Paradise")
    }

    return <div>
        <h1 className="title" onClick={handleClick}>{name}</h1>
    </div>
}

export default Title;