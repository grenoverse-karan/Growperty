import pb from '@/lib/pocketbaseClient';
import { normalizeEmail } from '@/lib/emailUtils.js';

let recoveryAttempted = false;

export const AdminRecoveryService = {
  init: async (targetEmail = 'thegrowperty@gmail.com') => {
    if (recoveryAttempted) {
      return { success: true, message: 'Super-admin setup complete' };
    }

    const isEnabled = import.meta.env.VITE_ENABLE_ADMIN_RECOVERY === 'true';

    if (!isEnabled) {
      console.log('Admin recovery disabled (ENABLE_ADMIN_RECOVERY=false)');
      return { success: true, message: 'Recovery disabled' };
    }

    console.log('Admin recovery enabled (ENABLE_ADMIN_RECOVERY=true)');
    const normalizedEmail = normalizeEmail(targetEmail);
    const tempPassword = 'TempPassword123!';

    try {
      const result = await pb.collection('admins').getList(1, 1, {
        filter: `email="${normalizedEmail}"`,
        $autoCancel: false
      });

      if (result.items && result.items.length > 0) {
        console.log('Admin already exists, skipping creation');
      } else {
        await pb.collection('admins').create({
          email: normalizedEmail,
          password: tempPassword,
          passwordConfirm: tempPassword,
          name: 'Super Admin',
          role: 'super-admin',
          isActive: true,
          requiresPasswordChange: true
        }, { $autoCancel: false });
        console.log('Admin created successfully');
      }
      
      recoveryAttempted = true;
      return { success: true, message: 'Super-admin setup complete' };
    } catch (error) {
      console.error(`Admin recovery error: ${error.message}`);
      return { success: false, message: 'Super-admin setup failed' };
    }
  }
};