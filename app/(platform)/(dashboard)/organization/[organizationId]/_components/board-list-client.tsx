"use client";

import { useEffect, useState } from "react";
import Pusher from "pusher-js";
import { FormPopover } from "@/components/form/form-popover";
import { Hint } from "@/components/hint";
import { HelpCircle, User2 } from "lucide-react";
import Link from "next/link";
import { useAction } from "@/hooks/use-action";
import { getBoards } from "@/actions/get-boards";
import { toast } from "sonner";

interface BoardListClientProps {
	initialBoards: Array<{ id: string; title: string; imageThumbUrl: string }>;
	orgId: string;
}

export const BoardListClient = ({
	initialBoards,
	orgId,
}: BoardListClientProps) => {
	const [boards, setBoards] = useState(initialBoards);

	const { execute } = useAction(getBoards);

	useEffect(() => {
		const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
			cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
		});

		const channel = pusher.subscribe(`organization-${orgId}-channel`);

		channel.bind("board-deleted", async () => {
			const result = await execute({});
			if (result.data) {
				setBoards(result.data);
			} else if (result.error) {
				toast.error("Failed to refresh boards");
			}
		});

		channel.bind("board-created", async () => {
			const result = await execute({});
			if (result.data) {
				setBoards(result.data);
			} else if (result.error) {
				toast.error("Failed to refresh boards");
			}
		});

		channel.bind("board-updated", async () => {
			const result = await execute({});
			if (result.data) {
				setBoards(result.data);
			} else if (result.error) {
				toast.error("Failed to refresh boards");
			}
		});

		return () => {
			channel.unbind_all();
			channel.unsubscribe();
		};
	}, [orgId, execute]);

	return (
		<div className="space-y-4">
			<div className="flex items-center font-semibold text-neutral-700">
				<User2 className="h-6 w-6 mr-2" />
				Your boards
			</div>
			<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
				{boards.map((board) => (
					<Link
						href={`/board/${board.id}`}
						key={board.id}
						style={{
							backgroundImage: `url(${board.imageThumbUrl})`,
						}}
						className="group relative aspect-video bg-no-repeat bg-center bg-cover bg-sky-700 rounded-sm h-full w-full p-2 overflow-hidden"
					>
						<div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition" />
						<p className="relative font-semibold text-white">
							{board.title}
						</p>
					</Link>
				))}
				<FormPopover sideOffset={10} side="right">
					<div
						className="aspect-video relative h-full w-full bg-muted rounded-sm flex flex-col gap-y-1 items-center justify-center hover:opacity-75 transition"
						role="button"
					>
						<p className="text-sm">Create new board</p>
						<span className="text-xs">5 remaining</span>
						<Hint
							sideOffset={40}
							description={`Free Workspaces can have up to 5 open boards. For unlimited boards upgrade this workspace. `}
						>
							<HelpCircle className="absolute bottom-2 right-2 h-[14px] w-[14px]" />
						</Hint>
					</div>
				</FormPopover>
			</div>
		</div>
	);
};
