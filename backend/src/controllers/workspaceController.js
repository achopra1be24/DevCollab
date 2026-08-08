const client = require("../config/db");

// 1. Create Workspace
async function createWorkspace(req, res) {

    try {

        const { name, description } = req.body;

        if (!name) {
            return res.status(400).send("Workspace name is required");
        }

        const ownerId = req.user.id;

        const result = await client.query(
            `
            INSERT INTO workspaces
            (name, description, owner_id)

            VALUES ($1, $2, $3)

            RETURNING id
            `,
            [
                name,
                description,
                ownerId
            ]
        );

        const workspaceId = result.rows[0].id;

        await client.query(
            `
            INSERT INTO workspace_members
            (workspace_id, user_id, role)

            VALUES ($1,$2,'Admin')
            `,
            [
                workspaceId,
                ownerId
            ]
        );

        res.status(201).send("Workspace Created Successfully");

    } catch (error) {

        console.log(error);
        res.status(500).send("Internal Server Error");

    }

}

// 2. Get Workspaces
async function getWorkspaces(req, res) {

    try {

        const result = await client.query(
            `
            SELECT

                w.*,
                wm.role

            FROM workspaces w

            JOIN workspace_members wm

            ON w.id = wm.workspace_id

            WHERE wm.user_id = $1
            `,
            [
                req.user.id
            ]
        );

        res.json(result.rows);

    } catch (error) {

        console.log(error);
        res.status(500).send("Internal Server Error");

    }

}

// 3. Get Workspace Members
async function getWorkspaceMembers(req, res) {

    try {

        const workspaceId = req.params.workspaceId;

        // Verify user belongs to workspace
        const member = await client.query(
            `
            SELECT *

            FROM workspace_members

            WHERE workspace_id = $1

            AND user_id = $2
            `,
            [
                workspaceId,
                req.user.id
            ]
        );

        if (member.rows.length === 0) {
            return res.status(403).send("Access Denied");
        }

        // Fetch all members
        const members = await client.query(
            `
            SELECT

                users.id,
                users.name,
                users.email,
                workspace_members.role

            FROM workspace_members

            JOIN users

            ON workspace_members.user_id = users.id

            WHERE workspace_members.workspace_id = $1

            ORDER BY users.name
            `,
            [
                workspaceId
            ]
        );

        res.json({
            members: members.rows,
            myRole: member.rows[0].role
        });

    } catch (error) {

        console.log(error);
        res.status(500).send("Internal Server Error");

    }

}

// 4. Remove Member
async function removeMember(req, res) {

    try {

        const workspaceId = req.params.workspaceId;

        const memberId = req.params.userId;

        const currentUserId = req.user.id;

        const admin = await client.query(
            `
            SELECT role

            FROM workspace_members

            WHERE workspace_id = $1

            AND user_id = $2
            `,
            [
                workspaceId,
                currentUserId
            ]
        );

        if (admin.rows.length === 0) {
            return res.status(403).send("Access Denied");
        }

        if (admin.rows[0].role !== "Admin") {
            return res.status(403).send("Only Admin can remove members");
        }

        if (String(memberId) === String(currentUserId)) {
            return res.status(400).send("Admin cannot remove himself");
        }

        const result = await client.query(
            `
            DELETE FROM workspace_members

            WHERE workspace_id = $1

            AND user_id = $2

            RETURNING *
            `,
            [
                workspaceId,
                memberId
            ]
        );

        if (result.rows.length === 0) {
            return res.status(404).send("Member not found");
        }

        res.send("Member Removed Successfully");

    } catch (error) {

        console.log(error);
        res.status(500).send("Internal Server Error");

    }

}

module.exports = {

    createWorkspace,
    getWorkspaces,
    getWorkspaceMembers,
    removeMember

};