// Authentication state checker
class AuthCheck {
    constructor() {
        this.currentUser = null;
        this.userRole = null;
        this.init();
    }

    async init() {
        // Check existing session
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (session) {
            this.currentUser = session.user;
            await this.getUserRole();
        }
        
        // Listen for auth changes
        supabaseClient.auth.onAuthStateChange(async (event, session) => {
            if (session) {
                this.currentUser = session.user;
                await this.getUserRole();
            } else {
                this.currentUser = null;
                this.userRole = null;
            }
        });
    }

    async getUserRole() {
        if (!this.currentUser) return null;
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('role')
                .eq('auth_id', this.currentUser.id)
                .single();
            
            if (error) throw error;
            
            this.userRole = data.role;
            return data.role;
        } catch (error) {
            console.error('Error getting user role:', error);
            return null;
        }
    }

    async requireAuth(redirectTo = '/auth/role-select.html') {
        const { data: { session } } = await supabaseClient.auth.getSession();
        
        if (!session) {
            window.location.href = redirectTo;
            return false;
        }
        
        return true;
    }

    async requireRole(requiredRole, redirectTo = '/auth/role-select.html') {
        const isAuthenticated = await this.requireAuth(redirectTo);
        
        if (!isAuthenticated) return false;
        
        if (this.userRole !== requiredRole) {
            // Redirect based on role
            switch (this.userRole) {
                case 'student':
                    window.location.href = '/student/student-dashboard.html';
                    break;
                case 'developer':
                    window.location.href = '/developer/developer-dashboard.html';
                    break;
                case 'admin':
                    window.location.href = '/admin/admin-dashboard.html';
                    break;
                default:
                    window.location.href = redirectTo;
            }
            return false;
        }
        
        return true;
    }

    async getCurrentUserId() {
        if (!this.currentUser) return null;
        
        try {
            const { data, error } = await supabaseClient
                .from('users')
                .select('id')
                .eq('auth_id', this.currentUser.id)
                .single();
            
            if (error) throw error;
            
            return data.id;
        } catch (error) {
            console.error('Error getting user ID:', error);
            return null;
        }
    }

    async getProfileId() {
        if (!this.currentUser || !this.userRole) return null;
        
        const userId = await this.getCurrentUserId();
        if (!userId) return null;
        
        try {
            let tableName = '';
            switch (this.userRole) {
                case 'student':
                    tableName = 'student_profiles';
                    break;
                case 'developer':
                    tableName = 'developer_profiles';
                    break;
                case 'admin':
                    tableName = 'admin_profiles';
                    break;
            }
            
            const { data, error } = await supabaseClient
                .from(tableName)
                .select('id')
                .eq('user_id', userId)
                .single();
            
            if (error) throw error;
            
            return data.id;
        } catch (error) {
            console.error('Error getting profile ID:', error);
            return null;
        }
    }
}

// Initialize auth checker
const authCheck = new AuthCheck();
window.authCheck = authCheck;
