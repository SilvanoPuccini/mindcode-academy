import type { Metadata } from 'next';
import Link from 'next/link';
import {
  UserPlus,
  TrendingUp,
  Heart,
  KeyRound,
  Star,
  MessageCircle,
} from 'lucide-react';
import { ContentPage } from '@/components/ContentPage/ContentPage';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Centro de Ayuda',
  description:
    'Encontrá respuestas rápidas sobre inscripciones, progreso, favoritos y tu cuenta en MindCode Academy.',
};

interface HelpTopic {
  icon: typeof UserPlus;
  title: string;
  description: string;
}

const TOPICS: HelpTopic[] = [
  {
    icon: UserPlus,
    title: 'Cómo inscribirte a un curso',
    description:
      'Explorá el catálogo desde la portada, filtrá por categoría o buscá por nombre y hacé clic en cualquier curso para ver sus lecciones y clases. No necesitás pagar nada para empezar a ver el contenido disponible.',
  },
  {
    icon: TrendingUp,
    title: 'Cómo ver tu progreso',
    description:
      'A medida que avanzás por las clases de un curso, tu progreso se guarda automáticamente en tu cuenta. Iniciá sesión para que quede asociado a tu perfil y puedas retomarlo desde cualquier dispositivo.',
  },
  {
    icon: Heart,
    title: 'Cómo usar los favoritos',
    description:
      'Con tu sesión iniciada, tocá el ícono de corazón en cualquier curso para agregarlo a tus favoritos. Podés ver la lista completa desde la sección "Favoritos" del menú principal.',
  },
  {
    icon: Star,
    title: 'Cómo calificar un curso',
    description:
      'Dentro de la página de un curso podés dejar tu calificación con estrellas. Tu opinión ayuda a otros estudiantes a elegir mejor y nos ayuda a mejorar el contenido.',
  },
  {
    icon: KeyRound,
    title: 'Cómo cambiar tu contraseña',
    description:
      'Desde la pantalla de inicio de sesión usá la opción "¿Olvidaste tu contraseña?" para recibir instrucciones y crear una nueva.',
  },
  {
    icon: MessageCircle,
    title: '¿No encontraste lo que buscabas?',
    description:
      'Revisá nuestras preguntas frecuentes o escribinos directamente y te respondemos a la brevedad.',
  },
];

export default function AyudaPage() {
  return (
    <ContentPage
      eyebrow="Estamos para ayudarte"
      title="Centro de Ayuda"
      subtitle="Guías rápidas sobre lo más importante para sacarle el máximo provecho a MindCode Academy."
    >
      <div className={styles.topicsGrid}>
        {TOPICS.map((topic) => (
          <article key={topic.title} className={styles.topicCard}>
            <div className={styles.topicIcon} aria-hidden="true">
              <topic.icon size={22} />
            </div>
            <h2 className={styles.topicTitle}>{topic.title}</h2>
            <p className={styles.topicDescription}>{topic.description}</p>
          </article>
        ))}
      </div>

      <div className={styles.moreHelp}>
        <p>
          ¿Todavía tenés dudas? Mirá nuestras{' '}
          <Link href="/faq">preguntas frecuentes</Link> o{' '}
          <Link href="/contacto">contactá a soporte</Link>.
        </p>
      </div>
    </ContentPage>
  );
}
