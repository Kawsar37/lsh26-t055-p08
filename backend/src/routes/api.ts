import { Router } from 'express';
import multer from 'multer';
import {
  getStudents,
  getStudentById,
  updateStudentMarks
} from '../controllers/studentController.js';
import {
  getResults,
  getResultByStudentId,
  recalculateSingleResult,
  recalculateAll
} from '../controllers/resultController.js';
import {
  getOptionalCheckingList,
  getPracticalCheckingList,
  getAbsentCheckingList
} from '../controllers/checkingListController.js';
import {
  getClasses,
  getClassSummary
} from '../controllers/classController.js';
import {
  getCsvTemplate,
  validateAndImportMarks
} from '../controllers/importController.js';
import { getDashboardStats } from '../controllers/dashboardController.js';
import { getPrintMarksheetData } from '../controllers/printController.js';
import { getCases, getCaseById } from '../controllers/caseController.js';
import { evaluateRuleTester } from '../controllers/ruleTesterController.js';

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

// Cases & Datasets (PUB-01 ... PUB-25)
router.get('/cases', getCases);
router.get('/cases/:caseId', getCaseById);

// Dashboard Stats
router.get('/dashboard/stats', getDashboardStats);

// Students
router.get('/students', getStudents);
router.get('/students/:id', getStudentById);
router.put('/students/:id/marks', updateStudentMarks);

// Results
router.get('/results', getResults);
router.get('/results/:studentId', getResultByStudentId);
router.post('/results/recalculate/:studentId', recalculateSingleResult);
router.post('/results/recalculate-all', recalculateAll);

// Checking Lists (3 independent lists)
router.get('/checking-lists/optional', getOptionalCheckingList);
router.get('/checking-lists/practical', getPracticalCheckingList);
router.get('/checking-lists/absent', getAbsentCheckingList);

// Classes & Class Summary
router.get('/classes', getClasses);
router.get('/classes/:classId/summary', getClassSummary);

// CSV Import & Template
router.get('/import/template', getCsvTemplate);
router.post('/import/marks', upload.single('file'), validateAndImportMarks);

// Printable Marksheet
router.get('/print/:studentId', getPrintMarksheetData);

// P08 Edge Case Rule Tester (Pure In-Memory Evaluation)
router.post('/rule-tester/evaluate', evaluateRuleTester);

export default router;
