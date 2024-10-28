import React, { useEffect, useState } from 'react';
import Image from './Image';
import Name from './Name';
import Calorie from './Calorie';
import { motion } from "framer-motion";
import Protein from './Protein';
import Ingredient from './Ingredient';

function Card(props) {
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFlipped, setIsFlipped] = useState(false);
    const [isAnimated, setIsAnimated] = useState(false);

    useEffect(() => {
        if (props.id) {
            const checkLikeStatus = async () => {
                try {
                    const response = await fetch(`http://localhost:3001/api/likes/check/${props.id}`, {
                        credentials: 'include',
                        headers: {
                            'Accept': 'application/json',
                        }
                    });
                    const data = await response.json();
                    setIsLiked(data.isLiked);
                } catch (error) {
                    console.error('Error checking like status:', error);
                }
            };

            checkLikeStatus();
        }
    }, [props.id]);

    const handleLike = async (e) => {
        e.stopPropagation();
        setIsLoading(true);
        
        try {
            const response = await fetch('http://localhost:3001/api/likes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({ recipeId: props.id }),
                credentials: 'include'
            });            

            if (response.ok) {
                const data = await response.json();
                setIsLiked(data.isLiked);
            }
        } catch (error) {
            console.error('Error toggling like:', error);
        } finally {
            setIsLoading(false);
        }
    };
    
    function handleClick(e) {
        e.preventDefault();
        if (!isAnimated) {
            setIsFlipped(!isFlipped);
            setIsAnimated(true);
        }
    }

    return (
        <div className="card">
            <div className="flip-card" onClick={handleClick}>    
                <motion.div 
                    className="flip-card-inner"
                    initial={false} 
                    animate={{ rotateY: isFlipped ? 180 : 360 }} 
                    transition={{ duration: 0.6 }}
                    onAnimationComplete={() => setIsAnimated(false)}
                >
                    <div className="flip-card-front">
                        <Image img={props.image} />
                        <div className="content-area">
                            <Name food={props.title} />
                            <div className="calorie">
                                <Calorie cal={props.calories} />
                            </div>
                            <div className="like-button">
                                <button 
                                    onClick={handleLike}
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="animate-spin h-5 w-5">
                                            <svg className="h-full w-full text-gray-400" viewBox="0 0 24 24">
                                                <circle 
                                                    className="opacity-25" 
                                                    cx="12" 
                                                    cy="12" 
                                                    r="10" 
                                                    stroke="currentColor" 
                                                    strokeWidth="4"
                                                    fill="none"
                                                />
                                                <path 
                                                    className="opacity-75"
                                                    fill="currentColor"
                                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                                />
                                            </svg>
                                        </div>
                                    ) : (
                                        <i className={`fa fa-heart text-xl ${isLiked ? 'text-red-500' : 'text-gray-600'}`} />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="flip-card-back">
                        <Protein protein={props.protein}/>
                        {console.log(props.ingredient)}
                        <Ingredient ingredient={props.ingredient}/>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}

export default Card;