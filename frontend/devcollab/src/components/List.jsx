import { useState } from "react";
import {
    SortableContext,
    verticalListSortingStrategy
} from "@dnd-kit/sortable";
import { useDroppable } from "@dnd-kit/core";

import CreateTaskModal from "./CreateTaskModal";
import TaskCard from "./TaskCard";

function List({
    list,
    tasks,
    boardId,
    refreshBoard,
    onOpenComments
}) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    const { setNodeRef, isOver } = useDroppable({
        id: String(list.id)
    });

    return (
        <div
            ref={setNodeRef}
            className={`
                w-80
                min-h-[500px]
                flex
                flex-col
                flex-shrink-0
                rounded-3xl
                border
                shadow-md
                transition-all
                duration-300
                p-5
                ${
                    isOver
                        ? "border-indigo-600 bg-indigo-200/90 shadow-lg scale-[1.01]"
                        : "border-slate-500/50 bg-slate-400/70"
                }
            `}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-1">
                <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                    <div>
                        <h2 className="text-xl font-bold text-slate-900">
                            {list.name}
                        </h2>
                        <p className="text-xs font-bold text-slate-700 mt-0.5">
                            {tasks.length} {tasks.length === 1 ? "Task" : "Tasks"}
                        </p>
                    </div>
                </div>

                <button
                    onClick={() => setIsModalOpen(true)}
                    className="
                        w-9
                        h-9
                        rounded-xl
                        bg-white
                        hover:bg-indigo-600
                        hover:text-white
                        text-slate-900
                        border
                        border-slate-500/60
                        text-lg
                        font-bold
                        shadow-sm
                        transition-all
                        flex
                        items-center
                        justify-center
                    "
                >
                    +
                </button>
            </div>

            <SortableContext
                items={tasks.map(task => String(task.id))}
                strategy={verticalListSortingStrategy}
            >
                <div className="flex-1 space-y-4">
                    {tasks.length === 0 && (
                        <div
                            className="
                                border-2
                                border-dashed
                                border-slate-600/60
                                rounded-2xl
                                py-12
                                text-center
                                text-slate-700
                                font-bold
                                text-sm
                                bg-white/50
                            "
                        >
                            📥 Drop Tasks Here
                        </div>
                    )}

                    {tasks.map(task => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            boardId={boardId}
                            onTaskUpdated={refreshBoard}
                            onOpenComments={onOpenComments}
                        />
                    ))}
                </div>
            </SortableContext>

            <CreateTaskModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                listId={list.id}
                boardId={boardId}
                onTaskCreated={refreshBoard}
            />
        </div>
    );
}

export default List;