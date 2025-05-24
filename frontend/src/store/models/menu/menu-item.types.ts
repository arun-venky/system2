export interface MenuItem {
  _id: string;
  title: string;
  slug: string;
  url: string;
  icon?: string;
  order: number;
  parentId?: string;
  children?: MenuItem[];
  isActive?: boolean;
  isVisible?: boolean;
  permissions?: string[];
} 