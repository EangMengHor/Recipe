import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import Title from './Title';
import Card from './Card';

const App = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [nextLink, setNextLink] = useState('');  // Start with empty string
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);  // Add page tracking

  const fetchRecipes = useCallback(async () => {
    if (loading) return;
    setLoading(true);

    try {
      // Include page number in the request
      const response = await axios.get('http://localhost:3001/api/data', {
        params: {
          nextLink: nextLink,
          page: page
        }
      });
      console.log('response');
      
      console.log(response);
      
      const newRecipes = response.data.recipes;
      const newNextLink = response.data.nextLink;

      // Only add recipes if they're not duplicates
      setRecipes(prev => {
        const existingIds = new Set(prev.map(r => r.id));
        const uniqueNewRecipes = newRecipes.filter(recipe => !existingIds.has(recipe.id));
        return [...prev, ...uniqueNewRecipes];
      });

      setNextLink(newNextLink);
      setHasMore(!!newNextLink);
      setPage(prev => prev + 1);  // Increment page
      
      console.log('Fetched new recipes:', newRecipes.length);
      console.log('Total recipes:', recipes.length + newRecipes.length);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, [loading, nextLink, page]);

  // Initial load
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Infinite scroll handler
  useEffect(() => {
    const handleScroll = () => {
      if (loading || !hasMore) return;

      const scrollPosition = window.innerHeight + document.documentElement.scrollTop;
      const pageHeight = document.documentElement.scrollHeight;
      const threshold = 200;

      if (pageHeight - scrollPosition < threshold) {
        console.log('Triggering fetch near bottom');
        fetchRecipes();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMore, fetchRecipes]);

  console.log(recipes);
  
  // console.log(recipes[0].ingredient);
  
  return (
    <div>
      <Title />
      <div className="container">
        {recipes.map((recipe, index) => (
          
          <Card 
            key={`${recipe.id}`}  // Use just the recipe.id as key
            id={recipe.id}
            image={recipe.image}
            title={recipe.title}
            calories={recipe.calories}
            protein = {recipe.protein}
            ingredient = {recipe.ingredient}
          />
        ))}
      </div>
      {loading && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          fontSize: '18px',
          color: '#666'
        }}>
          Loading more recipes...
        </div>
      )}
      {!hasMore && recipes.length > 0 && (
        <div style={{ 
          textAlign: 'center', 
          padding: '20px',
          fontSize: '18px',
          color: '#666'
        }}>
          No more recipes to load
        </div>
      )}
    </div>
  );
};

export default App;