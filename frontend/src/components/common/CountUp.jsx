import React, { useState, useEffect } from "react";

export function CountUp({ end = 0, duration = 1500, prefix = "", suffix = "", decimals = 0 }) {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime = null;
        const target = Number(end) || 0;

        const animate = (currentTime) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Ease-out cubic formula for smooth deceleration
            const easeOutProgress = 1 - Math.pow(1 - progress, 3);
            const currentCount = easeOutProgress * target;

            setCount(currentCount);

            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }, [end, duration]);

    const formatted = decimals > 0 
        ? count.toFixed(decimals) 
        : Math.round(count).toLocaleString("en-IN");

    return <span>{prefix}{formatted}{suffix}</span>;
}

export default CountUp;
