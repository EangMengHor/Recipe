import express from "express";
import axios from "axios";
import cors from "cors";
import NodeCache from "node-cache";
import pg from "pg";
import bodyParser from "body-parser";

const app = express();
const port = 3001;
app.use(cors({
    origin: 'http://localhost:3000', // Replace with your frontend URL
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Accept']
}));

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "Recipe",
    password: "Hor001",
    port: 5432,
  });
db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const cache = new NodeCache({ stdTTL: 300 });


const API = "https://api.edamam.com/api/recipes/v2?type=public" +
    "&app_id=045014af" +
    "&app_key=3bfe8ceea29c62746099a3ea2da350cf" +
    "&calories=100-500" +
    "&fields=image,label,source,calories";


const createTable = async () =>{
    try{
        await db.query(`CREATE TABLE IF NOT EXISTS recipe_likes (
                id SERIAL PRIMARY KEY,
                recipe_id TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );`);
            console.log("Table created");
            
    }catch(e){
        console.log("Error Creating table");
        
    }
}
createTable();

// Update your existing /api/data endpoint
app.get("/api/data", async(req,res)=>{
    const { nextLink, page } = req.query;
    console.log(req.query);
    
    const urlToFetch = nextLink || API;

    try {
        // Disable cache for pagination
        const response = await axios.get(urlToFetch);
        
        // getting likes for the recipes
        const likes = await db.query("SELECT recipe_id FROM recipe_likes");
        const likedRecipeIds = new Set(likes.rows.map(row => row.recipe_id));

        // Process recipes and ensure they're unique
        const recipes = response.data.hits.map(hit => {
            const id = hit.recipe.uri.split('#')[1];
            
            return {
                id,
                title: hit.recipe.label,
                image: hit.recipe.image,
                calories: Math.round(hit.recipe.calories),
                protein: Math.round(hit.recipe.totalNutrients.PROCNT.quantity),
                ingredient: hit.recipe.ingredientLines,
                isLiked: likedRecipeIds.has(id)

            };
        });
        
        // Get the next link from the API response
        const next = response.data._links?.next?.href || null;
        console.log("Next link generated:", next);
        

        
        // Send response with total count
        res.json({ 
            recipes,
            nextLink: next,
            total: recipes.length
        });
    } catch (error) {
        console.error("Error:", error.message);
        if (error.response) {
            console.error("API Response:", error.response.data);
        }
        res.status(500).json({ error: "Failed to fetch recipe data" });
    }
});
// getting recipes

app.get("/api/likes/check/:recipeId", async(req,res)=>{
    try {
        const {recipeId} = req.params;
        
        const result = await db.query(`SELECT EXISTS(SELECT 1 FROM recipe_likes WHERE recipe_id = $1)`, [recipeId]);
        res.json({isLiked: result.rows[0].exists})
    } catch (error) {
        console.error("Error checking like status:", error);
        res.status(500).json({ error: "Failed to check like status" });
    }
})

// Toggle like status
app.post("/api/likes", async (req, res) => {
    try {
        const { recipeId } = req.body;
        console.log('Toggling like for recipe:', recipeId); // Debug log

        // Check if recipe is already liked
        const checkResult = await db.query(
            'SELECT id FROM recipe_likes WHERE recipe_id = $1',
            [recipeId]
        );

        let isLiked = false;
        
        if (checkResult.rows.length > 0) {
            // Unlike: Remove the existing like
            await db.query(
                'DELETE FROM recipe_likes WHERE recipe_id = $1',
                [recipeId]
            );
            isLiked = false;
        } else {
            // Like: Add new like
            await db.query(
                'INSERT INTO recipe_likes (recipe_id) VALUES ($1)',
                [recipeId]
            );
            isLiked = true;
        }
        
        console.log('New like status:', isLiked); // Debug log
        res.json({ isLiked });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ error: "Failed to update like status" });
    }
});

// Get all liked recipes
app.get("/api/likes", async (req, res) => {
    try {
        const result = await db.query(
            'SELECT recipe_id FROM recipe_likes ORDER BY created_at DESC'
        );
        res.json({ likedRecipes: result.rows.map(row => row.recipe_id) });
    } catch (error) {
        console.error("Error fetching liked recipes:", error);
        res.status(500).json({ error: "Failed to fetch liked recipes" });
    }
});

// Clear cache endpoint (for development)
app.post("/api/cache/clear", (req, res) => {
    cache.flushAll();
    res.json({ message: "Cache cleared successfully" });
});


app.listen(port, ()=>{
    console.log(`Listening on ${port}`);
})