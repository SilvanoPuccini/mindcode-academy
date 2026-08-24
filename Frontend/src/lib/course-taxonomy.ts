import { Course } from '@/types';
import { normalizeText } from '@/lib/course-search';
import type { LucideIcon } from 'lucide-react';
import {
  Code2,
  Brain,
  Smartphone,
  Palette,
  Cloud,
  Blocks,
  ShieldCheck,
  Database,
  GitBranch,
  Shapes,
} from 'lucide-react';

export interface CourseCategory {
  id: number;
  key: string;
  label: string;
  icon: LucideIcon;
  count: number;
}

interface CategoryRule {
  key: string;
  label: string;
  icon: LucideIcon;
  patterns: RegExp[];
}

// Ordered most-specific-first: a course matching several rules
// gets the first (most specific) category.
const CATEGORY_RULES: CategoryRule[] = [
  {
    key: 'react',
    label: 'React',
    icon: Code2,
    patterns: [/\breact\b/, /\bnext\.?js\b/],
  },
  {
    key: 'vue',
    label: 'Vue.js',
    icon: Code2,
    patterns: [/\bvue\.?js?\b/],
  },
  {
    key: 'typescript',
    label: 'TypeScript',
    icon: Code2,
    patterns: [/\btypescript\b/],
  },
  {
    key: 'javascript',
    label: 'JavaScript',
    icon: Code2,
    patterns: [/\bjavascript\b/, /\bjs\b/],
  },
  {
    key: 'backend-node',
    label: 'Backend & Node.js',
    icon: Code2,
    patterns: [/\bnode\.?js\b/, /\bexpress\b/, /\bbackend\b/, /\bapi(s)?\b/],
  },
  {
    key: 'mobile',
    label: 'Desarrollo Móvil',
    icon: Smartphone,
    patterns: [/\bflutter\b/, /\bdart\b/, /\bandroid\b/, /\bios\b/, /\bm[oó]vil\b/, /m[oó]viles/],
  },
  {
    key: 'blockchain-web3',
    label: 'Blockchain & Web3',
    icon: Blocks,
    patterns: [/blockchain/, /\bweb3\b/, /\bsolidity\b/, /\bsmart contracts?\b/, /\bnft(s)?\b/],
  },
  {
    key: 'ia-ml',
    label: 'IA & Machine Learning',
    icon: Brain,
    patterns: [
      /inteligencia artificial/,
      /\bia\b/,
      /\bai\b/,
      /\bml\b/,
      /machine learning/,
      /deep learning/,
      /\bllm(s)?\b/,
      /redes neuronales/,
      /\bdata science\b/,
    ],
  },
  {
    key: 'devops-cloud',
    label: 'DevOps & Cloud',
    icon: Cloud,
    patterns: [/devops/, /\bdocker\b/, /kubernetes/, /\bci\/cd\b/, /\baws\b/, /\bazure\b/, /\bcloud\b/],
  },
  {
    key: 'sql-nosql-db',
    label: 'Bases de Datos',
    icon: Database,
    patterns: [/\bsql\b/, /\bnosql\b/, /bases de datos/, /\bpostgresql\b/, /\bmongodb\b/, /\bmysql\b/],
  },
  {
    key: 'git',
    label: 'Git & GitHub',
    icon: GitBranch,
    patterns: [/\bgit\b/, /\bgithub\b/],
  },
  {
    key: 'ux-ui',
    label: 'Diseño UX/UI',
    icon: Palette,
    patterns: [/\bux\b/, /\bui\b/, /dise[nñ]o/, /\bfigma\b/],
  },
  {
    key: 'ciberseguridad',
    label: 'Ciberseguridad',
    icon: ShieldCheck,
    patterns: [/ciberseguridad/, /cybersecurity/, /seguridad inform[aá]tica/, /\bhacking\b/],
  },
  {
    key: 'python',
    label: 'Python',
    icon: Code2,
    patterns: [/\bpython\b/, /\bdjango\b/, /\bflask\b/],
  },
];

const FALLBACK_RULE: CategoryRule = {
  key: 'otros',
  label: 'Otros',
  icon: Shapes,
  patterns: [],
};

export function inferCategory(course: Pick<Course, 'name' | 'description'>): CategoryRule {
  const haystack = normalizeText(`${course.name} ${course.description}`);
  return (
    CATEGORY_RULES.find((rule) => rule.patterns.some((pattern) => pattern.test(haystack))) ??
    FALLBACK_RULE
  );
}

// Builds the visible category list from real courses.
// id = index + 2 because id 1 is reserved for "Todos".
export function buildCategories(courses: Course[]): CourseCategory[] {
  const counts = new Map<CategoryRule, number>();

  for (const course of courses) {
    const rule = inferCategory(course);
    counts.set(rule, (counts.get(rule) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([rule, count], index) => ({
      id: index + 2,
      key: rule.key,
      label: rule.label,
      icon: rule.icon,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label, 'es'));
}
