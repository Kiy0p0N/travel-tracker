import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

// Initialize a new PostgreSQL client with connection configuration
const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "world",
    password: "hades",
    port: 5432
});

// Establish connection to the PostgreSQL database
try {
    db.connect();
    console.log("Connected to the database successfully.");
} catch (err) {
    console.error("Database connection error:", err);
}

const app = express(); // Initialize Express application instance
const port = 3000; // Define the port for the server

// Middleware to parse URL-encoded request bodies
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static("public"));

/**
 * Retrieves a list of visited country codes from the database.
 * @returns {Promise<string[]>} An array of country codes.
 */
async function checkCountry() {
    try {
        // Fetch all country codes from the "visited_countries" table
        const result = await db.query("SELECT country_code FROM visited_countries");
        
        // Extract country codes from the result set
        return result.rows.map(row => row.country_code);
    } catch (err) {
        console.error("Error fetching visited countries:", err);
        return []; // Return an empty array in case of an error
    }
}

/**
 * Handles GET requests to the root route.
 * Renders the index page with the list of visited countries.
 */
app.get("/", async (req, res) => {
    const countries = await checkCountry();
    res.render("index.ejs", {
        countries: countries, // Array of country codes
        total: countries.length, // Total number of visited countries
    });
});

/**
 * Handles POST requests to add a new visited country.
 * Retrieves the country code based on user input and inserts it into the database.
 */
app.post("/add", async (req, res) => {
    const country = req.body.country.trim(); // Extract and sanitize user input

    try {
        // Query to find the corresponding country code
        const result = await db.query(
            "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
            [country.toLowerCase()]
        );

        if (result.rows.length === 0) {
            throw new Error("Country name not found.");
        }

        const countryCode = result.rows[0].country_code; // Extract country code

        try {
            // Insert the country code into the "visited_countries" table
            await db.query("INSERT INTO visited_countries (country_code) VALUES ($1)", [countryCode]);
            res.redirect("/"); // Redirect back to the homepage on success
        } catch (err) {
            console.error("Database insertion error:", err);
            
            const countries = await checkCountry();
            res.render("index.ejs", {
                countries: countries,
                total: countries.length,
                error: "Country has already been added, try again."
            });
        }
    } catch (err) {
        console.error("Country lookup error:", err);
        
        const countries = await checkCountry();
        res.render("index.ejs", {
            countries: countries,
            total: countries.length,
            error: "Country name does not exist, try again."
        });
    }
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
