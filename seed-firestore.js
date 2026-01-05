/**
 * Firestore Seeding Script
 * Seeds library data: Departments → Semesters → Subjects → Content
 * 
 * Requirements:
 * 1. Install: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Place serviceAccountKey.json in project root
 * 4. Run: node seed-firestore.js
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
try {
  const serviceAccount = require('./serviceAccountKey.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  console.log('✓ Firebase Admin initialized');
} catch (error) {
  console.error('✗ Failed to initialize Firebase Admin');
  console.error('  Make sure serviceAccountKey.json exists in project root');
  process.exit(1);
}

const db = admin.firestore();

// Collection names
const COLLECTIONS = {
  DEPARTMENTS: 'library_departments',
  SEMESTERS: 'library_semesters',
  SUBJECTS: 'library_subjects',
};

// Department data (8 departments as specified)
const departments = [
  {
    name: 'Computer Engineering',
    code: 'COMP',
    subtitle: 'Building the digital future',
    icon: '💻',
    color: '#3b82f6',
  },
  {
    name: 'Information Technology',
    code: 'IT',
    subtitle: 'Data, networks, and innovation',
    icon: '🌐',
    color: '#8b5cf6',
  },
  {
    name: 'Mechanical Engineering',
    code: 'MECH',
    subtitle: 'Designing machines and systems',
    icon: '⚙️',
    color: '#ef4444',
  },
  {
    name: 'Electrical Engineering',
    code: 'ELEC',
    subtitle: 'Power, circuits, and electronics',
    icon: '⚡',
    color: '#f59e0b',
  },
  {
    name: 'Civil Engineering',
    code: 'CIVIL',
    subtitle: 'Infrastructure and construction',
    icon: '🏗️',
    color: '#10b981',
  },
  {
    name: 'Electronics & Communication',
    code: 'EC',
    subtitle: 'Signals, systems, and telecom',
    icon: '📡',
    color: '#06b6d4',
  },
  {
    name: 'AI & Data Science',
    code: 'AIDS',
    subtitle: 'Machine learning and analytics',
    icon: '🤖',
    color: '#ec4899',
  },
  {
    name: 'General / Common Subjects',
    code: 'GEN',
    subtitle: 'Foundation courses for all',
    icon: '📚',
    color: '#6366f1',
  },
];

// Subject templates by department
const subjectTemplates = {
  COMP: [
    { name: 'Data Structures and Algorithms', code: 'CS201' },
    { name: 'Object-Oriented Programming', code: 'CS202' },
    { name: 'Database Management Systems', code: 'CS301' },
    { name: 'Computer Networks', code: 'CS302' },
    { name: 'Operating Systems', code: 'CS303' },
    { name: 'Software Engineering', code: 'CS401' },
  ],
  IT: [
    { name: 'Web Technologies', code: 'IT201' },
    { name: 'Cloud Computing', code: 'IT301' },
    { name: 'Information Security', code: 'IT302' },
    { name: 'Big Data Analytics', code: 'IT401' },
    { name: 'Mobile Application Development', code: 'IT402' },
  ],
  MECH: [
    { name: 'Thermodynamics', code: 'ME201' },
    { name: 'Fluid Mechanics', code: 'ME202' },
    { name: 'Manufacturing Processes', code: 'ME301' },
    { name: 'Machine Design', code: 'ME302' },
    { name: 'Heat Transfer', code: 'ME401' },
  ],
  ELEC: [
    { name: 'Circuit Theory', code: 'EE201' },
    { name: 'Electromagnetic Fields', code: 'EE202' },
    { name: 'Power Systems', code: 'EE301' },
    { name: 'Control Systems', code: 'EE302' },
    { name: 'Power Electronics', code: 'EE401' },
  ],
  CIVIL: [
    { name: 'Structural Analysis', code: 'CE201' },
    { name: 'Geotechnical Engineering', code: 'CE202' },
    { name: 'Hydraulics', code: 'CE301' },
    { name: 'Transportation Engineering', code: 'CE302' },
    { name: 'Construction Management', code: 'CE401' },
  ],
  EC: [
    { name: 'Analog Electronics', code: 'EC201' },
    { name: 'Digital Communication', code: 'EC202' },
    { name: 'Microprocessors', code: 'EC301' },
    { name: 'Signal Processing', code: 'EC302' },
    { name: 'VLSI Design', code: 'EC401' },
  ],
  AIDS: [
    { name: 'Machine Learning', code: 'AI201' },
    { name: 'Deep Learning', code: 'AI301' },
    { name: 'Natural Language Processing', code: 'AI302' },
    { name: 'Computer Vision', code: 'AI401' },
    { name: 'Data Mining', code: 'AI402' },
  ],
  GEN: [
    { name: 'Engineering Mathematics I', code: 'GEN101' },
    { name: 'Engineering Mathematics II', code: 'GEN102' },
    { name: 'Engineering Physics', code: 'GEN103' },
    { name: 'Engineering Chemistry', code: 'GEN104' },
    { name: 'Communication Skills', code: 'GEN105' },
  ],
};

// Generate curated links (sample data)
function generateCuratedLinks(subjectName) {
  return [
    {
      title: `${subjectName} - Complete Course`,
      url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      type: 'video',
      source: 'YouTube',
      verified: true,
      description: 'Comprehensive video lecture series',
    },
    {
      title: `Official ${subjectName} Documentation`,
      url: 'https://developer.mozilla.org/en-US/',
      type: 'documentation',
      source: 'MDN Web Docs',
      verified: true,
      description: 'Official reference guide',
    },
    {
      title: `${subjectName} GitHub Repository`,
      url: 'https://github.com/topics/education',
      type: 'repo',
      source: 'GitHub',
      verified: true,
      description: 'Open source examples and projects',
    },
    {
      title: `Interactive ${subjectName} Tutorial`,
      url: 'https://www.freecodecamp.org/',
      type: 'article',
      source: 'freeCodeCamp',
      verified: true,
      description: 'Hands-on interactive learning',
    },
  ];
}

// Generate subject content
function generateSubjectContent(subjectName) {
  return {
    materials: [
      {
        title: `${subjectName} - Lecture Notes`,
        url: 'https://example.com/notes.pdf',
        type: 'pdf',
        uploadDate: new Date().toISOString(),
      },
      {
        title: `${subjectName} - Study Guide`,
        url: 'https://example.com/guide.pdf',
        type: 'pdf',
        uploadDate: new Date().toISOString(),
      },
    ],
    books: [
      {
        title: `Introduction to ${subjectName}`,
        author: 'John Doe',
        isbn: '978-0-123456-78-9',
      },
      {
        title: `Advanced ${subjectName}`,
        author: 'Jane Smith',
        isbn: '978-0-987654-32-1',
      },
    ],
    ppts: [
      {
        title: `${subjectName} - Chapter 1`,
        url: 'https://example.com/chapter1.ppt',
        slides: 45,
      },
      {
        title: `${subjectName} - Chapter 2`,
        url: 'https://example.com/chapter2.ppt',
        slides: 38,
      },
    ],
    curatedLinks: generateCuratedLinks(subjectName),
    extraResources: [
      {
        title: `${subjectName} Online Tool`,
        url: 'https://www.wolframalpha.com/',
        type: 'tool',
      },
    ],
  };
}

// Main seeding function
async function seedDatabase() {
  console.log('\n🌱 Starting database seeding...\n');

  try {
    // Step 1: Seed Departments
    console.log('📁 Seeding departments...');
    const departmentIds = [];

    for (const dept of departments) {
      const deptRef = await db.collection(COLLECTIONS.DEPARTMENTS).add({
        ...dept,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      departmentIds.push({ id: deptRef.id, code: dept.code });
      console.log(`  ✓ Added: ${dept.name} (${deptRef.id})`);
    }

    // Step 2: Seed Semesters (8 per department)
    console.log('\n📅 Seeding semesters...');
    const semesterIds = [];

    for (const dept of departmentIds) {
      for (let i = 1; i <= 8; i++) {
        const semesterRef = await db.collection(COLLECTIONS.SEMESTERS).add({
          number: i,
          name: `Semester ${i}`,
          departmentId: dept.id,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
        semesterIds.push({
          id: semesterRef.id,
          deptId: dept.id,
          deptCode: dept.code,
          semester: i,
        });
        console.log(`  ✓ Added: ${dept.code} - Semester ${i}`);
      }
    }

    // Step 3: Seed Subjects (distributed across semesters)
    console.log('\n📚 Seeding subjects...');
    let totalSubjects = 0;

    for (const sem of semesterIds) {
      const templates = subjectTemplates[sem.deptCode] || [];
      
      // Distribute subjects across semesters
      const subjectsForSemester = templates.filter((_, idx) => 
        idx % 8 === (sem.semester - 1)
      );

      for (const template of subjectsForSemester) {
        const subject = {
          name: template.name,
          code: template.code,
          description: `Comprehensive course covering ${template.name.toLowerCase()} concepts and applications.`,
          credits: 3,
          departmentId: sem.deptId,
          semesterId: sem.id,
          contents: generateSubjectContent(template.name),
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await db.collection(COLLECTIONS.SUBJECTS).add(subject);
        totalSubjects++;
        console.log(`  ✓ Added: ${template.code} - ${template.name} (Sem ${sem.semester})`);
      }
    }

    console.log('\n✅ Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`  - Departments: ${departmentIds.length}`);
    console.log(`  - Semesters: ${semesterIds.length}`);
    console.log(`  - Subjects: ${totalSubjects}`);
    console.log('\n');

  } catch (error) {
    console.error('\n❌ Error during seeding:', error);
    process.exit(1);
  }
}

// Clear existing data (optional, use with caution)
async function clearDatabase() {
  console.log('🗑️  Clearing existing library data...\n');

  const collections = [
    COLLECTIONS.SUBJECTS,
    COLLECTIONS.SEMESTERS,
    COLLECTIONS.DEPARTMENTS,
  ];

  for (const collectionName of collections) {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    console.log(`  ✓ Cleared: ${collectionName} (${snapshot.size} documents)`);
  }

  console.log('\n');
}

// Run the script
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--clear')) {
    await clearDatabase();
  }

  await seedDatabase();
  process.exit(0);
}

main();
