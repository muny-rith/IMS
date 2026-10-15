import React, { useState, useRef, useEffect, useMemo } from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import SearchIcon from '@mui/icons-material/Search';
import CheckIcon from '@mui/icons-material/Check';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import './MultiSelect.css';

/**
 * MultiSelect - Enterprise Multi-selection Dropdown with tabs and tags
 * 
 * Props:
 * - label: string (e.g. "Category", "Brand")
 * - placeholder: string (e.g. "Select an option")
 * - options: Array<{ value: string|number, label: string }>
 * - selectedValues: Array<string|number>
 * - onChange: (newValues: Array<string|number>) => void
 * - maxTagsVisible: number (default: 1)
 */
const MultiSelect = ({
  label,
  placeholder = 'All',
  options = [],
  selectedValues = [],
  onChange,
  maxTagsVisible = 1,
  width,
  popoverWidth,
  className = '',
  style = {},
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'selected'
  const [searchQuery, setSearchQuery] = useState('');

  // Mobile 3-step state cycle:
  // 0: Closed
  // 1: Menu Open (scrollable options, no keyboard) - 1st click
  // 2: Search Active (keyboard focused, live filter) - 2nd click
  // -> 3rd click resets back to 0 (Closed)
  const [mobileStep, setMobileStep] = useState(0);

  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Responsive device detection
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close dropdown on click outside or Escape key
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setMobileStep(0);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setMobileStep(0);
        setSearchQuery('');
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside, { passive: true });
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Desktop: Auto-focus search input immediately on 1st click (original pattern)
  // Mobile: Handled explicitly by mobileStep (focuses only on 2nd click)
  useEffect(() => {
    if (isOpen) {
      if (!isMobile) {
        setSearchQuery('');
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
    } else {
      setSearchQuery('');
      setMobileStep(0);
    }
  }, [isOpen, isMobile]);

  // Trigger click handler with exact flow requested by user:
  // On Phone (Mobile):
  // 1st click: Shows menu (mobileStep 1)
  // 2nd click: Gives search / opens virtual keyboard (mobileStep 2)
  // 3rd click: Closes menu (mobileStep 0)
  //
  // On Desktop:
  // 1st click: Opens menu & focuses search immediately (original pattern)
  // Click arrow or outside: Closes menu
  // Trigger click handler:
  // On Phone (Mobile):
  // 1st click: Shows menu (mobileStep 1)
  // 2nd click: Type text (mobileStep 2, focus virtual keyboard)
  // 3rd click: Closes menu (mobileStep 0, isOpen false)
  //
  // On Desktop:
  // 1st click: Opens menu & focuses search immediately (original pattern)
  // Click arrow or outside: Closes menu
  const handleTriggerClick = (e) => {
    // If clicking clear '✕' button in search mode, handled by clear button
    if (e.target.closest('.multiselect__search-cancel')) {
      return;
    }

    if (!isMobile) {
      // Desktop: toggle
      if (isOpen) {
        setIsOpen(false);
        setSearchQuery('');
      } else {
        setIsOpen(true);
      }
      return;
    }

    // Mobile Phone sequence:
    // Click 1: Show menu (mobileStep 1)
    // Click 2: Type text / search (mobileStep 2, focus keyboard)
    // Click 3: Close menu (mobileStep 0, isOpen false)
    if (!isOpen || mobileStep === 0) {
      // 1st click: Show menu
      setIsOpen(true);
      setMobileStep(1);
      setSearchQuery('');
    } else if (mobileStep === 1) {
      // 2nd click: Type text
      setMobileStep(2);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      // 3rd click: Close menu!
      setIsOpen(false);
      setMobileStep(0);
      setSearchQuery('');
    }
  };

  // Arrow icon click: directly toggles open/close
  const handleArrowClick = (e) => {
    e.stopPropagation();
    if (isOpen) {
      setIsOpen(false);
      setMobileStep(0);
      setSearchQuery('');
    } else {
      setIsOpen(true);
      if (isMobile) {
        setMobileStep(1);
      }
    }
  };

  // Lookup map for fast label resolution
  const optionMap = useMemo(() => {
    const map = new Map();
    (options || []).forEach((opt) => map.set(String(opt.value), opt.label));
    return map;
  }, [options]);

  const selectedCount = selectedValues.length;

  const handleToggle = (value) => {
    const strVal = String(value);
    const isSelected = selectedValues.some((v) => String(v) === strVal);
    let nextValues;

    if (isSelected) {
      nextValues = selectedValues.filter((v) => String(v) !== strVal);
    } else {
      nextValues = [...selectedValues, value];
    }

    onChange(nextValues);

    // Keep search input focused on mobile so keyboard stays open and user can continue typing
    if (isMobile && mobileStep === 2) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 10);
    }
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
    setSearchQuery('');
    setActiveTab('all');
    searchInputRef.current?.focus();
  };

  const visibleOptions = useMemo(() => {
    let list = options || [];
    if (activeTab === 'selected') {
      list = (options || []).filter((opt) =>
        selectedValues.some((v) => String(v) === String(opt.value))
      );
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((opt) => opt.label.toLowerCase().includes(q));
    }
    return list;
  }, [activeTab, options, selectedValues, searchQuery]);

  // Tags to display in trigger button
  const visibleTags = useMemo(() => {
    return selectedValues.slice(0, maxTagsVisible);
  }, [selectedValues, maxTagsVisible]);

  const overflowCount = selectedCount - maxTagsVisible;

  return (
    <div
      className={`multiselect ${className}`.trim()}
      ref={containerRef}
      style={{
        ...(width ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
        ...style,
      }}
    >
      {/* Trigger Box */}
      <div
        className={`multiselect__trigger ${isOpen ? 'multiselect__trigger--open' : ''} ${
          selectedCount > 0 ? 'multiselect__trigger--active' : ''
        }`}
        onClick={handleTriggerClick}
      >
        <div className="multiselect__trigger-content">
          {!isMobile ? (
            // ==================== DESKTOP VIEW ====================
            !isOpen ? (
              <div className="multiselect__tags-view">
                {label && <span className="multiselect__trigger-label">{label}:</span>}

                {selectedCount === 0 ? (
                  <span className="multiselect__placeholder">{placeholder || 'All'}</span>
                ) : (
                  <>
                    {visibleTags.map((val) => {
                      const text = optionMap.get(String(val)) || val;
                      return (
                        <span key={String(val)} className="multiselect__tag">
                          <span className="multiselect__tag-text" title={text}>
                            {text}
                          </span>
                          <span
                            className="multiselect__tag-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(val);
                            }}
                            title={`Remove ${text}`}
                            role="button"
                            aria-label={`Remove ${text}`}
                          >
                            <CloseIcon sx={{ fontSize: 13 }} />
                          </span>
                        </span>
                      );
                    })}

                    {overflowCount > 0 && (
                      <span className="multiselect__tag-overflow">
                        +{overflowCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="multiselect__search-view">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="multiselect__search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={label ? `Search ${label.toLowerCase()}...` : 'Search options...'}
                  autoComplete="off"
                  aria-label={label ? `Search ${label}` : 'Search options'}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setIsOpen(false);
                    }
                  }}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="multiselect__search-cancel"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchQuery('');
                      searchInputRef.current?.focus();
                    }}
                    title="Clear search text"
                    aria-label="Clear search text"
                  >
                    <CloseIcon sx={{ fontSize: 14 }} />
                  </button>
                )}
              </div>
            )
          ) : (
            // ==================== MOBILE PHONE VIEW ====================
            // mobileStep 0 or 1: Show label/tags + search hint
            // mobileStep 2: Show active search input
            mobileStep !== 2 ? (
              <div className="multiselect__tags-view">
                {label && <span className="multiselect__trigger-label">{label}:</span>}

                {selectedCount === 0 ? (
                  <span className="multiselect__placeholder">{placeholder || 'All'}</span>
                ) : (
                  <>
                    {visibleTags.map((val) => {
                      const text = optionMap.get(String(val)) || val;
                      return (
                        <span key={String(val)} className="multiselect__tag">
                          <span className="multiselect__tag-text" title={text}>
                            {text}
                          </span>
                          <span
                            className="multiselect__tag-remove"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggle(val);
                            }}
                            title={`Remove ${text}`}
                            role="button"
                            aria-label={`Remove ${text}`}
                          >
                            <CloseIcon sx={{ fontSize: 13 }} />
                          </span>
                        </span>
                      );
                    })}

                    {overflowCount > 0 && (
                      <span className="multiselect__tag-overflow">
                        +{overflowCount}
                      </span>
                    )}
                  </>
                )}
              </div>
            ) : (
              <div className="multiselect__search-view multiselect__search-view--mobile">
                <input
                  ref={searchInputRef}
                  type="text"
                  className="multiselect__search-input multiselect__search-input--mobile"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={label ? `Search ${label.toLowerCase()}...` : 'Search...'}
                  autoComplete="off"
                  enterKeyHint="search"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      e.stopPropagation();
                      e.currentTarget.blur();
                    }
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setIsOpen(false);
                      setMobileStep(0);
                      setSearchQuery('');
                    }
                  }}
                />
              </div>
            )
          )}
        </div>

        <div className="multiselect__trigger-actions">
          <span
            className={`multiselect__arrow ${isOpen ? 'multiselect__arrow--open' : ''}`}
            title={isOpen ? 'Close menu' : 'Open menu'}
            onClick={handleArrowClick}
          >
            <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
          </span>
        </div>
      </div>

      {/* Popover Menu: Starts DIRECTLY with Tabs, NO duplicate search header */}
      {isOpen && (
        <div
          className="multiselect__popover"
          role="listbox"
          style={
            popoverWidth
              ? {
                  width: typeof popoverWidth === 'number' ? `${popoverWidth}px` : popoverWidth,
                  maxWidth: '100%',
                }
              : undefined
          }
        >
          {/* All / Selected Tabs */}
          <div className="multiselect__tabs">
            <div className="multiselect__tabs-left">
              <button
                type="button"
                className={`multiselect__tab ${
                  activeTab === 'all' ? 'multiselect__tab--active' : ''
                }`}
                onClick={() => setActiveTab('all')}
              >
                All
              </button>
              <button
                type="button"
                className={`multiselect__tab ${
                  activeTab === 'selected' ? 'multiselect__tab--active' : ''
                }`}
                onClick={() => setActiveTab('selected')}
              >
                Selected
                {selectedCount > 0 && (
                  <span className="multiselect__tab-badge">{selectedCount}</span>
                )}
              </button>
            </div>

            {selectedCount > 0 && (
              <button
                type="button"
                className="multiselect__clear-all"
                onClick={handleClearAll}
                title="Cancel all selected"
                aria-label="Cancel all selected"
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </button>
            )}
          </div>

          {/* Options List */}
          <div className="multiselect__list">
            {visibleOptions.length === 0 ? (
              <div className="multiselect__empty">
                <div className="multiselect__empty-icon">
                  {searchQuery ? (
                    <SearchIcon sx={{ fontSize: 20 }} />
                  ) : (
                    <CheckBoxOutlineBlankIcon sx={{ fontSize: 20 }} />
                  )}
                </div>
                <span className="multiselect__empty-text">
                  {searchQuery
                    ? `No ${label ? label.toLowerCase() : 'options'} matching "${searchQuery}"`
                    : activeTab === 'selected'
                    ? 'Nothing selected'
                    : 'No options available'}
                </span>
              </div>
            ) : (
              visibleOptions.map((opt) => {
                const isChecked = selectedValues.some(
                  (v) => String(v) === String(opt.value)
                );
                return (
                  <div
                    key={String(opt.value)}
                    className={`multiselect__item ${
                      isChecked ? 'multiselect__item--checked' : ''
                    }`}
                    onMouseDown={(e) => {
                      // Prevent focus loss from search input when picking options
                      e.preventDefault();
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggle(opt.value);
                    }}
                    title={opt.label}
                  >
                    <div
                      className={`multiselect__checkbox ${
                        isChecked ? 'multiselect__checkbox--checked' : ''
                      }`}
                    >
                      {isChecked && <CheckIcon sx={{ fontSize: 14, color: '#ffffff' }} />}
                    </div>
                    <span className="multiselect__item-label" title={opt.label}>
                      {opt.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelect;
