import React from "react";

function Image(props){
    return <div>
        <a href="#"><img className="rounded-t-lg image" src={props.img} alt="" /></a>
    </div>
}

export default Image;