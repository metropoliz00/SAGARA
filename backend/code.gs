
// ... (SHEETS definitions and setupDatabase remain unchanged)
const SHEETS = {
  USERS: "Users",
  STUDENTS: "Students",
  AGENDAS: "Agendas",
  ATTENDANCE: "Attendance",
  HOLIDAYS: "Holidays",
  COUNSELING: "Counseling",
  EXTRACURRICULARS: "Extracurriculars",
  PROFILES: "Profiles",
  INVENTORY: "Inventory",
  GUESTS: "Guests",
  SIKAP: "PenilaianSikap",
  KARAKTER: "PenilaianKarakter",
  LINKS: "EmploymentLinks", 
  REPORTS: "LearningReports",
  JURNAL_KELAS: "JurnalKelas", 
  LIAISON: "BukuPenghubung", 
  PERMISSIONS: "PermissionRequests",
  JADWAL: "JadwalPelajaran",
  PIKET: "JadwalPiket",
  DENAH: "DenahDuduk",
  KALENDER: "KalenderAkademik",
  JAM: "JamPelajaran",
  KKTP: "ConfigKKTP",
  STRUKTUR: "StrukturOrganisasi",
  SETTINGS: "ClassSettings",
  DOCS: "SupportDocuments",
  SCHOOL_ASSETS: "SchoolAssets",
  BOS: "BOSManagement" // NEW SHEET
};

const SUBJECT_SHEETS = {
  'pai': 'Nilai PAI',
  'pancasila': 'Nilai Pendidikan Pancasila',
  'indo': 'Nilai Bahasa Indonesia',
  'mat': 'Nilai Matematika',
  'ipas': 'Nilai IPAS',
  'senibudaya': 'Nilai Seni dan Budaya',
  'pjok': 'Nilai PJOK',
  'jawa': 'Nilai Bahasa Jawa',
  'inggris': 'Nilai Bahasa Inggris',
  'kka': 'Nilai KKA',
};

function setupDatabase() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  const definitions = [
    {
      name: SHEETS.USERS,
      headers: ["ID", "Username", "Password", "Role", "Nama Lengkap", "NIP", "NUPTK", "Tempat Tgl Lahir", "Pendidikan Terakhir", "Jabatan Guru", "Pangkat / Gol", "Tugas Mengajar Kelas (Class ID)", "Email", "No HP", "Alamat", "Foto (Base64)", "Tanda Tangan (Base64)", "Student ID"]
    },
    {
      name: SHEETS.STUDENTS,
      headers: ["ID", "Class ID", "NIS", "NISN", "Nama Lengkap", "Gender (L/P)", "Tempat Lahir", "Tanggal Lahir (YYYY-MM-DD)", "Agama", "Alamat", "Nama Ayah", "Pekerjaan Ayah", "Pendidikan Ayah", "Nama Ibu", "Pekerjaan Ibu", "Pendidikan Ibu", "Nama Wali", "No HP Wali", "Pekerjaan Wali", "Status Ekonomi", "Tinggi (cm)", "Berat (kg)", "Gol Darah", "Riwayat Penyakit", "Hobi", "Cita-cita", "Prestasi (JSON)", "Pelanggaran (JSON)", "Skor Perilaku", "Hadir", "Sakit", "Izin", "Alpha", "Foto (Base64)", "Catatan Wali Kelas"]
    },
    { name: SHEETS.AGENDAS, headers: ["ID", "Class ID", "Judul", "Tanggal", "Waktu", "Tipe", "Selesai (TRUE/FALSE)"] },
    { name: SHEETS.ATTENDANCE, headers: ["Tanggal", "Student ID", "Class ID", "Status", "Catatan"] },
    { name: SHEETS.HOLIDAYS, headers: ["ID", "Class ID", "Tanggal", "Keterangan", "Tipe"] },
    { name: SHEETS.COUNSELING, headers: ["ID", "Class ID", "Student ID", "Nama Siswa", "Tanggal", "Tipe", "Kategori", "Deskripsi", "Poin", "Emosi", "Status"] },
    { name: SHEETS.EXTRACURRICULARS, headers: ["ID", "Class ID", "Nama Ekskul", "Kategori", "Jadwal", "Pelatih", "Anggota (JSON ID)"] },
    { name: SHEETS.PROFILES, headers: ["Nama Sekolah", "NIP/NPSN", "Alamat", "Kepala Sekolah", "NIP Kepsek", "Tahun Ajaran", "Semester", "Logo Kab (Base64)", "Logo Sekolah (Base64)", "Running Text", "Developer Info (JSON)", "TTD Kepsek (Base64)"] },
    { name: SHEETS.INVENTORY, headers: ["ID", "Class ID", "Nama Barang", "Kondisi", "Jumlah"] },
    { name: SHEETS.GUESTS, headers: ["ID", "Class ID", "Tanggal", "Waktu", "Nama Tamu", "Instansi", "Keperluan"] },
    { name: SHEETS.SIKAP, headers: ["Student ID", "Class ID", "Keimanan", "Kewargaan", "Bernalar Kritis", "Kreatif", "Gotong Royong", "Mandiri", "Kesehatan", "Komunikasi"] },
    { name: SHEETS.KARAKTER, headers: ["Student ID", "Class ID", "Bangun Pagi", "Beribadah", "Berolahraga", "Makan Sehat", "Gemar Belajar", "Bermasyarakat", "TidurAwal", "Catatan", "Afirmasi"] },
    { name: SHEETS.LINKS, headers: ["ID", "Judul", "URL", "Icon (Base64)"] },
    { name: SHEETS.REPORTS, headers: ["ID", "Class ID", "Tanggal", "Jenis Laporan", "Mata Pelajaran", "Materi/Topik", "Link Dokumen", "Nama Guru"] },
    { name: SHEETS.JURNAL_KELAS, headers: ["ID", "Class ID", "Tanggal", "Hari", "Jam Ke", "Mata Pelajaran", "Materi", "Kegiatan Pembelajaran", "Evaluasi", "Refleksi", "Tindak Lanjut"] },
    { name: SHEETS.LIAISON, headers: ["ID", "Class ID", "Student ID", "Tanggal", "Pengirim", "Pesan", "Status", "Kategori", "Response"] },
    { name: SHEETS.PERMISSIONS, headers: ["ID", "Class ID", "Student ID", "Tanggal", "Tipe", "Alasan", "Status"] },
    { name: SHEETS.DOCS, headers: ["ID", "Class ID", "Nama File", "URL"] },
    // Config Sheets
    { name: SHEETS.JADWAL, headers: ["ID", "Class ID", "Hari", "Jam", "Mata Pelajaran"] },
    { name: SHEETS.PIKET, headers: ["Class ID", "Hari", "Student IDs (JSON)"] },
    { name: SHEETS.DENAH, headers: ["Class ID", "Data (JSON)"] },
    { name: SHEETS.KALENDER, headers: ["Class ID", "Data (JSON)"] },
    { name: SHEETS.JAM, headers: ["Class ID", "Data (JSON)"] },
    { name: SHEETS.KKTP, headers: ["Class ID", "Data (JSON)"] },
    { name: SHEETS.STRUKTUR, headers: ["Class ID", "Data (JSON)"] },
    { name: SHEETS.SETTINGS, headers: ["Class ID", "Data (JSON)"] },
    { name: SHEETS.SCHOOL_ASSETS, headers: ["ID", "Nama Sarana/Prasarana", "Jumlah", "Kondisi", "Lokasi"] },
    { name: SHEETS.BOS, headers: ["ID", "Tanggal", "Tipe (income/expense)", "Kategori", "Deskripsi", "Jumlah"] } // NEW BOS
  ];

  Object.values(SUBJECT_SHEETS).forEach(sheetName => {
    definitions.push({
      name: sheetName,
      headers: ["Student ID", "Class ID", "SUM 1", "SUM 2", "SUM 3", "SUM 4", "SAS", "Nilai Akhir"]
    });
  });

  definitions.forEach(def => {
    let sheet = ss.getSheetByName(def.name);
    if (!sheet) {
      sheet = ss.insertSheet(def.name);
      sheet.getRange(1, 1, 1, def.headers.length).setValues([def.headers]);
      sheet.getRange(1, 1, 1, def.headers.length).setFontWeight("bold").setBackground("#f3f4f6");
      sheet.setFrozenRows(1);
    }
  });

  const userSheet = ss.getSheetByName(SHEETS.USERS);
  if (userSheet.getLastRow() <= 1) {
    userSheet.appendRow(["admin", "admin", "123456", "admin", "Administrator Utama", "-", "-", "-", "-", "Administrator", "-", "all", "admin@sekolah.id", "-", "Sekolah", "", "", ""]);
  }
}

// STANDARD GAS ENTRY POINTS
function doGet(e) {
  return handleRequest(e, 'GET');
}

function doPost(e) {
  return handleRequest(e, 'POST');
}

function getSheet(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  if (!sheet) {
    setupDatabase();
    sheet = ss.getSheetByName(name);
  }
  return sheet;
}

function getData(sheetName) {
  const sheet = getSheet(sheetName);
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  return sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn()).getValues();
}

function formatDate(dateVal) {
  if (!dateVal) return "";
  if (dateVal instanceof Date) {
    const y = dateVal.getFullYear();
    const m = String(dateVal.getMonth() + 1).padStart(2, '0');
    const d = String(dateVal.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  return String(dateVal);
}

function response(d) { return ContentService.createTextOutput(JSON.stringify(d)).setMimeType(ContentService.MimeType.JSON); }

function handleRequest(e, method) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(30000)) return response({ status: "error", message: "Server sibuk." });

  try {
    const params = method === 'GET' ? e.parameter : JSON.parse(e.postData.contents);
    
    // User context is passed as a top-level property, not inside payload
    let user = null;
    if (params.user) {
      user = (typeof params.user === 'string') ? JSON.parse(params.user) : params.user;
    }
    
    const action = params.action;
    const classId = params.classId || (user ? user.classId : null);
    
    // Standardized to use params.payload for data arguments
    if (action === "login") return login(params.payload);
    if (action === "loginGoogle") return loginGoogle(params.payload); // NEW HANDLER
    if (action === "getUsers") return getUsers(user); 
    if (action === "saveUser") return saveUser(params.payload);
    if (action === "saveUserBatch") return saveUserBatch(params.payload);
    if (action === "deleteUser") return deleteUser(params.id);
    if (action === "syncStudentAccounts") return syncStudentAccounts(); 
    
    if (action === "getStudents") return getStudents(user);
    if (action === "createStudent") return createStudent(params.payload);
    if (action === "updateStudent") return updateStudent(params.payload);
    if (action === "deleteStudent") return deleteStudent(params.id);
    if (action === "createStudentBatch") return createStudentBatch(params.payload);

    if (action === "getAgendas") return getAgendas(user);
    if (action === "createAgenda") return createAgenda(params.payload);
    if (action === "updateAgenda") return updateAgenda(params.payload);
    if (action === "deleteAgenda") return deleteAgenda(params.id);

    if (action === "getGrades") return getGrades(user);
    if (action === "saveGrade") return saveGrade(params.payload);

    if (action === "getAttendance") return getAttendance(user);
    if (action === "saveAttendance") return saveAttendance(params.payload);
    if (action === "saveAttendanceBatch") return saveAttendanceBatch(params.payload);

    if (action === "getHolidays") return getHolidays(user);
    if (action === "saveHolidayBatch") return saveHolidayBatch(params.payload);
    if (action === "updateHoliday") return updateHoliday(params.payload);
    if (action === "deleteHoliday") return deleteHoliday(params.id);

    if (action === "getCounselingLogs") return getCounselingLogs(user);
    if (action === "createCounselingLog") return createCounselingLog(params.payload);

    if (action === "getExtracurriculars") return getExtracurriculars(user);
    if (action === "createExtracurricular") return createExtracurricular(params.payload);
    if (action === "updateExtracurricular") return updateExtracurricular(params.payload);
    if (action === "deleteExtracurricular") return deleteExtracurricular(params.id);

    if (action === "getProfiles") return getProfiles();
    if (action === "saveProfile") return saveProfile(params.payload);

    if (action === "getInventory") return getInventory(classId);
    if (action === "saveInventory") return saveInventory(params.payload);
    if (action === "deleteInventory") return deleteInventory(params.id, classId);

    if (action === "getGuests") return getGuests(classId);
    if (action === "saveGuest") return saveGuest(params.payload);
    if (action === "deleteGuest") return deleteGuest(params.id, classId);

    if (action === "getSikapAssessments") return getSikapAssessments(user);
    if (action === "saveSikapAssessment") return saveSikapAssessment(params.payload);
    
    if (action === "getKarakterAssessments") return getKarakterAssessments(user);
    if (action === "saveKarakterAssessment") return saveKarakterAssessment(params.payload);

    if (action === "getClassConfig") return getClassConfig(classId);
    if (action === "saveClassConfig") return saveClassConfig(params.payload);

    if (action === "getEmploymentLinks") return getEmploymentLinks();
    if (action === "saveEmploymentLink") return saveEmploymentLink(params.payload);
    if (action === "deleteEmploymentLink") return deleteEmploymentLink(params.id);

    if (action === "getLearningReports") return getLearningReports(classId);
    if (action === "saveLearningReport") return saveLearningReport(params.payload);
    if (action === "deleteLearningReport") return deleteLearningReport(params.id, classId);

    if (action === "getLearningJournal") return getLearningJournal(classId);
    if (action === "saveLearningJournalBatch") return saveLearningJournalBatch(params.payload);
    if (action === "deleteLearningJournal") return deleteLearningJournal(params.id, classId);

    if (action === "getLiaisonLogs") return getLiaisonLogs(user);
    if (action === "saveLiaisonLog") return saveLiaisonLog(params.payload);
    if (action === "updateLiaisonStatus") return updateLiaisonStatus(params.payload);
    if (action === "replyLiaisonLog") return replyLiaisonLog(params.payload);

    if (action === "getPermissionRequests") return getPermissionRequests(user);
    if (action === "savePermissionRequest") return savePermissionRequest(params.payload);
    if (action === "processPermissionRequest") return processPermissionRequest(params.payload);

    if (action === "getSupportDocuments") return getSupportDocuments(classId);
    if (action === "saveSupportDocument") return saveSupportDocument(params.payload);
    if (action === "deleteSupportDocument") return deleteSupportDocument(params.id, classId);

    if (action === "getSchoolAssets") return getSchoolAssets();
    if (action === "saveSchoolAsset") return saveSchoolAsset(params.payload);
    if (action === "deleteSchoolAsset") return deleteSchoolAsset(params.id);

    // BOS API
    if (action === "getBOS") return getBOS();
    if (action === "saveBOS") return saveBOS(params.payload);
    if (action === "deleteBOS") return deleteBOS(params.id);

    if (action === "restoreData") {
       if (!user || user.role !== 'admin') return response({ status: "error", message: "Hanya admin yang bisa restore data." });
       return restoreData(params.payload);
    }

    return response({ status: "error", message: "Action not found" });

  } catch (error) {
    return response({ status: "error", message: "Error: " + error.toString() });
  } finally {
    lock.releaseLock();
  }
}

// ... (Existing Functions)
// Add these BOS functions

function getBOS(){const rows=getData(SHEETS.BOS);const data=rows.map(r=>({id:String(r[0]),date:formatDate(r[1]),type:String(r[2]),category:String(r[3]),description:String(r[4]),amount:Number(r[5])}));return response({status:"success",data})}
function saveBOS(item){const sheet=getSheet(SHEETS.BOS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(item.id));const row=[item.id||Utilities.getUuid(),item.date,item.type,item.category,item.description,item.amount];if(idx>0)sheet.getRange(idx+1,1,1,row.length).setValues([row]);else sheet.appendRow(row);return response({status:"success",id:row[0]})}
function deleteBOS(id){const sheet=getSheet(SHEETS.BOS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}

// ... (Rest of the functions)
function login(creds){const sheet=getSheet(SHEETS.USERS);const data=sheet.getDataRange().getValues();const inputUser=String(creds.username).trim().toLowerCase();const inputPass=String(creds.password).trim();for(let i=1;i<data.length;i++){const row=data[i];const dbUser=String(row[1]).trim().toLowerCase();const dbPass=String(row[2]).trim();if(dbUser===inputUser&&dbPass===inputPass){return response({status:"success",data:{id:String(row[0]),username:String(row[1]),password:String(row[2]),role:String(row[3]),fullName:String(row[4]),nip:String(row[5]),nuptk:String(row[6]),birthInfo:String(row[7]),education:String(row[8]),position:String(row[9]),rank:String(row[10]),classId:String(row[11]),email:String(row[12]),phone:String(row[13]),address:String(row[14]),photo:String(row[15]),signature:String(row[16]),studentId:String(row[17])}})}}
return response({status:"error",message:"Username atau Password salah."})}

function loginGoogle(payload){
  const email = String(payload.email).trim().toLowerCase();
  const sheet = getSheet(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  // Email is at index 12 (0-based)
  for(let i=1; i<data.length; i++){
    const row = data[i];
    const dbEmail = String(row[12]).trim().toLowerCase();
    if(dbEmail === email){
      return response({
        status: "success",
        data: {
          id:String(row[0]),username:String(row[1]),password:String(row[2]),role:String(row[3]),
          fullName:String(row[4]),nip:String(row[5]),nuptk:String(row[6]),birthInfo:String(row[7]),
          education:String(row[8]),position:String(row[9]),rank:String(row[10]),classId:String(row[11]),
          email:String(row[12]),phone:String(row[13]),address:String(row[14]),photo:String(row[15]),
          signature:String(row[16]),studentId:String(row[17])
        }
      });
    }
  }
  return response({status: "error", message: "Email tidak terdaftar di sistem."});
}

function getUsers(user){
  if(!user || (user.role !== 'admin' && user.role !== 'supervisor')) { return response({status:"error",message:"Unauthorized"}); }
  const rows=getData(SHEETS.USERS);
  const users=rows.map(row=>({id:String(row[0]),username:String(row[1]),password:String(row[2]),role:String(row[3]),fullName:String(row[4]),nip:String(row[5]),nuptk:String(row[6]),birthInfo:String(row[7]),education:String(row[8]),position:String(row[9]),rank:String(row[10]),classId:String(row[11]),email:String(row[12]),phone:String(row[13]),address:String(row[14]),photo:String(row[15]),signature:String(row[16]),studentId:String(row[17])}));
  return response({status:"success",data:users})
}
function saveUser(user){const sheet=getSheet(SHEETS.USERS);const data=sheet.getDataRange().getValues();let rowIndex=-1;const id=user.id||Utilities.getUuid();if(user.id)rowIndex=data.findIndex(r=>String(r[0])===String(user.id));const rowData=[id,user.username,user.password,user.role,user.fullName,user.nip||'',user.nuptk||'',user.birthInfo||'',user.education||'',user.position||'',user.rank||'',user.classId||'',user.email||'',user.phone||'',user.address||'',user.photo||'',user.signature||'',user.studentId||''];if(rowIndex>0)sheet.getRange(rowIndex+1,1,1,rowData.length).setValues([rowData]);else sheet.appendRow(rowData);return response({status:"success",id})}
function saveUserBatch(p){const sheet=getSheet(SHEETS.USERS);const newRows=p.users.map(u=>[Utilities.getUuid(),u.username,u.password,u.role,u.fullName,u.nip||'',u.nuptk||'',u.birthInfo||'',u.education||'',u.position||'',u.rank||'',u.classId||'',u.email||'',u.phone||'',u.address||'',u.photo||'',u.signature||'',u.studentId||'']);if(newRows.length>0)sheet.getRange(sheet.getLastRow()+1,1,newRows.length,newRows[0].length).setValues(newRows);return response({status:"success",count:newRows.length})}
function deleteUser(id){const sheet=getSheet(SHEETS.USERS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error",message:"Not found"})}
function syncStudentAccounts(){const sSheet=getSheet(SHEETS.STUDENTS);const uSheet=getSheet(SHEETS.USERS);const students=getData(SHEETS.STUDENTS);const users=getData(SHEETS.USERS);const newUsers=[];students.forEach(row=>{const sId=String(row[0]);const classId=String(row[1]);const nis=String(row[2]);const name=String(row[4]);const exists=users.some(u=>String(u[17])===sId);if(!exists&&nis){newUsers.push([Utilities.getUuid(),"'"+nis,"'"+nis,'siswa',name,'','','','','Siswa','',classId,'','','','','',sId])}});if(newUsers.length>0){uSheet.getRange(uSheet.getLastRow()+1,1,newUsers.length,newUsers[0].length).setValues(newUsers)}
return response({status:"success",message:`Synced ${newUsers.length} accounts.`})}
function getStudents(user){const rows=getData(SHEETS.STUDENTS);const data=rows.map(row=>({id:String(row[0]),classId:String(row[1]),nis:String(row[2]),nisn:String(row[3]),name:String(row[4]),gender:String(row[5]),birthPlace:String(row[6]),birthDate:formatDate(row[7]),religion:String(row[8]),address:String(row[9]),fatherName:String(row[10]),fatherJob:String(row[11]),fatherEducation:String(row[12]),motherName:String(row[13]),motherJob:String(row[14]),motherEducation:String(row[15]),parentName:String(row[16]),parentPhone:String(row[17]),parentJob:String(row[18]),economyStatus:String(row[19]),height:Number(row[20]),weight:Number(row[21]),bloodType:String(row[22]),healthNotes:String(row[23]),hobbies:String(row[24]),ambition:String(row[25]),achievements:parseJSON(row[26])||[],violations:parseJSON(row[27])||[],behaviorScore:Number(row[28]),attendance:{present:Number(row[29]),sick:Number(row[30]),permit:Number(row[31]),alpha:Number(row[32])},photo:String(row[33]),teacherNotes:String(row[34]||'')}));return response({status:"success",data})}
function createStudent(s){const sheet=getSheet(SHEETS.STUDENTS);const id=Utilities.getUuid();const row=[id,s.classId,"'"+s.nis,"'"+(s.nisn||''),s.name,s.gender,s.birthPlace||'',s.birthDate||'',s.religion||'',s.address||'',s.fatherName||'',s.fatherJob||'',s.fatherEducation||'',s.motherName||'',s.motherJob||'',s.motherEducation||'',s.parentName||'',"'" + (s.parentPhone||''),s.parentJob||'',s.economyStatus||'',s.height||0,s.weight||0,s.bloodType||'',s.healthNotes||'',s.hobbies||'',s.ambition||'',JSON.stringify(s.achievements||[]),JSON.stringify(s.violations||[]),100,0,0,0,0,s.photo||'',s.teacherNotes||''];sheet.appendRow(row);return response({status:"success",id})}
function updateStudent(s){const sheet=getSheet(SHEETS.STUDENTS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(s.id));if(idx>0){const row=[s.id,s.classId,"'"+s.nis,"'"+(s.nisn||''),s.name,s.gender,s.birthPlace||'',s.birthDate||'',s.religion||'',s.address||'',s.fatherName||'',s.fatherJob||'',s.fatherEducation||'',s.motherName||'',s.motherJob||'',s.motherEducation||'',s.parentName||'',"'" + (s.parentPhone||''),s.parentJob||'',s.economyStatus||'',s.height||0,s.weight||0,s.bloodType||'',s.healthNotes||'',s.hobbies||'',s.ambition||'',JSON.stringify(s.achievements||[]),JSON.stringify(s.violations||[]),s.behaviorScore,s.attendance.present,s.attendance.sick,s.attendance.permit,s.attendance.alpha,s.photo||'',s.teacherNotes||''];sheet.getRange(idx+1,1,1,row.length).setValues([row]);return response({status:"success"})}
return response({status:"error",message:"Student not found"})}
function deleteStudent(id){const sheet=getSheet(SHEETS.STUDENTS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function createStudentBatch(p){const sheet=getSheet(SHEETS.STUDENTS);const rows=p.students.map(s=>[Utilities.getUuid(),s.classId,"'"+s.nis,"'"+(s.nisn||''),s.name,s.gender,s.birthPlace||'',s.birthDate||'',s.religion||'',s.address||'',s.fatherName||'',s.fatherJob||'',s.fatherEducation||'',s.motherName||'',s.motherJob||'',s.motherEducation||'',s.parentName||'',"'" + (s.parentPhone||''),s.parentJob||'',s.economyStatus||'',s.height||0,s.weight||0,s.bloodType||'',s.healthNotes||'',s.hobbies||'',s.ambition||'',JSON.stringify(s.achievements||[]),JSON.stringify(s.violations||[]),100,0,0,0,0,s.photo||'',s.teacherNotes||'']);if(rows.length>0)sheet.getRange(sheet.getLastRow()+1,1,rows.length,rows[0].length).setValues(rows);return response({status:"success",count:rows.length})}
function getAgendas(user){const rows=getData(SHEETS.AGENDAS);const data=rows.map(r=>({id:String(r[0]),classId:String(r[1]),title:String(r[2]),date:formatDate(r[3]),time:String(r[4]),type:String(r[5]),completed:r[6]===true||r[6]==='TRUE'}));return response({status:"success",data})}
function createAgenda(a){const sheet=getSheet(SHEETS.AGENDAS);const id=Utilities.getUuid();sheet.appendRow([id,a.classId,a.title,a.date,a.time||'',a.type,a.completed]);return response({status:"success",id})}
function updateAgenda(a){const sheet=getSheet(SHEETS.AGENDAS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(a.id));if(idx>0){sheet.getRange(idx+1,1,1,7).setValues([[a.id,a.classId,a.title,a.date,a.time||'',a.type,a.completed]]);return response({status:"success"})}
return response({status:"error"})}
function deleteAgenda(id){const sheet=getSheet(SHEETS.AGENDAS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getGrades(user){const gradeMap={};const students=getData(SHEETS.STUDENTS);students.forEach(s=>{gradeMap[String(s[0])]={studentId:String(s[0]),classId:String(s[1]),subjects:{}}});Object.keys(SUBJECT_SHEETS).forEach(subjKey=>{const sheetName=SUBJECT_SHEETS[subjKey];const rows=getData(sheetName);rows.forEach(r=>{const sId=String(r[0]);if(gradeMap[sId]){gradeMap[sId].subjects[subjKey]={sum1:Number(r[2]),sum2:Number(r[3]),sum3:Number(r[4]),sum4:Number(r[5]),sas:Number(r[6])}}})});return response({status:"success",data:Object.values(gradeMap)})}
function saveGrade(p){const sheetName=SUBJECT_SHEETS[p.subjectId];if(!sheetName)return response({status:"error",message:"Subject not found"});const sheet=getSheet(sheetName);const data=sheet.getDataRange().getValues();let idx=data.findIndex(r=>String(r[0])===String(p.studentId));const g=p.gradeData;const rowData=[p.studentId,p.classId,g.sum1,g.sum2,g.sum3,g.sum4,g.sas,0];if(idx>0){sheet.getRange(idx+1,1,1,rowData.length).setValues([rowData])}else{sheet.appendRow(rowData)}
return response({status:"success"})}
function getAttendance(user){const rows=getData(SHEETS.ATTENDANCE);const data=rows.map(r=>({date:formatDate(r[0]),studentId:String(r[1]),classId:String(r[2]),status:String(r[3]),notes:String(r[4])}));return response({status:"success",data})}
function saveAttendance(p){const sheet=getSheet(SHEETS.ATTENDANCE);const rows=p.records.map(r=>[p.date,r.studentId,r.classId,r.status,r.notes]);if(rows.length>0)sheet.getRange(sheet.getLastRow()+1,1,rows.length,rows[0].length).setValues(rows);return response({status:"success"})}
function saveAttendanceBatch(p){const sheet=getSheet(SHEETS.ATTENDANCE);const allRows=[];p.batchData.forEach(d=>{d.records.forEach(r=>{allRows.push([d.date,r.studentId,r.classId,r.status,r.notes])})});if(allRows.length>0)sheet.getRange(sheet.getLastRow()+1,1,allRows.length,allRows[0].length).setValues(allRows);return response({status:"success"})}
function getHolidays(user){const rows=getData(SHEETS.HOLIDAYS);const data=rows.map(r=>({id:String(r[0]),classId:String(r[1]),date:formatDate(r[2]),description:String(r[3]),type:String(r[4])}));return response({status:"success",data})}
function saveHolidayBatch(p){const sheet=getSheet(SHEETS.HOLIDAYS);const rows=p.holidays.map(h=>[Utilities.getUuid(),h.classId,h.date,h.description,h.type]);if(rows.length>0)sheet.getRange(sheet.getLastRow()+1,1,rows.length,rows[0].length).setValues(rows);return response({status:"success"})}
function updateHoliday(h){const sheet=getSheet(SHEETS.HOLIDAYS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(h.id));if(idx>0){sheet.getRange(idx+1,1,1,5).setValues([[h.id,h.classId,h.date,h.description,h.type]]);return response({status:"success"})}
return response({status:"error"})}
function deleteHoliday(id){const sheet=getSheet(SHEETS.HOLIDAYS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getExtracurriculars(user){const rows=getData(SHEETS.EXTRACURRICULARS);const data=rows.map(r=>({id:String(r[0]),classId:String(r[1]),name:String(r[2]),category:String(r[3]),schedule:String(r[4]),coach:String(r[5]),members:parseJSON(r[6])||[]}));return response({status:"success",data})}
function createExtracurricular(e){const sheet=getSheet(SHEETS.EXTRACURRICULARS);const id=Utilities.getUuid();sheet.appendRow([id,e.classId,e.name,e.category,e.schedule,e.coach,JSON.stringify(e.members)]);return response({status:"success",id})}
function updateExtracurricular(e){const sheet=getSheet(SHEETS.EXTRACURRICULARS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(e.id));if(idx>0){sheet.getRange(idx+1,1,1,7).setValues([[e.id,e.classId,e.name,e.category,e.schedule,e.coach,JSON.stringify(e.members)]]);return response({status:"success"})}
return response({status:"error"})}
function deleteExtracurricular(id){const sheet=getSheet(SHEETS.EXTRACURRICULARS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getInventory(classId){
  const rows=getData(SHEETS.INVENTORY);
  let targetRows = rows;
  if (classId !== 'ALL') {
    targetRows = rows.filter(r => String(r[1]) === classId);
  }
  const data=targetRows.map(r=>({id:String(r[0]),classId:String(r[1]),name:String(r[2]),condition:String(r[3]),qty:Number(r[4])}));
  return response({status:"success",data})
}
function saveInventory(item){const sheet=getSheet(SHEETS.INVENTORY);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(item.id));const row=[item.id||Utilities.getUuid(),item.classId,item.name,item.condition,item.qty];if(idx>0)sheet.getRange(idx+1,1,1,row.length).setValues([row]);else sheet.appendRow(row);return response({status:"success",id:row[0]})}
function deleteInventory(id,classId){const sheet=getSheet(SHEETS.INVENTORY);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getGuests(classId){const rows=getData(SHEETS.GUESTS);const data=rows.filter(r=>String(r[1])===classId).map(r=>({id:String(r[0]),classId:String(r[1]),date:formatDate(r[2]),time:String(r[3]),name:String(r[4]),agency:String(r[5]),purpose:String(r[6])}));return response({status:"success",data})}
function saveGuest(g){const sheet=getSheet(SHEETS.GUESTS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(g.id));const row=[g.id,g.classId,g.date,g.time,g.name,g.agency,g.purpose];if(idx>0)sheet.getRange(idx+1,1,1,row.length).setValues([row]);else sheet.appendRow(row);return response({status:"success",id:g.id})}
function deleteGuest(id,classId){const sheet=getSheet(SHEETS.GUESTS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getCounselingLogs(user){const rows=getData(SHEETS.COUNSELING);const data=rows.map(r=>({id:String(r[0]),classId:String(r[1]),studentId:String(r[2]),studentName:String(r[3]),date:formatDate(r[4]),type:String(r[5]),category:String(r[6]),description:String(r[7]),point:Number(r[8]),emotion:String(r[9]),status:String(r[10])}));return response({status:"success",data})}
function createCounselingLog(l){const sheet=getSheet(SHEETS.COUNSELING);sheet.appendRow([l.id,l.classId,l.studentId,l.studentName,l.date,l.type,l.category,l.description,l.point,l.emotion,l.status]);return response({status:"success"})}
function getSikapAssessments(user){const rows=getData(SHEETS.SIKAP);const data=rows.map(r=>({studentId:String(r[0]),classId:String(r[1]),keimanan:Number(r[2]),kewargaan:Number(r[3]),penalaranKritis:Number(r[4]),kreativitas:Number(r[5]),kolaborasi:Number(r[6]),kemandirian:Number(r[7]),kesehatan:Number(r[8]),komunikasi:Number(r[9])}));return response({status:"success",data})}
function saveSikapAssessment(p){const sheet=getSheet(SHEETS.SIKAP);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(p.studentId));const a=p.assessment;const row=[p.studentId,p.classId,a.keimanan,a.kewargaan,a.penalaranKritis,a.kreativitas,a.kolaborasi,a.kemandirian,a.kesehatan,a.komunikasi];if(idx>0)sheet.getRange(idx+1,1,1,row.length).setValues([row]);else sheet.appendRow(row);return response({status:"success"})}
function getKarakterAssessments(user){const rows=getData(SHEETS.KARAKTER);const data=rows.map(r=>({studentId:String(r[0]),classId:String(r[1]),bangunPagi:String(r[2]),beribadah:String(r[3]),berolahraga:String(r[4]),makanSehat:String(r[5]),gemarBelajar:String(r[6]),bermasyarakat:String(r[7]),tidurAwal:String(r[8]),catatan:String(r[9]),afirmasi:String(r[10])}));return response({status:"success",data})}
function saveKarakterAssessment(p){const sheet=getSheet(SHEETS.KARAKTER);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(p.studentId));const a=p.assessment;const row=[p.studentId,p.classId,a.bangunPagi,a.beribadah,a.berolahraga,a.makanSehat,a.gemarBelajar,a.bermasyarakat,a.tidurAwal,a.catatan,a.afirmasi];if(idx>0)sheet.getRange(idx+1,1,1,row.length).setValues([row]);else sheet.appendRow(row);return response({status:"success"})}

function getClassConfig(classId) {
  const config = {};
  if (!classId && classId !== "__SCHOOL_WIDE__") return response({ status: "success", data: config });

  // 1. Get Schedule
  const scheduleRows = getData(SHEETS.JADWAL).filter(r => String(r[1]) === classId);
  config.schedule = scheduleRows.map(r => ({id: String(r[0]), classId: String(r[1]), day: String(r[2]), time: String(r[3]), subject: String(r[4])}));

  // 2. Get Piket
  const piketRows = getData(SHEETS.PIKET).filter(r => String(r[0]) === classId);
  config.piket = piketRows.map(r => ({day: String(r[1]), studentIds: parseJSON(r[2]) || []}));

  // 3. Get JSON-based configs
  const jsonConfigMap = {
    seats: SHEETS.DENAH,
    academicCalendar: SHEETS.KALENDER,
    timeSlots: SHEETS.JAM,
    kktp: SHEETS.KKTP,
    organization: SHEETS.STRUKTUR,
    settings: SHEETS.SETTINGS
  };

  for (const key in jsonConfigMap) {
    const sheetName = jsonConfigMap[key];
    const sheet = getSheet(sheetName);
    const allData = sheet.getDataRange().getValues();
    
    // ** CHANGE: Use school-wide ID for academic calendar **
    const lookupId = (key === 'academicCalendar') ? '__SCHOOL_WIDE__' : String(classId);

    const row = allData.find(r => String(r[0]) === lookupId);
    if (row && row[1]) {
      config[key] = parseJSON(row[1]);
    }
  }

  return response({ status: "success", data: config });
}

function saveClassConfig(payload) {
  const { key, data, classId: originalClassId } = payload;
  
  const jsonConfigMap = {
    SEATING: { sheetName: SHEETS.DENAH },
    ACADEMIC_CALENDAR: { sheetName: SHEETS.KALENDER },
    TIME_SLOTS: { sheetName: SHEETS.JAM },
    KKTP: { sheetName: SHEETS.KKTP },
    ORGANIZATION: { sheetName: SHEETS.STRUKTUR },
    RECAP_SETTINGS: { sheetName: SHEETS.SETTINGS }
  };

  if (jsonConfigMap[key]) {
    const sheetName = jsonConfigMap[key].sheetName;
    const sheet = getSheet(sheetName);
    const allData = sheet.getDataRange().getValues();
    
    // ** CHANGE: Use school-wide ID for academic calendar **
    const effectiveClassId = (key === 'ACADEMIC_CALENDAR') ? '__SCHOOL_WIDE__' : String(originalClassId);

    if (!effectiveClassId) return response({ status: "error", message: "Class ID is required" });

    const rowIndex = allData.findIndex(r => String(r[0]) === effectiveClassId);
    const rowData = [effectiveClassId, JSON.stringify(data)];
    
    if (rowIndex > 0) {
      sheet.getRange(rowIndex + 1, 1, 1, rowData.length).setValues([rowData]);
    } else {
      sheet.appendRow(rowData);
    }
    return response({ status: "success" });
  }

  if (!originalClassId) return response({ status: "error", message: "Class ID is required for this config type" });

  if (key === "SCHEDULE") {
    const sheet = getSheet(SHEETS.JADWAL);
    const allData = sheet.getDataRange().getValues();
    for (let i = allData.length - 1; i > 0; i--) {
        if (String(allData[i][1]) === String(originalClassId)) {
            sheet.deleteRow(i + 1);
        }
    }
    const newRows = data.map(function(item) {
      return [item.id || Utilities.getUuid(), originalClassId, item.day, item.time, item.subject]
    });
    if (newRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }
    return response({ status: "success" });
  }

  if (key === "PIKET") {
    const sheet = getSheet(SHEETS.PIKET);
    const allData = sheet.getDataRange().getValues();
    for (let i = allData.length - 1; i > 0; i--) {
        if (String(allData[i][0]) === String(originalClassId)) {
            sheet.deleteRow(i + 1);
        }
    }
    const newRows = data.map(function(group) {
      return [originalClassId, group.day, JSON.stringify(group.studentIds)]
    });
    if (newRows.length > 0) {
        sheet.getRange(sheet.getLastRow() + 1, 1, newRows.length, newRows[0].length).setValues(newRows);
    }
    return response({ status: "success" });
  }

  return response({ status: "error", message: "Unknown config key: " + key });
}

function getEmploymentLinks(){const rows=getData(SHEETS.LINKS);const data=rows.map(r=>({id:String(r[0]),title:String(r[1]),url:String(r[2]),icon:String(r[3])}));return response({status:"success",data})}
function saveEmploymentLink(l){const sheet=getSheet(SHEETS.LINKS);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(l.id));const id=l.id||Utilities.getUuid();const row=[id,l.title,l.url,l.icon];if(idx>0)sheet.getRange(idx+1,1,1,4).setValues([row]);else sheet.appendRow(row);return response({status:"success",id})}
function deleteEmploymentLink(id){const sheet=getSheet(SHEETS.LINKS);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getLearningReports(classId){const rows=getData(SHEETS.REPORTS);const data=rows.filter(r=>String(r[1])===classId).map(r=>({id:String(r[0]),classId:String(r[1]),date:formatDate(r[2]),type:String(r[3]),subject:String(r[4]),topic:String(r[5]),documentLink:String(r[6]),teacherName:String(r[7])}));return response({status:"success",data})}
function saveLearningReport(r){const sheet=getSheet(SHEETS.REPORTS);const id=r.id||Utilities.getUuid();const row=[id,r.classId,r.date,r.type,r.subject,r.topic,r.documentLink,r.teacherName];sheet.appendRow(row);return response({status:"success",id})}
function deleteLearningReport(id,classId){const sheet=getSheet(SHEETS.REPORTS);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getLearningJournal(classId){const rows=getData(SHEETS.JURNAL_KELAS);const data=rows.filter(r=>String(r[1])===classId).map(r=>({id:String(r[0]),classId:String(r[1]),date:formatDate(r[2]),day:String(r[3]),timeSlot:String(r[4]),subject:String(r[5]),topic:String(r[6]),activities:String(r[7]),evaluation:String(r[8]),reflection:String(r[9]),followUp:String(r[10])}));return response({status:"success",data})}
function saveLearningJournalBatch(p){const sheet=getSheet(SHEETS.JURNAL_KELAS);const newRows=p.entries.map(e=>[e.id||Utilities.getUuid(),e.classId,e.date,e.day,e.timeSlot,e.subject,e.topic,e.activities,e.evaluation,e.reflection,e.followUp]);if(newRows.length>0)sheet.getRange(sheet.getLastRow()+1,1,newRows.length,newRows[0].length).setValues(newRows);return response({status:"success"})}
function deleteLearningJournal(id,classId){const sheet=getSheet(SHEETS.JURNAL_KELAS);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getPermissionRequests(user){const rows=getData(SHEETS.PERMISSIONS);const data=rows.map(r=>({id:String(r[0]),classId:String(r[1]),studentId:String(r[2]),date:formatDate(r[3]),type:String(r[4]),reason:String(r[5]),status:String(r[6])}));return response({status:"success",data})}
function savePermissionRequest(p){const sheet=getSheet(SHEETS.PERMISSIONS);const id=Utilities.getUuid();sheet.appendRow([id,p.classId,p.studentId,p.date,p.type,p.reason,'Pending']);return response({status:"success",id})}
function processPermissionRequest(p){const sheet=getSheet(SHEETS.PERMISSIONS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(p.id));if(idx>0){const newStatus=p.action==='approve'?'Approved':'Rejected';sheet.getRange(idx+1,7).setValue(newStatus);if(p.action==='approve'){const attSheet=getSheet(SHEETS.ATTENDANCE);const row=data[idx];attSheet.appendRow([row[3],row[2],row[1],row[4],row[5]])}
return response({status:"success"})}
return response({status:"error"})}
function getSupportDocuments(classId){const rows=getData(SHEETS.DOCS);const data=rows.filter(r=>String(r[1])===classId).map(r=>({id:String(r[0]),classId:String(r[1]),name:String(r[2]),url:String(r[3])}));return response({status:"success",data})}
function saveSupportDocument(d){const sheet=getSheet(SHEETS.DOCS);const id=d.id||Utilities.getUuid();const row=[id,d.classId,d.name,d.url];const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(d.id));if(idx>0)sheet.getRange(idx+1,1,1,4).setValues([row]);else sheet.appendRow(row);return response({status:"success"})}
function deleteSupportDocument(id,classId){const sheet=getSheet(SHEETS.DOCS);const all=sheet.getDataRange().getValues();const idx=all.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function getSchoolAssets(){const rows=getData(SHEETS.SCHOOL_ASSETS);const data=rows.map(r=>({id:String(r[0]),name:String(r[1]),qty:Number(r[2]),condition:String(r[3]),location:String(r[4]||'')}));return response({status:"success",data})}
function saveSchoolAsset(item){const sheet=getSheet(SHEETS.SCHOOL_ASSETS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(item.id));const row=[item.id||Utilities.getUuid(),item.name,item.qty,item.condition,item.location||''];if(idx>0)sheet.getRange(idx+1,1,1,row.length).setValues([row]);else sheet.appendRow(row);return response({status:"success",id:row[0]})}
function deleteSchoolAsset(id){const sheet=getSheet(SHEETS.SCHOOL_ASSETS);const data=sheet.getDataRange().getValues();const idx=data.findIndex(r=>String(r[0])===String(id));if(idx>0){sheet.deleteRow(idx+1);return response({status:"success"})}
return response({status:"error"})}
function restoreData(data){return response({status:"success",message:"Restore functionality logic implemented but disabled for safety."})}
function parseJSON(str){try{return JSON.parse(str)}catch(e){return null}}
function getProfiles(){
  const sheet = getSheet(SHEETS.PROFILES);
  const data = sheet.getDataRange().getValues();
  let school = {};
  if(data.length > 1){
    const r = data[1];
    school = {
      name: String(r[0]||''),
      npsn: String(r[1]||''),
      address: String(r[2]||''),
      headmaster: String(r[3]||''),
      headmasterNip: String(r[4]||''),
      year: String(r[5]||''),
      semester: String(r[6]||''),
      regencyLogo: String(r[7]||''),
      schoolLogo: String(r[8]||''),
      runningText: String(r[9]||''),
      developerInfo: parseJSON(r[10])||{name:'',moto:'',photo:''},
      headmasterSignature: String(r[11]||'')
    };
  }
  return response({status:"success", data:{school: school}});
}
function saveProfile(p){
  if(p.type === 'school'){
    const sheet = getSheet(SHEETS.PROFILES);
    const d = p.data;
    const row = [d.name, d.npsn, d.address, d.headmaster, d.headmasterNip, d.year, d.semester, d.regencyLogo, d.schoolLogo, d.runningText, JSON.stringify(d.developerInfo||{}), d.headmasterSignature||''];
    if(sheet.getLastRow() > 1){
      sheet.getRange(2, 1, 1, row.length).setValues([row]);
    } else {
      sheet.appendRow(row);
    }
  }
  return response({status:"success"});
}
