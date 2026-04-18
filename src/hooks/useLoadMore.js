import { useState } from 'react';

export const useLoadMore = (initialCount = 3, loadCount = 3, dataLength = 0) => {
    const safeInitialCount = Math.max(0, Number(initialCount) || 0);
    const safeLoadCount = Math.max(1, Number(loadCount) || 1);
    const [requestedCount, setRequestedCount] = useState(safeInitialCount);

    const handleLoadMore = () => {
        setRequestedCount((previousCount) => previousCount + safeLoadCount);
    };

    const visibleCount = Math.min(
        Math.max(requestedCount, Math.min(safeInitialCount, dataLength)),
        dataLength
    );
    const hasMore = visibleCount < dataLength;

    return { visibleCount, handleLoadMore, hasMore };
};
