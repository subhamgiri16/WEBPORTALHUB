// const express = require("express");
// const mysql = require("mysql2");
// const bodyParser = require("body-parser");
// const bcrypt = require("bcryptjs");
// const jwt = require("jsonwebtoken");
// const cors = require("cors");
// const db = require("./config/db");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5500;

// // CORS Middleware
// app.use(
//   cors({
//     origin: "*",
//     methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
//     credentials: true,
//   })
// );

// // Middleware
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));

// // MySQL connection
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the database:", err.message);
//     return;
//   }
//   console.log("Connected to MySQL");
// });

// // MySQL connection for 'form_data' database
// const connectionFormData = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: "form_data", // New database name
// });

// connectionFormData.connect((err) => {
//   if (err) {
//     console.error("Error connecting to the form_data database:", err.message);
//     return;
//   }
//   console.log("Connected to MySQL for 'form_data' database");
// });

// // Authentication middleware
// function authenticateToken(req, res, next) {
//   const authHeader = req.headers["authorization"];
//   const token = authHeader && authHeader.split(" ")[1];
//   if (!token) return res.sendStatus(401);

//   jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
//     if (err) return res.sendStatus(403);
//     req.user = user;
//     next();
//   });
// }

// // Signup route
// app.post("/signup", async (req, res) => {
//   const { username, email, phone, password, dt, role } = req.body;

//   try {
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newUser = {
//       username,
//       email,
//       phone,
//       password: hashedPassword,
//       dt,
//       role,
//     };

//     connection.query("INSERT INTO users SET ?", newUser, (err, result) => {
//       if (err) {
//         console.error("Error registering user:", err);
//         res.status(500).json({ message: "Error registering user", error: err });
//         return;
//       }
//       res.status(201).json({ message: "User registered successfully" });
//     });
//   } catch (error) {
//     console.error("Error registering user:", error);
//     res.status(500).json({ message: "Error registering user", error });
//   }
// });

// // Login route
// app.post("/login", async (req, res) => {
//   const { email, password } = req.body;

//   // Validate request body
//   if (!email || !password) {
//     return res.status(400).json({ message: "Email and password are required" });
//   }

//   try {
//     // Query the database to find the user by email
//     const [rows] = await connection
//       .promise()
//       .query("SELECT * FROM users WHERE email = ?", [email]);

//     // Check if user exists
//     if (rows.length === 0) {
//       return res.status(401).json({ message: "User not found" });
//     }

//     const user = rows[0];

//     // Compare passwords using bcrypt
//     const passwordMatch = await bcrypt.compare(password, user.password);
//     if (!passwordMatch) {
//       return res.status(401).json({ message: "Incorrect password" });
//     }

//     // If password matches, generate JWT token
//     const accessToken = jwt.sign(
//       { email: user.email, role: user.role },
//       process.env.ACCESS_TOKEN_SECRET
//     );

//     // Send the token as a response
//     res.json({ accessToken });
//   } catch (error) {
//     console.error("Error authenticating user:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// });

// // Get all users
// app.get("/api/users", authenticateToken, (req, res) => {
//   const sql = "SELECT * FROM users";
//   connection.query(sql, (err, result) => {
//     if (err) throw err;
//     res.json(result);
//   });
// });

// // Update user role
// app.put("/api/users/:id", authenticateToken, (req, res) => {
//   const { id } = req.params;
//   const { username, email, phone, dt, role } = req.body;
//   const sql =
//     "UPDATE users SET username = ?, email = ?, phone = ?, dt = ?, role = ? WHERE id = ?";
//   connection.query(
//     sql,
//     [username, email, phone, dt, role, id],
//     (err, result) => {
//       if (err) throw err;
//       res.send("User updated");
//     }
//   );
// });

// // Delete user
// app.delete("/api/users/:id", authenticateToken, (req, res) => {
//   const { id } = req.params;
//   const sql = "DELETE FROM users WHERE id = ?";
//   connection.query(sql, [id], (err, result) => {
//     if (err) throw err;
//     res.send("User deleted");
//   });
// });

// // Update function
// app.put("/admin/update/:id", authenticateToken, (req, res) => {
//   const { id } = req.params;
//   const newData = req.body;

//   let query = "UPDATE users SET ";
//   const keys = Object.keys(newData);
//   const values = Object.values(newData);

//   keys.forEach((key, index) => {
//     query += `${key} = ?`;
//     if (index < keys.length - 1) {
//       query += ", ";
//     }
//   });

//   query += " WHERE id = ?";
//   values.push(id);

//   connection.query(query, values, (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(200).json({ message: "Record updated successfully", result });
//     }
//   });
// });

// // Delete function
// app.delete("/admin/delete/:id", authenticateToken, (req, res) => {
//   const { id } = req.params;

//   const query = "DELETE FROM users WHERE id = ?";

//   connection.query(query, [id], (err, result) => {
//     if (err) {
//       res.status(500).json({ error: err.message });
//     } else {
//       res.status(200).json({ message: "Record deleted successfully", result });
//     }
//   });
// });

// // Route to handle form data submission
// app.post("/submit-form", (req, res) => {
//   const newData = req.body; // Assuming the form data is sent as JSON in the request body

//   connectionFormData.query("INSERT INTO module1 SET ?", newData, (err, result) => {
//     if (err) {
//       console.error("Error inserting form data:", err);
//       return res.status(500).json({ message: "Error inserting form data", error: err });
//     }
//     res.status(201).json({ message: "Form data inserted successfully", result });
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use(
  cors({
    origin: "*",
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    credentials: true,
  })
);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, "public")));

// MySQL connection for 'users' database
const connection = mysql.createConnection({
  host: process.env.DB_HOST_USERS,
  user: process.env.DB_USER_USERS,
  password: process.env.DB_PASSWORD_USERS,
  database: process.env.DB_NAME_USERS,
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the 'users' database:", err.message);
    return;
  }
  console.log("Connected to MySQL for 'users' database");
});

// MySQL connection for 'form_data' database
const connectionFormData = mysql.createConnection({
  host: process.env.DB_HOST_FORM_DATA,
  user: process.env.DB_USER_FORM_DATA,
  password: process.env.DB_PASSWORD_FORM_DATA,
  database: process.env.DB_NAME_FORM_DATA,
});

connectionFormData.connect((err) => {
  if (err) {
    console.error("Error connecting to the 'form_data' database:", err.message);
    return;
  }
  console.log("Connected to MySQL for 'form_data' database");
});

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    console.log("No token provided");
    return res.sendStatus(401); // Unauthorized
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_USERS, (err, user) => {
    if (err) {
      console.log("Token verification failed:", err);
      return res.sendStatus(403); // Forbidden
    }
    console.log("Token verified, user:", user);
    req.user = user;
    next();
  });
}

// Signup route
app.post("/signup", async (req, res) => {
  const { username, email, phone, password, dt, role } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = {
      username,
      email,
      phone,
      password: hashedPassword,
      dt,
      role,
    };

    connection.query("INSERT INTO users SET ?", newUser, (err, result) => {
      if (err) {
        console.error("Error registering user:", err);
        res.status(500).json({ message: "Error registering user", error: err });
        return;
      }
      res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    res.status(500).json({ message: "Error registering user", error });
  }
});

// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await connection
      .promise()
      .query("SELECT * FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      return res.status(401).json({ message: "User not found" });
    }

    const user = rows[0];
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Incorrect password" });
    }

    const accessToken = jwt.sign(
      { email: user.email, role: user.role },
      process.env.ACCESS_TOKEN_SECRET_USERS,
      { expiresIn: "1h" } // Token expires in 1 hour
    );

    res.json({ accessToken });
  } catch (error) {
    console.error("Error authenticating user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all users
app.get("/api/users", authenticateToken, (req, res) => {
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, result) => {
    if (err) throw err;
    res.json(result);
  });
});

// Update user role
app.put("/api/users/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const { username, email, phone, dt, role } = req.body;
  const sql =
    "UPDATE users SET username = ?, email = ?, phone = ?, dt = ?, role = ? WHERE id = ?";
  connection.query(
    sql,
    [username, email, phone, dt, role, id],
    (err, result) => {
      if (err) throw err;
      res.send("User updated");
    }
  );
});

// Delete user
app.delete("/api/users/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const sql = "DELETE FROM users WHERE id = ?";
  connection.query(sql, [id], (err, result) => {
    if (err) throw err;
    res.send("User deleted");
  });
});

// Update function
app.put("/admin/update/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const newData = req.body;

  let query = "UPDATE users SET ";
  const keys = Object.keys(newData);
  const values = Object.values(newData);

  keys.forEach((key, index) => {
    query += `${key} = ?`;
    if (index < keys.length - 1) {
      query += ", ";
    }
  });

  query += " WHERE id = ?";
  values.push(id);

  connection.query(query, values, (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: "Record updated successfully", result });
    }
  });
});

// Delete function
app.delete("/admin/delete/:id", authenticateToken, (req, res) => {
  const { id } = req.params;
  const query = "DELETE FROM users WHERE id = ?";
  connection.query(query, [id], (err, result) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.status(200).json({ message: "Record deleted successfully", result });
    }
  });
});

// Route to handle form data submission for Module 1
app.post("/submit-module_1", (req, res) => {
  console.log("Submit MOdule1");
  console.log(req.body);
  const {
    Sl1,
    previousSl1,
    wbsElement,
    projectId,
    schemeName,
    sanctionedCost,
    anticipatedCost,
    ipmm,
    dept,
    proj_mgr,
    current_status,
    scheme_type,
    stage1_approval,
    stage1_approvaldate,
    stage1_cost_gross,
    stage1_cost_net,
    stage1_approval_time,
    stage1_pag_qtr,
    stage1_approval_qtr,
    stage1_approval_trend,
    award_trend_nit,
    stage2_pag_trend,
    award_trend_stage2,
    project_delay_trend,
  } = req.body;

  if (
    !Sl1 ||
    !previousSl1 ||
    !wbsElement ||
    !projectId ||
    !schemeName ||
    !sanctionedCost ||
    !anticipatedCost ||
    !ipmm ||
    !dept ||
    !proj_mgr ||
    !current_status ||
    !scheme_type ||
    !stage1_approval ||
    !stage1_approvaldate ||
    !stage1_approval_trend ||
    !award_trend_nit ||
    !stage2_pag_trend ||
    !award_trend_stage2 ||
    !project_delay_trend
  ) {
    return res.status(400).send("Missing required fields");
  }

  const data = {
    Sl1,
    previousSl1,
    wbsElement,
    projectId,
    schemeName,
    sanctionedCost,
    anticipatedCost,
    ipmm,
    dept,
    proj_mgr,
    current_status,
    scheme_type,
    stage1_approval,
    stage1_approvaldate,
    stage1_cost_gross,
    stage1_cost_net,
    stage1_approval_time,
    stage1_pag_qtr,
    stage1_approval_qtr,
    stage1_approval_trend,
    award_trend_nit,
    stage2_pag_trend,
    award_trend_stage2,
    project_delay_trend,
  };

  const sql = "INSERT INTO module_1 SET ?";
  connectionFormData.query(sql, data, (err, results) => {
    if (err) {
      console.error("Error inserting module_1 data:", err);
      return res.status(500).send(err);
    }
    res.send("Module 1 data saved successfully");
  });
});

// Route to handle form data submission for Module 2
app.post("/submit-module2", (req, res) => {
  console.log("Submit Module2");
  console.log(req.body);
  const {
    Sl2,
    previousSl2,
    nitdate,
    tod,
    tc_recomendation_date,
    stageII_pagdate,
    stageII_approval,
    stageII_gross,
    stageII_net,
    stage1_approval_trend,
    ttime_taken_in_issuing_nIT_after_StageI,
    nit,
    award_trend_nit,
    time_taken_StageIIPAG_after_TC_Recommendation,
    TC_Recommendation,
    stageII_plant_pag,
    stage2_pag_trend,
    time_taken_StageII_Approval_from_PAGII,
    stageII_approval_qtr,
    stageII_approval_trend,
    award_trend_stage2,
    project_delay_trend,
  } = req.body;

  // if (
  //   !Sl2 ||
  //   !previousSl2 ||
  //   !nitdate ||
  //   !tod ||
  //   !tc_recomendation_date ||
  //   !stageII_pagdate ||
  //   !stageII_approval ||
  //   !stageII_gross ||
  //   !stageII_net ||
  //   !stage1_approval_trend ||
  //   !ttime_taken_in_issuing_nIT_after_StageI ||
  //   !nit ||
  //   !award_trend_nit ||
  //   !time_taken_StageIIPAG_after_TC_Recommendation ||
  //   !TC_Recommendation ||
  //   !stageII_plant_pag ||
  //   !stage2_pag_trend ||
  //   !time_taken_StageII_Approval_from_PAGII ||
  //   !stageII_approval_qtr ||
  //   !stageII_approval_trend ||
  //   !award_trend_stage2 ||
  //   !project_delay_trend
  // ) {
  //   return res.status(400).send("Missing required fields");
  // }

  const data = {
    Sl2,
    previousSl2,
    nitdate,
    tod,
    tc_recomendation_date,
    stageII_pagdate,
    stageII_approval,
    stageII_gross,
    stageII_net,
    stage1_approval_trend,
    ttime_taken_in_issuing_nIT_after_StageI,
    nit,
    award_trend_nit,
    time_taken_StageIIPAG_after_TC_Recommendation,
    TC_Recommendation,
    stageII_plant_pag,
    stage2_pag_trend,
    time_taken_StageII_Approval_from_PAGII,
    stageII_approval_qtr,
    stageII_approval_trend,
    award_trend_stage2,
    project_delay_trend,
  };

  const sql = "INSERT INTO module2 SET ?";
  connectionFormData.query(sql, data, (err, results) => {
    if (err) {
      console.error("Error inserting module2 data:", err);
      return res.status(500).send(err);
    }
    res.send("Module 2 data saved successfully");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
