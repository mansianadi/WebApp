// Import the Application and Router classes from the Oak module
import { Application, Router } from "https://deno.land/x/oak@v12.6.1/mod.ts";

// Import the createExitSignal function from the JS+OAI shared library
import { createExitSignal, staticServer } from "./shared/server.ts";

// Create instances of the Application and Router classes
const app = new Application();
const router = new Router();

// Function to generate cocktail recipe using OpenAI API
async function generateCocktailRecipe(ingredients, flavor, mood) {
    const prompt =
        `Create a unique cocktail recipe using these ingredients: ${ingredients}.
         Make it ${flavor} and suitable for a ${mood} occasion. Include detailed instructions.`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: "gpt-4",
            messages: [{ role: "user", content: prompt }],
            max_tokens: 1200,
            temperature: 1.7,
        }),
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "Couldn't generate a recipe.";
}

// API for generating cocktail recipe
router.post("/api/cocktail", async (ctx) => {
    const { ingredients, flavor, mood } = await ctx.request.body({
        type: "json",
    }).value;

    if (!ingredients) {
        ctx.response.status = 400;
        ctx.response.body = { error: "Please provide ingredients." };
        return;
    }

    const recipe = await generateCocktailRecipe(ingredients, flavor, mood);
    ctx.response.body = { recipe };
});

// Tell the app to use the router
app.use(router.routes());
app.use(router.allowedMethods());

// Try serving undefined routes with static files
app.use(staticServer);

// Start the server
console.log("Server running on http://localhost:8000");
await app.listen({ port: 8000, signal: createExitSignal() });
