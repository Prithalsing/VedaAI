export type AssignmentRecord = {
  id: string;
  title: string;
  subtitle: string;
  assignedOn: string;
  dueDate: string;
  school: string;
  subject: string;
  className: string;
  timeAllowed: string;
  maxMarks: string;
  note: string;
  sectionTitle: string;
  questions: string[];
  answers: string[];
};

export const assignmentRecords: AssignmentRecord[] = [
  {
    id: "english-comprehension",
    title: "English Comprehension Test",
    subtitle:
      "Customized question paper for Class 5 aligned to grammar and writing outcomes.",
    assignedOn: "20-06-2025",
    dueDate: "29-06-2025",
    school: "Delhi Public School, Sector-4, Bokaro",
    subject: "English",
    className: "Class 5th",
    timeAllowed: "45 minutes",
    maxMarks: "30",
    note: "All questions are compulsory unless stated otherwise.",
    sectionTitle: "Section A",
    questions: [
      "Explain the difference between a proper noun and a common noun with one example each.",
      "Rewrite the sentence using the correct form of the adjective: 'Riya is the ___ runner in the class.'",
      "Identify the verb and the tense in the sentence: 'The children were reading quietly in the library.'",
      "Make a meaningful sentence using the idiom 'once in a blue moon'.",
      "Write two lines describing your favorite book and why you like it.",
    ],
    answers: [
      "A proper noun names a specific person, place, or thing, while a common noun names a general item.",
      "The correct adjective form is 'fastest'.",
      "The verb is 'were reading' and the tense is past continuous.",
      "I visit my grandparents once in a blue moon because they live very far away.",
      "The student should describe a favorite book clearly and mention one specific reason for liking it.",
    ],
  },
  {
    id: "science-electricity",
    title: "Quiz on Electricity",
    subtitle:
      "Concept check covering circuits, conductors, and electrical safety for middle school.",
    assignedOn: "22-06-2025",
    dueDate: "30-06-2025",
    school: "Delhi Public School, Sector-4, Bokaro",
    subject: "Science",
    className: "Class 8th",
    timeAllowed: "45 minutes",
    maxMarks: "30",
    note: "Answer all questions. Diagrams should be labeled clearly.",
    sectionTitle: "Section A",
    questions: [
      "Define electric current in one sentence.",
      "List two materials that are good conductors of electricity.",
      "Why is rubber used to cover electrical wires?",
      "Differentiate between an open circuit and a closed circuit.",
      "Write one safety rule that should be followed while using electricity at home.",
    ],
    answers: [
      "Electric current is the flow of electric charge through a conductor.",
      "Copper and aluminium are good conductors.",
      "Rubber is an insulator, so it prevents electric shocks.",
      "An open circuit breaks the path of current, while a closed circuit allows current to flow.",
      "Never touch switches or wires with wet hands.",
    ],
  },
  {
    id: "math-fractions",
    title: "Fractions Practice Test",
    subtitle:
      "Short worksheet focused on equivalent fractions, comparison, and word problems.",
    assignedOn: "24-06-2025",
    dueDate: "02-07-2025",
    school: "Delhi Public School, Sector-4, Bokaro",
    subject: "Mathematics",
    className: "Class 6th",
    timeAllowed: "40 minutes",
    maxMarks: "25",
    note: "Show steps wherever needed.",
    sectionTitle: "Section A",
    questions: [
      "Write two fractions equivalent to 3/5.",
      "Compare 4/7 and 5/9 using the correct symbol.",
      "Add 2/3 and 1/6.",
      "A pizza is cut into 8 equal slices. If 3 are eaten, what fraction is left?",
      "Convert 11/4 into a mixed fraction.",
    ],
    answers: [
      "Examples: 6/10 and 9/15.",
      "4/7 is greater than 5/9.",
      "2/3 + 1/6 = 5/6.",
      "5/8 of the pizza is left.",
      "11/4 = 2 3/4.",
    ],
  },
];
