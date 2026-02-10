const Skeleton = ({ className }) => {
    return (
        <div className={`animate-pulse bg-corporate-sidebar ${className}`}></div>
    );
};

export const TableSkeleton = ({ rows = 5 }) => (
    <div className="w-full">
        {[...Array(rows)].map((_, i) => (
            <div key={i} className="flex space-x-4 mb-4 p-4 border border-corporate-border bg-corporate-bg">
                <Skeleton className="h-10 w-10" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-3 w-1/4" />
                </div>
            </div>
        ))}
    </div>
);

export const CardSkeleton = ({ count = 4 }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(count)].map((_, i) => (
             <div key={i} className="p-6 border border-corporate-border bg-corporate-bg space-y-3">
                 <Skeleton className="h-3 w-1/3" />
                 <Skeleton className="h-8 w-1/2" />
             </div>
        ))}
    </div>
);

export default Skeleton;
