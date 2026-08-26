import { describe, it, expect } from 'vitest';
import { deriveBenefits, splitTopicTitle, teacherInitials } from './course-detail-derive';

describe('splitTopicTitle', () => {
  it('highlights the category keyword found in the title', () => {
    expect(splitTopicTitle('Curso de React desde cero', 'React')).toEqual({
      before: 'Curso de ',
      topic: 'React',
      after: ' desde cero',
    });
  });

  it('matches case-insensitively and preserves the original casing', () => {
    expect(splitTopicTitle('curso de REACT', 'React')).toEqual({
      before: 'curso de ',
      topic: 'REACT',
      after: '',
    });
  });

  it('matches multi-token keywords like Node.js', () => {
    expect(splitTopicTitle('Curso de Node.js avanzado', 'Backend & Node.js')).toEqual({
      before: 'Curso de ',
      topic: 'Node.js',
      after: ' avanzado',
    });
  });

  it('does not match a keyword embedded inside another word', () => {
    expect(splitTopicTitle('Reactividad química aplicada', 'React')).toEqual({
      before: 'Reactividad química ',
      topic: 'aplicada',
      after: '',
    });
  });

  it('falls back to the last word when no keyword matches', () => {
    expect(splitTopicTitle('Curso de Flutter', 'Diseño UX/UI')).toEqual({
      before: 'Curso de ',
      topic: 'Flutter',
      after: '',
    });
  });

  it('highlights the whole title when it is a single word', () => {
    expect(splitTopicTitle('Flutter', 'Diseño UX/UI')).toEqual({
      before: '',
      topic: 'Flutter',
      after: '',
    });
  });
});

describe('deriveBenefits', () => {
  it('derives up to 4 title-cased lines from description sentences', () => {
    const description =
      'domina los fundamentos del lenguaje. construye interfaces modernas. ' +
      'aplica buenas prácticas de la industria. despliega en producción. sobra.';
    const benefits = deriveBenefits(description, 'React');

    expect(benefits).toHaveLength(4);
    expect(benefits[0]).toBe('Domina los fundamentos del lenguaje.');
    expect(benefits[3]).toBe('Despliega en producción.');
  });

  it('keeps inner dots of tokens like Node.js intact', () => {
    const benefits = deriveBenefits(
      'Aprende Node.js y su ecosistema completo. Practica con proyectos reales.',
      'Backend & Node.js'
    );

    expect(benefits).toEqual([
      'Aprende Node.js y su ecosistema completo.',
      'Practica con proyectos reales.',
    ]);
  });

  it('keeps two usable sentences without falling back', () => {
    const benefits = deriveBenefits(
      'Primera lección con fundamentos sólidos. Segunda lección con práctica.',
      'React'
    );

    expect(benefits).toHaveLength(2);
  });

  it('falls back to generic lines when there are fewer than 2 sentences', () => {
    expect(deriveBenefits('Descripción del curso', 'React')).toEqual([
      'Fundamentos sólidos de React',
      'Proyectos prácticos y reales',
      'Buenas prácticas de la industria',
      'Herramientas actuales del ecosistema',
    ]);
  });

  it('falls back when every fragment is too short to be a benefit line', () => {
    expect(deriveBenefits('Uno. Dos.', 'Vue.js')[0]).toBe('Fundamentos sólidos de Vue.js');
  });

  it('truncates overly long sentences with an ellipsis', () => {
    const longSentence = `${'x'.repeat(130)}.`;
    const [benefit] = deriveBenefits(longSentence, 'React');

    expect(benefit).toHaveLength(120);
    expect(benefit?.endsWith('…')).toBe(true);
  });
});

describe('teacherInitials', () => {
  it('uses the first letter of the first two words', () => {
    expect(teacherInitials('Ana García')).toBe('AG');
  });

  it('uses a single letter for single-word names', () => {
    expect(teacherInitials('Ana')).toBe('A');
  });

  it('returns a placeholder for empty names', () => {
    expect(teacherInitials('   ')).toBe('?');
  });
});
