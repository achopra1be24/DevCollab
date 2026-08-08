const client = require("../config/db");

// Send Invitation
async function sendInvitation(workspaceId, senderId, email) {

    // Find user by email
    const user = await client.query(

        `
        SELECT id
        FROM users
        WHERE email = $1
        `,

        [email]

    );

    if (user.rows.length === 0) {

        throw new Error("User not found");

    }

    const receiverId = user.rows[0].id;

    // Prevent inviting yourself
    if (String(receiverId) === String(senderId)) {

        throw new Error("You cannot invite yourself");

    }

    // Prevent duplicate pending invitation
    const existingInvitation = await client.query(

        `
        SELECT id
        FROM invitations
        WHERE workspace_id = $1
        AND receiver_id = $2
        AND status = 'pending'
        `,

        [workspaceId, receiverId]

    );

    if (existingInvitation.rows.length > 0) {

        throw new Error("Invitation already sent");

    }

    const result = await client.query(

        `
        INSERT INTO invitations
        (workspace_id, sender_id, receiver_id, status)
        VALUES ($1, $2, $3, 'pending')
        RETURNING *
        `,

        [workspaceId, senderId, receiverId]

    );

    return result.rows[0];

}
// Get Pending Invitations
async function getInvitations(receiverId) {

    const result = await client.query(

        `
        SELECT
            invitations.id,
            invitations.workspace_id,
            workspaces.name AS workspace_name,
            users.name AS sender_name,
            users.email AS sender_email,
            invitations.created_at

        FROM invitations

        JOIN users
        ON invitations.sender_id = users.id

        JOIN workspaces
        ON invitations.workspace_id = workspaces.id

        WHERE
            receiver_id = $1
            AND status = 'pending'

        ORDER BY invitations.created_at DESC
        `,

        [receiverId]

    );

    return result.rows;

}

// Accept Invitation
async function acceptInvitation(invitationId) {

    const invitation = await client.query(
`
    UPDATE invitations
    SET status = 'accepted'
    WHERE id = $1
      AND status = 'pending'
    RETURNING *
    `,

        [invitationId]

    );

    if (invitation.rows.length === 0) {

        return null;

    }

    const data = invitation.rows[0];

    await client.query(

        `
        INSERT INTO workspace_members
        (workspace_id, user_id)

        VALUES ($1,$2)
         ON CONFLICT (workspace_id, user_id)
         DO NOTHING
        `,

        [data.workspace_id, data.receiver_id]

    );

    return data;

}

// Reject Invitation
async function rejectInvitation(invitationId) {

    await client.query(

        `
        DELETE FROM invitations
        WHERE id=$1
        `,

        [invitationId]

    );

}

module.exports = {

    sendInvitation,

    getInvitations,

    acceptInvitation,

    rejectInvitation

};