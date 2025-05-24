import { User } from '@/store/models';
import { useUserStore } from '../store/user.store';

export function useUserSecurity() {
  const userStore = useUserStore();
  const verifyEmail = async (user: User) => {
    try {
      await userStore.verifyEmail(user._id);
      return true;
    } catch (error) {
      console.error('Failed to verify email:', error);
      return false;
    }
  };

  // const resetPassword = async (user: User) => {
  //   try {
  //     await userStore.resetPassword(user._id);
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to reset password:', error);
  //     return false;
  //   }
  // };

  // const enable2FA = async (user: User) => {
  //   try {
  //     await userStore.enable2FA(user._id);
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to enable 2FA:', error);
  //     return false;
  //   }
  // };

  // const disable2FA = async (user: User) => {
  //   try {
  //     await userStore.disable2FA(user._id);
  //     return true;
  //   } catch (error) {
  //     console.error('Failed to disable 2FA:', error);
  //     return false;
  //   }
  // };

  return {
    verifyEmail,
    // resetPassword,
    // enable2FA,
    // disable2FA
  };
} 