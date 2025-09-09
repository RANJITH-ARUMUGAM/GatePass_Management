// ================== PUNCH IN ENDPOINT ==================

app.post('/AttendancePunchIn', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    // Get current IST time
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    const nowTime = istTime.toTimeString().substr(0, 8);
    const nowISO = now.toISOString();

    console.log('Punch In - Current time:', { today, nowTime, nowISO });

    // Get user details
    const userRes = await db.query(
      'SELECT adm_users_firstname, adm_users_lastname FROM ADM_User_T WHERE adm_users_id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userName = `${userRes.rows[0].adm_users_firstname} ${userRes.rows[0].adm_users_lastname}`;

    // Check if attendance record exists for today
    const existing = await db.query(
      `SELECT * FROM gms_attendance_temp 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2`,
      [userId, today]
    );

    if (existing.rows.length === 0) {
      // First punch-in today
      await db.query(
        `INSERT INTO gms_attendance_temp (
          gms_userid, gms_name, gms_status, gms_checkin, gms_checkout,
          gms_breakduration, gms_lateduration, gms_productionhours,
          gms_createdat, gms_updatedat
        ) VALUES ($1, $2, 'Present', $3, '00:00:00', '00:00:00', '00:00:00', '00:00:00', $4, $4)`,
        [userId, userName, nowTime, nowISO]
      );

      return res.status(201).json({
        message: 'First punch-in recorded successfully.',
        checkInTime: nowTime
      });
    } else {
      // Update existing record (punch-in after break)
      const record = existing.rows[0];

      await db.query(
        `UPDATE gms_attendance_temp
         SET gms_checkout = $1, gms_updatedat = $2
         WHERE gms_id = $3`,
        [nowTime, nowISO, record.gms_id]
      );

      return res.status(200).json({
        message: 'Punch-in recorded. Session continued.',
        checkInTime: record.gms_checkin,
        currentTime: nowTime
      });
    }
  } catch (err) {
    console.error('Punch In error:', err);
    res.status(500).json({ message: 'Punch In failed', error: err.message });
  }
});

// ================== PUNCH OUT ENDPOINT ==================

app.post('/AttendancePunchOut', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    // Get current IST time
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    const nowTime = istTime.toTimeString().substr(0, 8);
    const nowISO = now.toISOString();

    console.log('Punch Out - Current time:', { today, nowTime, nowISO });

    // Get user details
    const userRes = await db.query(
      'SELECT adm_users_firstname, adm_users_lastname FROM ADM_User_T WHERE adm_users_id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userName = `${userRes.rows[0].adm_users_firstname} ${userRes.rows[0].adm_users_lastname}`;

    // Get today's attendance record
    const result = await db.query(
      `SELECT * FROM gms_attendance_temp 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2`,
      [userId, today]
    );

    if (result.rows.length === 0) {
      // No punch-in record exists
      await db.query(
        `INSERT INTO gms_attendance_temp (
          gms_userid, gms_name, gms_status, gms_checkin, gms_checkout,
          gms_breakduration, gms_lateduration, gms_productionhours,
          gms_createdat, gms_updatedat, gms_remarks
        ) VALUES ($1, $2, 'Absent', NULL, NULL, '00:00:00', '00:00:00', '00:00:00', $3, $3, 'No punch-in recorded')`,
        [userId, userName, nowISO]
      );

      return res.status(400).json({
        message: 'No punch-in recorded for today. Marked as absent.'
      });
    }

    const attendance = result.rows[0];

    // Calculate production time
    if (attendance.gms_checkin) {
      const checkInTime = new Date(`${today}T${attendance.gms_checkin}`);
      const checkOutTime = new Date(`${today}T${nowTime}`);
      const productionMs = Math.max(checkOutTime - checkInTime, 0);
      const productionTime = msToInterval(productionMs);

      // Update record with punch-out
      await db.query(
        `UPDATE gms_attendance_temp
         SET gms_checkout = $1, gms_productionhours = $2, gms_updatedat = $3
         WHERE gms_id = $4`,
        [nowTime, productionTime, nowISO, attendance.gms_id]
      );

      return res.status(200).json({
        message: 'Punch out recorded successfully',
        data: {
          checkInTime: attendance.gms_checkin,
          checkOutTime: nowTime,
          productionHours: productionTime
        }
      });
    } else {
      return res.status(400).json({ message: 'Invalid attendance record' });
    }

  } catch (err) {
    console.error('Punch Out error:', err);
    res.status(500).json({ message: 'Error recording punch out', error: err.message });
  }
});

// ================== ATTENDANCE STATUS ENDPOINT ==================

app.get('/AttendanceStatus/:userId', async (req, res) => {
  const userId = parseInt(req.params.userId);

  if (isNaN(userId)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    // Get current IST date
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];

    console.log('Checking attendance status for:', { userId, today });

    const result = await db.query(
      `SELECT gms_checkin, gms_checkout, gms_status, gms_productionhours
       FROM gms_attendance_temp
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2
       ORDER BY gms_createdat DESC
       LIMIT 1`,
      [userId, today]
    );

    if (result.rows.length === 0) {
      return res.json({
        isPunchedIn: false,
        isPunchedOut: false,
        status: 'not_started'
      });
    }

    const record = result.rows[0];
    console.log('Attendance record found:', record);

    const isPunchedIn = !!record.gms_checkin;

    // Logic: User is "working" if checkin exists and checkin equals checkout
    // User is "finished" if checkin exists and checkin does not equal checkout
    const isStillWorking = isPunchedIn && (record.gms_checkin === record.gms_checkout);
    const isPunchedOut = isPunchedIn && (record.gms_checkin !== record.gms_checkout);

    let status = 'not_started';
    if (record.gms_status === 'Absent') {
      status = 'absent';
    } else if (isStillWorking) {
      status = 'working';
    } else if (isPunchedOut) {
      status = 'finished';
    }

    const response = {
      isPunchedIn: isStillWorking, // Only true if currently working
      isPunchedOut,
      status,
      checkInTime: record.gms_checkin,
      checkOutTime: record.gms_checkout,
      productionHours: record.gms_productionhours
    };

    console.log('Status response:', response);
    res.json(response);

  } catch (err) {
    console.error("Error fetching punch status:", err);
    res.status(500).json({ message: "Error fetching punch status", error: err.message });
  }
});


/////////////////////////////////

LogIn Time: 9:30AM
LogOut Time: 6:30PM
Break : 1.00 HR
Late: 15min 9:30AM to 9:45AM 

Logics:
* Temp Table:
1. Initialy login into the dashbord then make a as entry for IN-Time.  
Note for example: gms_status = "Present", gms_checkin = "09:30:00", gms_checkout = "Null", gms_breakduration = "00:00:00", gms_lateduration = "00:00:00", gms_productionhours = "00:00:00", gms_createdat = "09:30:00", gms_updatedat = "00:00:00"

2. Then want to take a break need to check Now caclualate the log table check in and check out is not null for gms_checkin_log, gms_checkout_log. so just make a calculation between for gms_checkout = "10:00:00", gms_productionhours = "00:30:00" 

3. Now login after break (gms_checkin_log = 10:16:00 AM) take calculation from log table for Temp Table (gms_breakduration = "00:15:00", gms_productionhours = "00:30:00"): 

4. the process continued as based on curent entrys. 

Note:
1. befor 9:30:00 if login sucessfully the make a present.
2. after 9:30:00 AM to 9:45:00 AM if login sucessfully the make a Late Login.
3. after 9:45:00 if login sucessfully the make a LOP.
4. NO login means the make a Absent.
5. If miss the Check out after 6:30 PM then make a LOP

////////////////////////////////////

2.Log Table:
1. Initialy login into the dashbord then make a as entry for IN-Time.  
Note for example: gms_id, gms_userid, gms_checkin_log = "09:30:00", gms_checkout_log = "Null", gms_createdat = "09:30:00", gms_updatedat = "00:00:00"

2. update the entry and check  gms_checkin_log = "09:30:00", gms_checkout_log = "Null" then make a entry.
Note for example: gms_id, gms_userid, gms_checkin_log = "09:30:00", gms_checkout_log = "10:00:00", gms_createdat = "09:30:00", gms_updatedat = "10:00:00"

3. Then after login checkin gms_checkin_log = '09:30:00'and gms_checkout_log = 10:00:00 is not null then nake new entry for example gms_id=1 then make a gms_id=2 
////////////////////////////////////

////////////////////////////////////

app.post('/AttendancePunchIn', async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: 'Missing userId' });
  }

  try {
    const now = new Date();
    const istTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
    const today = istTime.toISOString().split('T')[0];
    const nowTime = istTime.toTimeString().substr(0, 8);
    const nowISO = istTime.toISOString();

    const scheduledStart = new Date(`${today}T09:30:00`);
    const lateLimit = new Date(`${today}T09:45:00`);
    const currentTime = new Date(`${today}T${nowTime}`);

    const userRes = await db.query(
      'SELECT adm_users_firstname, adm_users_lastname FROM ADM_User_T WHERE adm_users_id = $1',
      [userId]
    );

    if (userRes.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userName = `${userRes.rows[0].adm_users_firstname} ${userRes.rows[0].adm_users_lastname}`;

    const existing = await db.query(
      `SELECT * FROM gms_attendance_temp 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2`,
      [userId, today]
    );

    const logLast = await db.query(
      `SELECT * FROM gms_attendance_log 
       WHERE gms_userid = $1 AND DATE(gms_createdat) = $2
       ORDER BY gms_id DESC LIMIT 1`,
      [userId, today]
    );

    if (existing.rows.length === 0) {
      // Determine status based on punch-in time
      let status = 'Present';
      let lateDuration = '00:00:00';

      if (currentTime > scheduledStart && currentTime <= lateLimit) {
        status = 'Late Login';
        lateDuration = msToInterval(currentTime - scheduledStart);
      } else if (currentTime > lateLimit) {
        status = 'LOP';
        lateDuration = msToInterval(currentTime - scheduledStart);
      }

      // Insert into temp table
      await db.query(
        `INSERT INTO gms_attendance_temp (
          gms_userid, gms_name, gms_status, gms_checkin, gms_checkout,
          gms_breakduration, gms_lateduration, gms_productionhours,
          gms_createdat, gms_updatedat
        ) VALUES ($1, $2, $3, $4, '00:00:00', '00:00:00', $5, '00:00:00', $6, $6)`,
        [userId, userName, status, nowTime, lateDuration, nowISO]
      );

      // Insert into log table
      await db.query(
        `INSERT INTO gms_attendance_log (
          gms_userid, gms_name_log, gms_checkin_log, gms_checkout_log,
          gms_createdat, gms_updatedat
        ) VALUES ($1, $2, $3, NULL, $4, $4)`,
        [userId, userName, nowTime, nowISO]
      );

      return res.status(201).json({
        message: `Punch-in recorded as ${status}`,
        checkInTime: nowTime,
        lateDuration
      });

    } else {
      const record = existing.rows[0];

      // Calculate break: Last log's checkout to now
      let breakDuration = '00:00:00';
      let newProduction = record.gms_productionhours;

      if (logLast.rows.length > 0 && logLast.rows[0].gms_checkout_log) {
        const lastOut = new Date(`${today}T${logLast.rows[0].gms_checkout_log}`);
        const breakMs = Math.max(currentTime - lastOut, 0);
        breakDuration = msToInterval(breakMs);
      }

      // Update temp table: add to breakduration
      const breakSum = await sumTime(record.gms_breakduration, breakDuration);

      await db.query(
        `UPDATE gms_attendance_temp 
         SET gms_breakduration = $1, gms_updatedat = $2
         WHERE gms_id = $3`,
        [breakSum, nowISO, record.gms_id]
      );

      // Insert into log table (new session)
      await db.query(
        `INSERT INTO gms_attendance_log (
          gms_userid, gms_name_log, gms_checkin_log, gms_checkout_log,
          gms_createdat, gms_updatedat
        ) VALUES ($1, $2, $3, NULL, $4, $4)`,
        [userId, userName, nowTime, nowISO]
      );

      return res.status(200).json({
        message: 'Punch-in after break recorded.',
        checkInTime: nowTime,
        breakDuration
      });
    }
  } catch (err) {
    console.error('Enhanced Punch In error:', err);
    res.status(500).json({ message: 'Punch In failed', error: err.message });
  }
});


function msToInterval(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

async function sumTime(t1, t2) {
  const [h1, m1, s1] = t1.split(':').map(Number);
  const [h2, m2, s2] = t2.split(':').map(Number);
  let totalSec = h1 * 3600 + m1 * 60 + s1 + h2 * 3600 + m2 * 60 + s2;
  return msToInterval(totalSec * 1000);
}

////////////////////////////////////
////////////////////////////////////
////////////////////////////////////
////////////////////////////////////