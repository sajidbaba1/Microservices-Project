import { useState, useEffect } from 'react';
import { analyticsApi } from '../lib/api';

export function useAnalytics() {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const response = await analyticsApi.get('/analytics/stats');
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        // Poll every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    return { data, loading, error, refresh: fetchStats };
}
