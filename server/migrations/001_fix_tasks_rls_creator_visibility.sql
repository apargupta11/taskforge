-- Run this in the Supabase SQL Editor if tasks are empty on the board but you can open the project.
-- Projects could be visible as creator (created_by) while tasks SELECT only allowed project_members.

DROP POLICY IF EXISTS "Members can view tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Members can insert tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Members can update tasks in their projects" ON tasks;
DROP POLICY IF EXISTS "Members can delete tasks in their projects" ON tasks;

CREATE POLICY "Members can view tasks in their projects" ON tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = tasks.project_id AND p.created_by = auth.uid())
);

CREATE POLICY "Members can insert tasks in their projects" ON tasks FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = tasks.project_id AND p.created_by = auth.uid())
);

CREATE POLICY "Members can update tasks in their projects" ON tasks FOR UPDATE USING (
  EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = tasks.project_id AND p.created_by = auth.uid())
);

CREATE POLICY "Members can delete tasks in their projects" ON tasks FOR DELETE USING (
  EXISTS (SELECT 1 FROM project_members pm WHERE pm.project_id = tasks.project_id AND pm.user_id = auth.uid())
  OR EXISTS (SELECT 1 FROM projects p WHERE p.id = tasks.project_id AND p.created_by = auth.uid())
);
