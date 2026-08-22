import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage/ContentPage';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes',
  description:
    'Respuestas a las preguntas más comunes sobre cuentas, progreso, favoritos y certificados en MindCode Academy.',
};

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: '¿Necesito crear una cuenta para ver los cursos?',
    answer:
      'No. Podés explorar todo el catálogo, ver el detalle de cada curso y sus clases sin iniciar sesión. Necesitás una cuenta solo para guardar favoritos, calificar cursos y que tu progreso quede asociado a tu perfil.',
  },
  {
    question: '¿Cómo guardo un curso en mis favoritos?',
    answer:
      'Iniciá sesión y tocá el ícono de corazón en la tarjeta de cualquier curso o dentro de su página de detalle. Podés ver toda tu lista desde la sección "Favoritos" del menú principal.',
  },
  {
    question: '¿Cómo veo mi progreso en un curso?',
    answer:
      'Tu progreso se guarda automáticamente a medida que avanzás por las clases, siempre que tengas la sesión iniciada. Podés retomarlo desde cualquier dispositivo con solo volver a iniciar sesión.',
  },
  {
    question: '¿Puedo calificar los cursos que tomé?',
    answer:
      'Sí. Desde la página de cada curso podés dejar una calificación con estrellas y actualizarla cuando quieras. Tu calificación ayuda a otros estudiantes a elegir mejor.',
  },
  {
    question: '¿Cómo cambio mi contraseña?',
    answer:
      'Andá a la pantalla de inicio de sesión y usá el enlace "¿Olvidaste tu contraseña?". Te vamos a pedir tu email para enviarte instrucciones de recuperación.',
  },
  {
    question: '¿Los cursos entregan un certificado al finalizar?',
    answer:
      'Todavía no. Estamos trabajando en nuestro sistema de certificación y esperamos lanzarlo próximamente. Mientras tanto, podés seguir tu avance desde tu progreso personal.',
  },
  {
    question: '¿Puedo ver las clases sin conexión?',
    answer:
      'Por ahora las clases se reproducen en streaming y necesitás conexión a internet. Descargar clases para verlas offline es algo que estamos evaluando para el futuro.',
  },
  {
    question: '¿Cómo cancelo o elimino mi cuenta?',
    answer:
      'Escribinos desde la página de Contacto contándonos que querés dar de baja tu cuenta y nuestro equipo procesa la solicitud a la brevedad.',
  },
];

export default function FaqPage() {
  return (
    <ContentPage
      eyebrow="¿Tenés dudas?"
      title="Preguntas Frecuentes"
      subtitle="Las respuestas más buscadas sobre cómo aprovechar MindCode Academy."
    >
      <div className={styles.accordion}>
        {FAQS.map((item) => (
          <details key={item.question} className={styles.item}>
            <summary className={styles.question}>{item.question}</summary>
            <p className={styles.answer}>{item.answer}</p>
          </details>
        ))}
      </div>
    </ContentPage>
  );
}
