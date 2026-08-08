export const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
        month: '2-digit',
        day: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
};

export const fmt = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD" });