import { ref, computed } from 'vue';
import { Role, Permission } from '@/store/models';
import { useRoleStore } from '../store/role.store';
import { useMachine } from '@xstate/vue';
import { createRoleMachine } from '../machines/roleMachine';

export function useRoleManagement() {
  const roleStore = useRoleStore();
  const { state, send } = useMachine(createRoleMachine());
  const showPermissionsModal = ref(false);
  const showUsersModal = ref(false);
  const selectedRole = ref<Role | null>(null);
  const selectedRolePermissions = ref<Permission[]>([]);
  const userSearchQuery = ref('');
  const selectedUsers = ref<string[]>([]);
  const users = ref<any[]>([]);

  const filteredUsers = computed(() => {
    if (!userSearchQuery.value) return users.value;
    const query = userSearchQuery.value.toLowerCase();
    return users.value.filter(user => 
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  const isCurrentState = (stateName: "idle" | "loading" | "creating" | "editing" | "deleting" | "error") => 
    state.value.matches(stateName);

  const raiseEvent = (event: string, data?: any) => {
    send({ type: event, ...data });
  };

  const openPermissionsModal = async (role: Role) => {
    selectedRole.value = role;
    try {
      const permissions = await roleStore.getRolePermissions(role._id);
      selectedRolePermissions.value = permissions;
      showPermissionsModal.value = true;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const openUsersModal = async (role: Role) => {
    selectedRole.value = role;
    try {
      const roleUsers = await roleStore.getRoleUsers(role._id);
      users.value = roleUsers;
      showUsersModal.value = true;
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const assignUsers = async () => {
    if (!selectedRole.value || !selectedUsers.value.length) return;
    try {
      await roleStore.assignRoleToUsers(selectedRole.value._id, selectedUsers.value);
      showUsersModal.value = false;
      selectedUsers.value = [];
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to assign users:', error);
    }
  };

  const removeUsers = async () => {
    if (!selectedRole.value || !selectedUsers.value.length) return;
    try {
      await roleStore.removeRoleFromUsers(selectedRole.value._id, selectedUsers.value);
      showUsersModal.value = false;
      selectedUsers.value = [];
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to remove users:', error);
    }
  };

  const duplicateRole = async (role: Role) => {
    const newName = prompt('Enter new role name:', `${role.name} (Copy)`);
    if (!newName) return;
    try {
      await roleStore.duplicateRole(role._id, newName);
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to duplicate role:', error);
    }
  };

  const editRole = (role: Role) => {
    raiseEvent('EDIT', { id: role._id });
  };

  const deleteRole = (role: Role) => {
    raiseEvent('DELETE', { id: role._id });
  };

  const confirmDelete = () => {
    raiseEvent('CONFIRM_DELETE');
  };

  const addPermission = () => {
    const permissions = state.value.context.formData.permissions || [];
    permissions.push({ resource: '', actions: [] });
    raiseEvent('UPDATE_FORM', { permissions });
  };

  const removePermission = (index: number) => {
    const permissions = [...state.value.context.formData.permissions];
    permissions.splice(index, 1);
    raiseEvent('UPDATE_FORM', { permissions });
  };

  const saveRole = () => {
    raiseEvent('SAVE');
  };

  return {
    state,
    showPermissionsModal,
    showUsersModal,
    selectedRole,
    selectedRolePermissions,
    userSearchQuery,
    selectedUsers,
    users,
    filteredUsers,
    isCurrentState,
    raiseEvent,
    openPermissionsModal,
    openUsersModal,
    assignUsers,
    removeUsers,
    duplicateRole,
    editRole,
    deleteRole,
    confirmDelete,
    addPermission,
    removePermission,
    saveRole
  };
} 