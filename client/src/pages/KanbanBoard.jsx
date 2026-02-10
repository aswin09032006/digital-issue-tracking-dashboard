import {
    closestCorners,
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from '../api/axios';
import socket from '../api/socket';
import { useNotification } from '../context/NotificationContext';
import { useTheme } from '../context/ThemeContext';

// Sortable Item Component (The Card)
function SortableItem({ id, issue }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const { compact, realTime } = useTheme();

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (p) => {
      switch(p) {
          case 'High': return 'bg-red-100 text-red-800';
          case 'Medium': return 'bg-blue-100 text-blue-800';
          default: return 'bg-gray-100 text-gray-800';
      }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-corporate-bg border border-corporate-border shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group ${compact ? 'p-2 mb-1' : 'p-4 mb-3'}`}
    >
      <Link to={`/issues/${issue._id}`} className="block no-underline">
          <div className="flex justify-between items-start mb-2">
               <span className={`text-xs px-2 py-0.5 font-medium uppercase tracking-wider ${getPriorityColor(issue.priority)}`}>
                   {issue.priority}
               </span>
               <span className="text-xs text-corporate-muted font-mono">
                   {new Date(issue.createdAt).toLocaleDateString()}
               </span>
          </div>
          <h3 className={`font-medium text-corporate-text mb-2 group-hover:text-corporate-accent transition-colors truncate ${compact ? 'text-xs' : 'text-sm'}`}>
              {issue.title}
          </h3>
          <div className={`flex justify-between items-center text-xs text-corporate-muted border-t border-corporate-border ${compact ? 'mt-1 pt-1' : 'mt-3 pt-3'}`}>
              <span>{issue.category}</span>
              <span className="bg-corporate-sidebar px-1.5 py-0.5 border border-corporate-border">
                  {issue.assignedTo || 'Unassigned'}
              </span>
          </div>
      </Link>
    </div>
  );
}

// Droppable Column Component
function Column({ id, title, issues }) {
    return (
        <div className="flex-1 min-w-[300px] bg-corporate-sidebar border border-corporate-border flex flex-col h-full max-h-full">
            <div className={`p-4 border-b border-corporate-border font-medium uppercase tracking-widest text-xs flex justify-between items-center bg-corporate-bg
                ${title === 'Open' ? 'border-t-4 border-t-red-500' : ''}
                ${title === 'In Progress' ? 'border-t-4 border-t-yellow-500' : ''}
                ${title === 'Resolved' ? 'border-t-4 border-t-green-500' : ''}
            `}>
                <span>{title}</span>
                <span className="bg-corporate-sidebar px-2 py-1 text-corporate-text border border-corporate-border">{issues.length}</span>
            </div>
            
            <div className="flex-1 p-4 overflow-y-auto">
                <SortableContext 
                    id={id} 
                    items={issues.map(i => i._id)} 
                    strategy={verticalListSortingStrategy}
                >
                    {issues.map((issue) => (
                        <SortableItem key={issue._id} id={issue._id} issue={issue} />
                    ))}
                </SortableContext>
                {issues.length === 0 && (
                    <div className="text-center py-8 text-corporate-muted text-sm italic border-2 border-dashed border-corporate-border">
                        No issues
                    </div>
                )}
            </div>
        </div>
    );
}

const KanbanBoard = () => {
    const [issues, setIssues] = useState([]);
    const [loading, setLoading] = useState(true);
    const notify = useNotification();

    // Sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 5,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const [activeId, setActiveId] = useState(null);

    const fetchIssues = async () => {
        try {
            const { data } = await axios.get('/issues');
            // Handle pagination response { issues: [], ... } or legacy []
            const issuesData = Array.isArray(data) ? data : data.issues || [];
            setIssues(issuesData);
        } catch (error) {
            console.error(error);
            notify.error("Failed to load issues");
        } finally {
            setLoading(false);
        }
    };

    const { compact, realTime } = useTheme();

    // ...

    useEffect(() => {
        fetchIssues();
        
        if (realTime) {
            socket.on('issueUpdated', (updatedIssue) => {
                // Simple refresh or clever splice
                // For simplicity and correctness with filters, let's refresh or update state
                setIssues(prev => {
                    const index = prev.findIndex(i => i._id === updatedIssue._id);
                    if (index !== -1) {
                        const newIssues = [...prev];
                        newIssues[index] = updatedIssue;
                        return newIssues;
                    }
                    return [updatedIssue, ...prev];
                });
            });
        }

        return () => socket.off('issueUpdated');
    }, [realTime]);

    // Filter issues by status
    const openIssues = issues.filter(i => i.status === 'Open');
    const inProgressIssues = issues.filter(i => i.status === 'In Progress');
    const resolvedIssues = issues.filter(i => i.status === 'Resolved');

    const handleDragStart = (event) => {
        setActiveId(event.active.id);
    };

    const handleDragEnd = async (event) => {
        const { active, over } = event;
        setActiveId(null);

        if (!over) return;

        const activeIssueId = active.id;
        // The over.id could be a container ID (Open, In Progress, Resolved) OR an item ID
        // If it's an item ID, we need to find which container it belongs to.
        // However, SortableContext id needs to match container id?
        // Actually, dnd-kit is flexible. 
        // Simplest strategy: The Droppable Containers are the columns.
        // But SortableContext requires items. 
        // Let's assume user drops ONTO a column or ONTO an item in a column.
        
        let newStatus = null;
        
        // Check if dropped on a container directly
        if (['Open', 'In Progress', 'Resolved'].includes(over.id)) {
            newStatus = over.id;
        } else {
            // Dropped on an item? Find that item's status
            const overIssue = issues.find(i => i._id === over.id);
            if (overIssue) {
                newStatus = overIssue.status;
            }
        }

        if (newStatus) {
            const activeIssue = issues.find(i => i._id === activeIssueId);
            if (activeIssue && activeIssue.status !== newStatus) {
                // Optimistic Update
                setIssues(issues.map(i => 
                    i._id === activeIssueId ? { ...i, status: newStatus } : i
                ));
                
                try {
                    await axios.put(`/issues/${activeIssueId}/status`, { status: newStatus });
                    notify.success(`Moved to ${newStatus}`);
                } catch (error) {
                    notify.error("Failed to update status");
                    // Revert
                    setIssues(issues.map(i => 
                        i._id === activeIssueId ? { ...i, status: activeIssue.status } : i
                    ));
                }
            }
        }
    };

    if (loading) return <div className="p-8 text-corporate-muted">Loading board...</div>;

    const activeIssue = activeId ? issues.find(i => i._id === activeId) : null;

    return (
        <div className="h-[calc(100vh-100px)] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6 px-1">
                <h2 className="text-2xl font-medium text-corporate-text tracking-tight uppercase">Kanban Board</h2>
                <button onClick={fetchIssues} className="text-sm text-corporate-accent hover:underline">Refresh</button>
            </div>
            
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            >
                <div className="flex gap-6 h-full overflow-x-auto pb-4">
                    <Column id="Open" title="Open" issues={openIssues} />
                    <Column id="In Progress" title="In Progress" issues={inProgressIssues} />
                    <Column id="Resolved" title="Resolved" issues={resolvedIssues} />
                </div>

                <DragOverlay>
                    {activeIssue ? (
                        <div className="bg-corporate-bg p-4 border border-corporate-accent shadow-xl rotate-3 opacity-90 cursor-grabbing w-[300px]">
                            <h3 className="font-medium text-corporate-text">{activeIssue.title}</h3>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>
        </div>
    );
};

export default KanbanBoard;
