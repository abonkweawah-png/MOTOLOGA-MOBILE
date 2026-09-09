"use client";

import * as React from "react";
import { useState, useRef, useLayoutEffect, useCallback } from "react";

export interface TabItem {
  icon: React.ReactNode;
  color: string;
  label?: string;
  badge?: number;
  id?: string;
}

export interface AnimatedTabBarProps {
  items: TabItem[];
  defaultIndex?: number;
  activeIndex?: number;
  onTabChange?: (index: number) => void;
  className?: string;
  barColor?: string;
}

export const AnimatedTabBar: React.FC<AnimatedTabBarProps> = ({
  items,
  defaultIndex = 0,
  activeIndex: controlledIndex,
  onTabChange,
  className = "",
  barColor,
}) => {
  const isControlled = controlledIndex !== undefined;
  const [internalActiveIndex, setInternalActiveIndex] = useState(defaultIndex);
  const activeIndex = isControlled ? controlledIndex : internalActiveIndex;

  const menuRef = useRef<HTMLMenuElement>(null);
  const menuBorderRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const offsetMenuBorder = useCallback(() => {
    const activeItem = itemRefs.current[activeIndex];
    const menu = menuRef.current;
    const menuBorder = menuBorderRef.current;

    if (activeItem && menu && menuBorder) {
      const activeItemRect = activeItem.getBoundingClientRect();
      const menuRect = menu.getBoundingClientRect();
      const left = Math.floor(
        (activeItemRect.left - menuRect.left) +
          (activeItemRect.width - menuBorder.offsetWidth) / 2
      );
      menuBorder.style.transform = `translate3d(${left}px, 0, 0)`;
    }
  }, [activeIndex]);

  useLayoutEffect(() => {
    offsetMenuBorder();
    const rafId = requestAnimationFrame(() => {
      offsetMenuBorder();
    });

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (menuRef.current) {
        menuRef.current.style.setProperty("--timeOut", "none");
      }
      offsetMenuBorder();

      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        if (menuRef.current) {
          menuRef.current.style.removeProperty("--timeOut");
        }
        offsetMenuBorder();
      }, 120);
    };

    window.addEventListener("resize", handleResize);

    // Responsive container observer so the tab bar resizes seamlessly to fit any display
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && menuRef.current) {
      resizeObserver = new ResizeObserver(() => {
        handleResize();
      });
      resizeObserver.observe(menuRef.current);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
    };
  }, [offsetMenuBorder]);

  const handleItemClick = (index: number) => {
    if (menuRef.current) {
      const menuStyle = menuRef.current.style;
      menuStyle.removeProperty("--timeOut");
    }
    if (!isControlled) {
      if (internalActiveIndex === index) return;
      setInternalActiveIndex(index);
    }
    if (onTabChange) {
      onTabChange(index);
    }
  };

  return (
    <>
      <div className="svg-container" aria-hidden="true">
        <svg viewBox="0 0 202.9 45.5">
          <clipPath
            id="menu-clip-path"
            clipPathUnits="objectBoundingBox"
            transform="scale(0.0049285362247413 0.021978021978022)"
          >
            <path d="M6.7,45.5c5.7,0.1,14.1-0.4,23.3-4c5.7-2.3,9.9-5,18.1-10.5c10.7-7.1,11.8-9.2,20.6-14.3c5-2.9,9.2-5.2,15.2-7 c7.1-2.1,13.3-2.3,17.6-2.1c4.2-0.2,10.5,0.1,17.6,2.1c6.1,1.8,10.2,4.1,15.2,7c8.8,5,9.9,7.1,20.6,14.3c8.3,5.5,12.4,8.2,18.1,10.5 c9.2,3.6,17.6,4.2,23.3,4H6.7z" />
          </clipPath>
        </svg>
      </div>

      <menu
        className={`menu ${className}`}
        ref={menuRef}
        style={barColor ? ({ "--menu-bg": barColor } as React.CSSProperties) : undefined}
      >
        {items.map((item, index) => {
          const isActive = activeIndex === index;
          return (
            <button
              key={item.id || index}
              id={item.id || `tab-item-${index}`}
              ref={(el) => (itemRefs.current[index] = el)}
              type="button"
              className={`menu__item ${isActive ? "active" : ""}`}
              style={{ "--bgColorItem": item.color } as React.CSSProperties}
              onClick={() => handleItemClick(index)}
              aria-label={item.label || `Tab ${index + 1}`}
              aria-selected={isActive}
            >
              <div className="menu__item-icon-wrapper">
                {item.icon}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-amber-500 text-slate-950 font-black font-mono text-[10px] rounded-full flex items-center justify-center ring-2 ring-[#0E2829] shadow-xs">
                    {item.badge}
                  </span>
                )}
              </div>
              {item.label && (
                <span className="menu__item-label">
                  {item.label}
                </span>
              )}
            </button>
          );
        })}
        <div className="menu__border" ref={menuBorderRef}></div>
      </menu>
    </>
  );
};
