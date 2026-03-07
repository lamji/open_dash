export interface DocSection {
  id: string;
  title: string;
  slug: string;
  icon: string;
  children: DocSubSection[];
}

export interface DocSubSection {
  id: string;
  title: string;
  anchor: string;
}

export interface DocFeature {
  title: string;
  description: string;
  icon: string;
}

export interface DocsState {
  activeSection: string;
  activeSubSection: string;
  searchQuery: string;
}
