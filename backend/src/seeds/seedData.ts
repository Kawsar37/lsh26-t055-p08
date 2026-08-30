import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { ClassModel } from '../models/Class.js';
import { SubjectModel } from '../models/Subject.js';
import { StudentModel } from '../models/Student.js';
import { MarkModel } from '../models/Mark.js';
import { ResultModel } from '../models/Result.js';
import { recalculateAllStudents } from '../services/resultService.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/resultflow';

const FIRST_NAMES = [
  'Arif', 'Tariq', 'Sadia', 'Nusrat', 'Tanvir', 'Farhana', 'Rahim', 'Karim', 'Tahsin', 'Anika',
  'Mehedi', 'Ayesha', 'Imran', 'Sultana', 'Shakib', 'Tamim', 'Tasnim', 'Fahim', 'Mahmud', 'Nafisa',
  'Zubair', 'Mitu', 'Sabbir', 'Nabil', 'Sumaiya', 'Rifat', 'Jannat', 'Mustafa', 'Lamia', 'Arman',
  'Samia', 'Adnan', 'Bushra', 'Hasan', 'Mubashir', 'Sharmin', 'Shohel', 'Zinia', 'Kaiser', 'Labiba'
];

const LAST_NAMES = [
  'Ahmed', 'Chowdhury', 'Hossain', 'Khan', 'Rahman', 'Islam', 'Siddique', 'Haque', 'Uddin', 'Mahmood',
  'Alam', 'Bhuiyan', 'Hasan', 'Majumdar', 'Sikder', 'Patwary', 'Dewan', 'Talukdar', 'Mia', 'Mollah'
];

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function seedDatabase() {
  try {
    console.log('[Seed] Connecting to database...');
    await mongoose.connect(MONGODB_URI);
    console.log('[Seed] Connected. Clearing previous collections...');

    await Promise.all([
      ClassModel.deleteMany({}),
      SubjectModel.deleteMany({}),
      StudentModel.deleteMany({}),
      MarkModel.deleteMany({}),
      ResultModel.deleteMany({})
    ]);

    console.log('[Seed] Creating Classes...');
    const class9 = await ClassModel.create({
      name: 'Class 9',
      section: 'Science-A',
      academicYear: '2026'
    });

    const class10 = await ClassModel.create({
      name: 'Class 10',
      section: 'Science-A',
      academicYear: '2026'
    });

    console.log('[Seed] Creating Curriculum Subjects...');
    // 6 Compulsory Subjects
    const bangla = await SubjectModel.create({
      code: '101',
      name: 'Bangla',
      isCompulsory: true,
      isPractical: false,
      theoryMax: 100,
      practicalMax: 0,
      totalMax: 100
    });

    const english = await SubjectModel.create({
      code: '107',
      name: 'English',
      isCompulsory: true,
      isPractical: false,
      theoryMax: 100,
      practicalMax: 0,
      totalMax: 100
    });

    const math = await SubjectModel.create({
      code: '109',
      name: 'Mathematics',
      isCompulsory: true,
      isPractical: false,
      theoryMax: 100,
      practicalMax: 0,
      totalMax: 100
    });

    const physics = await SubjectModel.create({
      code: '174',
      name: 'Physics',
      isCompulsory: true,
      isPractical: true,
      theoryMax: 75,
      practicalMax: 25,
      totalMax: 100
    });

    const chemistry = await SubjectModel.create({
      code: '176',
      name: 'Chemistry',
      isCompulsory: true,
      isPractical: true,
      theoryMax: 75,
      practicalMax: 25,
      totalMax: 100
    });

    const biology = await SubjectModel.create({
      code: '178',
      name: 'Biology',
      isCompulsory: true,
      isPractical: true,
      theoryMax: 75,
      practicalMax: 25,
      totalMax: 100
    });

    // Optional Subjects (4th subject choices)
    const higherMath = await SubjectModel.create({
      code: '126',
      name: 'Higher Mathematics',
      isCompulsory: false,
      isPractical: true,
      theoryMax: 75,
      practicalMax: 25,
      totalMax: 100
    });

    const agriculture = await SubjectModel.create({
      code: '134',
      name: 'Agriculture Studies',
      isCompulsory: false,
      isPractical: true,
      theoryMax: 75,
      practicalMax: 25,
      totalMax: 100
    });

    const ict = await SubjectModel.create({
      code: '154',
      name: 'Information & Communication Tech',
      isCompulsory: false,
      isPractical: false,
      theoryMax: 100,
      practicalMax: 0,
      totalMax: 100
    });

    const optionalOptions = [higherMath, agriculture, ict];
    const compulsoryList = [bangla, english, math, physics, chemistry, biology];

    console.log('[Seed] Seeding 80 Students with Explicit Edge Cases...');

    // Define the 9 Explicit Hard Edge Cases
    const edgeCases = [
      {
        studentId: 'S-1001',
        name: 'Arif Ahmed (High Avg + Compulsory Fail)',
        class: class10,
        roll: 1,
        optional: higherMath,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 88 },
          { subject: english, status: 'MARKED', mark: 84 },
          { subject: math, status: 'MARKED', mark: 92 },
          { subject: physics, status: 'MARKED', theory: 65, practical: 24 }, // 89 -> 5.0
          { subject: chemistry, status: 'MARKED', theory: 20, practical: 22 }, // Theory 20 < 25 -> FAIL (GP 0.0)
          { subject: biology, status: 'MARKED', theory: 62, practical: 23 }, // 85 -> 5.0
          { subject: higherMath, status: 'MARKED', theory: 68, practical: 24 } // 92 -> 5.0 -> Bonus 3.0
        ]
      },
      {
        studentId: 'S-1002',
        name: 'Tariq Hossain (Practical Theory Fail 24/20)',
        class: class10,
        roll: 2,
        optional: agriculture,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 72 },
          { subject: english, status: 'MARKED', mark: 68 },
          { subject: math, status: 'MARKED', mark: 75 },
          { subject: physics, status: 'MARKED', theory: 24, practical: 20 }, // Theory 24 < 25 -> FAIL (GP 0.0)
          { subject: chemistry, status: 'MARKED', theory: 45, practical: 18 },
          { subject: biology, status: 'MARKED', theory: 48, practical: 19 },
          { subject: agriculture, status: 'MARKED', theory: 55, practical: 22 }
        ]
      },
      {
        studentId: 'S-1003',
        name: 'Sadia Nusrat (Practical Mark < 8 Review)',
        class: class10,
        roll: 3,
        optional: higherMath,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 65 },
          { subject: english, status: 'MARKED', mark: 62 },
          { subject: math, status: 'MARKED', mark: 70 },
          { subject: physics, status: 'MARKED', theory: 55, practical: 18 },
          { subject: chemistry, status: 'MARKED', theory: 52, practical: 17 },
          { subject: biology, status: 'MARKED', theory: 62, practical: 7 }, // Practical 7 < 8 -> FAIL & Flag
          { subject: higherMath, status: 'MARKED', theory: 50, practical: 20 }
        ]
      },
      {
        studentId: 'S-1004',
        name: 'Tanvir Rahman (Optional GP exactly 2.0)',
        class: class10,
        roll: 4,
        optional: ict,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 75 },
          { subject: english, status: 'MARKED', mark: 70 },
          { subject: math, status: 'MARKED', mark: 80 },
          { subject: physics, status: 'MARKED', theory: 52, practical: 19 },
          { subject: chemistry, status: 'MARKED', theory: 50, practical: 18 },
          { subject: biology, status: 'MARKED', theory: 54, practical: 20 },
          { subject: ict, status: 'MARKED', mark: 45 } // Mark 45 -> GP 2.0 -> Bonus 0.0 -> Optional Review
        ]
      },
      {
        studentId: 'S-1005',
        name: 'Farhana Islam (Optional GP 1.0 < 2.0)',
        class: class10,
        roll: 5,
        optional: ict,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 70 },
          { subject: english, status: 'MARKED', mark: 65 },
          { subject: math, status: 'MARKED', mark: 72 },
          { subject: physics, status: 'MARKED', theory: 48, practical: 18 },
          { subject: chemistry, status: 'MARKED', theory: 46, practical: 17 },
          { subject: biology, status: 'MARKED', theory: 50, practical: 18 },
          { subject: ict, status: 'MARKED', mark: 36 } // Mark 36 -> GP 1.0 -> Bonus 0.0 -> Optional Review
        ]
      },
      {
        studentId: 'S-1006',
        name: 'Rahim Khan (Compulsory Absent AB)',
        class: class10,
        roll: 6,
        optional: higherMath,
        marks: [
          { subject: bangla, status: 'AB' }, // Compulsory Absent -> Overall F & Absent Review
          { subject: english, status: 'MARKED', mark: 78 },
          { subject: math, status: 'MARKED', mark: 82 },
          { subject: physics, status: 'MARKED', theory: 55, practical: 20 },
          { subject: chemistry, status: 'MARKED', theory: 52, practical: 19 },
          { subject: biology, status: 'MARKED', theory: 56, practical: 21 },
          { subject: higherMath, status: 'MARKED', theory: 58, practical: 22 }
        ]
      },
      {
        studentId: 'S-1007',
        name: 'Karim Uddin (Optional Absent AB)',
        class: class10,
        roll: 7,
        optional: higherMath,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 82 },
          { subject: english, status: 'MARKED', mark: 80 },
          { subject: math, status: 'MARKED', mark: 85 },
          { subject: physics, status: 'MARKED', theory: 60, practical: 22 },
          { subject: chemistry, status: 'MARKED', theory: 58, practical: 21 },
          { subject: biology, status: 'MARKED', theory: 62, practical: 23 },
          { subject: higherMath, status: 'AB' } // Optional AB -> Bonus 0.0, Passes Compulsory (GPA 5.0), Flagged for Optional & Absent lists
        ]
      },
      {
        studentId: 'S-1008',
        name: 'Tahsin Alam (Exact Boundary: Th 25, Pr 8 = 33 -> GP 1.0)',
        class: class10,
        roll: 8,
        optional: agriculture,
        marks: [
          { subject: bangla, status: 'MARKED', mark: 42 },
          { subject: english, status: 'MARKED', mark: 45 },
          { subject: math, status: 'MARKED', mark: 40 },
          { subject: physics, status: 'MARKED', theory: 25, practical: 8 }, // Total 33 -> GP 1.0 (Pass)
          { subject: chemistry, status: 'MARKED', theory: 30, practical: 12 }, // Total 42 -> GP 2.0
          { subject: biology, status: 'MARKED', theory: 32, practical: 14 }, // Total 46 -> GP 2.0
          { subject: agriculture, status: 'MARKED', theory: 35, practical: 15 }
        ]
      },
      {
        studentId: 'S-1009',
        name: 'Anika Bhuiyan (Multi-Flagged: AB + Pr < 8 + Opt <= 2.0)',
        class: class10,
        roll: 9,
        optional: ict,
        marks: [
          { subject: bangla, status: 'AB' }, // Absent flag
          { subject: english, status: 'MARKED', mark: 70 },
          { subject: math, status: 'MARKED', mark: 65 },
          { subject: physics, status: 'MARKED', theory: 45, practical: 6 }, // Practical < 8 flag
          { subject: chemistry, status: 'MARKED', theory: 50, practical: 18 },
          { subject: biology, status: 'MARKED', theory: 52, practical: 19 },
          { subject: ict, status: 'MARKED', mark: 42 } // GP 2.0 -> Optional flag
        ]
      }
    ];

    // Seed explicit edge cases first
    for (const ec of edgeCases) {
      const student = await StudentModel.create({
        studentId: ec.studentId,
        name: ec.name,
        rollNumber: ec.roll,
        classId: ec.class._id,
        optionalSubjectId: ec.optional._id,
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + ec.roll}?w=150&auto=format&fit=crop&q=80`
      });

      for (const m of ec.marks) {
        await MarkModel.create({
          studentId: student._id,
          subjectId: m.subject._id,
          status: m.status,
          mark: m.mark,
          theory: m.theory,
          practical: m.practical
        });
      }
    }

    // Seed remaining students up to 80 (Class 10: rolls 10-40, Class 9: rolls 1-40)
    let globalIndex = 10;

    // Additional Class 10 students (Roll 10 to 40)
    for (let roll = 10; roll <= 40; roll++) {
      const studentId = `S-10${roll < 10 ? '0' + roll : roll}`;
      const name = `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
      const optional = getRandomItem(optionalOptions);

      const student = await StudentModel.create({
        studentId,
        name,
        rollNumber: roll,
        classId: class10._id,
        optionalSubjectId: optional._id
      });

      // Distribute student ability profile: 30% Excellent (GPA 5.0/A), 50% Medium (GPA 3.0-4.0), 20% Borderline/Failed
      const profile = roll % 5 === 0 ? 'FAIL' : roll % 3 === 0 ? 'EXCELLENT' : 'AVERAGE';

      for (const sub of compulsoryList) {
        if (sub.isPractical) {
          let th = 0;
          let pr = 0;
          if (profile === 'EXCELLENT') {
            th = getRandomInt(55, 72);
            pr = getRandomInt(20, 25);
          } else if (profile === 'AVERAGE') {
            th = getRandomInt(35, 54);
            pr = getRandomInt(14, 21);
          } else {
            // Borderline or component fail
            th = roll % 2 === 0 ? getRandomInt(20, 24) : getRandomInt(25, 34);
            pr = roll % 2 === 0 ? getRandomInt(10, 18) : getRandomInt(5, 7);
          }
          await MarkModel.create({
            studentId: student._id,
            subjectId: sub._id,
            status: 'MARKED',
            theory: th,
            practical: pr
          });
        } else {
          let mark = 0;
          if (profile === 'EXCELLENT') mark = getRandomInt(80, 98);
          else if (profile === 'AVERAGE') mark = getRandomInt(50, 79);
          else mark = getRandomInt(28, 45);

          await MarkModel.create({
            studentId: student._id,
            subjectId: sub._id,
            status: 'MARKED',
            mark
          });
        }
      }

      // Optional subject
      if (optional.isPractical) {
        const th = profile === 'EXCELLENT' ? getRandomInt(58, 70) : getRandomInt(35, 55);
        const pr = profile === 'EXCELLENT' ? getRandomInt(21, 25) : getRandomInt(15, 20);
        await MarkModel.create({
          studentId: student._id,
          subjectId: optional._id,
          status: 'MARKED',
          theory: th,
          practical: pr
        });
      } else {
        const mark = profile === 'EXCELLENT' ? getRandomInt(82, 96) : getRandomInt(45, 78);
        await MarkModel.create({
          studentId: student._id,
          subjectId: optional._id,
          status: 'MARKED',
          mark
        });
      }
    }

    // Class 9 students (Roll 1 to 40)
    for (let roll = 1; roll <= 40; roll++) {
      const studentId = `S-90${roll < 10 ? '0' + roll : roll}`;
      const name = `${getRandomItem(FIRST_NAMES)} ${getRandomItem(LAST_NAMES)}`;
      const optional = getRandomItem(optionalOptions);

      const student = await StudentModel.create({
        studentId,
        name,
        rollNumber: roll,
        classId: class9._id,
        optionalSubjectId: optional._id
      });

      const profile = roll % 6 === 0 ? 'FAIL' : roll % 4 === 0 ? 'EXCELLENT' : 'AVERAGE';

      for (const sub of compulsoryList) {
        if (sub.isPractical) {
          let th = 0;
          let pr = 0;
          if (profile === 'EXCELLENT') {
            th = getRandomInt(56, 73);
            pr = getRandomInt(22, 25);
          } else if (profile === 'AVERAGE') {
            th = getRandomInt(38, 55);
            pr = getRandomInt(15, 22);
          } else {
            th = getRandomInt(22, 32);
            pr = getRandomInt(6, 12);
          }
          await MarkModel.create({
            studentId: student._id,
            subjectId: sub._id,
            status: 'MARKED',
            theory: th,
            practical: pr
          });
        } else {
          let mark = 0;
          if (profile === 'EXCELLENT') mark = getRandomInt(82, 95);
          else if (profile === 'AVERAGE') mark = getRandomInt(52, 78);
          else mark = getRandomInt(29, 44);

          await MarkModel.create({
            studentId: student._id,
            subjectId: sub._id,
            status: 'MARKED',
            mark
          });
        }
      }

      // Optional subject
      if (optional.isPractical) {
        const th = profile === 'EXCELLENT' ? getRandomInt(60, 72) : getRandomInt(38, 54);
        const pr = profile === 'EXCELLENT' ? getRandomInt(20, 25) : getRandomInt(14, 21);
        await MarkModel.create({
          studentId: student._id,
          subjectId: optional._id,
          status: 'MARKED',
          theory: th,
          practical: pr
        });
      } else {
        const mark = profile === 'EXCELLENT' ? getRandomInt(80, 95) : getRandomInt(48, 75);
        await MarkModel.create({
          studentId: student._id,
          subjectId: optional._id,
          status: 'MARKED',
          mark
        });
      }
    }

    console.log('[Seed] Calculating results for all 80 students using Pure Result Engine...');
    const resultStats = await recalculateAllStudents();
    console.log(`[Seed] Result calculation complete! Total students processed: ${resultStats.totalRecalculated}`);

    console.log('[Seed] Database successfully seeded with 80+ students and all edge cases.');
    await mongoose.disconnect();
  } catch (error) {
    console.error('[Seed Error]:', error);
    process.exit(1);
  }
}

if (process.argv[1]?.includes('seedData')) {
  seedDatabase();
}
