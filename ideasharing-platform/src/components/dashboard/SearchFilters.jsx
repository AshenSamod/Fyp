import React, { useState, useRef } from 'react';
import { Row, Col, Form, InputGroup, Popover, OverlayTrigger, Button } from 'react-bootstrap';
import { FaSearch, FaCalendarAlt, FaTimes } from 'react-icons/fa';

const SearchFilters = ({ onSearchChange, onDateRangeChange, searchTerm: externalSearchTerm }) => {
  const [searchTerm, setSearchTerm] = useState(externalSearchTerm || '');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const datePickerRef = useRef(null);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    // Auto-trigger search on change
    onSearchChange(value);
  };

  const handleStartDateChange = (e) => {
    const value = e.target.value;
    setStartDate(value);
  };

  const handleEndDateChange = (e) => {
    const value = e.target.value;
    setEndDate(value);
  };

  const handleApplyDateRange = () => {
    onDateRangeChange({ start: startDate, end: endDate });
    setShowDatePicker(false);
  };

  const handleClearDateRange = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange({ start: '', end: '' });
    setShowDatePicker(false);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setStartDate('');
    setEndDate('');
    onSearchChange('');
    onDateRangeChange({ start: '', end: '' });
  };

  const formatDateDisplay = () => {
    if (!startDate && !endDate) return 'Select date range';
    if (startDate && endDate) {
      return `${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    if (startDate) {
      return `From ${new Date(startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    return `Until ${new Date(endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const hasFilters = searchTerm || startDate || endDate;
  const hasDateFilter = startDate || endDate;

  const dateRangePopover = (
    <Popover id="date-range-popover" style={{ maxWidth: '400px' }}>
      <Popover.Header as="h3">Select Date Range</Popover.Header>
      <Popover.Body>
        <Form.Group className="mb-3">
          <Form.Label className="small text-muted">Start Date</Form.Label>
          <Form.Control
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={handleStartDateChange}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label className="small text-muted">End Date</Form.Label>
          <Form.Control
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={handleEndDateChange}
          />
        </Form.Group>
        <div className="d-flex gap-2">
          <Button 
            variant="primary" 
            size="sm" 
            onClick={handleApplyDateRange}
            className="flex-grow-1"
          >
            Apply
          </Button>
          <Button 
            variant="outline-secondary" 
            size="sm" 
            onClick={handleClearDateRange}
          >
            Clear
          </Button>
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <div className="bg-white p-3 p-md-4 border rounded mb-3 mb-md-4 shadow-sm">
      <Row className="g-2 g-md-3">
        <Col xs={12} lg={hasFilters ? 5 : 6}>
          <InputGroup>
            <InputGroup.Text className="bg-white">
              <FaSearch className="text-muted" />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Search ideas by title or description..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="border-start-0"
            />
          </InputGroup>
        </Col>
        
        <Col xs={12} lg={hasFilters ? 4 : 6}>
          <OverlayTrigger
            trigger="click"
            placement="bottom"
            overlay={dateRangePopover}
            show={showDatePicker}
            onToggle={setShowDatePicker}
            rootClose
            ref={datePickerRef}
          >
            <InputGroup style={{ cursor: 'pointer' }}>
              <InputGroup.Text className="bg-white">
                <FaCalendarAlt className="text-muted" />
              </InputGroup.Text>
              <Form.Control
                readOnly
                placeholder="Select date range"
                value={formatDateDisplay()}
                className={`border-start-0 ${hasDateFilter ? 'fw-medium' : ''}`}
                style={{ cursor: 'pointer', backgroundColor: 'white' }}
              />
              {hasDateFilter && (
                <Button
                  variant="outline-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleClearDateRange();
                  }}
                  className="border-start-0"
                >
                  <FaTimes />
                </Button>
              )}
            </InputGroup>
          </OverlayTrigger>
        </Col>

        {hasFilters && (
          <Col xs={12} lg={3} className="d-flex align-items-center">
            <button 
              className="btn btn-outline-secondary w-100"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          </Col>
        )}
      </Row>
    </div>
  );
};

export default SearchFilters;