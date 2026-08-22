import type { Metadata } from 'next';
import { ContentPage } from '@/components/ContentPage/ContentPage';
import styles from './page.module.scss';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description:
    'Cómo recolectamos, usamos y protegemos tus datos personales en MindCode Academy.',
};

export default function PrivacidadPage() {
  return (
    <ContentPage title="Política de Privacidad" subtitle="Última actualización: agosto de 2026">
      <div className={styles.prose}>
        <h2>1. Qué datos recolectamos</h2>
        <p>
          Cuando creás una cuenta recolectamos tu nombre y tu email. Cuando
          usás la Plataforma también almacenamos información asociada a tu
          actividad, como tus cursos favoritos, tu progreso en las clases y
          las calificaciones que dejás.
        </p>

        <h2>2. Cómo usamos tus datos</h2>
        <ul>
          <li>Para crear y mantener tu cuenta y tu sesión.</li>
          <li>Para guardar tu progreso y tus favoritos entre dispositivos.</li>
          <li>
            Para mostrarte calificaciones y estadísticas agregadas de los
            cursos.
          </li>
          <li>
            Para responder tus consultas cuando nos escribís desde la página
            de Contacto.
          </li>
          <li>
            Para mejorar la Plataforma y comunicarte novedades, si te
            suscribiste a nuestro newsletter.
          </li>
        </ul>

        <h2>3. Con quién compartimos tus datos</h2>
        <p>
          No vendemos ni compartimos tus datos personales con terceros con
          fines publicitarios. Solo compartimos información cuando es
          necesario para operar la Plataforma (por ejemplo, con proveedores
          de infraestructura) o cuando la ley nos obliga a hacerlo.
        </p>

        <h2>4. Cookies y almacenamiento local</h2>
        <p>
          Utilizamos almacenamiento local del navegador y cookies técnicas
          para mantener tu sesión iniciada y recordar tus preferencias, como
          el tema claro u oscuro. No usamos cookies de rastreo publicitario
          de terceros.
        </p>

        <h2>5. Seguridad</h2>
        <p>
          Tu contraseña se almacena de forma cifrada y las comunicaciones con
          nuestros servidores viajan sobre conexiones seguras. Ningún sistema
          es 100% infalible, pero tomamos medidas razonables para proteger tu
          información.
        </p>

        <h2>6. Tus derechos</h2>
        <p>
          Podés acceder, corregir o eliminar tus datos personales en
          cualquier momento. Para solicitar la eliminación de tu cuenta o
          ejercer cualquier otro derecho sobre tus datos, escribinos desde
          nuestra página de Contacto.
        </p>

        <h2>7. Cambios en esta política</h2>
        <p>
          Podemos actualizar esta Política de Privacidad para reflejar
          cambios en la Plataforma o en la normativa vigente. Publicaremos
          cualquier cambio importante en esta misma página.
        </p>

        <h2>8. Contacto</h2>
        <p>
          Ante cualquier duda sobre el tratamiento de tus datos, escribinos a{' '}
          <a href="mailto:soporte@mindcode-academy.com">
            soporte@mindcode-academy.com
          </a>
          .
        </p>
      </div>
    </ContentPage>
  );
}
