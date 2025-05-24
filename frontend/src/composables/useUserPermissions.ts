import { ref } from 'vue';
import { User } from '@/store/models';
import { useUserStore } from '../store/user.store';

export function useUserPermissions() {
  const userStore = useUserStore();
  const showPermissionsModal = ref(false);
  const selectedUser = ref<User | null>(null);
  const userPermissions = ref<any[]>([]);

  // const openPermissionsModal = async (user: User) => {
  //   selectedUser.value = user;
  //   try {
  //     const permissions = await userStore.getUserPermissions(user._id);
  //     userPermissions.value = permissions;
  //     showPermissionsModal.value = true;
  //   } catch (error) {
  //     console.error('Failed to fetch user permissions:', error);
  //   }
  // };

  // const updatePermissions = async (permissions: any[]) => {
  //   if (!selectedUser.value) return;
  //   try {
  //     await userStore.updateUserPermissions(selectedUser.value._id, permissions);
  //     showPermissionsModal.value = false;
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to update permissions:', error);
  //     return false;
  //   }
  // };

  return {
    showPermissionsModal,
    selectedUser,
    userPermissions,
    //openPermissionsModal,
    //updatePermissions
  };
} 