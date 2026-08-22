import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage/ContentPage';
import { ContactForm } from './ContactForm';

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Escribinos tus preguntas, sugerencias o problemas y te respondemos a la brevedad.',
};

export default function ContactoPage() {
  return (
    <ContentPage
      eyebrow="Hablemos"
      title="Contacto"
      subtitle="¿Tenés una pregunta, sugerencia o problema? Contanos y te respondemos a soporte@mindcode-academy.com."
    >
      <ContactForm />
    </ContentPage>
  );
}
