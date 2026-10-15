import React, {
  forwardRef,
  useState,
  useRef,
  useEffect,
  useMemo,
  useCallback,
} from 'react';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CloseIcon from '@mui/icons-material/Close';
import CheckIcon from '@mui/icons-material/Check';
import Skeleton from '../Skeleton/Skeleton';
import '../Form.css';
import './Select.css';

export const SelectSkeleton = ({ label, className = '' }) => (
  <div className={`ui-select-container ui-select-container--skeleton ${className}`.trim()} style={{ width: '100%' }}>
    {label && (
      <div style={{ marginBottom: '6px' }}>
        <Skeleton variant="text" width={75} height={15} />
      </div>
    )}
    <div
      className="ui-select-trigger ui-select-trigger--skeleton"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 12px',
        height: '42px',
        backgroundColor: '#ffffff',
        border: '1px solid #cbd5e1',
        borderRadius: '8px',
        boxSizing: 'border-box',
      }}
    >
      <Skeleton variant="text" width="55%" height={18} />
      <Skeleton variant="rounded" width={16} height={16} style={{ borderRadius: '4px' }} />
    </div>
  </div>
);


/**
 * Enterprise Single Select Component
 *
 * Implements the exact same responsive 3-step cycle as MultiSelect:
 * - Desktop:
 *   1st click: Opens menu & focuses search input immediately.
 *   2nd click: Closes menu.
 * - Mobile Phone (<= 768px):
 *   1st click: Shows menu (scrollable options, no keyboard covering screen - mobileStep 1).
 *   2nd click: Activates search mode & focuses virtual keyboard (mobileStep 2).
 *   3rd click: Closes menu (mobileStep 0).
 */
const Select = forwardRef(
  (
    {
      label,
      placeholder = 'Select...',
      options = [],
      error,
      value,
      onChange,
      onBlur,
      name,
      className = '',
      disabled = false,
      required = false,
      isClearable,
      loading = false,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const [highlightedIndex, setHighlightedIndex] = useState(-1);

    // Mobile 3-step state cycle:
    // 0: Closed
    // 1: Menu Open (scrollable options, no keyboard) - 1st click
    // 2: Search Active (keyboard focused, live filter) - 2nd click
    // -> 3rd click resets back to 0 (Closed)
    const [mobileStep, setMobileStep] = useState(0);

    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const searchInputRef = useRef(null);
    const listRef = useRef(null);
    const isKeyboardDismissingRef = useRef(false);

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

    // Normalize options into consistent { value: string, label: string, original }
    const normalizedOptions = useMemo(() => {
      if (!Array.isArray(options)) return [];
      return options.map((opt) => {
        if (typeof opt === 'object' && opt !== null) {
          const val =
            opt.value !== undefined
              ? opt.value
              : opt.id !== undefined
              ? opt.id
              : opt.category_id !== undefined
              ? opt.category_id
              : opt.brand_id !== undefined
              ? opt.brand_id
              : '';
          const lbl =
            opt.label !== undefined
              ? opt.label
              : opt.name !== undefined
              ? opt.name
              : opt.category_name !== undefined
              ? opt.category_name
              : opt.brand_name !== undefined
              ? opt.brand_name
              : String(val);

          return {
            value: String(val ?? ''),
            label: String(lbl ?? ''),
            original: opt,
          };
        }

        return {
          value: String(opt ?? ''),
          label: String(opt ?? ''),
          original: opt,
        };
      });
    }, [options]);

    // Find currently selected option
    const selectedOption = useMemo(() => {
      if (value === undefined || value === null || value === '') return null;
      return (
        normalizedOptions.find((opt) => String(opt.value) === String(value)) ||
        null
      );
    }, [normalizedOptions, value]);

    // Filtered options based on search query
    const filteredOptions = useMemo(() => {
      if (!searchQuery.trim()) {
        return normalizedOptions;
      }
      const q = searchQuery.toLowerCase().trim();
      return normalizedOptions.filter((opt) =>
        opt.label.toLowerCase().includes(q)
      );
    }, [normalizedOptions, searchQuery]);

    // Close when clicking outside or pressing Escape
    useEffect(() => {
      const handleClickOutside = (e) => {
        if (isKeyboardDismissingRef.current) return;
        if (containerRef.current && !containerRef.current.contains(e.target)) {
          setIsOpen(false);
          setMobileStep(0);
          setSearchQuery('');
          if (onBlur) onBlur();
        }
      };

      const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
          setIsOpen(false);
          setMobileStep(0);
          setSearchQuery('');
          triggerRef.current?.focus();
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside, {
          passive: true,
        });
        document.addEventListener('keydown', handleKeyDown);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('touchstart', handleClickOutside);
        document.removeEventListener('keydown', handleKeyDown);
      };
    }, [isOpen, onBlur]);

    // Desktop: Auto-focus search input immediately on 1st click
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

    // Set highlighted index when opened
    useEffect(() => {
      if (isOpen) {
        const idx = filteredOptions.findIndex(
          (opt) => String(opt.value) === String(value)
        );
        setHighlightedIndex(idx >= 0 ? idx : 0);
      }
    }, [isOpen, filteredOptions, value]);

    // Scroll highlighted item into view
    useEffect(() => {
      if (isOpen && listRef.current && highlightedIndex >= 0) {
        const item = listRef.current.children[highlightedIndex];
        if (item) {
          item.scrollIntoView({ block: 'nearest' });
        }
      }
    }, [isOpen, highlightedIndex]);

    // Emit selection change with synthetic event compatible with standard forms and RHF
    const handleSelect = useCallback(
      (optValue) => {
        if (onChange) {
          onChange({
            target: {
              name,
              value: optValue,
            },
          });
        }
        setIsOpen(false);
        setMobileStep(0);
        setSearchQuery('');
        triggerRef.current?.blur();
      },
      [name, onChange]
    );

    const handleClear = useCallback(
      (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        handleSelect('');
      },
      [handleSelect]
    );

    // Trigger click handler with exact flow matching MultiSelect:
    // On Phone (Mobile):
    // 1st click: Shows menu (mobileStep 1, options scrollable, no keyboard)
    // 2nd click: Type text / search (mobileStep 2, virtual keyboard focused)
    // 3rd click: Closes menu (mobileStep 0, isOpen false)
    //
    // On Desktop:
    // 1st click: Opens menu & focuses search immediately
    // 2nd click: Closes menu
    const handleTriggerClick = (e) => {
      if (disabled) return;

      if (!isMobile) {
        // Desktop: clicking inside search input or clear button should not toggle/close
        if (
          e.target.closest('.ui-select-search-input') ||
          e.target.closest('.ui-select-search-clear') ||
          e.target.closest('.ui-select-clear-btn')
        ) {
          return;
        }

        // Desktop: toggle
        if (isOpen) {
          setIsOpen(false);
          setSearchQuery('');
          triggerRef.current?.blur();
          if (onBlur) onBlur();
        } else {
          setIsOpen(true);
        }
        return;
      }

      // Mobile Phone sequence:
      // Clicking clear button only clears text, doesn't cycle/close steps
      if (
        e.target.closest('.ui-select-search-clear') ||
        e.target.closest('.ui-select-clear-btn')
      ) {
        return;
      }

      // Mobile 3-Step Sequence:
      // Click 1: Show menu (mobileStep 1, options scrollable, keyboard hidden)
      // Click 2: Type text / search (mobileStep 2, virtual keyboard focused)
      // Click 3: Close menu! (mobileStep 0, isOpen false)
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
        if (onBlur) onBlur();
      }
    };

    const handleArrowClick = (e) => {
      e.stopPropagation();
      if (disabled) return;
      if (isOpen) {
        setIsOpen(false);
        setMobileStep(0);
        setSearchQuery('');
        if (onBlur) onBlur();
      } else {
        setIsOpen(true);
        if (isMobile) {
          setMobileStep(1);
        }
      }
    };

    // Keyboard navigation
    const handleKeyDown = (e) => {
      if (disabled) return;

      if (!isOpen) {
        if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
          e.preventDefault();
          setIsOpen(true);
        }
        return;
      }

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev < filteredOptions.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setHighlightedIndex((prev) =>
            prev > 0 ? prev - 1 : filteredOptions.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (!isMobile && filteredOptions[highlightedIndex]) {
            handleSelect(filteredOptions[highlightedIndex].value);
          }
          break;
        case 'Escape':
          e.preventDefault();
          setIsOpen(false);
          setMobileStep(0);
          setSearchQuery('');
          triggerRef.current?.focus();
          break;
        case 'Tab':
          setIsOpen(false);
          setMobileStep(0);
          setSearchQuery('');
          break;
        default:
          break;
      }
    };

    const canClear =
      (isClearable || (!required && placeholder === 'None')) &&
      Boolean(value) &&
      !disabled;

    const listboxId = name
      ? `select-${name}-listbox`
      : `ui-select-listbox-${placeholder.replace(/\s+/g, '-').toLowerCase()}`;

    if (loading) {
      return <SelectSkeleton label={label} className={className} />;
    }

    return (

      <div
        ref={containerRef}
        className={`ui-select-container ${className}`.trim()}
      >
        {label && <label className="ui-select-label">{label}</label>}

        {/* Hidden Input for Form Submissions & RHF ref binding */}
        <input
          type="hidden"
          ref={ref}
          name={name}
          value={value ?? ''}
          {...props}
        />

        {/* Trigger Field (Houses direct search input when open) */}
        <div
          ref={triggerRef}
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-haspopup="listbox"
          tabIndex={disabled ? -1 : 0}
          onClick={handleTriggerClick}
          onKeyDown={handleKeyDown}
          className={`ui-select-trigger ${
            isOpen ? 'ui-select-trigger--open' : ''
          } ${error ? 'ui-select-trigger--error' : ''} ${
            disabled ? 'ui-select-trigger--disabled' : ''
          }`}
        >
          <div className="ui-select-trigger-content">
            {!isMobile ? (
              // ==================== DESKTOP VIEW ====================
              !isOpen ? (
                <span
                  className={`ui-select-value ${
                    !selectedOption ? 'ui-select-placeholder' : ''
                  }`}
                >
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              ) : (
                <div
                  className="ui-select-search-view"
                  onClick={(e) => e.stopPropagation()}
                  onTouchStart={(e) => e.stopPropagation()}
                >
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="ui-select-search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    placeholder={
                      selectedOption
                        ? selectedOption.label
                        : placeholder &&
                          placeholder !== 'Select...' &&
                          placeholder !== 'None'
                        ? `Search ${placeholder
                            .toLowerCase()
                            .replace(/^select\s+/, '')}...`
                        : 'Search...'
                    }
                    autoComplete="off"
                    onKeyDown={handleKeyDown}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="ui-select-search-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      title="Clear search text"
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </button>
                  )}
                </div>
              )
            ) : (
              // ==================== MOBILE PHONE VIEW ====================
              // mobileStep 0 or 1: Show label/value (no keyboard covering screen)
              // mobileStep 2: Show active search input (virtual keyboard focused)
              mobileStep !== 2 ? (
                <span
                  className={`ui-select-value ${
                    !selectedOption ? 'ui-select-placeholder' : ''
                  }`}
                >
                  {selectedOption ? selectedOption.label : placeholder}
                </span>
              ) : (
                <div className="ui-select-search-view ui-select-search-view--mobile">
                  <input
                    ref={searchInputRef}
                    type="text"
                    className="ui-select-search-input ui-select-search-input--mobile"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={
                      selectedOption
                        ? selectedOption.label
                        : placeholder &&
                          placeholder !== 'Select...' &&
                          placeholder !== 'None'
                        ? `Search ${placeholder
                            .toLowerCase()
                            .replace(/^select\s+/, '')}...`
                        : 'Search...'
                    }
                    autoComplete="off"
                    enterKeyHint="done"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                        isKeyboardDismissingRef.current = true;
                        e.currentTarget.blur();
                        setMobileStep(1);
                        setTimeout(() => {
                          isKeyboardDismissingRef.current = false;
                        }, 400);
                      }
                      if (e.key === 'Escape') {
                        e.stopPropagation();
                        setIsOpen(false);
                        setMobileStep(0);
                        setSearchQuery('');
                      }
                    }}
                    onKeyUp={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        e.stopPropagation();
                      }
                    }}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      className="ui-select-search-clear"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSearchQuery('');
                        searchInputRef.current?.focus();
                      }}
                      title="Clear search text"
                    >
                      <CloseIcon sx={{ fontSize: 13 }} />
                    </button>
                  )}
                </div>
              )
            )}
          </div>

          <div className="ui-select-actions">
            {!isOpen && canClear && (
              <button
                type="button"
                className="ui-select-clear-btn"
                onClick={handleClear}
                title="Clear selection"
                tabIndex={-1}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </button>
            )}

            <span
              className={`ui-select-arrow ${
                isOpen ? 'ui-select-arrow--open' : ''
              }`}
              aria-hidden="true"
              onClick={handleArrowClick}
            >
              <KeyboardArrowDownIcon sx={{ fontSize: 18 }} />
            </span>
          </div>
        </div>

        {/* Popover Menu: Starts DIRECTLY with Options List, NO duplicate search box */}
        {isOpen && (
          <div id={listboxId} className="ui-select-popover" role="listbox">
            <div ref={listRef} className="ui-select-list">
              {/* Optional "None" Option */}
              {(placeholder === 'None' || isClearable) &&
                !required &&
                !searchQuery && (
                  <div
                    role="option"
                    aria-selected={!value}
                    className={`ui-select-option ui-select-option--none ${
                      !value ? 'ui-select-option--selected' : ''
                    }`}
                    onClick={() => handleSelect('')}
                  >
                    <span className="ui-select-option-label">None</span>
                    {!value && (
                      <CheckIcon
                        sx={{ fontSize: 16 }}
                        className="ui-select-check"
                      />
                    )}
                  </div>
                )}

              {filteredOptions.length === 0 ? (
                <div className="ui-select-empty">No options found</div>
              ) : (
                filteredOptions.map((opt, index) => {
                  const isSelected = String(opt.value) === String(value);
                  const isHighlighted = index === highlightedIndex;

                  return (
                    <div
                      key={opt.value || index}
                      role="option"
                      aria-selected={isSelected}
                      className={`ui-select-option ${
                        isSelected ? 'ui-select-option--selected' : ''
                      } ${
                        isHighlighted ? 'ui-select-option--highlighted' : ''
                      }`}
                      onClick={() => handleSelect(opt.value)}
                      onMouseEnter={() => setHighlightedIndex(index)}
                    >
                      <span className="ui-select-option-label">{opt.label}</span>
                      {isSelected && (
                        <CheckIcon
                          sx={{ fontSize: 16 }}
                          className="ui-select-check"
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* Validation Error Message */}
        {error && <span className="error-text">{error}</span>}
      </div>
    );
  }
);

Select.displayName = 'Select';
Select.Skeleton = SelectSkeleton;

export default Select;