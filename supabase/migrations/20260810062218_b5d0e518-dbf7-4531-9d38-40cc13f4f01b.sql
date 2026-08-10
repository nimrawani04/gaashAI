insert into public.user_roles (user_id, role)
values ('f3d3bc0a-5152-49a6-b7c1-7732ea92d838', 'admin')
on conflict (user_id, role) do nothing;