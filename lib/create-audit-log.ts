import { auth, currentUser } from "@clerk/nextjs/server";
import { ACTION, ENTITY_TYPE } from "@prisma/client";
import { db } from "./db";

interface Props {
	entityId: string;
	entityType: ENTITY_TYPE;
	entityTitle: string;
	action: ACTION;
}

export const createAuditLog = async (props: Props) => {
	try {
		const { orgId } = auth();

		const user = await currentUser();

		if (!user || !orgId) {
			throw new Error("User not found");
		}

		const { entityId, entityType, entityTitle, action } = props;

		const userName =
			user.firstName && user.lastName
				? `${user.firstName} ${user.lastName}`
				: user.emailAddresses[0].emailAddress.split("@")[0];

		await db.auditLog.create({
			data: {
				orgId,
				entityId,
				entityType,
				entityTitle,
				action,
				userId: user.id,
				userImage: user?.imageUrl,
				userName,
			},
		});
	} catch (error) {
		console.log("[AUDIT LOG ERROR]", error);
	}
};
