"""
Seed data script for Platziflix database.
This script creates REAL sample data for testing and development.
"""

from datetime import datetime
from sqlalchemy.orm import Session
from app.db.base import SessionLocal
from app.models import Teacher, Course, Lesson, CourseRating, course_teachers
from app.core.config import settings


def create_sample_data():
    """Create comprehensive sample data with real course information."""
    db: Session = SessionLocal()

    try:
        # ==================== TEACHERS ====================
        teachers = [
            Teacher(
                name="Freddy Vega",
                email="freddy@platzi.com",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Teacher(
                name="Carlos Hernández",
                email="carlos@platzi.com",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Teacher(
                name="Diana García",
                email="diana@platzi.com",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Teacher(
                name="Ricardo Celis",
                email="ricardo@platzi.com",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Teacher(
                name="Oscar Barajas",
                email="oscar@platzi.com",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Teacher(
                name="Ana Belisa Martínez",
                email="ana@platzi.com",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
        ]
        db.add_all(teachers)
        db.commit()

        # ==================== COURSES WITH REAL THUMBNAILS ====================
        courses = [
            Course(
                name="Curso Profesional de JavaScript",
                description="Domina JavaScript desde los fundamentos hasta técnicas avanzadas. Aprende ES6+, asincronía, patrones de diseño y buenas prácticas.",
                thumbnail="https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=450&fit=crop",
                slug="curso-profesional-javascript",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Python desde Cero",
                description="Aprende Python, uno de los lenguajes más demandados. Desde sintaxis básica hasta proyectos reales con Django y Flask.",
                thumbnail="https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=450&fit=crop",
                slug="curso-python-desde-cero",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de React.js Profesional",
                description="Conviértete en experto en React. Hooks, Context, Redux, Next.js y mejores prácticas para aplicaciones modernas.",
                thumbnail="https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=450&fit=crop",
                slug="curso-react-profesional",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Backend con Node.js",
                description="Desarrolla APIs REST escalables con Node.js, Express, bases de datos y arquitectura de microservicios.",
                thumbnail="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=450&fit=crop",
                slug="curso-backend-nodejs",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Inteligencia Artificial con Python",
                description="Aprende Machine Learning, Deep Learning y redes neuronales. Proyectos reales con TensorFlow y PyTorch.",
                thumbnail="https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
                slug="curso-inteligencia-artificial-python",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Diseño UX/UI",
                description="Diseña productos digitales centrados en el usuario. Figma, prototipado, research y testing con usuarios reales.",
                thumbnail="https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=450&fit=crop",
                slug="curso-diseno-ux-ui",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de DevOps y Cloud Computing",
                description="Domina Docker, Kubernetes, CI/CD, AWS y Azure. Automatiza deployments y escala aplicaciones.",
                thumbnail="https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9?w=800&h=450&fit=crop",
                slug="curso-devops-cloud",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Bases de Datos SQL y NoSQL",
                description="PostgreSQL, MySQL, MongoDB y Redis. Diseño, optimización y queries avanzadas.",
                thumbnail="https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=450&fit=crop",
                slug="curso-bases-datos-sql-nosql",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de TypeScript Avanzado",
                description="Lleva JavaScript al siguiente nivel con TypeScript. Tipos avanzados, generics y arquitectura escalable.",
                thumbnail="https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=450&fit=crop",
                slug="curso-typescript-avanzado",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Git y GitHub Profesional",
                description="Control de versiones profesional. Branching, merging, resolución de conflictos y trabajo en equipo.",
                thumbnail="https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=800&h=450&fit=crop",
                slug="curso-git-github-profesional",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Vue.js 3 Desde Cero",
                description="Framework progresivo para interfaces de usuario. Composition API, Pinia, Vue Router y Nuxt 3.",
                thumbnail="https://images.unsplash.com/photo-1593720213428-28a5b9e94613?w=800&h=450&fit=crop",
                slug="curso-vuejs-3-desde-cero",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Ciberseguridad",
                description="Protege sistemas y datos. Hacking ético, pentesting, seguridad web y mejores prácticas.",
                thumbnail="https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&h=450&fit=crop",
                slug="curso-ciberseguridad",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Flutter y Dart",
                description="Desarrollo móvil multiplataforma. Crea apps nativas para iOS y Android con un solo código.",
                thumbnail="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800&h=450&fit=crop",
                slug="curso-flutter-dart",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Blockchain y Web3",
                description="Tecnología blockchain, smart contracts con Solidity y desarrollo de dApps descentralizadas.",
                thumbnail="https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=450&fit=crop",
                slug="curso-blockchain-web3",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
            Course(
                name="Curso de Data Science con R",
                description="Análisis de datos, estadística, visualización y machine learning con R y RStudio.",
                thumbnail="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop",
                slug="curso-data-science-r",
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            ),
        ]
        db.add_all(courses)
        db.commit()

        # ==================== ASSIGN TEACHERS TO COURSES ====================
        courses[0].teachers.extend([teachers[0], teachers[4]])  # JS - Freddy, Oscar
        courses[1].teachers.extend([teachers[1], teachers[2]])  # Python - Carlos, Diana
        courses[2].teachers.extend([teachers[4], teachers[0]])  # React - Oscar, Freddy
        courses[3].teachers.extend([teachers[1], teachers[3]])  # Node - Carlos, Ricardo
        courses[4].teachers.extend([teachers[2], teachers[1]])  # AI - Diana, Carlos
        courses[5].teachers.extend([teachers[5]])  # UX/UI - Ana
        courses[6].teachers.extend([teachers[3], teachers[1]])  # DevOps - Ricardo, Carlos
        courses[7].teachers.extend([teachers[1]])  # DBs - Carlos
        courses[8].teachers.extend([teachers[4]])  # TS - Oscar
        courses[9].teachers.extend([teachers[0]])  # Git - Freddy
        courses[10].teachers.extend([teachers[4]])  # Vue - Oscar
        courses[11].teachers.extend([teachers[3]])  # Cyber - Ricardo
        courses[12].teachers.extend([teachers[2]])  # Flutter - Diana
        courses[13].teachers.extend([teachers[3]])  # Blockchain - Ricardo
        courses[14].teachers.extend([teachers[2]])  # R - Diana

        db.commit()

        # ==================== CREATE LESSONS FOR EACH COURSE ====================
        lessons_data = [
            # JavaScript Course
            {"course": courses[0], "name": "Introducción a JavaScript", "description": "Historia y fundamentos del lenguaje", "slug": "introduccion-javascript", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[0], "name": "Variables y Tipos de Datos", "description": "let, const, var y tipos primitivos", "slug": "variables-tipos-datos", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[0], "name": "Funciones y Arrow Functions", "description": "Declaración, expresión y funciones flecha", "slug": "funciones-arrow-functions", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[0], "name": "Async/Await y Promises", "description": "Programación asíncrona moderna", "slug": "async-await-promises", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},

            # Python Course
            {"course": courses[1], "name": "Introducción a Python", "description": "Configuración y primer programa", "slug": "introduccion-python", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[1], "name": "Estructuras de Control", "description": "if, for, while y comprehensions", "slug": "estructuras-control-python", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[1], "name": "Funciones y Módulos", "description": "Organización de código Python", "slug": "funciones-modulos-python", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},

            # React Course
            {"course": courses[2], "name": "Fundamentos de React", "description": "JSX, componentes y props", "slug": "fundamentos-react", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[2], "name": "Hooks en React", "description": "useState, useEffect, useContext", "slug": "hooks-react", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[2], "name": "React Router", "description": "Navegación en aplicaciones React", "slug": "react-router", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},

            # Node.js Course
            {"course": courses[3], "name": "Introducción a Node.js", "description": "Event loop y módulos", "slug": "introduccion-nodejs", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[3], "name": "Express.js Básico", "description": "Creación de APIs REST", "slug": "express-basico", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},

            # AI Course
            {"course": courses[4], "name": "Introducción a IA", "description": "Conceptos y aplicaciones", "slug": "introduccion-ia", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
            {"course": courses[4], "name": "Machine Learning Básico", "description": "Algoritmos supervisados", "slug": "machine-learning-basico", "video_url": "https://www.youtube.com/watch?v=W6NZfCO5SIk"},
        ]

        for lesson_data in lessons_data:
            lesson = Lesson(
                course_id=lesson_data["course"].id,
                name=lesson_data["name"],
                description=lesson_data["description"],
                slug=lesson_data["slug"],
                video_url=lesson_data["video_url"],
                created_at=datetime.utcnow(),
                updated_at=datetime.utcnow(),
            )
            db.add(lesson)

        db.commit()

        # ==================== CREATE RATINGS ====================
        # Simulate multiple users rating courses
        ratings = [
            # JavaScript course - muy popular
            CourseRating(course_id=courses[0].id, user_id=1, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[0].id, user_id=2, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[0].id, user_id=3, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[0].id, user_id=4, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[0].id, user_id=5, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Python course
            CourseRating(course_id=courses[1].id, user_id=1, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[1].id, user_id=2, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[1].id, user_id=6, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # React course
            CourseRating(course_id=courses[2].id, user_id=3, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[2].id, user_id=4, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[2].id, user_id=7, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Node.js course
            CourseRating(course_id=courses[3].id, user_id=2, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[3].id, user_id=5, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # AI course
            CourseRating(course_id=courses[4].id, user_id=1, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[4].id, user_id=6, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[4].id, user_id=8, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # UX/UI course
            CourseRating(course_id=courses[5].id, user_id=3, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[5].id, user_id=9, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # DevOps course
            CourseRating(course_id=courses[6].id, user_id=4, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[6].id, user_id=10, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Databases course
            CourseRating(course_id=courses[7].id, user_id=5, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # TypeScript course
            CourseRating(course_id=courses[8].id, user_id=7, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[8].id, user_id=11, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Git course
            CourseRating(course_id=courses[9].id, user_id=2, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
            CourseRating(course_id=courses[9].id, user_id=8, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Vue course
            CourseRating(course_id=courses[10].id, user_id=9, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Cybersecurity course
            CourseRating(course_id=courses[11].id, user_id=10, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Flutter course
            CourseRating(course_id=courses[12].id, user_id=6, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Blockchain course
            CourseRating(course_id=courses[13].id, user_id=11, rating=5, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),

            # Data Science course
            CourseRating(course_id=courses[14].id, user_id=1, rating=4, created_at=datetime.utcnow(), updated_at=datetime.utcnow()),
        ]

        db.add_all(ratings)
        db.commit()

        print("✅ Sample data created successfully!")
        print(f"   - Created {len(teachers)} teachers")
        print(f"   - Created {len(courses)} courses")
        print(f"   - Created {len(lessons_data)} lessons")
        print(f"   - Created {len(ratings)} ratings")
        print("\n📊 Course Stats:")
        for course in courses[:5]:  # Show first 5
            db.refresh(course)
            print(f"   - {course.name}: ⭐ {course.average_rating} ({course.total_ratings} ratings)")

    except Exception as e:
        db.rollback()
        print(f"❌ Error creating sample data: {e}")
        raise
    finally:
        db.close()


def clear_all_data():
    """Clear all data from the database."""
    db: Session = SessionLocal()

    try:
        # Delete in reverse order to avoid foreign key constraints
        from app.models import CourseRating
        db.query(CourseRating).delete()
        db.query(Lesson).delete()
        db.execute(course_teachers.delete())
        db.query(Course).delete()
        db.query(Teacher).delete()
        db.commit()

        print("✅ All data cleared successfully!")

    except Exception as e:
        db.rollback()
        print(f"❌ Error clearing data: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import sys

    if len(sys.argv) > 1 and sys.argv[1] == "clear":
        clear_all_data()
    else:
        create_sample_data()
