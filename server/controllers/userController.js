const { createUserClient } = require('../config/supabase');

exports.updateUserRole = async (req, res, next) => {
  const { id } = req.params;
  const { role } = req.body;
  const userClient = createUserClient(req.token);

  // Verify the requester is an admin
  const { data: currentUser, error: userError } = await userClient
    .from('users')
    .select('role')
    .eq('id', req.user.id)
    .single();

  if (userError || currentUser?.role !== 'admin') {
    return res.status(403).json({ error: 'Only admins can change user roles' });
  }

  // Update the target user's role
  const { data, error } = await userClient
    .from('users')
    .update({ role })
    .eq('id', id)
    .select()
    .single();

  if (error) return next(error);
  res.json(data);
};
