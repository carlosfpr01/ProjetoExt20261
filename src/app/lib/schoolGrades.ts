export const SCHOOL_GRADE_VALUES = [
  'EF_1',
  'EF_2',
  'EF_3',
  'EF_4',
  'EF_5',
  'EF_6',
  'EF_7',
  'EF_8',
  'EF_9',
  'EM_1',
  'EM_2',
  'EM_3',
] as const;

export type SchoolGrade = (typeof SCHOOL_GRADE_VALUES)[number];

const SCHOOL_GRADE_LABELS: Record<SchoolGrade, string> = {
  EF_1: 'EF_1 (1o ano EF)',
  EF_2: 'EF_2 (2o ano EF)',
  EF_3: 'EF_3 (3o ano EF)',
  EF_4: 'EF_4 (4o ano EF)',
  EF_5: 'EF_5 (5o ano EF)',
  EF_6: 'EF_6 (6o ano EF)',
  EF_7: 'EF_7 (7o ano EF)',
  EF_8: 'EF_8 (8o ano EF)',
  EF_9: 'EF_9 (9o ano EF)',
  EM_1: 'EM_1 (1o ano EM)',
  EM_2: 'EM_2 (2o ano EM)',
  EM_3: 'EM_3 (3o ano EM)',
};

export const SCHOOL_GRADE_OPTIONS = SCHOOL_GRADE_VALUES.map(value => ({
  value,
  label: SCHOOL_GRADE_LABELS[value],
}));

export function isSchoolGrade(value: string): value is SchoolGrade {
  return (SCHOOL_GRADE_VALUES as readonly string[]).includes(value);
}

export function toSchoolGradeLabel(value?: string): string {
  if (!value) return '';
  return isSchoolGrade(value) ? SCHOOL_GRADE_LABELS[value] : value;
}
