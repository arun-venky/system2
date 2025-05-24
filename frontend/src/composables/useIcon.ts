import { h, type FunctionalComponent, type HTMLAttributes, type VNodeProps } from 'vue'
import { 
  HomeIcon, 
  DocumentIcon, 
  ListBulletIcon, 
  ShieldCheckIcon, 
  LockClosedIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  Bars3Icon, 
  UserGroupIcon, 
  UserCircleIcon, 
  UserIcon, 
  UserPlusIcon, 
  UserMinusIcon, 
  ExclamationCircleIcon
} from "@heroicons/vue/24/outline";

type IconComponent = FunctionalComponent<HTMLAttributes & VNodeProps>
const iconMap: Record<string, IconComponent> = {
  HomeIcon, 
  DocumentIcon, 
  ListBulletIcon, 
  ShieldCheckIcon, 
  LockClosedIcon, 
  UsersIcon, 
  BriefcaseIcon, 
  Bars3Icon, 
  UserGroupIcon, 
  UserCircleIcon, 
  UserIcon, 
  UserPlusIcon, 
  UserMinusIcon, 
  ExclamationCircleIcon
}

export function useIcon() {
  const getIcon = (name: string): IconComponent | null => {
    return iconMap[name] || null
  }

  const renderIcon = (name: string, classes = 'h-5 w-5 text-gray-400') => {
    const component = getIcon(name)
    if (!component) return null

    return h(component, {
      class: classes,
    })
  }

  return {
    getIcon,
    renderIcon,
  }
}

