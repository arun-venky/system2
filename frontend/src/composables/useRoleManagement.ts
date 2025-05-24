import { ref, computed } from 'vue';
import type { Role, Permission } from '@/store/models';
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
  const selectedResource = ref('');

  const filteredUsers = computed(() => {
    if (!userSearchQuery.value) return [];
    const query = userSearchQuery.value.toLowerCase();
    const assignedUserIds = new Set(users.value.map(u => u._id));
    return users.value.filter(user => 
      !assignedUserIds.has(user._id) &&
      (user.username.toLowerCase().includes(query) ||
       user.email.toLowerCase().includes(query))
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
      const response = await roleStore.getRolePermissions(role._id);
      selectedRolePermissions.value = response.permissions || [];
      showPermissionsModal.value = true;
    } catch (error) {
      console.error('Failed to fetch permissions:', error);
    }
  };

  const openUsersModal = async (role: Role) => {
    selectedRole.value = role;
    try {
      const response = await roleStore.getRoleUsers(role._id);
      users.value = response.users || [];
      selectedUsers.value = [];
      userSearchQuery.value = '';
      showUsersModal.value = true;
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const assignUsers = async () => {
    if (!selectedRole.value || !selectedUsers.value.length) return;
    try {
      await roleStore.assignRoleToUsers(selectedRole.value._id, selectedUsers.value);
      const response = await roleStore.getRoleUsers(selectedRole.value._id);
      users.value = response.users || [];
      selectedUsers.value = [];
    } catch (error) {
      console.error('Failed to assign users:', error);
    }
  };

  const removeUserFromRole = async (user: any) => {
    if (!selectedRole.value) return;
    try {
      await roleStore.removeRoleFromUsers(selectedRole.value._id, [user._id]);
      users.value = users.value.filter(u => u._id !== user._id);
    } catch (error) {
      console.error('Failed to remove user:', error);
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

  const savePermissions = async () => {
    if (!selectedRole.value) return;
    try {
      await roleStore.updateRolePermissions(selectedRole.value._id, selectedRolePermissions.value);
      showPermissionsModal.value = false;
      raiseEvent('FETCH');
    } catch (error) {
      console.error('Failed to save permissions:', error);
    }
  };

  const addResource = () => {
    if (!selectedResource.value) return;
    selectedRolePermissions.value.push({
      resource: selectedResource.value,
      actions: []
    });
    selectedResource.value = '';
  };

  const removeResource = (index: number) => {
    selectedRolePermissions.value.splice(index, 1);
  };

  const addAction = (permission: Permission, index: number) => {
    if (!permission.newAction?.trim()) return;
    if (!permission.actions.includes(permission.newAction)) {
      permission.actions.push(permission.newAction);
    }
    permission.newAction = '';
  };

  const removeAction = (permission: Permission, action: string, index: number) => {
    const actionIndex = permission.actions.indexOf(action);
    if (actionIndex > -1) {
      permission.actions.splice(actionIndex, 1);
    }
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
    removeUserFromRole,
    removeUsers,
    duplicateRole,
    editRole,
    deleteRole,
    confirmDelete,
    addPermission,
    removePermission,
    saveRole,
    savePermissions,
    addResource,
    removeResource,
    addAction,
    removeAction
  };
} 