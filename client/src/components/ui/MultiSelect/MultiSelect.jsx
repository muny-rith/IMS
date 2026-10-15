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
  placeholder = 'Select an option',
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
  const [mobileSearchActive, setMobileSearchActive] = useState(false);
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);

  // Responsive device detection (reactive on resize)
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
        setMobileSearchActive(false);
        setSearchQuery('');
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setMobileSearchActive(false);
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
  // Mobile: DO NOT auto-focus on 1st click so keyboard does not pop up
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
      setMobileSearchActive(false);
    }
  }, [isOpen, isMobile]);

  // Toggle dropdown on trigger click
  const handleTriggerClick = (e) => {
    // If mobile search is active and user taps the search input, allow typing
    if (isMobile && mobileSearchActive && e.target.closest('.multiselect__search-input')) {
      return;
    }

    // Toggle behavior:
    // If open -> clicking again CLOSES it! ("ចុចម្តងទៀត អោយបិទ")
    // If closed -> clicking opens it!
    if (isOpen) {
      setIsOpen(false);
      setMobileSearchActive(false);
      setSearchQuery('');
    } else {
      setIsOpen(true);
      setMobileSearchActive(false);
    }
  };

  // Lookup map for fast label resolution
  const optionMap = useMemo(() => {
    const map = new Map();
    options.forEach((opt) => map.set(String(opt.value), opt.label));
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
  };

  const handleClearAll = (e) => {
    e.stopPropagation();
    onChange([]);
  };

  const visibleOptions = useMemo(() => {
    let list = options;
    if (activeTab === 'selected') {
      list = options.filter((opt) =>
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
      {/* Trigger Box: Directly contains label, tags, and embedded search input */}
      <div
        className={`multiselect__trigger ${isOpen ? 'multiselect__trigger--open' : ''} ${
          selectedCount > 0 ? 'multiselect__trigger--active' : ''
        }`}
        onClick={handleTriggerClick}
      >
        <div className="multiselect__trigger-content">
          {!isMobile ? (
            // Desktop View: Original pattern
            !isOpen ? (
              <div className="multiselect__tags-view">
                {label && <span className="multiselect__trigger-label">{label}:</span>}

                {selectedCount === 0 ? (
                  <span className="multiselect__placeholder">All</span>
                ) : (
                  <>
                    {visibleTags.map((val) => {
                      const text = optionMap.get(String(val)) || val;
                      return (
                        <span key={String(val)} className="multiselect__tag">
                          <span className="multiselect__tag-text" title={text}>
                            {text}
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
              </div>
            )
          ) : (
            // Mobile View:
            // When not searching: show tags/label (clicking anywhere on trigger toggles open/close)
            // When searching: show active search input with clear/exit button
            !mobileSearchActive ? (
              <div className="multiselect__tags-view">
                {label && <span className="multiselect__trigger-label">{label}:</span>}

                {selectedCount === 0 ? (
                  <span className="multiselect__placeholder">All</span>
                ) : (
                  <>
                    {visibleTags.map((val) => {
                      const text = optionMap.get(String(val)) || val;
                      return (
                        <span key={String(val)} className="multiselect__tag">
                          <span className="multiselect__tag-text" title={text}>
                            {text}
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
                <SearchIcon sx={{ fontSize: 16, color: '#64748b' }} />
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
                      e.currentTarget.blur();
                    }
                    if (e.key === 'Escape') {
                      e.stopPropagation();
                      setMobileSearchActive(false);
                    }
                  }}
                />
                <button
                  type="button"
                  className="multiselect__search-cancel"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchQuery('');
                    setMobileSearchActive(false);
                  }}
                  title="Exit search"
                  aria-label="Exit search"
                >
                  <CloseIcon sx={{ fontSize: 14 }} />
                </button>
              </div>
            )
          )}
        </div>

        <div className="multiselect__trigger-actions">
          {/* On Mobile when open and NOT searching: show 🔍 button to activate keyboard search */}
          {isMobile && isOpen && !mobileSearchActive && (
            <button
              type="button"
              className="multiselect__search-btn"
              onClick={(e) => {
                e.stopPropagation();
                setMobileSearchActive(true);
                setTimeout(() => searchInputRef.current?.focus(), 50);
              }}
              title={`Search ${label || 'options'}`}
              aria-label={`Search ${label || 'options'}`}
            >
              <SearchIcon sx={{ fontSize: 16 }} />
            </button>
          )}

          <span
            className={`multiselect__arrow ${isOpen ? 'multiselect__arrow--open' : ''}`}
            title={isOpen ? 'Close menu' : 'Open menu'}
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
              ? { width: typeof popoverWidth === 'number' ? `${popoverWidth}px` : popoverWidth }
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
                    onClick={() => handleToggle(opt.value)}
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
