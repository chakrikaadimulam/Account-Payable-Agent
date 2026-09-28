import React from "react";
import useScrollReveal from "../../hooks/useScrollReveal";

export function ScrollRevealSection({ children, className = "", delay = 0 }) {
    const [ref, isVisible] = useScrollReveal();

    return (
        <div
            ref={ref}
            className={`scroll-reveal ${isVisible ? "reveal-visible" : ""} ${className}`}
            style={{ transitionDelay: `${delay}ms` }}
        >
            {children}
        </div>
    );
}

export default ScrollRevealSection;
