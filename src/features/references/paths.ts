import { cases, additionalCases } from '@/data/rocketbase';

export function getReferenceStaticPaths() {
  const all = [...cases, ...additionalCases];
  return all.map((item) => ({
    params: { slug: item.slug },
    props: { item },
  }));
}
