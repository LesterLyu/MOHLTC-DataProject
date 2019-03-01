### Backlog
  - Front-end Pages and Logics (Using React.js)
    - [ ] Registration page
    - [ ] User profile page
    - [ ] User management page
    - [ ] Front-end permissions
    
  - Front-end Excel Related (Patially Using React.js; uses HandsonTable)
    - [ ] Fix Issue when hidden row/col > rendered row/col
    - [ ] Fix Issue when merge cells with borders
    - [ ] Create Excel: fix formula
    - [ ] Create Excel: fix border
    - [ ] Create Excel: support hyperlink
    - [ ] Create Excel: support data validation
    - [ ] Create Excel: Assign attribute and category to rows and columns
    - [ ] Edit Excel page for user/client
    - [x] Create Excel: Fix calculation chain
    
  - Back-end (Our server, totally no React.js)
    - [ ] Rewrite backend to store workbook for admin
    - [ ] Rewrite backend to store workbook for user/client
    - [ ] ...Many other changes here while implementing the front-end pages
    
  - [xlsx-populate](https://github.com/LesterLyu/xlsx-populate) (Excel library used in this project)
    > priority in this order
    - [ ] Add shared formula support
    - [ ] Support conditional formatting
    - [ ] Support comments
    - [ ] Support images
  
  - [formula-parser](https://github.com/LesterLyu/formula-parser) and [formula.js](https://github.com/LesterLyu/formula.js) (Excel formula library used in this project)
    - [ ] **Excel Formula EXPERT needed to test through these library**
---
The following are old update history (not using react.js)
### Dev 0.3.6
 - Breakthrough supports:
    - Rich text (readonly, not editable).
    - More font styles (rotations, ...).
    - Number formats ($, date format, etc...)
    - Theme color. (need to parse XML)
 - Add
    - Real time Workbook Query 'Workbook Query -> Query workbooks'
    - Test file, test scripts
    - view test report in 'System -> Test Report'
    - Auto redirect to the last page you visit after login
 - Fix:
    - Fix border alignment issue.
    - Optimize front-end performance, half the loading time!
    - Many other bugs

### Dev 0.3.2
 - Breakthrough supports:
    - Font size
    - Font family
    - Underlined Font
    - Overflowed Display
    - Wrap text
  - Fix:
    - Default vertical alignment is not consistent.

### Dev 0.3.1
 - Fix bug:
    - Cannot click 'Add Sheet'.
    - Cannot display sheet without style in 'fill-workbook' page.
 - Breakthrough:
    - Supports hide grid lines.
    - Move sheet tabs to the bottom, add scroll button:
        <img src="https://raw.githubusercontent.com/LesterLyu/MOHLTC-DataProject/dev-lester/documents/img/bottom-tabs.jpg" height="50" alt="bottom tabs"/>
    - Support auto-resize, but very slow...
### Dev 0.3.0
 - Fix bug:
    - Hyperlink may lead into some performance issues.
    - Minor bug fixes
 - Breakthrough:
    - Support hidden column and row.
    - Support fixed column and row.

### Dev 0.2.9
  - Fix bug:
    - Cannot click 'Add' when create sheet.
  - Improvements:
    - optimize data structure for storing workbooks.
    - Add hyperlink support.
    - optimize front-end innerText and innerHTML calls performance.
  - What is broken:
    - Cannot click 'Add sheet' when edit sheet.
### Dev 0.2.8
  - Fix bug:
    - Data validation strings need to be trimmed.
    - Cannot evaluate formula start with ```=+```.
  - Improvements:
    - Supports hidden sheets.
    - Export excel with styles.

### Dev 0.2.7
 - Fix bug:
    - Edit Form: first time click on a number will erase the data.
    - Back-end: First row is trimmed sometimes.
 - Improvements:
    - Back-end: Add support for [custom defined name](https://support.office.com/en-us/article/define-and-use-names-in-formulas-4d0f13ac-53b7-422e-afd2-abd7ff379c64).
    - Back-end: Add support for [data validation](https://support.office.com/en-us/article/apply-data-validation-to-cells-29fecbcc-d1b9-42c1-9d76-eff3ce5f7249).
    - Front-end: Able to get defined name via ```gui.getDefinedName(string name)```
    - Front-end: Support dropdown ([excel list data validation](https://support.office.com/en-us/article/apply-data-validation-to-cells-29fecbcc-d1b9-42c1-9d76-eff3ce5f7249)).
        - Limitation: Does not support different sheet reference,
        e.g. ```=Sheet2!$A$2:$A$10```. Please define name to table range
        and use the defined name to setup data validation in Excel, [see this](https://www.contextures.com/xlDataVal01.html)
        - Limitation: Does not support style for now.
