const invitationModel = require("../models/invitationModel");

// Send Invitation
async function sendInvitation(req, res) {

    try {

        const workspaceId = req.params.workspaceId;

        const senderId = req.user.id;

        const { email } = req.body;

        const invitation = await invitationModel.sendInvitation(

            workspaceId,

            senderId,

            email

        );
        // Get Socket.IO instance
        const io = req.app.get("io");

        // Send live notification to the invited user
        io.to(`user-${invitation.receiver_id}`).emit(

        "new-invitation", invitation);

        res.status(201).json(invitation);

    }

    catch (error) {

    console.log(error);

    if (
        error.message === "User not found" ||
        error.message === "You cannot invite yourself" ||  error.message === "Invitation already sent"
    ) {

        return res.status(400).send(error.message);

    }

    res.status(500).send("Server Error");

}

}

// Get My Invitations
async function getInvitations(req, res) {

    try {

        const receiverId = req.user.id;

        const invitations = await invitationModel.getInvitations(

            receiverId

        );

        res.json(invitations);

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Server Error");

    }

}

// Accept Invitation
async function acceptInvitation(req, res) {

    try {

        const invitationId = req.params.id;

        const invitation = await invitationModel.acceptInvitation(

            invitationId

        );

        if (!invitation) {

            return res.status(404).send("Invitation Not Found");

        }
        // Notify the user to refresh their workspace list
const io = req.app.get("io");

io.to(`user-${invitation.receiver_id}`).emit(

    "workspace-updated"

);

        res.json({message : "Invitation Accepted",
                                    invitation});

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Server Error");

    }

}

// Reject Invitation
async function rejectInvitation(req, res) {

    try {

        const invitationId = req.params.id;

        await invitationModel.rejectInvitation(

            invitationId

        );

        res.send("Invitation Rejected");

    }

    catch (error) {

        console.log(error);

        res.status(500).send("Server Error");

    }

}

module.exports = {

    sendInvitation,

    getInvitations,

    acceptInvitation,

    rejectInvitation

};