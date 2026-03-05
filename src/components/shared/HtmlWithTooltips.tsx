"use client";

import React, { useEffect, useRef } from "react";

interface HtmlWithTooltipsProps {
  html: string;
  devMode: boolean;
}

export function HtmlWithTooltips({ html, devMode }: HtmlWithTooltipsProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!devMode || !containerRef.current) return;

    // Find all elements with data-test-id
    const elements = containerRef.current.querySelectorAll("[data-test-id]");
    
    elements.forEach((element) => {
      const testId = element.getAttribute("data-test-id");
      const className = element.getAttribute("class") || "";
      
      // Add hover effect to show it's interactive in dev mode
      (element as HTMLElement).style.outline = "1px dashed rgba(59, 130, 246, 0.3)";
      (element as HTMLElement).style.cursor = "help";
      
      // Add title attribute for native tooltip with styles info
      const styleInfo = `ID: ${testId}\nClasses: ${className}`;
      element.setAttribute("title", styleInfo);
      
      // Add hover listeners for enhanced tooltip
      element.addEventListener("mouseenter", () => {
        (element as HTMLElement).style.outline = "2px solid rgba(59, 130, 246, 0.6)";
      });
      
      element.addEventListener("mouseleave", () => {
        (element as HTMLElement).style.outline = "1px dashed rgba(59, 130, 246, 0.3)";
      });
    });

    return () => {
      // Cleanup
      elements.forEach((element) => {
        (element as HTMLElement).style.outline = "";
        (element as HTMLElement).style.cursor = "";
        element.removeAttribute("title");
      });
    };
  }, [html, devMode]);

  return (
    <div 
      ref={containerRef}
      className="p-6"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
