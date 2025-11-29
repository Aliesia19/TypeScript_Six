
// ENUMS
enum StudentStatus {
    Active = "Active",
    Academic_Leave = "Academic_Leave",
    Graduated = "Graduated",
    Expelled = "Expelled"
}

enum CourseType {
    Mandatory = "Mandatory",
    Optional = "Optional",
    Special = "Special"
}

enum Semester {
    First = "First",
    Second = "Second"
}

enum Grade {
    Excellent = 5,
    Good = 4,
    Satisfactory = 3,
    Unsatisfactory = 2
}

enum Faculty {
    Computer_Science = "Computer_Science",
    Economics = "Economics",
    Law = "Law",
    Engineering = "Engineering"
}


// INTERFACES
interface Student {
    id: number;
    fullName: string;
    faculty: Faculty;
    year: number;
    status: StudentStatus;
    enrollmentDate: Date;
    groupNumber: string;
}

interface Course {
    id: number;
    name: string;
    type: CourseType;
    credits: number;
    semester: Semester;
    faculty: Faculty;
    maxStudents: number;
}

interface StudentGrade {
    studentId: number;
    courseId: number;
    grade: Grade;
    date: Date;
    semester: Semester;
}


// MAIN CLASS
class UniversityManagementSystem {

    private students: Student[] = [];
    private courses: Course[] = [];
    private grades: StudentGrade[] = [];

    // courseId → studentIds
    private courseRegistrations: Record<number, number[]> = {};

    private studentIdCounter = 1;
    private courseIdCounter = 1;

    // ДОДАВАННЯ СТУДЕНТА
    enrollStudent(student: Omit<Student, "id">): Student {
        const newStudent: Student = {
            ...student,
            id: this.studentIdCounter++
        };
        this.students.push(newStudent);
        return newStudent;
    }

    // ДОДАВАННЯ КУРСУ
    addCourse(course: Omit<Course, "id">): Course {
        const newCourse: Course = { ...course, id: this.courseIdCounter++ };
        this.courses.push(newCourse);
        this.courseRegistrations[newCourse.id] = [];
        return newCourse;
    }

    // РЕЄСТРАЦІЯ НА КУРС
    registerForCourse(studentId: number, courseId: number): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student) throw new Error("Студента не знайдено.");
        if (!course) throw new Error("Курс не знайдено.");

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
    setGrade(studentId: number, courseId: number, grade: Grade): void {
        const student = this.students.find(s => s.id === studentId);
        const course = this.courses.find(c => c.id === courseId);

        if (!student) throw new Error("Студента не знайдено.");
        if (!course) throw new Error("Курс не знайдено.");

        // студент мусить бути зареєстрований на курс
        if (!this.courseRegistrations[courseId].includes(studentId)) {
            throw new Error("Студент не зареєстрований на цей курс.");
        }

        const gradeRecord: StudentGrade = {
            studentId,
            courseId,
            grade,
            date: new Date(),
            semester: course.semester
        };

        this.grades.push(gradeRecord);
    }

    // ОНОВЛЕННЯ СТАТУСУ
    updateStudentStatus(studentId: number, newStatus: StudentStatus): void {
        const student = this.students.find(s => s.id === studentId);

        if (!student) throw new Error("Студента не знайдено.");

        if (student.status === StudentStatus.Expelled) {
            throw new Error("Статус відрахованого студента змінювати заборонено.");
        }

        if (student.status === StudentStatus.Graduated) {
            throw new Error("Випускнику не можна змінити статус.");
        }

        student.status = newStatus;
    }

    // СТУДЕНТИ ФАКУЛЬТЕТУ
    getStudentsByFaculty(faculty: Faculty): Student[] {
        return this.students.filter(s => s.faculty === faculty);
    }

    // ОЦІНКИ СТУДЕНТА
    getStudentGrades(studentId: number): StudentGrade[] {
        return this.grades.filter(g => g.studentId === studentId);
    }

    // ДОСТУПНІ КУРСИ
    getAvailableCourses(faculty: Faculty, semester: Semester): Course[] {
        return this.courses.filter(
            c => c.faculty === faculty && c.semester === semester
        );
    }

    // СЕРЕДНІЙ БАЛ
    calculateAverageGrade(studentId: number): number {
        const studentGrades = this.getStudentGrades(studentId);
        if (studentGrades.length === 0) return 0;

        const total = studentGrades.reduce((sum, g) => sum + g.grade, 0);
        return Number((total / studentGrades.length).toFixed(2));
    }

    // СПИСОК ВІДМІННИКІВ
    getHonorsStudents(faculty: Faculty): Student[] {
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
