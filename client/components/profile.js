const ProfileComponent = {
    render: () => {
        const user = JSON.parse(localStorage.getItem('lifeos_user')) || {};
        return `
            <div class="glass-card">
                <h1>👤 My Profile</h1>
                <div class="card">
                    <h3>User Info</h3>
                    <p><strong>Username:</strong> ${user.username}</p>
                    <p><strong>Role:</strong> ${user.role}</p>

                    <label>Full Name</label>
                    <input type="text" id="profile-name" value="${user.full_name || ''}">
                    <label>Email</label>
                    <input type="email" id="profile-email" value="${user.email || ''}">
                    <label>Bio</label>
                    <textarea id="profile-bio" style="width:100%; background:transparent; color:white; border:1px solid rgba(255,255,255,0.1); padding:0.5rem; border-radius:8px;">${user.bio || ''}</textarea>
                    <button onclick="ProfileComponent.updateProfile()">Save Profile</button>
                </div>

                <div class="card" style="margin-top: 2rem;">
                    <h3>Change Password</h3>
                    <input type="password" id="current-password" placeholder="Current Password">
                    <input type="password" id="new-password" placeholder="New Password">
                    <input type="password" id="confirm-password" placeholder="Confirm New Password">
                    <button onclick="ProfileComponent.changePassword()">Update Password</button>
                </div>
            </div>
        `;
    },
    updateProfile: async () => {
        const full_name = document.getElementById('profile-name').value;
        const email = document.getElementById('profile-email').value;
        const bio = document.getElementById('profile-bio').value;

        try {
            const res = await API.updateProfile({ full_name, email, bio });
            if (res.success) {
                const user = JSON.parse(localStorage.getItem('lifeos_user'));
                user.full_name = full_name;
                user.email = email;
                user.bio = bio;
                localStorage.setItem('lifeos_user', JSON.stringify(user));
                alert('Profile updated');
                renderCurrentSection();
            }
        } catch (e) {
            alert('Update failed');
        }
    },
    changePassword: async () => {
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (!currentPassword || !newPassword || newPassword !== confirmPassword) {
            alert('Passwords do not match or are empty');
            return;
        }

        try {
            const res = await API.changePassword(currentPassword, newPassword);
            if (res.message) alert(res.message);
            if (res.success) {
                document.getElementById('current-password').value = '';
                document.getElementById('new-password').value = '';
                document.getElementById('confirm-password').value = '';
            }
        } catch (e) {
            alert('Failed to change password');
        }
    }
};
