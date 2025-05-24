import { ref } from 'vue';
import { User } from '@/store/models';
import { useUserStore } from '../store/user.store';

export function useUserRoles() {
  const userStore = useUserStore();
  const showRolesModal = ref(false);
  const selectedUser = ref<User | null>(null);
  const userRoles = ref<string[]>([]);

  // const openRolesModal = async (user: User) => {
  //   selectedUser.value = user;
  //   try {
  //     const roles = await userStore.getUserRoles(user._id);
  //     userRoles.value = roles;
  //     showRolesModal.value = true;
  //   } catch (error) {
  //     console.error('Failed to fetch user roles:', error);
  //   }
  // };

  // const assignRoles = async (roleIds: string[]) => {
  //   if (!selectedUser.value) return;
  //   try {
  //     await userStore.assignRoles(selectedUser.value._id, roleIds);
  //     showRolesModal.value = false;
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to assign roles:', error);
  //     return false;
  //   }
  // };

  // const removeRoles = async (roleIds: string[]) => {
  //   if (!selectedUser.value) return;
  //   try {
  //     await userStore.removeRoles(selectedUser.value._id, roleIds);
  //     showRolesModal.value = false;
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to remove roles:', error);
  //     return false;
  //   }
  // };

  // const bulkAssignRoles = async (userIds: string[], roleIds: string[]) => {
  //   try {
  //     await userStore.bulkAssignRoles(userIds, roleIds);
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to assign roles:', error);
  //     return false;
  //   }
  // };

  return {
    showRolesModal,
    selectedUser,
    userRoles,
    // openRolesModal,
    // assignRoles,
    // removeRoles,
    // bulkAssignRoles
  };
} 