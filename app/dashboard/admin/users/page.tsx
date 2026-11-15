import UsersPage from '@/lib/users';
import React from 'react';

const AddUserPage = async () => {

   const User = await UsersPage()
   console.log(User)

    return (
        <div>
            
        </div>
    );
};

export default AddUserPage;