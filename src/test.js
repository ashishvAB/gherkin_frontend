const PROJECT_API_URL = process.env.REACT_APP_API_URL;

if (PROJECT_API_URL) {
    console.log(PROJECT_API_URL);
} else {
    console.error("REACT_APP_API_URL is not defined.");
}

console.log(process.env);