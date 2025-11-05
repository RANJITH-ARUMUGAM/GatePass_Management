
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const { Pool } = require("pg");
const { log } = require('console');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
require("dotenv").config();
const multer = require('multer');
const moment = require('moment');
const CryptoJS = require("crypto-js");
const AES_SECRET_KEY = "password";

const QRCode = require('qrcode');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Ensure this folder exists and is public/static
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

app.use(bodyParser.json({ limit: '10mb' }));
app.use(cors({
  origin: ["http://localhost:3000"],
  methods: ["POST", "GET", "DELETE", "PUT", "SORT"],
  credentials: true
}));

const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "5441",
  database: process.env.DB_NAME || "GMS",
  port: process.env.DB_PORT || 5432
});

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

transporter.verify((err, success) => {
  if (err) {
    console.error('Email transporter connection failed:', err);
  } else {
    console.log('✅ Email transporter is ready to send!');
  }
});
////-------------------------------------Login Page Begins Here------------------------------------------------------////


app.post('/user_login', async (req, res) => {
  const { username, password } = req.body;
  console.log("/login " + username, password);

  db.query("SELECT * FROM ADM_User_T WHERE ADM_Users_loginid=$1", [username], async (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      res.status(500).send({ success: false, error: "Database error" });
    } else {
      if (results.rowCount > 0) {
        const user = results.rows[0];
        if (!user.adm_users_status) {
          return res.json({
            success: false,
            message: "Your account is not active. Please contact the administrator.",
            status: "inactive"
          });
        }

        let decryptedPassword;
        try {
          const bytes = CryptoJS.AES.decrypt(user.adm_users_password, AES_SECRET_KEY);
          decryptedPassword = bytes.toString(CryptoJS.enc.Utf8);
        } catch (err) {
          console.error("Password decryption error:", err);
          return res.status(500).json({ success: false, message: "Error processing password" });
        }

        if (password === decryptedPassword) {
          db.query(`SELECT "Roles_RoleName", "Roles_Application"
                    FROM public.userrole_vw_new 
                    WHERE "Users_LoginID" = $1 AND "UserRole_Status" = true`,
            [username],
            (err2, roleResults) => {
              if (err2) {
                console.error("Role fetch error:", err2);
                return res.status(500).send({ success: false, error: "Role fetch error" });
              }

              let userRole = null;
              let userApp = null;
              if (roleResults.rowCount > 0) {
                userRole = roleResults.rows[0].Roles_RoleName;
                userApp = roleResults.rows[0].Roles_Application;
              }

              let avatar = null;
              if (user.adm_users_profileimage) {
                if (user.adm_users_profileimage.type === 'Buffer') {
                  const base64Image = Buffer.from(user.adm_users_profileimage.data).toString('base64');
                  avatar = `data:image/png;base64,${base64Image}`;
                } else if (typeof user.adm_users_profileimage === 'string') {
                  avatar = user.adm_users_profileimage;
                }
              }

              res.json({
                success: true,
                message: "Login Successful",
                id: user.adm_users_id,
                loginid: user.adm_users_loginid,
                UserRole: userRole,
                Application: userApp,
                name: `${user.adm_users_firstname} ${user.adm_users_lastname}`,
                avatar: avatar,
              });
              console.log("Success - Logged In:", username, "Role:", userRole);
            }
          );
        } else {
          res.json({ success: false, message: "Invalid Login Credential" });
          console.log("Failed - Incorrect Password");
        }
      } else {
        res.json({ success: false, message: "Invalid Login Credential" });
        console.log("Failed - No User");
      }
    }
  });
});




////-------------------------------------Login Page Ends Here------------------------------------------------------////


////-------------------------------------SignUp Page Begins Here------------------------------------------------------////

app.post("/user_signup", async (req, res) => {
  const { username, firstname, lastname, email, mobile, created_by } = req.body;
  console.log("/user_signup" + username, firstname, lastname, email, mobile);
  db.query("INSERT INTO ADM_User_T (ADM_Users_LoginID,ADM_Users_FirstName ,ADM_Users_LastName,ADM_Users_email, ADM_Users_Mobile,created_on, created_by) VALUES ($1,$2,$3,$4,$5,CURRENT_DATE,$6)",
    [username, firstname, lastname, email, mobile, created_by], (err, results) => {
      if (err) {
        console.error("Database query error:", err);
        res.status(500).json({ success: false, error: "Database error" });
      }
      else {
        res.json({ success: true, message: "User added successfully." });
        console.log("Data Stored...");
      }
    });
});

app.post('/user_checkemail', async (req, res) => {
  const { email } = req.body;
  console.log("/user_checkemail'" + email);
  db.query('SELECT * FROM ADM_User_T WHERE ADM_Users_email = $1', [email],
    (err, results) => {
      if (err) {
        console.error(err);
        res.status(500).send('Server error');
      }
      else {
        if (results.rows.length > 0) {
          res.status(200).send({ exists: true, message: "User Already Exist" });
        } else {
          res.status(200).send({ exists: false });
        }
      }
    }
  );
});
////-------------------------------------Signup Page Ends Here------------------------------------------------------////
////-------------------------------------Admin Page UserList Begins Here------------------------------------------------------////
// 🔹 Fetch All Users
app.get("/userlist_getalldata", (req, res) => {
  console.log("/userlist_getalldata");
  db.query("SELECT * FROM adm_user_t", (err, result) => {
    if (err) {
      console.error("error:", err);
      res.status(500).json({ success: false, error: "error" });
    }
    else
      res.status(200).json({ success: true, data: result.rows });
  }
  );
});
// 🔹 Fetch a Single User by ID (Fixed)
app.get("/userlist_getalldatabyid/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log("/userlist_getalldatabyid:" + userId);
  db.query("SELECT * FROM adm_user_t WHERE adm_users_id = $1", [userId],
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else {
        if (result.rows.length > 0) {
          //console.log(result.rows[0]);
          res.status(200).json(result.rows[0]);
        } else {
          res.status(404).json({ success: false, error: "User not found" });
          console.log("not found")
        }
      }
    });
});
// Delete a user by ID
app.delete('/userlist_deleteuser/:userId', (req, res) => {
  const userId = req.params.userId;
  console.log("/userlist_deleteuser:" + userId);
  if (!userId) {
    return res.status(400).json({ error: "User ID is required" });
  }
  const query = `DELETE FROM adm_user_t WHERE adm_users_id = $1`;
  db.query(query, [userId], (error, results) => {
    if (error) {
      console.error('Error executing delete query:', error);
      return res.status(500).json({ success: false, message: 'Database error.' });
    }
    // Check if any row was deleted
    if (results.rowCount === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }
    return res.status(200).json({ success: true, message: 'User deleted successfully.' });
  });
});
//! Edit profile by the user
app.get('/edit_profile/:loginid', async (req, res) => {
  const loginid = req.params.loginid;
  db.query("SELECT * FROM adm_user_t WHERE LOWER(adm_users_loginid) = LOWER($1)", [loginid], (err, result) => {
    if (err) {
      console.error("DB error:", err);
      return res.status(500).json({ success: false, error: "Database error" });
    }
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    const user = result.rows[0];
    // Convert buffer to base64 string
    if (user.adm_users_profileimage && user.adm_users_profileimage.type === 'Buffer') {
      // Convert the Buffer object to a Base64 string
      const base64Image = Buffer.from(user.adm_users_profileimage.data).toString('base64');
      // Prepend the data URI scheme
      user.adm_users_profileimage = `data:image/png;base64,${base64Image}`;
    }
    return res.json(user);
  });
});


app.put('/edit_profile/:mail', async (req, res) => {
  const mail = req.params.mail;
  const updatedData = req.body;
  console.log("/edit_profile for:", mail);
  let query = `
    UPDATE ADM_User_T SET
      ADM_Users_Address1 = $1,
      ADM_Users_Address2 = $2,
      ADM_Users_Address3 = $3,
      ADM_Users_DOB = $4,
      ADM_Users_Gender = $5,
      modified_on = CURRENT_DATE,
      modified_by = 'User'
  `;
  const params = [
    updatedData.adm_users_address1 || null,
    updatedData.adm_users_address2 || null,
    updatedData.adm_users_address3 || null,
    updatedData.adm_users_dob || null,
    updatedData.adm_users_gender || null,
  ];
  if (updatedData.adm_users_profileimage) {
    try {
      let imageBuffer;
      if (typeof updatedData.adm_users_profileimage === "string") {
        // case: base64 string from frontend
        const base64Data = updatedData.adm_users_profileimage.replace(/^data:image\/[a-zA-Z]+;base64,/, '');
        imageBuffer = Buffer.from(base64Data, 'base64');
      } else if (updatedData.adm_users_profileimage.type === "Buffer" || updatedData.adm_users_profileimage.data) {
        // case: JSON with Buffer-like { type: 'Buffer', data: [...] }
        imageBuffer = Buffer.from(updatedData.adm_users_profileimage.data);
      } else if (Buffer.isBuffer(updatedData.adm_users_profileimage)) {
        // case: already a Buffer
        imageBuffer = updatedData.adm_users_profileimage;
      } else {
        return res.status(400).json({ success: false, error: "Unsupported image format" });
      }
      if (!imageBuffer || imageBuffer.length === 0) {
        return res.status(400).json({ success: false, error: "Invalid image data" });
      }
      if (imageBuffer.length > 5 * 1024 * 1024) {
        return res.status(400).json({ success: false, error: "Image too large. Maximum 5MB allowed." });
      }
      query += `, ADM_Users_ProfileImage = $6::bytea`;
      params.push(imageBuffer);
    } catch (err) {
      console.error("Image conversion error:", err);
      return res.status(400).json({ success: false, error: "Invalid image data" });
    }
  }
  query += ` WHERE LOWER(ADM_Users_LoginID) = LOWER($${params.length + 1})`;
  params.push(mail);
  console.log("Executing query:", query);
  console.log("With params:", params);
  db.query(query, params, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send({ success: false, error: "Database error" });
    }
    if (results.rowCount > 0) {
      console.log("✅ Profile updated successfully");
      return res.json({ success: true, message: "Profile updated successfully" });
    } else {
      console.log("❌ Profile update failed: User not found");
      return res.json({ success: false, message: "User not found" });
    }
  });
});



app.post('/validate_password', async (req, res) => {
  const { email, password } = req.body;
  try {
    const query = 'SELECT adm_users_password FROM adm_user_t WHERE adm_users_loginid = $1';
    const result = await pool.query(query, [email]);
    if (result.rowCount === 0) {
      return res.status(404).json({ isValid: false, message: 'User not found' });
    }
    const storedHashedPassword = result.rows[0].adm_users_password;
    const isMatch = await bcrypt.compare(password, storedHashedPassword);
    if (isMatch) {
      return res.status(200).json({ isValid: true });
    } else {
      return res.status(401).json({ isValid: false, message: 'Invalid password' });
    }
  } catch (err) {
    console.error('Validation error:', err);
    return res.status(500).json({ isValid: false, message: 'Server error' });
  }
});

app.put('/change_password/:mail', (req, res) => {
  const mail = req.params.mail;
  const { newPassword } = req.body;
  bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
    if (err) {
      console.error("Hash error:", err);
      return res.status(500).json({ success: false, error: 'Error hashing password' });
    }
    const query = `
      UPDATE adm_user_t
      SET adm_users_password = $1, modified_on = CURRENT_DATE, modified_by = 'System'
      WHERE adm_users_loginid = $2
    `;
    pool.query(query, [hashedPassword, mail], (err, result) => {
      if (err) {
        console.error("DB error:", err);
        return res.status(500).json({ success: false, error: 'Database error' });
      }
      if (result.rowCount > 0) {
        return res.status(200).json({ success: true, message: 'Password changed' });
      } else {
        return res.status(404).json({ success: false, error: "User not found" });
      }
    });
  });
});

////-------------------------------------Admin Page UserList Ends Here------------------------------------------------------////

////-------------------------------------User Page EditUser Begins Here------------------------------------------------------////

app.post("/userlist_adduser", (req, res) => {
  const {
    adm_users_loginid, adm_users_password, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
    adm_users_address1, adm_users_address2, adm_users_address3, adm_users_dob, adm_users_gender,
    adm_users_phoneextn, adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_islocked,
    adm_users_status, created_by, adm_users_defaultroleid
  } = req.body;
  console.log("/userlist_adduser");
  // Check for required fields
  if (!adm_users_loginid || !adm_users_password || !adm_users_email || !adm_users_firstname) {
    res.status(400).json({ error: "Required fields are missing." });
    return;
  }
  // Hash the password before saving
  bcrypt.hash(adm_users_password, 10, (err, hash) => {
    if (err) {
      console.error("Password hashing error:", err);
      return res.status(500).json({ error: "Error processing password." });
    }
    const query = `
      INSERT INTO adm_user_t (
        adm_users_loginid, adm_users_password, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
        adm_users_gender, adm_users_dob, adm_users_address1, adm_users_address2, adm_users_address3,
        adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_phoneextn, adm_users_islocked,
        adm_users_status, created_on, created_by, adm_users_defaultroleid
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, CURRENT_DATE, $19, $20
      )
    `;
    const values = [
      adm_users_loginid, hash, adm_users_email, adm_users_title, adm_users_firstname, adm_users_lastname, adm_users_mobile,
      adm_users_gender, adm_users_dob, adm_users_address1, adm_users_address2, adm_users_address3,
      adm_users_deptid, adm_users_jobid, adm_users_positionid, adm_users_phoneextn,
      adm_users_islocked === true,
      adm_users_status === true,
      created_by,
      adm_users_defaultroleid
    ];
    db.query(query, values, (err) => {
      if (err) {
        console.error("Database Error:", err);
        res.status(500).json({ error: "Error adding user." });
      } else {
        res.status(200).json({ message: "User added successfully." });
      }
    });
  });
});

app.put("/userlist_changepassword/:id", async (req, res) => {
  const userId = req.params.id;
  const { newPassword } = req.body;
  const currentUserRole = req.session.user.role; // Example using a session
  if (currentUserRole !== 'Administrator') {
    return res.status(403).json({ success: false, error: "Access denied. Only Administrators can change passwords." });
  }
  if (!newPassword) {
    return res.status(400).json({ error: "New password is required." });
  }
  try {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
          UPDATE adm_user_t
          SET adm_users_password = $1, modified_on = CURRENT_DATE
          WHERE adm_users_id = $2
          RETURNING *;
      `;
    const values = [hashedPassword, userId];
    db.query(query, values, (err, result) => {
      if (err) {
        console.error("Database Error:", err);
        return res.status(500).json({ error: "Error updating password." });
      } else {
        if (result.rowCount === 0) {
          return res.status(404).json({ success: false, error: "User not found" });
        } else {
          res.status(200).json({ success: true, message: "Password updated successfully." });
        }
      }
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    res.status(500).json({ error: "Error processing password." });
  }
});

app.put("/userlist_editusers/:id", async (req, res) => {
  const userId = req.params.id;
  const updatedData = req.body;
  if (updatedData.adm_users_password) {
    delete updatedData.adm_users_password;
  }
  console.log("/userlist_editusers : " + userId);
  const fields = Object.keys(updatedData)
    .map((key, index) => `${key} = $${index + 1}`)
    .join(", ");
  const values = Object.values(updatedData);
  values.push(userId);
  const query = `
    UPDATE adm_user_t
    SET ${fields}
    WHERE adm_users_id = $${values.length}
    RETURNING *;
  `;
  db.query(query, values, (err, result) => {
    if (err) {
      console.error("Database Error:", err);
      res.status(500).json({ error: "Error adding user." });
    } else {
      if (result.rowCount === 0) {
        return res.status(404).json({ success: false, error: "User not found" });
      } else {
        res.status(200).json({ success: true, user: result.rows[0] });
      }
    }
  });
});

////-------------------------------------User Page EditUser Ends Here------------------------------------------------------////

////-------------------------------------MetaData Page Starts Here------------------------------------------------------////

app.get('/metadata_Detail', (req, res) => {
  console.log('MetaData Details');
  db.query("select GEN_Metadtl_ID,GEN_Metahdr_ID,GEN_Metadtl_Value1,GEN_Metadtl_Value2,GEN_Metadtl_Value3,GEN_Metadtl_Value4,GEN_Metadtl_Value5,GEN_Metadtl_Value6,GEN_Metadtl_Value7,GEN_Metadtl_Value8,GEN_Metadtl_Status from GEN_MetadataDtl_T",
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else
        res.status(200).json({ success: true, data: result.rows });
    }
  )
});

app.post('/metadata_Header', (req, res) => {
  console.log('MetaData Header')
  const {
    GEN_Metahdr_ID,
    GEN_Metahdr_Category,
    GEN_Metahdr_CategoryName,
    GEN_Metahdr_Status,
  } = req.body;
  const metahdrquery = `INSERT INTO gen_metadatahdr_t
    (GEN_Metahdr_ID,GEN_Metahdr_Category,GEN_Metahdr_CategoryName,GEN_Metahdr_Status,created_on, created_by) 
    VALUES ($1,$2,$3,$4,CURRENT_DATE,'Admin')`;
  db.query(metahdrquery, [GEN_Metahdr_ID, GEN_Metahdr_Category, GEN_Metahdr_CategoryName, GEN_Metahdr_Status],
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else
        res.status(200).json({ success: true, message: 'Meta Data Header inserted' });
    }
  );
});

app.post('/metadata_Details', (req, res) => {
  console.log('MetaData Details')
  const {
    GEN_Metadtl_ID,
    GEN_Metahdr_ID,
    GEN_Metadtl_Value1,
    GEN_Metadtl_Value2,
    GEN_Metadtl_Value3,
    GEN_Metadtl_Value4,
    GEN_Metadtl_Value5,
    GEN_Metadtl_Value6,
    GEN_Metadtl_Value7,
    GEN_Metadtl_Value8,
    GEN_Metadtl_Status,
  } = req.body;
  const query = "INSERT INTO GEN_MetadataDtl_T (GEN_Metadtl_ID,GEN_Metahdr_ID,GEN_Metadtl_Value1,GEN_Metadtl_Value2,GEN_Metadtl_Value3,GEN_Metadtl_Value4,GEN_Metadtl_Value5,GEN_Metadtl_Value6,GEN_Metadtl_Value7,GEN_Metadtl_Value8,GEN_Metadtl_Status,created_on, created_by) VALUES ($1,$2,$3,$4, $5,$6, $7, $8, $9, $10,$11,CURRENT_DATE,'Admin')";
  db.query(query, [
    GEN_Metadtl_ID,
    GEN_Metahdr_ID,
    GEN_Metadtl_Value1 || null,
    GEN_Metadtl_Value2 || null,
    GEN_Metadtl_Value3 || null,
    GEN_Metadtl_Value4 || null,
    GEN_Metadtl_Value5 || null,
    GEN_Metadtl_Value6 || null,
    GEN_Metadtl_Value7 || null,
    GEN_Metadtl_Value8 || null,
    GEN_Metadtl_Status
  ],
    (err, result) => {
      if (err) {
        console.error("error:", err);
        res.status(500).json({ success: false, error: "error" });
      }
      else
        res.status(200).json({ success: true, message: 'Meta Data Header inserted' });
    }
  );
});
////-------------------------------------MetaData Page Ends Here------------------------------------------------------////
////-------------------------------------Visitor Details Starts Here------------------------------------------------------////
app.use(bodyParser.json({ limit: '10mb' }));
// );

app.post('/visitorgateentry', async (req, res) => {
  try {
    const {
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_ToMeet,
      GMS_ToMeetEmail,
      GMS_VisitPurpose,
      GMS_Expectedexit,
      GMS_VehicleNo,
      GMS_IdentificationType,
      GMS_IdentificationNo,
      GMS_MobileNo,
      GMS_EmailID,
      GMS_VisitorImage,
      GMS_Status = 'Pending',
      created_by = 'system'
    } = req.body;
    // Validate required fields
    if (!GMS_VisitorName?.trim()) {
      return res.status(400).json({ success: false, message: 'Visitor name is required' });
    }
    if (!GMS_MobileNo?.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }
    if (!GMS_VisitorImage) {
      return res.status(400).json({ success: false, message: 'Visitor image is required' });
    }
    // Process image - remove data URL prefix if present
    const base64Data = GMS_VisitorImage.replace(/^data:image\/\w+;base64,/, '');
    const imageBuffer = Buffer.from(base64Data, 'base64');
    const insertQuery = `
      INSERT INTO gms_gate_entries (
        GMS_VisitorName,
        GMS_VisitorFrom,
        GMS_ToMeet,
        GMS_ToMeetEmail,
        GMS_VisitPurpose,
        GMS_Expectedexit,
        GMS_VehicleNo,
        GMS_IdentificationType,
        GMS_IdentificationNo,
        GMS_MobileNo,
        GMS_EmailID,
        GMS_VisitorImage,
        GMS_Status,
        created_by,
         entry_time, 
        GMS_Outtime
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW(), NUll)
      RETURNING GMS_GateEntry_ID;
    `;
    const values = [
      GMS_VisitorName.trim(),
      GMS_VisitorFrom?.trim() || null,
      GMS_ToMeet?.trim() || null,
      GMS_ToMeetEmail?.trim() || null,
      GMS_VisitPurpose?.trim() || null,
      GMS_Expectedexit || null,
      GMS_VehicleNo?.trim() || null,
      GMS_IdentificationType?.trim() || null,
      GMS_IdentificationNo?.trim() || null,
      GMS_MobileNo.trim(),
      GMS_EmailID?.trim() || null,
      imageBuffer, // Binary image data
      GMS_Status,
      created_by
    ];
    const result = await db.query(insertQuery, values);
    res.status(201).json({
      success: true,
      message: 'Visitor entry created successfully',
      visitorId: result.rows[0].GMS_GateEntry_ID
    });
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create visitor entry',
      error: error.message
    });
  }
});


app.post('/sendVisitorIDEmail', async (req, res) => {
  const { email, visitor } = req.body;
  console.log('Email request received:', { email, visitor });
  if (!email || !visitor) {
    return res.status(400).json({ message: 'Email and visitor details are required.' });
  }
  try {
    // 1. Generate QR code as buffer (instead of DataURL)
    const qrData = {
      visitorId: visitor.id,
      name: visitor.name,
      from: visitor.from,
      toMeet: visitor.toMeet,
      purpose: visitor.purpose,
      vehicle: visitor.vehicle,
      issuedBy: 'Security Desk',
      date: visitor.date,
      time: visitor.time,
    };
    const qrBuffer = await QRCode.toBuffer(JSON.stringify(qrData));
    // 2. Fetch visitor image from DB
    const imageResult = await db.query(
      'SELECT gms_visitorimage FROM gms_gate_entries WHERE GMS_GateEntry_ID = $1',
      [visitor.id]
    );
    if (!imageResult.rows.length || !imageResult.rows[0].gms_visitorimage) {
      return res.status(404).json({ message: 'Visitor image not found in database.' });
    }
    const imageBuffer = imageResult.rows[0].gms_visitorimage;
    // Detect MIME type (JPG/PNG)
    const isJPEG = imageBuffer[0] === 0xFF && imageBuffer[1] === 0xD8;
    const mimeType = isJPEG ? 'image/jpeg' : 'image/png';
    // Base64 for debug if needed
    const base64Image = `data:${mimeType};base64,${imageBuffer.toString('base64')}`;
    // 3. Compose HTML email (photo + QR use cid)
    const html = `
      <div style="display: flex; gap: 20px; justify-content: center; font-family: Arial, sans-serif; padding: 20px;">
        <!-- FRONT SIDE -->
        <div style="width: 300px; height: 450px; border: 2px solid #2c3e50; border-radius: 10px; overflow: hidden; position: relative; background: white; color: black; padding: 0; box-sizing: border-box;">
          <div style="background: #1d4ed8; padding: 10px 16px; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; font-size: 1rem; font-weight: 700; color: white;">COMPANY</h3>
            <span style="background: #22c55e; color: white; padding: 4px 10px; border-radius: 20px; font-size: 0.65rem; font-weight: 700;">VISITOR</span>
          </div>
          <div style="display: flex; justify-content: center; align-items: center; margin: 3px; width: 100%;">
            <img src="cid:visitorphoto_${visitor.id}" alt="Visitor" style="width: 125px; height: 125px; border-radius: 50%; border: 2px solid green; object-fit: cover;" />
          </div>
          <div style="font-size: 0.85rem; line-height: 1;">
            <p><strong>ID:</strong> ${visitor.id}</p>
            <p><strong>Name:</strong> ${visitor.name}</p>
            <p><strong>Company:</strong> ${visitor.from}</p>
            <p><strong>To Meet:</strong> ${visitor.toMeet}</p>
            <p><strong>Date:</strong> ${visitor.date}</p>
            <p><strong>Time In:</strong> ${visitor.time}</p>
            <p><strong>Address:</strong> Company name 1/40, 1st street, Guindy, Chennai-68.</p>
          </div>
          <div style="position: absolute; bottom: 0; width: 100%; background: #1ec534; text-align: center; padding: 6px; font-weight: bold; font-size: 0.85rem; border-top: 1px solid #e2e8f0;">
            Valid ${visitor.date}
          </div>
        </div>
        <!-- BACK SIDE -->
        <div style="width: 300px; height: 450px; border: 2px solid #2c3e50; border-radius: 10px; background: white; display: flex; flex-direction: column; align-items: center; padding: 20px; box-sizing: border-box;">
          <div style="text-align: center; margin-top: 40px;">
            <img src="cid:visitorqr_${visitor.id}" alt="QR Code" style="width: 160px; height: 160px; margin-bottom: 12px; border: 1px solid #22c55e; padding: 5px; border-radius: 10px;" />
            <p style="font-size: 1rem; margin: 10px 0 0; width: 100%;">Scan this code for visitor details</p>
          </div>
          <div style="margin-top: auto; text-align: center; width: 100%; font-size: 0.75rem; color: #1e293b;">
            <p><strong>In case of emergency, please contact:</strong></p>
            <p>Security: +1 234 567 8900</p>
          </div>
        </div>
      </div>
    `;
    console.log('Attempting to send email to:', email);
    // 4. Send visitor email
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: `Visitor ID Card - ${visitor.name}`,
      html,
      attachments: [
        {
          filename: `visitor_${visitor.id}.jpg`,
          content: imageBuffer,
          cid: `visitorphoto_${visitor.id}`
        },
        {
          filename: `qr_${visitor.id}.png`,
          content: qrBuffer,
          cid: `visitorqr_${visitor.id}`
        }
      ]
    };
    const result = await transporter.sendMail(mailOptions);
    console.log('Visitor email sent successfully:', result.messageId);
    // ✅ Notify employee also
    if (visitor.toMeetEmail) {
      const employeeMailOptions = {
        from: process.env.EMAIL_USER,
        to: visitor.toMeetEmail,
        subject: `Visitor Arrival Notification - ${visitor.name}`,
        html: `
          <p>Dear ${visitor.toMeet},</p>
          <p>This is to inform you that <strong>${visitor.name}</strong> from <strong>${visitor.from}</strong> has arrived to meet you.</p>
          <p><strong>Purpose:</strong> ${visitor.purpose}</p>
          <p><strong>Vehicle:</strong> ${visitor.vehicle || "N/A"}</p>
          <p><strong>Time In:</strong> ${visitor.time}, <strong>Date:</strong> ${visitor.date}</p>
          <br/>
          <p>Regards,<br/>Security Desk</p>
        `
      };
      try {
        const empResult = await transporter.sendMail(employeeMailOptions);
        console.log('Employee notification email sent:', empResult.messageId);
      } catch (err) {
        console.error('Failed to send employee notification email:', err);
      }
    }
    res.status(200).json({
      message: 'Visitor ID Card emailed successfully to visitor (and employee notified if applicable).',
      messageId: result.messageId
    });
  } catch (error) {
    console.error('Error sending visitor ID email:', error);
    res.status(500).json({
      message: 'Failed to send visitor ID card.',
      error: error.message
    });
  }
});



app.post('/sendEmail', async (req, res) => {
  const { from, to, cc, bcc, subject, html } = req.body;
  console.log("📨 /sendEmail request:", { from, to, cc, bcc, subject });
  // Build email options (conditionally include bcc)
  const mailOptions = {
    from,
    to,
    cc,
    subject,
    html,
    ...(bcc && { bcc }) // Add bcc only if provided
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
    res.status(200).send('Email sent successfully!');
  } catch (error) {
    console.error("❌ Email sending error:", error);
    res.status(500).send('Error sending email.');
  }
});

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};
// Send OTP
);
// Verify OTP
);

);

//////////////////////////////////////////////////////////////////////////////////////////////////////////////
// // -------------------- Visitor OTP APIs --------------------
// // Send OTP for Visitor Entry
// app.post('/sendVisitorOTP', async (req, res) => {
//   console.log("Request Body:", req.body);
//   const { email } = req.body;
//   if (!email) return res.status(400).json({ message: 'Email is required' });
//   const otp = generateOTP();
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
//   try {
//     // Save or update OTP in visitor table
//     await db.query(
//       `INSERT INTO GMS_Visitor_OTP (email, otp, otp_expires)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (email)
//         DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
//       `,
//       [email, otp, otpExpires]
//     );
//     // Send email with OTP
//     await transporter.sendMail({
//       from: process.env.EMAIL,
//       to: email,
//       subject: 'Visitor Verification OTP',
//       text: `Your OTP is ${otp}. It will expire in 10 minutes.`,
//     });
//     res.status(200).json({ message: 'Visitor OTP sent successfully' });
//   } catch (err) {
//     console.error('Error in /sendVisitorOTP:', err);
//     res.status(500).json({ message: 'Error sending Visitor OTP' });
//   }
// });
// // Verify Visitor OTP
// app.post('/verifyVisitorOTP', async (req, res) => {
//   const { email, otp } = req.body;
//   if (!email || !otp) {
//     return res.status(400).json({ success: false, message: 'Email and OTP are required' });
//   }
//   try {
//     const result = await db.query(
//       'SELECT * FROM GMS_Visitor_OTP WHERE email = $1 AND otp = $2 AND otp_expires > NOW()',
//       [email, otp]
//     );
//     if (result.rows.length > 0) {
//       return res.status(200).json({ success: true, message: 'Visitor OTP verified successfully' });
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }
//   } catch (err) {
//     console.error('Error in /verifyVisitorOTP:', err);
//     res.status(500).json({ success: false, message: 'Visitor OTP verification failed' });
//   }
// });
// //////////////////////////////////////////////////////////////////////  visitors Email OTP //////////////
// //////////////////////////////////////////////////////////////////////  visitors SMS  OTP //////////////
// // Send OTP for Visitor Entry via SMS
// app.post('/sendVisitorSmsOTP', async (req, res) => {
//   console.log("Request Body:", req.body);
//   const { phone } = req.body;
//   if (!phone) {
//     return res.status(400).json({ message: 'Phone number is required' });
//   }
//   const otp = generateOTP();
//   const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes validity
//   try {
//     // Save or update OTP in a new visitor_sms_otp table
//     // Ensure you have a 'GMS_Visitor_Sms_OTP' table with columns: 'phone' (primary key), 'otp', 'otp_expires'.
//     await db.query(
//       `INSERT INTO GMS_Visitor_Sms_OTP (phone, otp, otp_expires)
//         VALUES ($1, $2, $3)
//         ON CONFLICT (phone)
//         DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
//       `,
//       [phone, otp, otpExpires]
//     );
//     // Send SMS with OTP using the placeholder function
//     const smsMessage = `Your OTP is ${otp}. It will expire in 10 minutes.`;
//     await sendSms(phone, smsMessage);
//     res.status(200).json({ message: 'Visitor SMS OTP sent successfully' });
//   } catch (err) {
//     console.error('Error in /sendVisitorSmsOTP:', err);
//     res.status(500).json({ message: 'Error sending Visitor SMS OTP' });
//   }
// });
// // Verify Visitor SMS OTP
// app.post('/verifyVisitorSmsOTP', async (req, res) => {
//   const { phone, otp } = req.body;
//   if (!phone || !otp) {
//     return res.status(400).json({ success: false, message: 'Phone number and OTP are required' });
//   }
//   try {
//     const result = await db.query(
//       'SELECT * FROM GMS_Visitor_Sms_OTP WHERE phone = $1 AND otp = $2 AND otp_expires > NOW()',
//       [phone, otp]
//     );
//     if (result.rows.length > 0) {
//       return res.status(200).json({ success: true, message: 'Visitor SMS OTP verified successfully' });
//     } else {
//       return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//     }
//   } catch (err) {
//     console.error('Error in /verifyVisitorSmsOTP:', err);
//     res.status(500).json({ success: false, message: 'Visitor SMS OTP verification failed' });
//   }
// });
// Function for sending emails using Nodemailer


const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: to,
    subject: subject,
    text: text,
  };
  try {
    await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${to}`);
    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};
// Placeholder function for sending SMS, since you only have Nodemailer
const sendSms = async (to, message) => {
  console.log(`SMS functionality not implemented. Attempted to send to ${to} with message: ${message}`);
  // You would implement a service like Twilio here if needed
  return true;
};
// Send OTP for Visitor Entry (unified for both email and SMS)
app.post('/sendOTP', async (req, res) => {
  console.log("Request Body:", req.body);
  const { contact_info, contact_type } = req.body;
  // Validate request body
  if (!contact_info || !contact_type) {
    return res.status(400).json({ message: 'Contact information and type are required' });
  }
  // Generate a new 6-digit OTP
  const otp = generateOTP();
  // Set OTP to expire in 10 minutes from now
  const otpExpires = new Date(Date.now() + 10 * 60 * 1000);
  try {
    // Save or update the OTP in the GMS_OTP table.
    // The ON CONFLICT clause handles cases where an OTP already exists for the contact,
    // updating it instead of creating a new row.
    await db.query(
      `INSERT INTO GMS_OTP (contact_info, contact_type, otp, otp_expires)
             VALUES ($1, $2, $3, $4)
             ON CONFLICT (contact_info, contact_type)
             DO UPDATE SET otp = EXCLUDED.otp, otp_expires = EXCLUDED.otp_expires;
            `,
      [contact_info, contact_type, otp, otpExpires]
    );
    // Conditionally send the OTP via email or SMS
    if (contact_type === 'email') {
      const subject = 'Visitor Verification OTP';
      const text = `Your OTP is ${otp}. It will expire in 10 minutes.`;
      await sendEmail(contact_info, subject, text);
    } else if (contact_type === 'phone') {
      const message = `Your OTP is ${otp}. It will expire in 10 minutes.`;
      await sendSms(contact_info, message);
    } else {
      return res.status(400).json({ message: 'Invalid contact type' });
    }
    res.status(200).json({ message: 'OTP sent successfully' });
  } catch (err) {
    // Log the full error object for detailed debugging
    console.error('Error in /sendOTP:', err);
    // Provide a generic, safe error message to the client
    res.status(500).json({ message: 'Error sending OTP' });
  }
});
// Verify Visitor OTP (unified for both email and SMS)
app.post('/verifyOTP', async (req, res) => {
  const { contact_info, contact_type, otp } = req.body;
  if (!contact_info || !contact_type || !otp) {
    return res.status(400).json({ success: false, message: 'Contact info, type, and OTP are required' });
  }
  try {
    const result = await db.query(
      `SELECT * FROM GMS_OTP
       WHERE contact_info = $1 AND contact_type = $2 AND otp = $3 AND otp_expires > NOW()`,
      [contact_info, contact_type, otp]
    );
    if (result.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'OTP verified successfully' });
    } else {
      return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
    }
  } catch (err) {
    console.error('Error in /verifyOTP:', err);
    res.status(500).json({ success: false, message: 'OTP verification failed' });
  }
});
// //////////////////////////////////////////////////////////////////////  visitors SMS OTP //////////////
//////////////////////////////////////////////////////////////////////  Show all visitors imges //////////////

);
///  Show all visitors list //////////////
app.get('/allvisitors', (req, res) => {
  console.log("/allvis visitors request received");
  db.query(`SELECT 
              ge.gms_gateentry_id AS id,
              ge.gms_visitorname AS visitor_name,
              ge.gms_visitorfrom AS visitor_from,
              ge.gms_tomeet AS to_meet_employeename,
              -- From employee table
              emp.gms_department AS emp_department,
              emp.gms_designation AS emp_designation,
              -- From admin user table
              adm.adm_users_deptid AS adm_department_id,
              adm.adm_users_jobid AS adm_role_id,
              ge.gms_visitpurpose AS purpose,
              ge.gms_expectedexit AS expected_exit_time,
              ge.gms_vehicleno AS vehicle_no,
              ge.gms_intime AS check_in,
              ge.gms_outtime AS check_out,
              ge.gms_status AS status,
              ge.gms_identificationtype AS id_type,
              ge.gms_identificationno AS id_number,
              ge.gms_mobileno AS phone_number,
              ge.gms_emailid AS email,
              ge.created_on,
              ge.created_by,
              ge.modified_on,
              ge.modified_by,
              ge.gms_visitorimage AS image_data,
              ge.gms_visitorimage_bytea AS image_blob
          FROM public.gms_gate_entries ge
          LEFT JOIN public.gms_emplayoee_tbl emp
                ON ge.gms_tomeet = CONCAT(emp.gms_first_name, ' ', emp.gms_last_name)
          LEFT JOIN public.adm_user_t adm
                ON ge.gms_tomeet = CONCAT(adm.adm_users_firstname, ' ', adm.adm_users_lastname)
          ORDER BY ge.created_on DESC;`, (err, results) => {
    if (err) {
      console.error("Database query error:", err);
      return res.status(500).send({
        success: false,
        error: "Database error",
        details: err.message
      });
    }
    if (results.rowCount > 0) {
      console.log(`Successfully retrieved ${results.rowCount} visitors`);
      res.json({
        success: true,
        message: "Visitors retrieved successfully",
        data: results.rows,
        count: results.rowCount
      });
    } else {
      console.log("No visitors found");
      res.json({
        success: true,
        message: "No visitor records found",
        data: [],
        count: 0
      });
    }
  });
});
// Delete visitor
app.delete('/deletevisitor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Visitor ID is required",
      });
    }
    const result = await db.query(
      `DELETE FROM gms_gate_entries WHERE gms_gateentry_id = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: "Visitor not found",
      });
    }
    res.json({
      success: true,
      message: "Visitor deleted successfully",
      data: result.rows[0],
    });
  } catch (err) {
    console.error("Error deleting visitor:", err);
    res.status(500).json({
      success: false,
      error: "Failed to delete visitor",
    });
  }
});
/////////////////////////////////////////////////////////////////////////////////////////////


app.get("/editvisitors/:id", (req, res) => {
  const id = req.params.id;
  console.log('id', id)
  db.query(
    `SELECT gms_gateentry_id, gms_visitorname, gms_visitorfrom, gms_tomeet, gms_visitpurpose, gms_vehicleno, gms_identificationtype, gms_identificationno, gms_mobileno, gms_emailid, gms_intime, gms_outtime, gms_status, created_on, created_by, modified_on, modified_by, gms_visitorimage, gms_visitorimage_bytea, entry_time, gms_tomeetemail
	FROM public.gms_gate_entries 
       WHERE gms_gateentry_id = $1`,
    [id],
    (error, results) => {
      if (error) {
        console.error("Error executing query", error);
        res.status(500).json({ error });
      } else {
        res.json(results.rows);
      }
    }
  );
});

app.get("/viewvisitors/:id", (req, res) => {
  const id = req.params.id;
  console.log('id', id)
  db.query(
    `SELECT gms_gateentry_id, gms_visitorname, gms_visitorfrom, gms_tomeet, gms_visitpurpose, gms_vehicleno, gms_identificationtype, gms_identificationno, gms_mobileno, gms_emailid, gms_intime, gms_outtime, gms_status, created_on, created_by, modified_on, modified_by, gms_visitorimage, gms_visitorimage_bytea, entry_time, gms_tomeetemail
	FROM public.gms_gate_entries 
       WHERE gms_gateentry_id = $1`,
    [id],
    (error, results) => {
      if (error) {
        console.error("Error executing query", error);
        res.status(500).json({ error });
      } else {
        res.json(results.rows);
      }
    }
  );
});


const moments = require('moment-timezone');

app.put('/updatevisitorstatus/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    // Get current IST time as ISO string
    const istTime = moments().tz('Asia/Kolkata').format('YYYY-MM-DDTHH:mm:ss');
    const updates = {
      status: status,
      ...(status === 'Checked Out' && {
        gms_outtime: istTime
      })
    };
    const result = await db.query(
      `UPDATE gms_gate_entries
       SET gms_status = $1,
           gms_outtime = $2,
           modified_on = NOW()
       WHERE gms_gateentry_id = $3
       RETURNING *`,
      [updates.status, updates.gms_outtime, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }
    res.json({
      success: true,
      message: 'Visitor status updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating visitor status:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update visitor status',
    });
  }
});



);
// Update visitor by ID
app.put('/updatevisitor/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      GMS_VisitorName,
      GMS_VisitorFrom,
      GMS_ToMeet,
      GMS_ToMeetEmail,
      GMS_VisitPurpose,
      GMS_VehicleNo,
      GMS_IdentificationType,
      GMS_IdentificationNo,
      GMS_MobileNo,
      GMS_EmailID
    } = req.body;
    const result = await db.query(
      `UPDATE gms_gate_entries
       SET 
           GMS_VisitorName = $1,
           GMS_VisitorFrom = $2,
           GMS_ToMeet = $3,
           GMS_ToMeetEmail = $4,
           GMS_VisitPurpose = $5,
           GMS_VehicleNo = $6,
           GMS_IdentificationType = $7,
           GMS_IdentificationNo = $8,
           GMS_MobileNo = $9,
           GMS_EmailID = $10
       WHERE GMS_GateEntry_ID = $11
       RETURNING *`,
      [
        GMS_VisitorName,
        GMS_VisitorFrom,
        GMS_ToMeet,
        GMS_ToMeetEmail,
        GMS_VisitPurpose,
        GMS_VehicleNo,
        GMS_IdentificationType,
        GMS_IdentificationNo,
        GMS_MobileNo,
        GMS_EmailID,
        id
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Visitor not found',
      });
    }
    res.json({
      success: true,
      message: 'Visitor updated successfully',
      data: result.rows[0],
    });
  } catch (err) {
    console.error('Error updating visitor:', err);
    res.status(500).json({
      success: false,
      error: 'Failed to update visitor',
    });
  }
});
//------------------------------------------ get employees list ------------------------------------------//

app.put('/updateviewvisitorstatus/:id', async (req, res) => {
  const { id } = req.params;
  const { gms_status } = req.body;
  try {
    const updateQuery = `
          UPDATE gms_gate_entries
          SET gms_status = $1
          WHERE gms_gateentry_id = $2 AND gms_status = 'Checked In'
          RETURNING *;
      `;
    const result = await db.query(updateQuery, [gms_status, id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Visitor not found' });
    }
    res.status(200).json({ message: 'Status updated successfully', visitor: result.rows[0] });
  } catch (error) {
    console.error('Error updating status:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
///////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/gettingemailsfromtwotable', async (req, res) => {
  try {
    const result = await db.query(`
  SELECT 
    id AS user_id,
    COALESCE(gms_first_name, '') || ' ' || COALESCE(gms_last_name, '') AS name,
    gms_email AS email,
    'Employee' AS user_type
  FROM gms_emplayoee_tbl
  WHERE gms_status = 'Active'
  UNION ALL
  SELECT 
    adm_users_id AS user_id,
    COALESCE(adm_users_firstname, '') || ' ' || COALESCE(adm_users_lastname, '') AS name,
    adm_users_email AS email,
    'Admin' AS user_type
  FROM adm_user_t
  WHERE adm_users_status = true
`);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

);

app.post("/department_add", (req, res) => {
  const { department_name, department_description, status } = req.body;
  const query = `
    INSERT INTO gms_department_t (department_name, department_description, status, created_on, created_by)
    VALUES ($1, $2, $3, CURRENT_TIMESTAMP, 'System')
    RETURNING department_id
  `;
  db.query(query, [department_name, department_description, status], (err, result) => {
    if (err) {
      console.error("Insert error:", err);
      return res.status(500).json({ success: false, message: "Failed to add department" });
    }
    res.status(200).json({ success: true, message: "Department added", department_id: result.rows[0].department_id });
  });
});


app.get('/department_getalldata', (req, res) => {
  const query = `
    SELECT 
      department_id, 
      department_name, 
      department_description, 
      status 
    FROM gms_department_t 
    ORDER BY department_id DESC
  `;
  db.query(query, (err, result) => {
    if (err) {
      console.error("Error fetching department data:", err);
      return res.status(500).json({ success: false, message: "Database query failed" });
    }
    res.status(200).json({ success: true, data: result.rows });
  });
});
// Route to fetch department by ID
app.get("/department_getbyid/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM gms_department_t WHERE department_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    res.status(200).json({ success: true, data: result.rows });
  } catch (error) {
    console.error("Error fetching department:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
// Route to update department details
app.put("/department_update/:id", async (req, res) => {
  const { id } = req.params;
  const { department_name, department_description, status } = req.body;
  // Assuming the `modified_by` is the user who is making the update
  const modifiedBy = "admin"; // You can get this from the logged-in user's session or JWT
  try {
    const result = await db.query(
      `UPDATE gms_department_t
       SET department_name = $1,
           department_description = $2,
           status = $3,
           modified_on = CURRENT_TIMESTAMP,
           modified_by = $4
       WHERE department_id = $5
       RETURNING *`,
      [department_name, department_description, status, modifiedBy, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    res.status(200).json({ success: true, message: "Department updated successfully.", data: result.rows[0] });
  } catch (error) {
    console.error("Error updating department:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
// Route to delete department by ID
app.delete("/department_delete/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Ensure the department exists before attempting to delete
    const result = await db.query(
      `SELECT * FROM gms_department_t WHERE department_id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Department not found." });
    }
    // Proceed to delete the department
    await db.query(
      `DELETE FROM gms_department_t WHERE department_id = $1`,
      [id]
    );
    res.status(200).json({ success: true, message: "Department deleted successfully." });
  } catch (error) {
    console.error("Error deleting department:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
//------------------------------------------ get employees list ------------------------------------------//
//------------------------------------------ Designation ------------------------------------------//
// Get all designations
app.get('/GMS_getall_designations', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM gms_designations ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching designations:', err);
    res.status(500).json({ message: 'Failed to fetch designations' });
  }
});
// Create new designation
app.post('/GMS_createnew_designations', async (req, res) => {
  const { designations_name, designations_status } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO gms_designations (designations_name, designations_status) VALUES ($1, $2) RETURNING *',
      [designations_name.trim(), designations_status]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating designation:', err);
    if (err.code === '23505') {
      return res.status(400).json({ message: 'Designation name must be unique' });
    }
    res.status(500).json({ message: 'Failed to create designation' });
  }
});
// Get designation by ID
app.get('/GMS_getbyid_designations/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query('SELECT * FROM gms_designations WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching designation:', err);
    res.status(500).json({ message: 'Failed to fetch designation' });
  }
});
// Update designation
app.put('/GMS_update_designations/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const { designations_name, designations_status } = req.body;
    // Validate incoming fields
    if (!designations_name || !designations_name.trim()) {
      return res.status(400).json({ message: 'Designation name is required' });
    }
    // Optional: Validate status value
    const validStatus = ['Active', 'Inactive'];
    if (!validStatus.includes(designations_status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const result = await db.query(
      `UPDATE gms_designations
       SET designations_name = $1,
           designations_status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [designations_name.trim(), designations_status, id]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.status(200).json({ message: 'Designation updated successfully' });
  } catch (error) {
    console.error('Error updating designation:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});
// Delete designation
app.delete('/GMS_delete_designations/:id', async (req, res) => {
  const { id } = req.params;
  console.log('Designations was Deleted', id)
  try {
    const result = await db.query('DELETE FROM gms_designations WHERE id = $1 RETURNING *', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Designation not found' });
    }
    res.json({ message: 'Designation deleted successfully' });
  } catch (err) {
    console.error('Error deleting designation:', err.message);
    res.status(500).json({ message: 'Failed to delete designation' });
  }
});
//------------------------------------------ Designation ------------------------------------------//
///////////////////////////////////////////////////////// Emplayoees /////////////////////////////////////////////////////////

app.get('/get_all_employees', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT
        id,
        CONCAT(GMS_first_name, ' ', GMS_last_name) AS name,
        GMS_email AS email,
        GMS_phone AS phone,
        gms_joining_date,
        gms_status
      FROM GMS_emplayoee_tbl
      ORDER BY id DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error('Fetch error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/add_employees', upload.single('image'), async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone,
    joining_date,
    gender,
    department,
    designation,
    status,
    password,
    confirm_password,
    about
  } = req.body;
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  if (!email || !first_name || !last_name || !phone || !password || !confirm_password) {
    return res.status(400).json({ error: 'Required fields missing' });
  }
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }
  try {
    const result = await db.query(`
      INSERT INTO GMS_emplayoee_tbl (
        GMS_first_name,
        GMS_last_name,
        GMS_email,
        GMS_phone,
        GMS_joining_date,
        GMS_gender,
        GMS_department,
        GMS_designation,
        GMS_status,
        GMS_password,
        GMS_confirm_password,
        GMS_about,
        GMS_image
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *
    `, [
      first_name || null,
      last_name || null,
      email || null,
      phone || null,
      joining_date || null,
      gender || null,
      department || null,
      designation || null,
      status || 'Active',
      password || null,
      confirm_password || null,
      about || null,
      imagePath || null
    ]);
    res.status(201).json({
      message: 'Employee added successfully',
      employee: result.rows[0],
    });
  } catch (err) {
    console.error('Insert error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

app.get('/get_byid_employeesview/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid employee ID' });
  }
  try {
    const query = `
      SELECT 
        e.id AS employee_id,
        e.GMS_first_name || ' ' || e.GMS_last_name AS full_name,
        e.GMS_email,
        e.GMS_phone,
        e.GMS_joining_date,
        e.GMS_gender,
        e.GMS_department,
        e.GMS_designation,
        e.GMS_status,
        e.GMS_about,
        e.GMS_image,
        v.gms_gateentry_id AS visitor_id,
        v.gms_visitorname AS visitor_name,
        v.gms_emailid AS visitor_email,
        v.gms_intime AS entry_time,
        v.gms_status AS visitor_status,
        v.gms_tomeet AS to_meet,
        v.gms_tomeetemail AS to_meet_email,
        v.gms_visitorimage AS image,
        v.gms_visitpurpose AS purpose,
        v.gms_mobileno AS phone,
        v.gms_identificationno AS id_number,
        v.gms_identificationtype AS id_type,
        v.gms_vehicleno AS vehicle
      FROM GMS_emplayoee_tbl e
      LEFT JOIN gms_gate_entries v
        ON v.gms_tomeetemail = e.GMS_email
      WHERE e.id = $1
      ORDER BY v.gms_intime DESC
      LIMIT 100
    `;
    const result = await db.query(query, [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found or no visitors' });
    }
    const employeeRow = result.rows[0];
    const employee = {
      id: employeeRow.employee_id,
      name: employeeRow.full_name,
      email: employeeRow.gms_email,
      phone: employeeRow.gms_phone,
      department: employeeRow.gms_department,
      designation: employeeRow.gms_designation,
      image: employeeRow.gms_image,
      joining_date: employeeRow.gms_joining_date,
      status: employeeRow.gms_status,
      about: employeeRow.gms_about,
      gender: employeeRow.gms_gender
    };
    const visitors = result.rows
      .filter(row => row.visitor_id !== null)  // Skip if no visitor match
      .map(row => ({
        id: row.visitor_id,
        visitor_name: row.visitor_name,
        email: row.visitor_email,
        entry_time: new Date(row.entry_time).toLocaleString(),
        status: row.visitor_status,
        to_meet: row.to_meet,
        to_meet_email: row.to_meet_email,
        image: row.image,
        purpose: row.purpose,
        phone: row.phone,
        id_number: row.id_number,
        id_type: row.id_type,
        vehicle: row.vehicle
      }));
    res.json({ employee, visitors, count: visitors.length });
  } catch (err) {
    console.error('Database error:', err);
    res.status(500).json({
      error: 'Internal server error',
      details: err.message
    });
  }
});

app.get("/get_employee_by_id/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM GMS_emplayoee_tbl WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    res.status(200).json({ success: true, data: result.rows[0] }); // return single employee
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});


app.put('/update_employee/:id', upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const {
    first_name,
    last_name,
    email,
    phone,
    joining_date,
    gender,
    department,
    designation,
    status,
    about
  } = req.body;
  if (!id || isNaN(parseInt(id))) {
    return res.status(400).json({ error: 'Invalid or missing employee ID' });
  }
  const imagePath = req.file ? `/uploads/${req.file.filename}` : null;
  try {
    const existing = await db.query(`SELECT * FROM GMS_emplayoee_tbl WHERE id = $1`, [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }
    let updateQuery = `
      UPDATE GMS_emplayoee_tbl SET
        GMS_first_name = $1,
        GMS_last_name = $2,
        GMS_email = $3,
        GMS_phone = $4,
        GMS_joining_date = $5,
        GMS_gender = $6,
        GMS_department = $7,
        GMS_designation = $8,
        GMS_status = $9,
        GMS_about = $10
    `;
    const values = [
      first_name || null,
      last_name || null,
      email || null,
      phone || null,
      joining_date || null,
      gender || null,
      department || null,
      designation || null,
      status || 'Active',
      about || null
    ];
    if (imagePath) {
      updateQuery += `, GMS_image = $11`;
      values.push(imagePath);
    }
    updateQuery += ` WHERE id = $${values.length + 1} RETURNING *`;
    values.push(id);
    const result = await db.query(updateQuery, values);
    res.json({ message: 'Employee updated successfully', employee: result.rows[0] });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  }
});
///////////////////////////////////////////////////////// Emplayoees /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// Attendance Admin /////////////////////////////////////////////////////////
// ✅ GET /CountofTotalEMP
app.get('/CountofTotalEMP', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT COUNT(*) AS total_users
       FROM (
         SELECT id AS user_id FROM public.gms_emplayoee_tbl
         UNION ALL
         SELECT adm_users_id AS user_id FROM public.adm_user_t
       ) AS combined_users;`
    );
    res.status(200).json({ total_employees: parseInt(result.rows[0].total_users, 10) });
  } catch (err) {
    console.error('Error fetching employee count:', err);
    res.status(500).json({ error: 'Failed to fetch total employee count' });
  }
});



app.get("/AttendanceEditEMP/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM gms_attendance_temp WHERE gms_userid = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: "Employee not found." });
    }
    res.status(200).json({ success: true, data: result.rows[0] });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, message: "Internal Server Error." });
  }
});
// Helper function to convert duration object to PostgreSQL interval string
const durationObjToInterval = (durationObj) => {
  if (!durationObj || (durationObj.hours === 0 && durationObj.minutes === 0 && durationObj.seconds === 0)) {
    return '00:00:00';
  }
  const hours = durationObj.hours || 0;
  const minutes = durationObj.minutes || 0;
  const seconds = durationObj.seconds || 0;
  // Format as HH:MM:SS for PostgreSQL interval
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};
// Helper function to validate time format
const isValidTimeFormat = (timeStr) => {
  if (!timeStr) return true; // Allow null/empty
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/;
  return timeRegex.test(timeStr);
};

app.put('/AttendanceEditUpdateEMP/:id', async (req, res) => {
  const {
    employee_id,
    name,
    status,
    check_in,
    check_out,
    break_time,
    late_by
  } = req.body;
  console.log('Received PUT request to update attendance:', {
    employee_id,
    name,
    status,
    check_in,
    check_out,
    break_time,
    late_by
  });
  try {
    // Validate required fields
    if (!employee_id || !name || !status || !check_in) {
      return res.status(400).json({
        error: 'Missing required fields: employee_id, name, status, and check_in are required'
      });
    }
    if (!isValidTimeFormat(check_in)) {
      return res.status(400).json({ error: 'Invalid check_in time format. Use HH:MM:SS' });
    }
    if (check_out && !isValidTimeFormat(check_out)) {
      return res.status(400).json({ error: 'Invalid check_out time format. Use HH:MM:SS' });
    }
    let breakDuration = null;
    let lateDuration = null;
    if (break_time) {
      if (typeof break_time === 'object') {
        breakDuration = durationObjToInterval(break_time);
        console.log('Converted break_time object to interval:', breakDuration);
      } else if (typeof break_time === 'string' && isValidTimeFormat(break_time)) {
        breakDuration = break_time;
      } else {
        return res.status(400).json({ error: 'Invalid break_time format' });
      }
    }
    if (late_by) {
      if (typeof late_by === 'object') {
        lateDuration = durationObjToInterval(late_by);
        console.log('Converted late_by object to interval:', lateDuration);
      } else if (typeof late_by === 'string' && isValidTimeFormat(late_by)) {
        lateDuration = late_by;
      } else {
        return res.status(400).json({ error: 'Invalid late_by format' });
      }
    }
    // Perform the update using name + userid
    const result = await db.query(
      `UPDATE public.gms_attendance_temp 
       SET 
         gms_userid = $1,
         gms_name = $2,
         gms_status = $3,
         gms_checkin = $4,
         gms_checkout = $5,
         gms_breakduration = $6::interval,
         gms_lateduration = $7::interval,
         gms_updatedat = CURRENT_TIMESTAMP
       WHERE gms_userid = $1 AND gms_name = $2
       RETURNING *`,
      [
        employee_id,     // $1
        name,            // $2
        status,          // $3
        check_in,        // $4
        check_out || null, // $5
        breakDuration,   // $6
        lateDuration     // $7
      ]
    );
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Attendance record not found (update)' });
    }
    console.log(`Attendance record for ${name} (user ID ${employee_id}) updated successfully`);
    res.status(200).json({
      message: 'Attendance updated successfully',
      updated_id: result.rows[0].gms_id,
      updated_record: result.rows[0]
    });
  } catch (error) {
    console.error('Error updating attendance:', error);
    if (error.code === '22007') {
      return res.status(400).json({ error: 'Invalid time/interval format' });
    } else if (error.code === '23505') {
      return res.status(400).json({ error: 'Duplicate entry exists' });
    } else if (error.code === '23503') {
      return res.status(400).json({ error: 'Foreign key constraint violation' });
    }
    res.status(500).json({ error: 'Internal Server Error' });
  }
});



);
// Attendance summary endpoint
app.get('/AttendanceStatusEMP', async (req, res) => {
  try {
    const result = await db.query(
      `WITH all_users AS (
  SELECT id AS user_id FROM public.gms_emplayoee_tbl
  UNION ALL
  SELECT adm_users_id AS user_id FROM public.adm_user_t
),
attendance_today AS (
  SELECT gms_userid, LOWER(gms_status) AS gms_status
  FROM public.gms_attendance_temp
  WHERE DATE(gms_createdat) = CURRENT_DATE
)
-- Final summary
SELECT 'Present' AS status, COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'present'

UNION ALL

SELECT 'Absent', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status IS NULL

UNION ALL

SELECT 'Late Login', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'late login'

UNION ALL

SELECT 'Permission', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'permission'

UNION ALL

SELECT 'WFH', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'wfh'

UNION ALL

SELECT 'LOP', COUNT(*) AS count
FROM all_users u
LEFT JOIN attendance_today a ON u.user_id = a.gms_userid
WHERE a.gms_status = 'lop';
`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
// Main attendance
app.get('/AttendanceDeltailsEMP', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT 
          COALESCE(e.id, u.adm_users_id) AS id,
          a.gms_name AS name,
          a.gms_status AS status,
          a.gms_checkin AS checkIn,
          a.gms_checkout AS checkOut,
          a.gms_breakduration AS break,
          a.gms_lateduration AS late,
          u.adm_users_profileimage AS images,
          a.gms_createdat::date AS createdDate,
          a.gms_productionhours AS productionHours
      FROM 
          public.gms_attendance_temp a
      LEFT JOIN 
          public.gms_emplayoee_tbl e ON a.gms_userid = e.id
      LEFT JOIN 
          public.adm_user_t u ON a.gms_userid = u.adm_users_id
      WHERE 
          a.gms_createdat::date = CURRENT_DATE
      ORDER BY 
          a.gms_createdat ASC;`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
////////////////////////////////////////////////////////////////////////////////////////////////////////

app.get('/AttendanceFullDetails/:userid', async (req, res) => {
  const userid = decodeURIComponent(req.params.userid);
  try {
    const result = await db.query(`
      WITH user_attendance AS (
        SELECT 
          a.gms_userid,
          a.gms_name,
          a.gms_createdat::date AS date,
          a.gms_productionhours,
          a.gms_breakduration,
          a.gms_lateduration,
          a.gms_remarks,
          EXTRACT(EPOCH FROM a.gms_productionhours) AS total_seconds,
          EXTRACT(EPOCH FROM a.gms_breakduration) AS break_seconds,
          EXTRACT(EPOCH FROM a.gms_lateduration) AS late_seconds,
          u.adm_users_profileimage AS profile_image,
          u.adm_users_jobid AS job_id,
          u.adm_users_email AS email
        FROM public.gms_attendance_temp a
        LEFT JOIN public.adm_user_t u ON a.gms_userid = u.adm_users_id
        WHERE a.gms_userid = $1
      ),
      daily_summary AS (
        SELECT 
          date,
          total_seconds,
          break_seconds,
          late_seconds,
          CASE 
            WHEN total_seconds > 32400 THEN total_seconds - 32400
            ELSE 0
          END AS overtime_seconds
        FROM user_attendance
      ),
      today_record AS (
        SELECT * FROM user_attendance WHERE date = CURRENT_DATE LIMIT 1
      )
      SELECT 
        t.gms_name AS username,
        t.gms_userid AS user_id,
        t.profile_image,
        t.job_id,
        t.email,
        t.gms_productionhours AS production_hours_today,
        -- Aggregated durations
        ROUND(SUM(CASE WHEN ua.date = CURRENT_DATE THEN ua.total_seconds ELSE 0 END) / 3600, 2) AS total_hours_today,
        ROUND(SUM(CASE WHEN ua.date >= date_trunc('week', CURRENT_DATE) THEN ua.total_seconds ELSE 0 END) / 3600, 2) AS total_hours_week,
        ROUND(SUM(CASE WHEN date_trunc('month', ua.date) = date_trunc('month', CURRENT_DATE) THEN ua.total_seconds ELSE 0 END) / 3600, 2) AS total_hours_month,
        ROUND(SUM(CASE WHEN date_trunc('month', ua.date) = date_trunc('month', CURRENT_DATE) THEN d.overtime_seconds ELSE 0 END) / 3600, 2) AS overtime_month,
        -- Today's breakdown
        ROUND((t.total_seconds - COALESCE(t.break_seconds, 0) - COALESCE(t.late_seconds, 0)) / 3600.0, 2) AS working_hours,
        ROUND((t.total_seconds - COALESCE(t.break_seconds, 0)) / 3600.0, 2) AS productive_hours,
        ROUND(t.break_seconds / 3600.0, 2) AS break_hours,
        ROUND(t.late_seconds / 3600.0, 2) AS late_hours,
        ROUND(CASE 
                WHEN t.total_seconds > 32400 THEN (t.total_seconds - 32400) / 3600.0
                ELSE 0
              END, 2) AS overtime_hours
      FROM user_attendance ua
      LEFT JOIN daily_summary d ON ua.date = d.date
      LEFT JOIN today_record t ON TRUE
      GROUP BY 
        t.gms_name, t.gms_userid, t.profile_image, t.job_id, t.email,
        t.gms_productionhours, t.break_seconds, t.late_seconds, t.total_seconds;
    `, [userid]);
    const row = result.rows[0];
    if (!row) {
      return res.status(404).json({ error: 'No attendance record found for user.' });
    }
    res.status(200).json({
      username: row.username,
      userId: row.user_id,
      profileImage: row.profile_image,
      jobId: row.job_id,
      email: row.email,
      productionhours: row.production_hours_today,
      total_hours_today: row.total_hours_today,
      total_hours_week: row.total_hours_week,
      total_hours_month: row.total_hours_month,
      overtime_month: row.overtime_month,
      working_hours: row.working_hours,
      productive_hours: row.productive_hours,
      break_hours: row.break_hours,
      late_hours: row.late_hours,
      overtime_hours: row.overtime_hours
    });
  } catch (error) {
    console.error('Error fetching full attendance details:', error);
    res.status(500).json({ error: 'Failed to fetch attendance full details' });
  }
});
// WITH user_attendance AS (
//   SELECT 
//     a.gms_userid,
//     a.gms_name,
//     a.gms_createdat::date AS date,
//     a.gms_productionhours,
//     a.gms_breakduration,
//     a.gms_lateduration,
//     a.gms_remarks,
//     EXTRACT(EPOCH FROM a.gms_productionhours) AS total_seconds,
//     EXTRACT(EPOCH FROM a.gms_breakduration) AS break_seconds,
//     EXTRACT(EPOCH FROM a.gms_lateduration) AS late_seconds,
//     u.adm_users_profileimage AS profile_image,
//     u.adm_users_jobid AS job_id,
//     u.adm_users_email AS email
//   FROM public.gms_attendance_temp a
//   LEFT JOIN public.adm_user_t u ON a.gms_userid = u.adm_users_id
//   WHERE a.gms_userid = 46
// ),
// daily_overtime AS (
//   SELECT 
//     date,
//     CASE 
//       WHEN total_seconds > 32400 THEN total_seconds - 32400
//       ELSE 0
//     END AS overtime_seconds
//   FROM user_attendance
// ),
// monthly_overtime AS (
//   SELECT 
//     SUM(CASE 
//         WHEN total_seconds > 32400 THEN total_seconds - 32400
//         ELSE 0 
//     END) AS month_overtime_seconds
//   FROM user_attendance
//   WHERE date_trunc('month', date) = date_trunc('month', CURRENT_DATE)
// ),
// today_record AS (
//   SELECT * FROM user_attendance WHERE date = CURRENT_DATE LIMIT 1
// )
// SELECT 
//   t.gms_name AS username,
//   t.gms_userid AS user_id,
//   t.profile_image,
//   t.job_id,
//   t.email,
//   -- Raw durations (interval)
//   TO_CHAR(t.gms_productionhours, 'HH24:MI:SS') AS production_hours_today,
//   TO_CHAR(t.gms_breakduration, 'HH24:MI:SS') AS break_duration,
//   TO_CHAR(t.gms_lateduration, 'HH24:MI:SS') AS late_duration,
//   -- Computed values formatted as HH:MI:SS
//   TO_CHAR(make_interval(secs => ROUND(t.late_seconds)), 'HH24:MI:SS') AS late_hours,
//   TO_CHAR(make_interval(secs => ROUND(t.total_seconds - COALESCE(t.break_seconds, 0) - COALESCE(t.late_seconds, 0))), 'HH24:MI:SS') AS working_hours,
//   TO_CHAR(make_interval(secs => ROUND(t.total_seconds - COALESCE(t.break_seconds, 0))), 'HH24:MI:SS') AS productive_hours,
//   TO_CHAR(make_interval(secs => ROUND(COALESCE(t.break_seconds, 0))), 'HH24:MI:SS') AS break_hours,
//   TO_CHAR(make_interval(secs => ROUND(CASE WHEN t.total_seconds > 32400 THEN (t.total_seconds - 32400) ELSE 0 END)), 'HH24:MI:SS') AS overtime_today,
//   -- Total durations for today, week, and month
//   TO_CHAR(make_interval(secs => ROUND(SUM(CASE WHEN ua.date = CURRENT_DATE THEN ua.total_seconds ELSE 0 END))), 'HH24:MI:SS') AS total_hours_today,
//   TO_CHAR(make_interval(secs => ROUND(SUM(CASE WHEN ua.date >= date_trunc('week', CURRENT_DATE) AND ua.date <= CURRENT_DATE THEN ua.total_seconds ELSE 0 END))), 'HH24:MI:SS') AS total_hours_week,
//   TO_CHAR(make_interval(secs => ROUND(SUM(CASE WHEN date_trunc('month', ua.date) = date_trunc('month', CURRENT_DATE) THEN ua.total_seconds ELSE 0 END))), 'HH24:MI:SS') AS total_hours_month,
//   -- Monthly overtime in HH:MI:SS
//   TO_CHAR(make_interval(secs => ROUND(COALESCE(m.month_overtime_seconds, 0))), 'HH24:MI:SS') AS overtime_this_month
// FROM user_attendance ua
// LEFT JOIN today_record t ON TRUE
// LEFT JOIN monthly_overtime m ON TRUE
// GROUP BY 
//   t.gms_name, t.gms_userid, t.profile_image, t.job_id, t.email,
//   t.gms_productionhours, t.gms_breakduration, t.gms_lateduration,
//   t.total_seconds, t.break_seconds, t.late_seconds, m.month_overtime_seconds;
////////////////////////////////////////////////////////////////////////////////////////////////////////


app.get('/AttendanceDeltailsEMPTable/:userId', async (req, res) => {
  const userId = req.params.userId;
  try {
    const query = `
      SELECT 
          gms_name AS "Name",
          TO_CHAR(gms_createdat, 'YYYY-MM-DD') AS "createdDate",
          TO_CHAR(gms_checkin, 'HH24:MI:SS') AS "checkIn",
          gms_status AS status,
          TO_CHAR(gms_checkout, 'HH24:MI:SS') AS "checkOut",
          TO_CHAR(gms_breakduration, 'HH24:MI:SS') AS "break",
          TO_CHAR(gms_lateduration, 'HH24:MI:SS') AS "late",
          -- Overtime = productionHours - 8 hours (if > 0)
          CASE 
              WHEN gms_productionhours > INTERVAL '8 hours' 
              THEN TO_CHAR(gms_productionhours - INTERVAL '8 hours', 'HH24:MI:SS')
              ELSE '00:00:00'
          END AS "overtime",
          TO_CHAR(gms_productionhours, 'HH24:MI:SS') AS "productionHours"
      FROM 
          public.gms_attendance_temp
      WHERE 
          gms_userid = $1
      ORDER BY 
          gms_createdat DESC;
    `;
    const result = await db.query(query, [userId]);
    res.status(200).json({
      success: true,
      records: result.rows
    });
  } catch (err) {
    console.error('Error fetching attendance records:', err);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance records'
    });
  }
});
// Delete attendance record endpoint
app.delete('/AttendanceDeleteEMP/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(
      `DELETE FROM public.gms_attendance_temp WHERE gms_userid = $1`,
      [id]
    );
    res.status(200).json({ message: 'Attendance record deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error', details: err.message });
  }
});
///////////////////////////////////////////////////////// Attendance Admin /////////////////////////////////////////////////////////
///////////////////////////////////////////////////////// Attendance Emplayoees /////////////////////////////////////////////////////////
// Get employee profile data
);
// Get timeline data. Full working version of /api/attendance/timeline endpoint with debug logs and fixes
