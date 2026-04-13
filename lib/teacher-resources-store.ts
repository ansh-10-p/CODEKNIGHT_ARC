// In-memory store — persists for the dev server session (fine for hackathon demo)
export const teacherResourcesStore: {
  _id: string
  title: string
  subject: string
  description: string
  content: string
  category: "notes" | "slides" | "assignment" | "reference"
  postedBy: string
  postedByName: string
  fileSize: string
  downloads: number
  createdAt: string
}[] = [
  {
    _id: "tr-1",
    title: "Data Structures — Week 8 Notes",
    subject: "CS301 — Data Structures",
    description: "Complete notes on AVL Trees, Red-Black Trees, and Graph traversal algorithms.",
    content: `# Data Structures — Week 8

## AVL Trees
An AVL tree is a self-balancing Binary Search Tree (BST) where the difference between heights of left and right subtrees cannot be more than one for all nodes.

### Properties
- Height of an AVL tree is O(log n)
- Balance factor = height(left) - height(right), must be -1, 0, or 1

### Rotations
1. **Left Rotation (LL)** — applied when right subtree is heavy
2. **Right Rotation (RR)** — applied when left subtree is heavy  
3. **Left-Right (LR)** — double rotation
4. **Right-Left (RL)** — double rotation

## Red-Black Trees
A Red-Black tree is a BST with the following properties:
- Every node is Red or Black
- Root is always Black
- No two adjacent Red nodes
- Every path from root to NULL has the same number of Black nodes

## Graph Traversal
### BFS (Breadth-First Search)
- Uses a Queue
- Time: O(V + E)
- Shortest path in unweighted graph

### DFS (Depth-First Search)
- Uses Stack (or recursion)
- Time: O(V + E)
- Useful for cycle detection, topological sort`,
    category: "notes",
    postedBy: "teacher-1",
    postedByName: "Prof. Priya Verma",
    fileSize: "124 KB",
    downloads: 42,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    _id: "tr-2",
    title: "DBMS — Normalization Slides",
    subject: "CS305 — Database Systems",
    description: "Slides covering 1NF, 2NF, 3NF, and BCNF with examples and practice problems.",
    content: `# Database Normalization

## First Normal Form (1NF)
- Each column must contain atomic values
- Each column must have unique names
- Order of data storage doesn't matter

## Second Normal Form (2NF)
- Must be in 1NF
- No partial dependency (all non-key attributes must depend on the entire primary key)

## Third Normal Form (3NF)
- Must be in 2NF
- No transitive dependency

## Boyce-Codd Normal Form (BCNF)
- A stricter version of 3NF
- For every functional dependency X → Y, X should be a super key

## Practice Problem
Given: R(A, B, C, D) with FDs: A→B, B→C, C→D
- Find the candidate key
- Decompose into BCNF`,
    category: "slides",
    postedBy: "teacher-1",
    postedByName: "Prof. Priya Verma",
    fileSize: "2.1 MB",
    downloads: 38,
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    _id: "tr-3",
    title: "OS Assignment — Process Scheduling",
    subject: "CS402 — Operating Systems",
    description: "Assignment on CPU scheduling algorithms: FCFS, SJF, Round Robin, and Priority Scheduling.",
    content: `# OS Assignment — Process Scheduling

## Due Date: April 20, 2026

## Instructions
Solve all the following questions. Show your work with Gantt charts.

## Question 1 — FCFS
Given processes:
| Process | Burst Time | Arrival Time |
|---------|-----------|--------------|
| P1      | 6         | 0            |
| P2      | 8         | 1            |
| P3      | 7         | 2            |
| P4      | 3         | 3            |

Calculate: Average Waiting Time, Average Turnaround Time

## Question 2 — SJF (Non-Preemptive)
Use the same process table above. Calculate AWT and ATT.

## Question 3 — Round Robin (Quantum = 4)
Apply Round Robin with time quantum = 4 ms. Draw the Gantt chart.

## Question 4 — Priority Scheduling
| Process | Burst Time | Priority |
|---------|-----------|----------|
| P1      | 10        | 3        |
| P2      | 1         | 1        |
| P3      | 2         | 4        |
| P4      | 1         | 5        |
| P5      | 5         | 2        |

Lower number = higher priority. Calculate AWT.`,
    category: "assignment",
    postedBy: "teacher-2",
    postedByName: "Prof. Arjun Kumar",
    fileSize: "89 KB",
    downloads: 55,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
]
