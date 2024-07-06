const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const otpGenerator = require('otp-generator');
const cors = require("cors");
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
  const username = req.body.username ?? "";
  const email = req.body.email ?? "";
  const phone = req.body.phone ?? "";
  const password = req.body.password ?? "";
  const dt = req.body.dt ?? "";
  const role = req.body.role ?? "";

  // Validate input data
  if (!username || username.length > 6) {
    return res.status(400).json({ error: "Invalid username" });
  }
  if (!email || email.length <= 5 || !email.includes("@")) {
    return res.status(400).json({ error: "Invalid email" });
  }
  if (!phone || phone.length < 10) {
    return res.status(400).json({ error: "Invalid phone number" });
  }
  if (!password || password.length > 10) {
    return res.status(400).json({ error: "Invalid password" });
  }
  if (!role || role.length < 1) {
    return res.status(400).json({ error: "Invalid role" });
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
        return res
          .status(500)
          .json({ message: "Error registering user", error: err });
      }
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

    return res.json({ accessToken });
  } catch (error) {
    console.error("Error authenticating user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Route to handle form data submission for Module 1
app.post("/submit-module1", (req, res) => {
  console.log("Recived");
  console.log(req.body);
  const {
    id,
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
    id,
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
  if (
    !Sl2 ||
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
    !project_delay_trend
  ) {
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

// Endpoint to handle form data submission for Module 3
app.post("/submit-module3", (req, res) => {
  console.log("Received data:", req.body);

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
    project_delay_trend,
  } = req.body;

  // Check for required fields
  if (
    !Sl3 ||
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
    !project_delay_trend
  ) {
    return res.status(400).send("Required fields are missing");
  }

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

  const sql = "INSERT INTO module3 SET ?";
  connectionFormData.query(sql, data, (err, results) => {
    if (err) {
      console.error("Error inserting module3 data:", err);
      return res
        .status(500)
        .send("Error inserting module3 data: " + err.message);
    }
    return res.send("Module 3 data saved successfully");
  });
});

//Route to handle form data submission for capex
app.post("/submit-capex", (req, res) => {
  const {
    Sl,
    previousSl,
    actualupto,
    "2021-22 BE": be2021_22,
    "2021-22 RE": re2021_22,
    "Actual Aprl-Mar'22": actualAprMar22,
    "2022-23 BE": be2022_23,
    "2022-23 RE": re2022_23,
    "Actual Capex 2022-23": actualCapex2022_23,
    "STATUS on 31.03.2023": status_31_03_2023,
    "2023-24 BE": be2023_24,
    "STATUS as per Annual Plan 23-24": statusAnnualPlan23_24,
    "2023-24 RE": re2023_24,
    "Actual Capex 2023-24": actualCapex2023_24,
    "Actual Capex Upto 31.03.2024": actualCapexUpto31_03_2024,
    "STATUS on 31.03.24": status_31_03_24,
    "2024-25 (BE)": be2024_25,
    "2024-25 (RE)": re2024_25,
    "STATUS as per Annual Plan 24-25": statusAnnualPlan24_25,
    "Actual Capex 2024-25(TILL DATE)": actualCapex2024_25,
    stage1_approval_trend,
    award_trend_nit,
  } = req.body;

  // Check for required fields
  if (
    !Sl ||
    !previousSl ||
    !status_31_03_2023 ||
    !statusAnnualPlan23_24 ||
    !status_31_03_24 ||
    !statusAnnualPlan24_25 ||
    !stage1_approval_trend ||
    !award_trend_nit
  ) {
    return res.status(400).send("Required fields are missing");
  }

  // Construct data object with all fields (optional fields may be empty)
  const data = {
    Sl,
    previousSl,
    actualupto,
    "2021-22 BE": be2021_22,
    "2021-22 RE": re2021_22,
    "Actual Aprl-Mar'22": actualAprMar22,
    "2022-23 BE": be2022_23,
    "2022-23 RE": re2022_23,
    "Actual Capex 2022-23": actualCapex2022_23,
    "STATUS on 31.03.2023": status_31_03_2023,
    "2023-24 BE": be2023_24,
    "STATUS as per Annual Plan 23-24": statusAnnualPlan23_24,
    "2023-24 RE": re2023_24,
    "Actual Capex 2023-24": actualCapex2023_24,
    "Actual Capex Upto 31.03.2024": actualCapexUpto31_03_2024,
    "STATUS on 31.03.24": status_31_03_24,
    "2024-25 (BE)": be2024_25,
    "2024-25 (RE)": re2024_25,
    "STATUS as per Annual Plan 24-25": statusAnnualPlan24_25,
    "Actual Capex 2024-25(TILL DATE)": actualCapex2024_25,
    stage1_approval_trend,
    award_trend_nit,
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

//Get all users
app.get("/api/users", (req, res) => {
  const sql = "SELECT * FROM users";
  connection.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching users:", err);
      res.status(500).send("Error fetching users data");
      return;
    }
    res.json(results); // Send JSON response with fetched users data
  });
});

// Update a user
app.put("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const { username, email, phone, role } = req.body;
  const sql = `UPDATE users SET username=?, email=?, phone=?, role=? WHERE id=?`;
  connection.query(sql, [username, email, phone, role, id], (err, result) => {
    if (err) {
      console.error("Error updating user:", err);
      res.status(500).send("Error updating user");
      return;
    }
    res.send("User updated successfully");
  });
});

// Delete a user
app.delete("/api/users/:id", (req, res) => {
  const id = req.params.id;
  const sql = "DELETE FROM users WHERE id=?";
  connection.query(sql, id, (err, result) => {
    if (err) {
      console.error("Error deleting user:", err);
      res.status(500).send("Error deleting user");
      return;
    }
    res.send("User deleted successfully");
  });
});

// Get all schemes
app.get("/api/form_data", (req, res) => {
  console.log("Received request for /api/form_data");
  const sql = "SELECT * FROM module1";
  connectionFormData.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err);
      res.status(500).send("Error fetching data");
      return;
    }
    res.json(results);
  });
});

// Update a record
app.put("/api/records/:id", (req, res) => {
  const id = req.params.id;

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

  const sql = `
    UPDATE module1 
    SET 
      Sl1=?,
      previousSl1=?, 
      wbsElement=?, 
      projectId=?, 
      schemeName=?, 
      sanctionedCost=?, 
      anticipatedCost=?, 
      ipmm=?, 
      dept=?, 
      proj_mgr=?, 
      current_status=?, 
      scheme_type=?, 
      stage1_approval=?, 
      stage1_approvaldate=?, 
      stage1_cost_gross=?, 
      stage1_cost_net=?, 
      stage1_approval_time=?, 
      stage1_pag_qtr=?, 
      stage1_approval_qtr=?, 
      stage1_approval_trend=?, 
      award_trend_nit=?, 
      stage2_pag_trend=?, 
      award_trend_stage2=?, 
      project_delay_trend=?
    WHERE id=?
  `;

  const values = [
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
    id,
  ];

  connectionFormData.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating record:", err);
      res.status(500).send("Error updating record");
      return;
    }
    res.send("Record updated successfully");
  });
});

// Delete a record
app.delete("/api/records/:id", (req, res) => {
  const Sl1 = req.params.id;
  const sql = `DELETE FROM module1 WHERE Sl1=?`;

  connectionFormData.query(sql, id, (err, result) => {
    if (err) {
      console.error("Error deleting record:", err);
      res.status(500).send("Error deleting record");
      return;
    }
    res.send("Record deleted successfully");
  });
});

// Get all module2 data
app.get("/api/module2", (req, res) => {
  console.log("Received request for /api/module2");

  const sql = "SELECT * FROM module2";
  connectionFormData.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err); // Log the error
      res.status(500).send("Error fetching data");
      return;
    }
    res.json(results);
  });
});

// Update a record in module2
app.put("/api/records/:Sl2", (req, res) => {
  const Sl2 = req.params.Sl2;
  const {
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

  const sql = `
    UPDATE module2 
    SET 
      previousSl2=?, 
      nitdate=?, 
      tod=?, 
      tc_recomendation_date=?, 
      stageII_pagdate=?, 
      stageII_approval=?, 
      stageII_gross=?, 
      stageII_net=?, 
      stage1_approval_trend=?, 
      time_taken_in_issuing_nIT_after_StageI=?, 
      nit=?, 
      award_trend_nit=?, 
      time_taken_StageIIPAG_after_TC_Recommendation=?, 
      TC_Recommendation=?, 
      stageII_plant_pag=?, 
      stage2_pag_trend=?, 
      time_taken_StageII_Approval_from_PAGII=?, 
      stageII_approval_qtr=?, 
      stageII_approval_trend=?, 
      award_trend_stage2=?, 
      project_delay_trend=?
    WHERE Sl2=?
  `;

  const values = [
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
    Sl2,
  ];

  connectionFormData.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error updating record:", err);
      res.status(500).send("Error updating record");
      return;
    }
    console.log(`Record with Sl2 ${Sl2} updated successfully`);
    res.status(200).send(`Record with Sl2 ${Sl2} updated successfully`);
  });
});

// Delete a record
app.delete("/api/records/:Sl2", (req, res) => {
  const Sl1 = req.params.Sl2;
  const sql = `DELETE FROM module1 WHERE Sl2=?`;

  connectionFormData.query(sql, [Sl1], (err, result) => {
    if (err) {
      console.error("Error deleting record:", err);
      res.status(500).send("Error deleting record");
      return;
    }
    res.send("Record deleted successfully");
  });
});

// Get all module3 data
app.get("/api/module3", (req, res) => {
  console.log("Received request for /api/module3");

  const sql = "SELECT * FROM module3";
  connectionFormData.query(sql, (err, results) => {
    if (err) {
      console.error("Error fetching data:", err); // Log the error
      res.status(500).send("Error fetching data");
      return;
    }
    res.json(results);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
