import express from "express";
import bodyParser from "body-parser";
import pg from 'pg';

// Initialize a new PostgreSQL client with connection configuration
const db = new pg.Client({
    user: "postgres", // Database username
    host: "localhost", // Database host (localhost in this case)
    database: "world", // Database name
    password: "hades", // Database password
    port: 5432 // Database port (default for PostgreSQL)
});

// Establish connection to the PostgreSQL database
try {
    db.connect(); // Connect to the database
    console.log("Connected to the database successfully.");
} catch (err) {
    console.error("Database connection error:", err);
}

const app = express(); // Initialize Express application instance
const port = 3000; // Define the port for the server

app.use(bodyParser.urlencoded({ extended: true })); // Middleware to parse URL-encoded request bodies
app.use(express.static("public")); // Serve static files from the "public" directory

let currentUserId = 1; // Variable to keep track of the currently selected user
let users = []; // Array to store user data

// Function to check visited countries for the current user
async function checkCountry() {
    // Query the database for visited country codes by the current user
    const result = await db.query(
        "SELECT country_code FROM visited_countries JOIN users ON users.id = user_id WHERE user_id = $1",
        [currentUserId]
    );

    let countries = []; // Array to store unique country codes

    // Iterate through the result rows and add unique country codes to the array
    result.rows.forEach((country) => {
        if(countries.includes(country.country_code)){
            console.log("This country has already been added, try again");
        } else{
            countries.push(country.country_code);
        }
    });

    return countries; // Return the list of visited countries
}

// Function to retrieve user information from the database
async function checkUser() {
    const result = await db.query(
        "SELECT * FROM users" // Query all users from the database
    );

    users = result.rows; // Store the user data in the 'users' array

    // Find and return the current user based on 'currentUserId'
    return users.find((user) => user.id === parseInt(currentUserId));
}

// Route for the home page
app.get("/", async (req, res) => {
    const countries = await checkCountry(); // Get visited countries
    const currentUser = await checkUser(); // Get current user info

    // Render the 'index.ejs' page with the retrieved data
    res.render("index.ejs", {
        countries: countries,
        total: countries.length, // Total number of visited countries
        users: users, // List of all users
        color: currentUser.color // User's selected color
    });
});

// Route to add a new visited country
app.post("/add", async (req, res) => {
    const country = req.body.country; // Extract and sanitize user input

    try {
        // Query to find the corresponding country code
        const result = await db.query(
            "SELECT country_code FROM countries WHERE LOWER(country_name) LIKE '%' || $1 || '%'",
            [country.toLowerCase()]
        );

        const countryCode = result.rows[0].country_code; // Extract country code

        try {
            // Insert the visited country into the database
            await db.query(
                "INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)", 
                [countryCode, currentUserId]
            );

            res.redirect("/"); // Redirect back to the homepage on success

        } catch (err) {
            console.error("Database insertion error:", err);
            
            const countries = await checkCountry(); // Refresh visited countries list
            const currentUser = await checkUser(); // Refresh user info

            // Render the page again with an error message
            res.render("index.ejs", {
                countries: countries,
                total: countries.length,
                users: users,
                color: currentUser.color,
                error: "Country has already been added, try again."
            });
        }
    } catch (err) {
        console.error("Country lookup error:", err);
        
        const countries = await checkCountry(); // Refresh visited countries list
        const currentUser = await checkUser(); // Refresh user info

        // Render the page again with an error message
        res.render("index.ejs", {
            countries: countries,
            total: countries.length,
            users: users,
            color: currentUser.color,
            error: "Country name does not exist, try again."
        });
    }
});

// Route to handle user selection or new user creation
app.post("/user", async (req, res) => {
    if(req.body.add === "new"){ // If "new" is selected, render new user form
        res.render("new.ejs");
    } else{
        currentUserId = req.body.user; // Update the current user ID
        res.redirect("/"); // Redirect to home page
    }
});

// Route to create a new user
app.post("/new", async (req, res) => {
    const name = req.body.name; // Extract name from form input
    const color = req.body.color; // Extract color from form input

    // Insert new user into the database
    const result = await db.query(
        "INSERT INTO users(name, color) VALUES ($1, $2)",
        [name, color]
    );

    res.redirect("/"); // Redirect to home page after adding user
});

// Start the server and listen on the specified port
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
