# Implementation Plan

- [x] 1. Database Schema and Core Infrastructure

  - Execute database migrations to create companies and contracts tables with proper relationships
  - Update form_templates table to include mandatory contract_id foreign key
  - Create database triggers for automatic inheritance of contract and company data in form_responses
  - Create database views for hierarchical queries and summary statistics
  - _Requirements: 1.3, 2.2, 3.2, 4.1, 4.2, 6.4_

- [x] 1.1 Create and execute database migration script


  - Write SQL migration script with companies, contracts tables and relationships
  - Add contract_id column to form_templates with NOT NULL constraint
  - Create inheritance triggers for form_responses table
  - Create summary views for reporting and statistics


  - _Requirements: 1.3, 2.2, 3.2, 4.1, 4.2_



- [ ] 1.2 Create TypeScript interfaces for new entities
  - Define Company, Contract, ContractSummary interfaces with all fields
  - Define form data interfaces for CompanyFormData, ContractFormData
  - Define filter interfaces for CompanyFilters, ContractFilters


  - Define statistics interfaces for CompanyStats, ContractStats
  - _Requirements: 1.1, 2.1, 7.1, 7.2_

- [x] 1.3 Implement ContractService with all CRUD operations

  - Create ContractService class with methods for companies and contracts management
  - Implement validation functions for document uniqueness and contract numbers
  - Add methods for statistics and reporting queries
  - Include error handling and data formatting utilities


  - _Requirements: 1.3, 2.3, 6.1, 6.2, 8.1, 8.2_

- [x] 2. Company Management Components


  - Build CompanyForm component with complete validation and CNPJ/CPF formatting
  - Build CompanyList component with filtering, search, and statistics dashboard
  - Create company detail pages with contract navigation
  - Implement company CRUD operations with proper error handling
  - _Requirements: 1.1, 1.2, 1.4, 1.5, 5.1, 7.1, 8.1_



- [ ] 2.1 Create CompanyForm component with validation
  - Build comprehensive form with all company fields (basic info, contact, address)
  - Implement CNPJ/CPF validation and formatting
  - Add form validation with error messages


  - Include status management and file upload for logo
  - _Requirements: 1.2, 1.4, 1.5, 8.1_

- [x] 2.2 Create CompanyList component with filtering and statistics

  - Build company listing with search and filter capabilities
  - Add statistics cards showing totals, active companies, and document types
  - Implement pagination and sorting functionality
  - Add action buttons for view, edit, delete with proper validations
  - _Requirements: 1.1, 5.1, 6.1, 7.1_

- [x] 2.3 Create company detail and navigation pages


  - Build company detail page showing all information and related contracts
  - Add navigation to contracts list filtered by company
  - Implement breadcrumb navigation for hierarchy
  - Add drill-down capabilities to contract and template levels
  - _Requirements: 5.1, 5.2, 5.5_




- [ ] 3. Contract Management Components
  - Build ContractForm component with company selection and validation
  - Build ContractList component with company information and filtering
  - Create contract detail pages with template navigation


  - Implement contract CRUD operations with business rule validations
  - _Requirements: 2.1, 2.2, 2.4, 2.5, 5.2, 7.2, 8.2_

- [x] 3.1 Create ContractForm component with company integration


  - Build contract form with mandatory company selection dropdown
  - Implement contract number generation and validation
  - Add date validation ensuring start_date < end_date
  - Include contract type, status, and financial information fields
  - _Requirements: 2.2, 2.3, 2.4, 2.5, 8.2_

- [x] 3.2 Create ContractList component with hierarchical information


  - Build contract listing showing company information in each row
  - Add filtering by company, status, contract type, and date ranges
  - Implement statistics showing total contracts, active count, and total value
  - Add expiration alerts for contracts ending within 30 days
  - _Requirements: 2.1, 5.2, 7.2, 7.5_



- [ ] 3.3 Create contract detail and template navigation pages
  - Build contract detail page with complete contract information
  - Add template listing filtered by current contract
  - Implement navigation to template designer with contract pre-selected


  - Add document collection summary and navigation
  - _Requirements: 5.2, 5.3, 5.4_


- [ ] 4. Template Integration with Contract Hierarchy
  - Create ContractSelector component for mandatory contract selection in templates
  - Update FormDesigner to require contract selection before template creation
  - Modify template creation workflow to enforce contract relationship
  - Update template listings to show contract and company information
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_



- [ ] 4.1 Create ContractSelector component for template creation
  - Build contract selection dropdown showing only active contracts
  - Display company information alongside contract details
  - Implement search and filtering within contract selection

  - Add validation to prevent template creation without contract selection


  - _Requirements: 3.1, 3.2, 3.4_

- [x] 4.2 Update FormDesigner with mandatory contract selection



  - Integrate ContractSelector into template creation workflow
  - Display selected contract information prominently in designer


  - Prevent template saving without valid contract selection
  - Add breadcrumb showing Company > Contract > Template hierarchy
  - _Requirements: 3.1, 3.3, 5.5_

- [ ] 4.3 Update template listings with hierarchical information
  - Modify template list to show contract and company information
  - Add filtering by company and contract
  - Update template cards to display hierarchical context
  - Implement navigation from template to contract and company details
  - _Requirements: 3.5, 5.1, 5.2_



- [ ] 5. Document Collection Inheritance and Navigation
  - Update form response creation to automatically inherit contract and company data
  - Modify document listings to show complete hierarchical information
  - Create hierarchical filtering for document collections
  - Implement navigation through the complete hierarchy in document views
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 5.3, 5.4_

- [ ] 5.1 Update form response creation with automatic inheritance
  - Modify form submission process to automatically populate contract_id and company_id
  - Ensure inheritance triggers work correctly during response creation
  - Add validation to verify hierarchical data integrity
  - Test inheritance functionality with various template and contract combinations
  - _Requirements: 4.1, 4.2, 6.5_

- [ ] 5.2 Create hierarchical document listings and filtering
  - Update document list to display company and contract information
  - Add filtering options by company, contract, and template
  - Implement search across hierarchical data
  - Add sorting and pagination with hierarchical context
  - _Requirements: 4.3, 4.4, 5.4_

- [ ] 5.3 Implement complete hierarchy navigation in document views
  - Add breadcrumb navigation in document detail views
  - Create navigation links to parent contract and company
  - Implement drill-up and drill-down navigation capabilities
  - Add related documents and templates navigation
  - _Requirements: 5.3, 5.4, 5.5_

- [ ] 6. Navigation and User Experience Components
  - Create HierarchyBreadcrumb component for consistent navigation
  - Build HierarchyNavigation component for drill-down capabilities
  - Implement dashboard with hierarchical statistics and quick access
  - Add search functionality across the entire hierarchy
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3_

- [ ] 6.1 Create HierarchyBreadcrumb component
  - Build reusable breadcrumb component showing current position in hierarchy
  - Support navigation to any level in the breadcrumb path
  - Display appropriate icons and labels for each hierarchy level
  - Handle dynamic breadcrumb generation based on current context
  - _Requirements: 5.5_

- [ ] 6.2 Create HierarchyNavigation component for drill-down
  - Build navigation component with counters for each hierarchy level
  - Implement expandable tree view for exploring relationships
  - Add quick access buttons for common navigation patterns
  - Include contextual actions based on current hierarchy position
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ] 6.3 Create dashboard with hierarchical statistics
  - Build main dashboard showing statistics for companies, contracts, and templates
  - Add quick access cards for recent activities and alerts
  - Implement charts and graphs showing hierarchical data relationships
  - Add shortcuts for common tasks like creating new contracts or templates
  - _Requirements: 7.1, 7.2, 7.3, 7.5_

- [ ] 7. Data Integrity and Validation Systems
  - Implement comprehensive validation for all hierarchy levels
  - Create referential integrity checks and cascade deletion controls
  - Add audit logging for critical operations
  - Implement business rule validations and error handling
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 8.1, 8.2, 8.3, 8.4, 8.5_

- [ ] 7.1 Implement comprehensive validation system
  - Create validation functions for CNPJ/CPF format and uniqueness
  - Add contract number validation and generation
  - Implement date range validation for contract periods
  - Create business rule validations for status transitions
  - _Requirements: 8.1, 8.2, 8.4_

- [ ] 7.2 Create referential integrity and cascade controls
  - Implement checks preventing deletion of entities with active dependencies
  - Add cascade deletion options for inactive entities
  - Create confirmation dialogs with dependency information
  - Add soft delete options for maintaining historical data
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [ ]* 7.3 Add audit logging and history tracking
  - Create audit log tables for tracking changes to critical entities
  - Implement automatic logging for create, update, delete operations
  - Add user tracking and timestamp information to audit logs
  - Create audit log viewing interface for administrators
  - _Requirements: 6.5, 8.5_

- [ ] 8. Testing and Quality Assurance
  - Create comprehensive test suite for all components and services
  - Implement integration tests for hierarchy workflows
  - Add end-to-end tests for critical user journeys
  - Create test data and fixtures for development and testing
  - _Requirements: All requirements validation_

- [ ]* 8.1 Create unit tests for services and components
  - Write unit tests for ContractService CRUD operations
  - Create component tests for forms, lists, and navigation
  - Add validation function tests with various input scenarios
  - Test error handling and edge cases
  - _Requirements: All requirements validation_

- [ ]* 8.2 Create integration tests for hierarchy workflows
  - Test complete workflow from company creation to document collection
  - Verify inheritance functionality and data integrity
  - Test cascade operations and referential integrity
  - Validate business rule enforcement across the hierarchy
  - _Requirements: All requirements validation_

- [ ]* 8.3 Create end-to-end tests for user journeys
  - Test complete user workflows through the application
  - Verify navigation and user experience flows
  - Test error scenarios and recovery paths
  - Validate performance with realistic data volumes
  - _Requirements: All requirements validation_