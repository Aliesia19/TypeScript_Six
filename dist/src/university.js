"use strict";
// ENUMS
var StudentStatus;
(function (StudentStatus) {
    StudentStatus["Active"] = "Active";
    StudentStatus["Academic_Leave"] = "Academic_Leave";
    StudentStatus["Graduated"] = "Graduated";
    StudentStatus["Expelled"] = "Expelled";
})(StudentStatus || (StudentStatus = {}));
var CourseType;
(function (CourseType) {
    CourseType["Mandatory"] = "Mandatory";
    CourseType["Optional"] = "Optional";
    CourseType["Special"] = "Special";
})(CourseType || (CourseType = {}));
var Semester;
(function (Semester) {
    Semester["First"] = "First";
    Semester["Second"] = "Second";
})(Semester || (Semester = {}));
var Grade;
(function (Grade) {
    Grade[Grade["Excellent"] = 5] = "Excellent";
    Grade[Grade["Good"] = 4] = "Good";
    Grade[Grade["Satisfactory"] = 3] = "Satisfactory";
    Grade[Grade["Unsatisfactory"] = 2] = "Unsatisfactory";
})(Grade || (Grade = {}));
var Faculty;
(function (Faculty) {
    Faculty["Computer_Science"] = "Computer_Science";
    Faculty["Economics"] = "Economics";
    Faculty["Law"] = "Law";
    Faculty["Engineering"] = "Engineering";
})(Faculty || (Faculty = {}));
// MAIN CLASS
class UniversityManagementSystem {
    constructor() {
        this.students = [];
        this.courses = [];
        this.grades = [];
        // courseId → studentIds
        this.courseRegistrations = {};
        this.studentIdCounter = 1;
        this.courseIdCounter = 1;
    }
    // ДОДАВАННЯ СТУДЕНТА
    enrollStudent(student) {
        const newStudent = Object.assign(Object.assign({}, student), { id: this.studentIdCounter++ });
        this.students.push(newStudent);
        return newStudent;
    }
    // ДОДАВАННЯ КУРСУ
    addCourse(course) {
        const newCourse = Object.assign(Object.assign({}, course), { id: this.courseIdCounter++ });
        this.courses.push(newCourse);
        this.courseRegistrations[newCourse.id] = [];
        return newCourse;
    }
    // РЕЄСТРАЦІЯ НА КУРС
    registerForCourse(studentId, courseId) {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student)
            throw new Error("Студента не знайдено.");
        if (!course)
            throw new Error("Курс не знайдено.");
        // факультет повинен співпадати
        if (student.faculty !== course.faculty) {
            throw new Error("Студент не може записатися на курс іншого факультету.");
        }
        // перевірка кількості місць
        const registered = this.courseRegistrations[courseId];
        if (registered.length >= course.maxStudents) {
            throw new Error("На курсі більше немає вільних місць.");
        }
        // перевірка повторної реєстрації
        if (registered.includes(studentId)) {
            throw new Error("Студент вже зареєстрований на цей курс.");
        }
        registered.push(studentId);
    }
    // ВИСТАВЛЕННЯ ОЦІНКИ
    setGrade(studentId, courseId, grade) {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);
        if (!student)
            throw new Error("Студента не знайдено.");
        if (!course)
            throw new Error("Курс не знайдено.");
        // студент мусить бути зареєстрований на курс
        if (!this.courseRegistrations[courseId].includes(studentId)) {
            throw new Error("Студент не зареєстрований на цей курс.");
        }
        const gradeRecord = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester
        };
        this.grades.push(gradeRecord);
    }
    // ОНОВЛЕННЯ СТАТУСУ
    updateStudentStatus(studentId, newStatus) {
        const student = this.students.find(s => s.id === studentId);
        if (!student)
            throw new Error("Студента не знайдено.");
        if (student.status === StudentStatus.Expelled) {
            throw new Error("Статус відрахованого студента змінювати заборонено.");
        }
        if (student.status === StudentStatus.Graduated) {
            throw new Error("Випускнику не можна змінити статус.");
        }
        student.status = newStatus;
    }
    // СТУДЕНТИ ФАКУЛЬТЕТУ
    getStudentsByFaculty(faculty) {
        return this.students.filter(s => s.faculty === faculty);
    }
    // ОЦІНКИ СТУДЕНТА
    getStudentGrades(studentId) {
        return this.grades.filter(g => g.studentId === studentId);
    }
    // ДОСТУПНІ КУРСИ
    getAvailableCourses(faculty, semester) {
        return this.courses.filter(c => c.faculty === faculty && c.semester === semester);
    }
    // СЕРЕДНІЙ БАЛ
    calculateAverageGrade(studentId) {
        const studentGrades = this.getStudentGrades(studentId);
        if (studentGrades.length === 0)
            return 0;
        const total = studentGrades.reduce((sum, g) => sum + g.grade, 0);
        return Number((total / studentGrades.length).toFixed(2));
    }
    // СПИСОК ВІДМІННИКІВ
    getHonorsStudents(faculty) {
        const facultyStudents = this.getStudentsByFaculty(faculty);
        return facultyStudents.filter(s => this.calculateAverageGrade(s.id) >= 4.5);
    }
}
// ТЕСТ (за потреби можеш прибрати)
const uni = new UniversityManagementSystem();
const s1 = uni.enrollStudent({
    fullName: "Olena Petrenko",
    faculty: Faculty.Computer_Science,
    year: 1,
    status: StudentStatus.Active,
    enrollmentDate: new Date(),
    groupNumber: "CS-12"
});
const c1 = uni.addCourse({
    name: "Programming",
    type: CourseType.Mandatory,
    credits: 5,
    semester: Semester.First,
    faculty: Faculty.Computer_Science,
    maxStudents: 30
});
uni.registerForCourse(s1.id, c1.id);
uni.setGrade(s1.id, c1.id, Grade.Excellent);
console.log("Середній бал:", uni.calculateAverageGrade(s1.id));
console.log("Відмінники факультету:", uni.getHonorsStudents(Faculty.Computer_Science));
