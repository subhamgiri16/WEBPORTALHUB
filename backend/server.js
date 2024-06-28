const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
  credentials: true,
}));

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

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

// Signup route
app.post("/signup", async (req, res) => {
  const username = req.body.username ?? '';
  const email = req.body.email ?? '';
  const phone = req.body.phone ?? '';
  const password = req.body.password ?? '';
  const dt = req.body.dt ?? '';
  const role = req.body.role ?? '';

  // Validate input data
  if (!username || username.length < 6) {
    return res.status(400).json({ error: 'Invalid username' });
  }
  if (!email || email.length <= 5 || !email.includes('@')) {
    return res.status(400).json({ error: 'Invalid email' });
  }
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: 'Invalid phone number' });
  }
  if (!password || password.length <= 10) {
    return res.status(400).json({ error: 'Invalid password' });
  }
  if (!role || role.length < 1) {
    return res.status(400).json({ error: 'Invalid role' });
  }

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
        return res.status(500).json({ message: "Error registering user", error: err });
      }
      return res.status(201).json({ message: "User registered successfully" });
    });
  } catch (error) {
    console.error("Error registering user:", error);
    return res.status(500).json({ message: "Error registering user", error });
  }
});


// Login route
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required" });
  }

  try {
    const [rows] = await connection.promise().query("SELECT * FROM users WHERE email = ?", [email]);

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

    return res.json({ accessToken });
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle form data submission for Module 1
app.post("/submit-module1", (req, res) => {
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

  const sql = "INSERT INTO module1 SET ?";
  connectionFormData.query(sql, data, (err, results) => {
    if (err) {
      console.error("Error inserting module1 data:", err);
      return res.status(500).send(err);
    }
    return res.send("Module 1 data saved successfully");
  });
});

// Route to handle form data submission for Module 2
app.post("/submit-module2", (req, res) => {
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
    time_taken_in_issuing_nIT_after_StageI,
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

  // Validate required fields
  if (!Sl2 ||
      !previousSl2 ||
      !nitdate ||
      !tod ||
      !tc_recomendation_date ||
      !stageII_pagdate ||
      !stageII_approval ||
      !stageII_gross ||
      !stageII_net ||
      !stage1_approval_trend ||
      !time_taken_in_issuing_nIT_after_StageI ||
      !nit ||
      !award_trend_nit ||
      !time_taken_StageIIPAG_after_TC_Recommendation ||
      !TC_Recommendation ||
      !stageII_plant_pag ||
      !stage2_pag_trend ||
      !time_taken_StageII_Approval_from_PAGII ||
      !stageII_approval_qtr ||
      !stageII_approval_trend ||
      !award_trend_stage2 ||
      !project_delay_trend) {
    return res.status(400).send("All fields are required");
  }

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
    time_taken_in_issuing_nIT_after_StageI,
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
    return res.send("Module 2 data saved successfully");
  });
});

// Route to handle form data submission for Module 3
app.post("/submit-module3", (req, res) => {
  const {
    Sl3,
    previousSl3,
    award_date,
    order_cost,
    order_cost_net,
    party_name,
    email,
    contact_no,
    pan_no,
    contract_date,
    completion_period,
    completion_date,
    actual_completion_date,
    delay_reason,
    action_taken,
    status_scheme,
    stage1_approval_trend,
    award_nit,
    award_date_qtr,
    award_trend_nit,
    stage2_pag_trend,
    time_taken_stage_approval,
    award_trend_stage2,
    eff_contractdate,
    schedule_completion,
    completion_qtr,
    projectdelay,
    project_delay_trend
  } = req.body;

  // Check for required fields
  if (!Sl3 ||
      !previousSl3 ||
      !award_date ||
      !order_cost ||
      !order_cost_net ||
      !contract_date ||
      !completion_date ||
      !actual_completion_date ||
      !delay_reason ||
      !action_taken ||
      !status_scheme ||
      !stage1_approval_trend ||
      !award_trend_nit ||
      !stage2_pag_trend ||
      !award_trend_stage2 ||
      !project_delay_trend) {
    return res.status(400).send("Required fields are missing");
  }

  // Construct data object with all fields (optional fields may be empty)
  const data = {
    Sl3,
    previousSl3,
    award_date,
    order_cost,
    order_cost_net,
    party_name,
    email,
    contact_no,
    pan_no,
    contract_date,
    completion_period,
    completion_date,
    actual_completion_date,
    delay_reason,
    action_taken,
    status_scheme,
    stage1_approval_trend,
    award_nit,
    award_date_qtr,
    award_trend_nit,
    stage2_pag_trend,
    time_taken_stage_approval,
    award_trend_stage2,
    eff_contractdate,
    schedule_completion,
    completion_qtr,
    projectdelay,
    project_delay_trend,
  };

  // Insert data into database
  const sql = "INSERT INTO module3 SET ?";
  connectionFormData.query(sql, data, (err, results) => {
    if (err) {
      console.error("Error inserting module3 data:", err);
      return res.status(500).send(err);
    }
    return res.send("Module 3 data saved successfully");
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
