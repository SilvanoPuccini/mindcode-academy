import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage/ContentPage';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description:
    'Condiciones de uso de la plataforma de cursos online MindCode Academy.',
};

export default function TerminosPage() {
  return (
    <ContentPage title="Términos de Servicio" subtitle="Última actualización: agosto de 2026">
      <div className={styles.prose}>
        <h2>1. Aceptación de los términos</h2>
        <p>
          Al crear una cuenta o utilizar MindCode Academy (&quot;la Plataforma&quot;)
          aceptás estos Términos de Servicio. Si no estás de acuerdo con
          alguna parte de estas condiciones, te pedimos que no utilices la
          Plataforma.
        </p>

        <h2>2. Uso de la cuenta</h2>
        <p>
          Sos responsable de mantener la confidencialidad de tu contraseña y
          de toda la actividad que ocurra bajo tu cuenta. Debés notificarnos
          de inmediato ante cualquier uso no autorizado. Nos reservamos el
          derecho de suspender cuentas que incumplan estos términos o que
          realicen un uso indebido de la Plataforma.
        </p>

        <h2>3. Contenido de los cursos</h2>
        <ul>
          <li>
            Todos los cursos, clases, videos, materiales y evaluaciones
            publicados en la Plataforma son propiedad de MindCode Academy o
            de sus profesores, y están protegidos por leyes de propiedad
            intelectual.
          </li>
          <li>
            El acceso a un curso te otorga una licencia personal, no
            transferible e intransferible para ver el contenido con fines de
            aprendizaje individual.
          </li>
          <li>
            No está permitido copiar, redistribuir, revender ni publicar el
            contenido de los cursos sin autorización expresa.
          </li>
        </ul>

        <h2>4. Conducta del usuario</h2>
        <p>
          Al interactuar con la Plataforma (por ejemplo, dejando calificaciones
          o comentarios) te comprometés a hacerlo de forma respetuosa,
          honesta y sin infringir derechos de terceros. Nos reservamos el
          derecho de moderar o eliminar contenido que consideremos
          inapropiado.
        </p>

        <h2>5. Disponibilidad del servicio</h2>
        <p>
          Trabajamos para que la Plataforma esté disponible de forma
          continua, pero no garantizamos un funcionamiento ininterrumpido o
          libre de errores. Podemos realizar mantenimientos, actualizaciones
          o cambios en las funcionalidades en cualquier momento.
        </p>

        <h2>6. Modificaciones</h2>
        <p>
          Podemos actualizar estos Términos de Servicio periódicamente. Los
          cambios importantes serán comunicados a través de la Plataforma. El
          uso continuado del servicio después de una actualización implica la
          aceptación de los nuevos términos.
        </p>

        <h2>7. Contacto</h2>
        <p>
          Si tenés preguntas sobre estos términos, escribinos a{' '}
          <a href="mailto:soporte@mindcode-academy.com">
            soporte@mindcode-academy.com
          </a>{' '}
          o desde nuestra página de Contacto.
        </p>
      </div>
    </ContentPage>
  );
}
