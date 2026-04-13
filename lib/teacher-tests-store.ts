export interface TestItem {
  _id: string
  title: string
  subject: string
  classroomId: string
  classroomTitle: string
  type: "unit-test" | "midterm" | "final" | "quiz" | "practical"
  date: string          // ISO date string
  time: string          // e.g. "10:00 AM"
  duration: number      // minutes
  venue: string
  totalMarks: number
  syllabus: string
  instructions: string
  postedBy: string
  postedByName: string
  createdAt: string
}

export const testsStore: TestItem[] = [
  {
    _id: "t1",
    title: "Unit Test 1 — Arrays & Linked Lists",
    subject: "CS301 — Data Structures",
    classroomId: "mc1",
    classroomTitle: "Data Structures & Algorithms",
    type: "unit-test",
    date: new Date(Date.now() + 3 * 86400000).toISOString(),
    time: "10:00 AM",
    duration: 60,
    venue: "Exam Hall A — Block 2",
    totalMarks: 30,
    syllabus: "Unit 1: Arrays, Strings, Linked Lists (Singly, Doubly, Circular). Unit 2: Stack, Queue (Array & Linked List implementation).",
    instructions: "Closed book. No programmable calculators. Write roll number on all sheets. Attempt all questions.",
    postedBy: "teacher-1",
    postedByName: "Prof. Priya Verma",
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    _id: "t2",
    title: "Midterm Exam — DBMS",
    subject: "CS303 — Database Management",
    classroomId: "mc2",
    classroomTitle: "Database Management Systems",
    type: "midterm",
    date: new Date(Date.now() + 7 * 86400000).toISOString(),
    time: "09:00 AM",
    duration: 120,
    venue: "Exam Hall B — Block 3",
    totalMarks: 50,
    syllabus: "Modules 1–4: ER Diagrams, Relational Model, SQL (DDL/DML), Normalization (1NF–BCNF), Transactions (ACID).",
    instructions: "Closed book. SQL syntax sheet provided. Attempt 5 out of 7 questions. Each carries 10 marks.",
    postedBy: "teacher-2",
    postedByName: "Prof. Priya Verma",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    _id: "t3",
    title: "Quiz 2 — CPU Scheduling",
    subject: "CS302 — Operating Systems",
    classroomId: "mc3",
    classroomTitle: "Operating Systems",
    type: "quiz",
    date: new Date(Date.now() + 1 * 86400000).toISOString(),
    time: "02:00 PM",
    duration: 30,
    venue: "Room 301 — Block 1",
    totalMarks: 15,
    syllabus: "FCFS, SJF, Round Robin, Priority Scheduling. Gantt charts and waiting time calculations.",
    instructions: "MCQ + short answers. Online on college portal. Calculator allowed for numerical problems.",
    postedBy: "teacher-3",
    postedByName: "Dr. Anita Desai",
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    _id: "t4",
    title: "Practical Exam — SQL Lab",
    subject: "CS303 — Database Management",
    classroomId: "mc2",
    classroomTitle: "Database Management Systems",
    type: "practical",
    date: new Date(Date.now() + 14 * 86400000).toISOString(),
    time: "11:00 AM",
    duration: 90,
    venue: "Computer Lab 2 — Block 4",
    totalMarks: 25,
    syllabus: "DDL/DML queries, JOINs, subqueries, views, stored procedures, triggers.",
    instructions: "Individual systems. Internet access blocked. Bring student ID. Login credentials on lab sheet.",
    postedBy: "teacher-2",
    postedByName: "Prof. Priya Verma",
    createdAt: new Date().toISOString(),
  },
]
