import { ref, computed } from 'vue';
import { User } from '@/store/models';
import { useUserStore } from '../store/user.store';
import { useMachine } from '@xstate/vue';
import { createUserMachine } from '../machines/userMachine';

export function useUserManagement() {
  const userStore = useUserStore();
  const { state, send } = useMachine(createUserMachine());
  const showRolesModal = ref(false);
  const showPermissionsModal = ref(false);
  const selectedUser = ref<User | null>(null);
  const userRoles = ref<string[]>([]);
  const userPermissions = ref<any[]>([]);
  const searchQuery = ref('');
  const selectedUsers = ref<string[]>([]);
  const showBulkActions = ref(false);

  const filteredUsers = computed(() => {
    if (!searchQuery.value) return state.value.context.users;
    const query = searchQuery.value.toLowerCase();
    return state.value.context.users.filter((user: { username: string; email: string; }) => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const isCurrentState = (stateName: 'idle' | 'loading' | 'creating' | 'editing' | 'deleting' | 'error') => 
    state.value.matches(stateName);

  const raiseEvent = (event: string, data?: any) => {
    send({ type: event, ...data });
  };

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

  // const assignRoles = async (roleIds: string[]) => {
  //   if (!selectedUser.value) return;
  //   try {
  //     await userStore.assignRoles(selectedUser.value._id, roleIds);
  //     showRolesModal.value = false;
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to assign roles:', error);
  //   }
  // };

  // const removeRoles = async (roleIds: string[]) => {
  //   if (!selectedUser.value) return;
  //   try {
  //     await userStore.removeRoles(selectedUser.value._id, roleIds);
  //     showRolesModal.value = false;
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to remove roles:', error);
  //   }
  // };

  const verifyEmail = async (user: User) => {
    try {
      await userStore.verifyEmail(user._id);
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to verify email:', error);
    }
  };

  // const resetPassword = async (user: User) => {
  //   try {
  //     await userStore.resetPassword(user._id);
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to reset password:', error);
  //   }
  // };

  // const enable2FA = async (user: User) => {
  //   try {
  //     await userStore.enable2FA(user._id);
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to enable 2FA:', error);
  //   }
  // };

  // const disable2FA = async (user: User) => {
  //   try {
  //     await userStore.disable2FA(user._id);
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to disable 2FA:', error);
  //   }
  // };

  const editUser = (user: User) => {
    raiseEvent('EDIT', { id: user._id });
  };

  const deleteUser = (user: User) => {
    raiseEvent('DELETE', { id: user._id });
  };

  const confirmDelete = () => {
    raiseEvent('CONFIRM_DELETE');
  };

  const saveUser = () => {
    raiseEvent('SAVE');
  };

  // const bulkDelete = async () => {
  //   if (!selectedUsers.value.length) return;
  //   try {
  //     await userStore.bulkDelete(selectedUsers.value);
  //     selectedUsers.value = [];
  //     showBulkActions.value = false;
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to delete users:', error);
  //   }
  // };

  // const bulkAssignRoles = async (roleIds: string[]) => {
  //   if (!selectedUsers.value.length) return;
  //   try {
  //     await userStore.bulkAssignRoles(selectedUsers.value, roleIds);
  //     selectedUsers.value = [];
  //     showBulkActions.value = false;
  //     raiseEvent('FETCH');
  //   } catch (error) {
  //     console.error('Failed to assign roles:', error);
  //   }
  // };

  return {
    state,
    showRolesModal,
    showPermissionsModal,
    selectedUser,
    userRoles,
    userPermissions,
    searchQuery,
    selectedUsers,
    showBulkActions,
    filteredUsers,
    isCurrentState,
    raiseEvent,
    // openRolesModal,
    // openPermissionsModal,
    // assignRoles,
    // removeRoles,
    verifyEmail,
    // resetPassword,
    // enable2FA,
    // disable2FA,
    editUser,
    deleteUser,
    confirmDelete,
    saveUser,
    //bulkDelete,
    //bulkAssignRoles
  };
} 