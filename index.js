

const http = require("http");
const port = 5466;
const students = require("./db.json");

// Get all students
const getAllStudents = (req, res) => {
    new Promise((resolve, reject) => {
        resolve(students);
    })
    .then((data) => {
        res.end(JSON.stringify(data));
    })
    .catch((error) => {
        res.end(JSON.stringify({ error: error.message }));
    });
};

// Get one student by ID
const getAStudent = (req, res, browserId) => {
    new Promise((resolve, reject) => {
        if (browserId >= 5 && browserId <= 9) {
            reject(new Error("The ID is not available"));
        } else {
            const student = students.find((student) => student.id == browserId);
            if (student) {
                resolve(student);
            } else {
                reject(new Error("Student not found"));
            }
        }
    })
    .then((data) => {
        res.end(JSON.stringify(data));
    })
    .catch((err) => {
        res.end(JSON.stringify({ error: err.message }));
    });
};

// Create a new student
const createStudent = (req, res, info) => {
    new Promise((resolve, reject) => {
        let lastId = students[students.length - 1]?.id 
        const newId = lastId + 1;
        const newStudent = { id: newId, ...info };
        students.push(newStudent);
        resolve(newStudent);
    })
    .then((data) => {
        res.statusCode = 201; // Status code for created
        res.end(JSON.stringify(data));
    })
    .catch((error) => {
        res.statusCode = 500; // Internal Server Error
        res.end(JSON.stringify({ error: error.message }));
    });
};

http.createServer((req, res) => {
    try {
        if (req.url == "/" && req.method === "GET") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "text/plain");
            res.end("Welcome to Festac backend class");
        } else if (req.url == "/allstudent" && req.method === "GET") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            getAllStudents(req, res);
        } else if (req.url.match(/^\/onestudent\/([0-9]+)$/) && req.method === "GET") {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            let id = parseInt(req.url.split("/")[2], 10);
            getAStudent(req, res, id);
        } else if (req.url == "/api/students" && req.method === "POST") {
            res.setHeader("Content-Type", "application/json");
            let requestBody = "";
            req.on("data", (chunk) => {
                requestBody += chunk;
            });
            req.on("end", () => {
                try {
                    const parsedData = JSON.parse(requestBody);
                    createStudent(req, res, parsedData);
                } catch (err) {
                    res.statusCode = 400; // Bad Request
                    res.end(JSON.stringify({ error: "Invalid JSON" }));
                }
            });
        } else {
            res.statusCode = 404;
            res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify({ error: "Not Found" }));
        }
    } catch (error) {
        res.statusCode = 500; // Internal Server Error
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: error.message }));
    }
}).listen(port, () => {
    console.log(`App is up and running on port ${port}`);
});
